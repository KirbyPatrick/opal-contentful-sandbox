import { redactSecrets } from "../contentful/errors";

/**
 * Errors a tool returns to the agent as `{ ok: false, error: { code, message } }`.
 * Messages are written for an AI agent: they say what is wrong and what to do next.
 */
export type ToolErrorCode =
  | "invalid_input"
  | "unknown_brand"
  | "not_found"
  | "not_allowed"
  | "version_conflict"
  | "slug_taken"
  | "rejected";

export class ToolError extends Error {
  override name = "ToolError";
  constructor(readonly code: ToolErrorCode, message: string) {
    super(message);
  }
}

/** HTTP status of a Contentful SDK error. SDK error messages are JSON text with a numeric status. */
export function sdkStatus(error: unknown): number | undefined {
  if (!(error instanceof Error)) return undefined;
  try {
    const body = JSON.parse(error.message) as { status?: unknown };
    return typeof body.status === "number" ? body.status : undefined;
  } catch {
    return undefined;
  }
}

interface RejectionBody {
  message?: unknown;
  details?: { errors?: unknown };
}

/**
 * What an agent may be told about a Contentful rejection: the message and the validation problems
 * (field path and rule text). Never the request URL (it holds the space and environment IDs), request
 * headers, request ID, or the submitted values.
 */
export function describeRejection(error: unknown): string {
  let body: RejectionBody = {};
  if (error instanceof Error) {
    try {
      body = JSON.parse(error.message) as RejectionBody;
    } catch {
      // Not an SDK error body; fall through to the generic text.
    }
  }
  const parts: string[] = [];
  if (typeof body.message === "string" && body.message !== "") parts.push(body.message);
  const problems = Array.isArray(body.details?.errors) ? (body.details.errors as Array<Record<string, unknown>>) : [];
  const lines = problems.slice(0, 5).map((problem) => {
    const path = Array.isArray(problem.path) ? problem.path.filter((p) => p !== "en-US").join(".") : "";
    const detail = typeof problem.details === "string" ? problem.details : typeof problem.name === "string" ? problem.name : "invalid";
    return path ? `${path}: ${detail}` : detail;
  });
  if (lines.length > 0) parts.push(lines.join("; "));
  const text = redactSecrets(parts.join(" - "));
  return (text === "" ? "the change did not pass Contentful's validation" : text).slice(0, 400);
}

/**
 * Turns the Contentful failures an agent can act on into ToolErrors. Anything else is returned
 * unchanged, so the HTTP layer logs it (through describeError) and answers with a generic error.
 */
export function upstreamToToolError(error: unknown, subject: string): unknown {
  if (error instanceof ToolError) return error;
  const status = sdkStatus(error);
  if (status === 404) return new ToolError("not_found", `${subject} was not found.`);
  if (status === 409) {
    return new ToolError(
      "version_conflict",
      `${subject} changed since you read it. Call get_entry again, apply your edit to the new version, and retry with the new version number.`,
    );
  }
  if (status === 422) return new ToolError("rejected", `Contentful rejected the change: ${describeRejection(error)}`);
  return error;
}
