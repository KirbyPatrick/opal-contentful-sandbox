/**
 * Read-only smoke test of a running Opal API, local or deployed. Sends no
 * writes: it checks discovery, that tool calls without the right token are
 * refused, and that two read tools answer. The token comes from
 * OPAL_API_TOKEN and is never printed.
 *
 *   npm run opal:smoke                                  (http://localhost:3000)
 *   npm run opal:smoke -- https://opal-contentful-sandbox.vercel.app
 */
const target = new URL(process.argv[2] ?? process.env.SITE_URL ?? "http://localhost:3000");
const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
if (target.protocol !== "https:" && !isLocal) {
  console.error("Refusing to send the token over plain http to a non-local host.");
  process.exit(2);
}
const token = process.env.OPAL_API_TOKEN;
if (!token) {
  console.error("OPAL_API_TOKEN is not set. Add it to .env first.");
  process.exit(2);
}
const base = `${target.origin}/api/opal`;

let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (!ok) failures++;
  console.log(`${ok ? "pass" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

async function call(tool: string, parameters: object, authorization: string | undefined) {
  const response = await fetch(`${base}/tools/${tool}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(authorization ? { authorization } : {}) },
    body: JSON.stringify({ parameters }),
  });
  const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: { code?: string }; brands?: unknown[] };
  return { status: response.status, body };
}

async function main(): Promise<void> {
  const discovery = await fetch(`${base}/discovery`);
  const manifest = (await discovery.json().catch(() => ({}))) as { functions?: Array<{ name: string; endpoint: string; http_method: string }> };
  check("discovery is public and lists 9 tools", discovery.status === 200 && manifest.functions?.length === 9, `HTTP ${discovery.status}`);
  check("no tool can delete", !manifest.functions?.some((f) => /delete|archive/i.test(f.name)));
  check("every tool is a POST under /tools/", Boolean(manifest.functions?.every((f) => f.http_method === "POST" && f.endpoint.startsWith("/tools/"))));

  const noToken = await call("list-brands", {}, undefined);
  check("a call with no token is refused", noToken.status === 401, `HTTP ${noToken.status}`);
  const wrong = await call("list-brands", {}, "Bearer not-the-token");
  check("a call with the wrong token is refused", wrong.status === 401, `HTTP ${wrong.status}`);

  const brands = await call("list-brands", {}, `Bearer ${token}`);
  check("list_brands works with the token", brands.status === 200 && brands.body.ok === true && (brands.body.brands?.length ?? 0) > 0, `HTTP ${brands.status}`);
  const unknown = await call("find-pages", { brand: "no-such-brand" }, `Bearer ${token}`);
  check("an unknown brand returns an error for the agent", unknown.status === 200 && unknown.body.error?.code === "unknown_brand", `HTTP ${unknown.status}`);

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(`Smoke test stopped: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
