/**
 * The only module allowed to import contentful-management at runtime
 * (enforced by ESLint and by tests/import-boundary.test.ts).
 *
 * - getSandboxClient(): the only client that can write. It is pinned to
 *   CONTENTFUL_SPACE_ID / CONTENTFUL_ENVIRONMENT_ID and is only returned after
 *   the static and live master checks pass.
 * - getReadOnlyClient(): reads only, for preflight and the master inventory.
 *
 * Server side only. The management token must never reach the browser.
 */
import { createClient, type PlainClientAPI } from "contentful-management";
import { readManagementToken, readOptionalSpaceId, readSandboxTarget, type SandboxTarget } from "./config";
import { describeError, redactSecrets } from "./errors";
import { PROTECTED_ENVIRONMENT_ID, assertDoesNotResolveToMaster, assertSafeEnvironmentId } from "./guard";
import {
  READ_ONLY_ALLOW,
  SANDBOX_ALLOW,
  restrictClient,
  type ReadOnlyClient,
  type SandboxClient,
} from "./policy";

// The Free plan allows 7 CMA requests per second. Stay below it.
const REQUESTS_PER_SECOND = 5;
// The SDK retries 429 and 5xx responses, waiting for the reset time Contentful sends back.
const RETRY_LIMIT = 6;
const REQUEST_TIMEOUT_MS = 30_000;

function createRawClient(accessToken: string): PlainClientAPI {
  return createClient({
    accessToken,
    throttle: REQUESTS_PER_SECOND,
    retryOnError: true,
    retryLimit: RETRY_LIMIT,
    timeout: REQUEST_TIMEOUT_MS,
    application: "opal-contentful-sandbox/0.1.0",
    logHandler: logSdkEvent,
  });
}

/** SDK warnings (such as rate limit retries) as structured lines, with secrets removed. */
function logSdkEvent(level: string, data?: Error | string): void {
  if (level !== "warning" && level !== "error") {
    return;
  }
  const message = typeof data === "string" ? redactSecrets(data) : describeError(data);
  console.error(JSON.stringify({ level, source: "contentful-management", message }));
}

/** Runs the live master check, then pins the client to the sandbox. Exported for tests. */
export async function createSandboxClientFrom(
  raw: PlainClientAPI,
  target: SandboxTarget,
): Promise<SandboxClient> {
  await assertDoesNotResolveToMaster(target.environmentId, (environmentId) =>
    raw.environment.get({ spaceId: target.spaceId, environmentId }),
  );
  return restrictClient(raw, { name: "sandbox", allow: SANDBOX_ALLOW, pin: target });
}

let sandboxClient: Promise<SandboxClient> | undefined;

export function getSandboxClient(): Promise<SandboxClient> {
  sandboxClient ??= (async () => {
    const target = readSandboxTarget();
    return createSandboxClientFrom(createRawClient(readManagementToken()), target);
  })().catch((error: unknown) => {
    // Do not cache a failure, so a long-running server can retry the checks.
    sandboxClient = undefined;
    throw error;
  });
  return sandboxClient;
}

export function getReadOnlyClient(): ReadOnlyClient {
  const spaceId = readOptionalSpaceId();
  return restrictClient(createRawClient(readManagementToken()), {
    name: "read-only",
    allow: READ_ONLY_ALLOW,
    pin: spaceId ? { spaceId } : {},
  });
}

const ENVIRONMENT_READY_TIMEOUT_MS = 10 * 60_000;
const ENVIRONMENT_POLL_MS = 5_000;

/**
 * Creates the sandbox environment as a copy of master. Copying only reads
 * master. Does nothing if the environment already exists. Waits until the
 * copy is ready, then runs the full live guard through getSandboxClient().
 */
export async function createSandboxEnvironment(): Promise<"created" | "exists"> {
  const target = readSandboxTarget();
  const raw = createRawClient(readManagementToken());
  const existing = await raw.environment.getMany({ spaceId: target.spaceId, query: { limit: 100 } });
  if (existing.items.some((environment) => environment.sys.id === target.environmentId)) {
    await getSandboxClient();
    return "exists";
  }

  // Checked again right before the only space-level write in this module.
  const environmentId = assertSafeEnvironmentId(target.environmentId);
  await raw.environment.createWithId(
    { spaceId: target.spaceId, environmentId, sourceEnvironmentId: PROTECTED_ENVIRONMENT_ID },
    { name: environmentId },
  );

  const deadline = Date.now() + ENVIRONMENT_READY_TIMEOUT_MS;
  for (;;) {
    const environment = await raw.environment.get({ spaceId: target.spaceId, environmentId });
    const status = environment.sys.status.sys.id;
    if (status === "ready") break;
    if (status === "failed") throw new Error(`Environment "${environmentId}" failed to copy.`);
    if (Date.now() > deadline) throw new Error(`Environment "${environmentId}" is still "${status}" after 10 minutes.`);
    await new Promise((resolve) => setTimeout(resolve, ENVIRONMENT_POLL_MS));
  }
  await getSandboxClient();
  return "created";
}

const WEBHOOK_NAME = "opal-sandbox site revalidation";
const WEBHOOK_TOPICS = ["Entry.publish", "Entry.unpublish", "Entry.delete", "Asset.publish", "Asset.unpublish", "Asset.delete"];

/**
 * Creates or updates the one webhook this project owns: it tells the site to
 * refresh when sandbox content is published, unpublished, or deleted. It is
 * filtered to the sandbox environment, so master activity never triggers it.
 * The secret header value is marked secret in Contentful (not readable later).
 */
export async function upsertRevalidationWebhook(url: string, secret: string): Promise<"created" | "updated"> {
  const target = readSandboxTarget();
  await getSandboxClient();
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !parsed.pathname.endsWith("/api/revalidate")) {
    throw new Error("The webhook URL must be https and end with /api/revalidate.");
  }
  const raw = createRawClient(readManagementToken());
  const body = {
    name: WEBHOOK_NAME,
    url: parsed.toString(),
    topics: WEBHOOK_TOPICS,
    filters: [{ equals: [{ doc: "sys.environment.sys.id" }, assertSafeEnvironmentId(target.environmentId)] }],
    headers: [{ key: "x-revalidate-secret", value: secret, secret: true }],
    active: true,
  };
  const existing = (await raw.webhook.getMany({ spaceId: target.spaceId, query: { limit: 100 } })).items.find((w) => w.name === WEBHOOK_NAME);
  if (existing) {
    await raw.webhook.update({ spaceId: target.spaceId, webhookDefinitionId: existing.sys.id }, { ...existing, ...body } as never);
    return "updated";
  }
  await raw.webhook.create({ spaceId: target.spaceId }, body as never);
  return "created";
}
