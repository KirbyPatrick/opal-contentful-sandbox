import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_BODY_BYTES, bearerMatches, handleDiscovery, handleToolRequest, type HttpDeps } from "../src/lib/opal/http";
import { RateLimiter } from "../src/lib/opal/rate-limit";
import { fakeCma } from "./fixtures/fake-cma";

const TOKEN = "opal-test-token-0123456789-0123456789-abcdef";
const PREVIEW_SECRET = "preview-secret-value-that-must-never-leak-0123456789";
const NOW = new Date("2026-10-08T12:00:00Z");
const URL_BASE = "https://site.test/api/opal/tools/";

function deps(overrides: Partial<HttpDeps> = {}): { deps: HttpDeps; logs: Record<string, unknown>[] } {
  const logs: Record<string, unknown>[] = [];
  const cma = fakeCma();
  return {
    logs,
    deps: {
      config: () => ({ apiToken: TOKEN, siteUrl: "https://site.test", previewSecret: PREVIEW_SECRET }),
      client: async () => cma.client,
      now: () => NOW,
      limits: { all: new RateLimiter(100, 60_000), write: new RateLimiter(100, 60_000) },
      log: (event) => logs.push(event),
      ...overrides,
    },
  };
}

function call(tool: string, body: unknown, headers: Record<string, string> = { authorization: `Bearer ${TOKEN}` }, raw?: string) {
  return new Request(`${URL_BASE}${tool}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: raw ?? JSON.stringify(body),
  });
}

const read = async (response: Response) => (await response.json()) as Record<string, unknown> & { error?: { code: string; message: string } };

describe("bearer token", () => {
  it("accepts only the exact token with the Bearer scheme", () => {
    assert.equal(bearerMatches(`Bearer ${TOKEN}`, TOKEN), true);
    assert.equal(bearerMatches(`bearer ${TOKEN}`, TOKEN), true);
    assert.equal(bearerMatches(TOKEN, TOKEN), false);
    assert.equal(bearerMatches(`Basic ${TOKEN}`, TOKEN), false);
    assert.equal(bearerMatches(`Bearer ${TOKEN}x`, TOKEN), false);
    assert.equal(bearerMatches(`Bearer ${TOKEN.slice(1)}`, TOKEN), false);
    assert.equal(bearerMatches("Bearer ", TOKEN), false);
    assert.equal(bearerMatches(null, TOKEN), false);
  });

  it("returns 401 with no detail, and logs the denial without any token", async () => {
    const attempts: Array<Record<string, string>> = [{}, { authorization: "Bearer wrong-token-value" }, { authorization: TOKEN }];
    for (const headers of attempts) {
      const { deps: d, logs } = deps();
      const response = await handleToolRequest(call("list-brands", {}, headers), "list-brands", d);
      assert.equal(response.status, 401);
      assert.equal(response.headers.get("www-authenticate"), "Bearer");
      assert.equal((await read(response)).error?.code, "unauthorized");
      assert.equal(logs[0]?.result, "denied");
      assert.ok(!JSON.stringify(logs).includes("wrong-token-value"));
    }
  });

  it("checks the token before the tool name, so unauthenticated callers learn nothing", async () => {
    const { deps: d } = deps();
    const response = await handleToolRequest(call("delete-everything", {}, {}), "delete-everything", d);
    assert.equal(response.status, 401);
  });

  it("answers 404 for an unknown tool once authenticated, and there is no delete tool", async () => {
    const { deps: d } = deps();
    for (const name of ["delete-entry", "archive-entry", "delete-article", "unpublish-all"]) {
      assert.equal((await handleToolRequest(call(name, {}), name, d)).status, 404);
    }
  });

  it("never sets Access-Control headers, so browsers cannot call it cross-origin", async () => {
    const { deps: d } = deps();
    const response = await handleToolRequest(call("list-brands", {}), "list-brands", d);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  });
});

describe("requests", () => {
  it("runs a tool and wraps the result in ok: true", async () => {
    const { deps: d, logs } = deps();
    const response = await handleToolRequest(
      call("list-brands", { parameters: {}, auth: { provider: "x" }, environment: { execution_mode: "interactive" } }, { authorization: `Bearer ${TOKEN}`, "x-opal-thread-id": "thread-1" }),
      "list-brands",
      d,
    );
    assert.equal(response.status, 200);
    const body = await read(response);
    assert.equal(body.ok, true);
    assert.equal((body.brands as unknown[]).length, 2);
    assert.equal(logs[0]?.result, "ok");
    assert.equal(logs[0]?.thread_id, "thread-1");
  });

  it("accepts a bare parameters object for manual testing, and numbers sent as text", async () => {
    const { deps: d } = deps();
    const body = await read(await handleToolRequest(call("find-pages", { brand: "defeo-mutual", limit: "2", query: "" }), "find-pages", d));
    assert.equal(body.ok, true);
    assert.equal(body.count, 2);
  });

  it("treats null and empty-string parameters as not sent", async () => {
    const { deps: d } = deps();
    const body = await read(await handleToolRequest(call("find-pages", { parameters: { brand: "defeo-mutual", type: null, query: "", limit: "" } }), "find-pages", d));
    assert.equal(body.ok, true);
  });

  it("rejects unknown parameters and lists the valid ones", async () => {
    const { deps: d } = deps();
    const body = await read(await handleToolRequest(call("find-pages", { parameters: { brand: "defeo-mutual", sql: "drop" } }), "find-pages", d));
    assert.equal(body.ok, false);
    assert.equal(body.error?.code, "invalid_input");
    assert.match(body.error?.message ?? "", /Valid parameters: brand, query, type, limit/);
  });

  it("rejects missing, mistyped, and out of range parameters", async () => {
    const { deps: d } = deps();
    const cases: Array<[string, unknown, RegExp]> = [
      ["find-pages", { parameters: {} }, /brand/],
      ["find-pages", { parameters: { brand: "defeo-mutual", limit: 500 } }, /limit/],
      ["find-pages", { parameters: { brand: "defeo-mutual", type: "brand" } }, /type/],
      ["get-entry", { parameters: { entry_id: "../../etc/passwd" } }, /entry_id/],
      ["update-entry", { parameters: { brand: "x", entry_id: "a", version: "abc", fields: "{}" } }, /version/],
      ["create-article", { parameters: { brand: "x", title: "t" } }, /summary|body_markdown|hero_image_id/],
      ["create-article", { parameters: { brand: "x", title: "t", summary: "s", hero_image_id: "i", body_markdown: "x".repeat(10_001) } }, /body_markdown/],
    ];
    for (const [tool, body, expected] of cases) {
      const response = await read(await handleToolRequest(call(tool, body), tool, d));
      assert.equal(response.ok, false, tool);
      assert.match(response.error?.message ?? "", expected, tool);
    }
  });

  it("answers invalid JSON as an agent-readable error", async () => {
    const { deps: d } = deps();
    const response = await handleToolRequest(call("list-brands", null, undefined, "{not json"), "list-brands", d);
    assert.equal((await read(response)).error?.code, "invalid_input");
  });

  it("refuses a body over the size limit with 413, by header and by content", async () => {
    const { deps: d } = deps();
    const big = "x".repeat(MAX_BODY_BYTES + 10);
    const byContent = await handleToolRequest(call("create-article", null, undefined, JSON.stringify({ parameters: { body_markdown: big } })), "create-article", d);
    assert.equal(byContent.status, 413);
    const byHeader = await handleToolRequest(call("list-brands", {}, { authorization: `Bearer ${TOKEN}`, "content-length": String(MAX_BODY_BYTES + 1) }), "list-brands", d);
    assert.equal(byHeader.status, 413);
  });

  it("caps attacker-controlled values before they reach the logs", async () => {
    const { deps: d, logs } = deps();
    const long = "x".repeat(5_000);
    await handleToolRequest(call("list-brands", {}, { authorization: "Bearer wrong", "x-opal-thread-id": long }), long, d);
    await handleToolRequest(call("list-brands", {}, { authorization: `Bearer ${TOKEN}`, "x-opal-thread-id": long, "x-opal-agent-execution-id": long }), "list-brands", d);
    for (const log of logs) {
      assert.ok(String(log.tool).length <= 64);
      assert.ok(String(log.thread_id ?? "").length <= 64);
      assert.ok(String(log.execution_id ?? "").length <= 64);
    }
    assert.ok(JSON.stringify(logs).length < 2_000);
  });

  it("counts the size limit in bytes, not characters", async () => {
    const { deps: d } = deps();
    // 100,000 characters of a 3-byte character is about 300 KB, over the 256 KB limit.
    const body = JSON.stringify({ parameters: { query: "\u20ac".repeat(100_000) } });
    assert.ok(body.length < MAX_BODY_BYTES);
    const response = await handleToolRequest(call("find-pages", null, undefined, body), "find-pages", d);
    assert.equal(response.status, 413);
  });

  it("maps tool errors to a 200 with the code and message the agent needs", async () => {
    const { deps: d, logs } = deps();
    const response = await handleToolRequest(call("find-pages", { parameters: { brand: "acme" } }), "find-pages", d);
    assert.equal(response.status, 200);
    const body = await read(response);
    assert.equal(body.ok, false);
    assert.equal(body.error?.code, "unknown_brand");
    assert.match(body.error?.message ?? "", /ask the user/i);
    assert.equal(logs[0]?.result, "tool_error");
  });
});

describe("failures and limits", () => {
  it("answers unexpected errors with a generic 500 and logs a redacted description", async () => {
    const { deps: d, logs } = deps({
      client: async () => {
        throw new Error("boom with Authorization: Bearer super-secret-management-token inside");
      },
    });
    const response = await handleToolRequest(call("list-brands", {}), "list-brands", d);
    assert.equal(response.status, 500);
    const text = JSON.stringify(await read(response));
    assert.ok(!text.includes("boom") && !text.includes("super-secret"));
    assert.equal(logs[0]?.result, "error");
    assert.ok(!JSON.stringify(logs).includes("super-secret-management-token"));
  });

  it("answers a missing configuration with a generic 500 that names nothing", async () => {
    const { deps: d, logs } = deps({
      config: () => {
        throw new Error("Missing or invalid environment variable(s): OPAL_API_TOKEN.");
      },
    });
    const response = await handleToolRequest(call("list-brands", {}), "list-brands", d);
    assert.equal(response.status, 500);
    assert.ok(!JSON.stringify(await read(response)).includes("OPAL_API_TOKEN"));
    assert.equal(logs[0]?.result, "misconfigured");
  });

  it("rate limits with 429 and Retry-After, and limits writes more tightly than reads", async () => {
    const all = new RateLimiter(3, 60_000);
    const write = new RateLimiter(1, 60_000);
    const { deps: d } = deps({ limits: { all, write } });
    const first = await handleToolRequest(call("unpublish-entry", { parameters: { brand: "defeo-mutual", entry_id: "article-hl-seed", version: 6 } }), "unpublish-entry", d);
    assert.equal(first.status, 200);
    const second = await handleToolRequest(call("unpublish-entry", { parameters: { brand: "defeo-mutual", entry_id: "article-hl-seed", version: 7 } }), "unpublish-entry", d);
    assert.equal(second.status, 429);
    assert.ok(Number(second.headers.get("retry-after")) >= 1);
    assert.equal((await handleToolRequest(call("list-brands", {}), "list-brands", d)).status, 200);
  });

  it("the sliding window frees up as time passes", () => {
    const limiter = new RateLimiter(2, 1000);
    assert.equal(limiter.take(0).ok, true);
    assert.equal(limiter.take(10).ok, true);
    assert.equal(limiter.take(20).ok, false);
    assert.equal(limiter.take(1001).ok, true);
  });
});

describe("discovery", () => {
  it("lists every tool with a relative POST endpoint and no secrets", async () => {
    const response = handleDiscovery();
    const manifest = (await response.json()) as { functions: Array<{ name: string; endpoint: string; http_method: string; parameters: unknown[]; description: string }> };
    assert.deepEqual(
      manifest.functions.map((f) => f.name),
      ["list_brands", "find_pages", "get_entry", "get_content_rules", "list_brand_images", "create_article", "update_entry", "publish_entry", "unpublish_entry"],
    );
    for (const tool of manifest.functions) {
      assert.equal(tool.http_method, "POST");
      assert.match(tool.endpoint, /^\/tools\/[a-z-]+$/);
      assert.ok(tool.description.length > 40);
    }
    const text = JSON.stringify(manifest);
    assert.ok(!text.includes(TOKEN) && !text.includes(PREVIEW_SECRET));
    assert.ok(!manifest.functions.some((f) => /delete|archive/i.test(f.name)));
  });
});
