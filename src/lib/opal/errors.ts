import { describeError } from "../contentful/errors";

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
  if (status === 422) return new ToolError("rejected", `Contentful rejected the change: ${describeError(error)}`);
  return error;
}
