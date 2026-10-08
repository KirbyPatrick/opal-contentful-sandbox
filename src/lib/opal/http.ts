/**
 * The HTTP layer for the Opal API. Everything about a request that is not
 * content logic: bearer token, size limit, rate limits, JSON parsing, strict
 * parameter validation, error mapping, and structured logs.
 *
 * Status codes: 401 bad or missing token, 413 too large, 429 rate limited,
 * 404 unknown tool, 500 unexpected. Everything the agent can act on (invalid
 * input, unknown brand, version conflict, Contentful rejecting a change) is a
 * 200 with { ok: false, error: { code, message } }, so the agent always sees
 * the message instead of a generic failure.
 */
import type { z } from "zod";
import { describeError } from "../contentful/errors";
import type { OpalClient } from "../contentful/policy";
import { safeEqual } from "../safe-equal";
import type { OpalConfig } from "./config";
import { ToolError } from "./errors";
import type { RateLimiter } from "./rate-limit";
import { buildManifest, findTool } from "./registry";

export const MAX_BODY_BYTES = 256 * 1024;

export interface HttpDeps {
  config: () => OpalConfig;
  client: () => Promise<OpalClient>;
  now: () => Date;
  limits: { all: RateLimiter; write: RateLimiter };
  log: (event: Record<string, unknown>) => void;
}

const NO_STORE = { "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate" };

function reply(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

const failure = (code: string, message: string) => ({ ok: false as const, error: { code, message } });

/** The discovery document. Public by design: it lists tool names and descriptions only. */
export function handleDiscovery(): Response {
  return Response.json(buildManifest(), { headers: { "Cache-Control": "public, max-age=60" } });
}

export function bearerMatches(header: string | null, expected: string): boolean {
  const match = /^Bearer[ \t]+(\S+)$/i.exec(header ?? "");
  return match !== null && safeEqual(match[1], expected);
}

/** Opal sends { parameters: {...}, auth, environment, chat_metadata }. A bare object is accepted for manual testing. */
function extractParameters(body: unknown): Record<string, unknown> | undefined {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return undefined;
  const record = body as Record<string, unknown>;
  const raw = "parameters" in record ? record.parameters : record;
  if (raw === undefined || raw === null) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return undefined;
  // An omitted optional parameter may arrive as null or an empty string. Treat both as absent.
  return Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== null && value !== ""));
}

function describeIssues(issues: readonly z.core.$ZodIssue[], parameterNames: string[]): string {
  const lines = issues.slice(0, 6).map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  const unknownKey = issues.some((issue) => issue.code === "unrecognized_keys");
  return `${lines.join("; ")}.${unknownKey ? ` Valid parameters: ${parameterNames.join(", ")}.` : ""}`;
}

export async function handleToolRequest(request: Request, toolSlug: string, deps: HttpDeps): Promise<Response> {
  const started = Date.now();
  // These values arrive before authentication, so cap their length in the logs.
  const clip = (value: string | null | undefined) => value?.slice(0, 64) || undefined;
  const base = {
    tool: toolSlug.slice(0, 64),
    thread_id: clip(request.headers.get("x-opal-thread-id")),
    execution_id: clip(request.headers.get("x-opal-agent-execution-id") ?? request.headers.get("x-opal-workflow-execution-id")),
  };
  const finish = (result: string, extra: Record<string, unknown> = {}) =>
    deps.log({ ...base, result, ms: Date.now() - started, ...extra });

  let config: OpalConfig;
  try {
    config = deps.config();
  } catch (error) {
    finish("misconfigured", { error: describeError(error) });
    return reply(failure("server_misconfigured", "The Opal API is not configured on the server."), 500);
  }

  if (!bearerMatches(request.headers.get("authorization"), config.apiToken)) {
    finish("denied");
    return reply(failure("unauthorized", "Missing or invalid bearer token."), 401, { "WWW-Authenticate": "Bearer" });
  }

  const tool = findTool(toolSlug);
  if (!tool) {
    finish("unknown_tool");
    return reply(failure("unknown_tool", "No such tool."), 404);
  }

  const nowMs = deps.now().getTime();
  const limited = [deps.limits.all.take(nowMs), ...(tool.write ? [deps.limits.write.take(nowMs)] : [])].find((check) => !check.ok);
  if (limited && !limited.ok) {
    finish("rate_limited");
    return reply(
      failure("rate_limited", `Too many requests. Wait ${limited.retryAfterSeconds} seconds and try again.`),
      429,
      { "Retry-After": String(limited.retryAfterSeconds) },
    );
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  const raw = declared > MAX_BODY_BYTES ? undefined : await request.text();
  if (raw === undefined || Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    finish("too_large");
    return reply(failure("payload_too_large", "The request is too large."), 413);
  }

  let parameters: Record<string, unknown> | undefined;
  try {
    parameters = extractParameters(raw.trim() === "" ? {} : JSON.parse(raw));
  } catch {
    parameters = undefined;
  }
  if (!parameters) {
    finish("invalid_request");
    return reply(failure("invalid_input", "The request body must be JSON with a parameters object."), 200);
  }

  const parsed = tool.schema.safeParse(parameters);
  if (!parsed.success) {
    finish("invalid_input");
    return reply(failure("invalid_input", describeIssues(parsed.error.issues, tool.parameters.map((p) => p.name))));
  }

  try {
    const output = await tool.run(
      { client: await deps.client(), siteUrl: config.siteUrl, previewSecret: config.previewSecret, now: deps.now(), memo: new Map() },
      parsed.data,
    );
    const summary = output as { entry_id?: unknown; brand?: unknown; status?: unknown };
    finish("ok", { entry_id: summary.entry_id, brand: summary.brand, status: summary.status });
    return reply({ ok: true, ...output });
  } catch (error) {
    if (error instanceof ToolError) {
      finish("tool_error", { code: error.code });
      return reply(failure(error.code, error.message));
    }
    // Never log the raw error: SDK errors can carry request headers.
    finish("error", { error: describeError(error) });
    return reply(failure("internal_error", "Something went wrong on the server. Try again once; if it fails again, tell the user."), 500);
  }
}
