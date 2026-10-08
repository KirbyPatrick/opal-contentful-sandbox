/**
 * Turns errors into short, safe, one-line descriptions.
 *
 * Contentful SDK errors embed the request headers (including the last
 * characters of the token) and the full request body in `error.message`.
 * Never print or log a raw error from the SDK. Use describeError() instead.
 */

const SECRET_PATTERNS: readonly RegExp[] = [
  // Contentful personal access tokens.
  /CFPAT-[A-Za-z0-9_-]+/g,
  // Authorization header values, including the SDK's partially masked form.
  /Bearer\s+[^\s"',]+/gi,
];

const MAX_DESCRIPTION_LENGTH = 600;
const MAX_DETAILS_LENGTH = 300;

export function redactSecrets(text: string): string {
  return SECRET_PATTERNS.reduce(
    (result, pattern) => result.replace(pattern, "[redacted]"),
    text,
  );
}

export function describeError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unknown error.";
  }
  const description = describeSdkError(error) ?? `${error.name}: ${error.message}`;
  return truncate(redactSecrets(description), MAX_DESCRIPTION_LENGTH);
}

interface SdkErrorBody {
  status?: unknown;
  message?: unknown;
  requestId?: unknown;
  details?: { errors?: unknown };
  request?: { method?: unknown; url?: unknown };
}

/** Reads only the safe fields of an SDK error. Headers and payload are dropped. */
function describeSdkError(error: Error): string | undefined {
  let body: SdkErrorBody;
  try {
    body = JSON.parse(error.message) as SdkErrorBody;
  } catch {
    return undefined;
  }
  if (typeof body !== "object" || body === null || typeof body.status !== "number") {
    return undefined;
  }

  const parts = [`${error.name} (HTTP ${body.status})`];
  const { method, url } = body.request ?? {};
  if (typeof method === "string" && typeof url === "string") {
    parts.push(`${method.toUpperCase()} ${url.split("?")[0]}`);
  }
  if (typeof body.message === "string" && body.message !== "") {
    parts.push(body.message);
  }
  if (Array.isArray(body.details?.errors) && body.details.errors.length > 0) {
    parts.push(`details: ${truncate(JSON.stringify(body.details.errors), MAX_DETAILS_LENGTH)}`);
  }
  if (typeof body.requestId === "string") {
    parts.push(`request id ${body.requestId}`);
  }
  return parts.join(" | ");
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 3)}...`;
}
