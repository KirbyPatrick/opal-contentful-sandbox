/**
 * Allowlists for Contentful Management API clients.
 *
 * restrictClient() exposes only the namespaces and methods a policy lists,
 * and forces the policy's space and environment into every call. A call that
 * tries to pass a different space or environment is refused before any
 * request is made. Anything not listed (including the SDK's `raw` escape
 * hatch) does not exist on the restricted client.
 */
import type { PlainClientAPI } from "contentful-management";
import { CONTENTFUL_ID_PATTERN } from "./config";

export class PolicyError extends Error {
  override name = "PolicyError";
}

export type MethodAllowlist = Readonly<Record<string, readonly string[]>>;

export interface ClientPolicy<A extends MethodAllowlist> {
  /** Shown in refusal messages. */
  readonly name: string;
  readonly allow: A;
  /** Values forced into every call. */
  readonly pin: Readonly<{ spaceId?: string; environmentId?: string }>;
}

export type RestrictedClient<A extends MethodAllowlist> = {
  readonly [N in keyof A & keyof PlainClientAPI]: Pick<
    PlainClientAPI[N],
    A[N][number] & keyof PlainClientAPI[N]
  >;
};

/**
 * Content work inside the sandbox environment. No space, environment, alias,
 * webhook, API key, role, or app changes. Content type writes are here for
 * migrations and the Phase 2 cleanup; the Opal API gets a narrower policy.
 */
export const SANDBOX_ALLOW = {
  entry: [
    "get", "getMany", "getManyWithCursor", "getPublished", "getPublishedWithCursor", "references",
    "create", "createWithId", "update", "patch", "publish", "unpublish", "archive", "unarchive", "delete",
  ],
  asset: [
    "get", "getMany", "getManyWithCursor", "getPublished", "getPublishedWithCursor",
    "create", "createWithId", "createFromFiles", "update", "processForAllLocales", "processForLocale",
    "publish", "unpublish", "archive", "unarchive", "delete",
  ],
  upload: ["get", "create", "delete"],
  contentType: [
    "get", "getMany", "getManyWithCursor",
    "create", "createWithId", "update", "publish", "unpublish", "delete", "omitAndDeleteField",
  ],
  editorInterface: ["get", "getMany", "update"],
  tag: ["get", "getMany", "createWithId", "update", "delete"],
  // Delete is for removing inherited locales; this sandbox is en-US only.
  locale: ["get", "getMany", "delete"],
  environment: ["get"],
  bulkAction: ["get", "getV2", "validate", "validateV2", "publish", "publishV2", "unpublish", "unpublishV2"],
  appInstallation: ["get", "getMany"],
} as const satisfies MethodAllowlist;

/**
 * Reads only. Used for preflight checks and the read-only inventory of
 * master. Secret-bearing reads (API keys, tokens, webhook signing secrets)
 * are deliberately left out.
 */
export const READ_ONLY_ALLOW = {
  space: ["get", "getMany"],
  environment: ["get", "getMany"],
  environmentAlias: ["get", "getMany"],
  user: ["getCurrent"],
  spaceMember: ["get", "getMany"],
  spaceMembership: ["get", "getMany"],
  role: ["get", "getMany"],
  contentType: ["get", "getMany"],
  editorInterface: ["get", "getMany"],
  entry: ["get", "getMany"],
  asset: ["get", "getMany"],
  tag: ["get", "getMany"],
  locale: ["get", "getMany"],
  appInstallation: ["get", "getMany"],
  extension: ["get", "getMany"],
  webhook: ["get", "getMany"],
} as const satisfies MethodAllowlist;

export type SandboxClient = RestrictedClient<typeof SANDBOX_ALLOW>;
export type ReadOnlyClient = RestrictedClient<typeof READ_ONLY_ALLOW>;

const PINNABLE_PARAMS = ["spaceId", "environmentId"] as const;

type AnyFunction = (...args: unknown[]) => unknown;

export function restrictClient<A extends MethodAllowlist>(
  client: object,
  policy: ClientPolicy<A>,
): RestrictedClient<A> {
  const source = client as Record<string, Record<string, unknown> | undefined>;
  const namespaces: Record<string, object> = {};

  for (const [namespace, methods] of Object.entries(policy.allow)) {
    const methodsSource = source[namespace];
    const wrapped: Record<string, AnyFunction> = {};
    for (const method of methods) {
      const fn = methodsSource?.[method];
      if (typeof fn !== "function") {
        throw new PolicyError(`${policy.name} policy lists ${namespace}.${method}, which this SDK does not provide.`);
      }
      const label = `${namespace}.${method}`;
      wrapped[method] = (params?: unknown, ...rest: unknown[]) =>
        (fn as AnyFunction).call(methodsSource, scopeParams(policy, label, params), ...rest);
    }
    namespaces[namespace] = refuseUnlisted(Object.freeze(wrapped), policy.name, namespace);
  }

  return refuseUnlisted(Object.freeze(namespaces), policy.name) as RestrictedClient<A>;
}

function scopeParams(
  policy: ClientPolicy<MethodAllowlist>,
  label: string,
  params: unknown,
): Record<string, unknown> {
  const given = params ?? {};
  if (typeof given !== "object" || Array.isArray(given)) {
    throw new PolicyError(`${policy.name}: ${label} expects a params object.`);
  }
  const scoped: Record<string, unknown> = { ...(given as Record<string, unknown>) };
  for (const key of PINNABLE_PARAMS) {
    const pinned = policy.pin[key];
    const requested = scoped[key];
    if (pinned !== undefined) {
      if (requested !== undefined && requested !== pinned) {
        throw new PolicyError(`${policy.name}: ${label} tried to use a different ${key}. Refused.`);
      }
      scoped[key] = pinned;
    } else if (
      requested !== undefined &&
      (typeof requested !== "string" || !CONTENTFUL_ID_PATTERN.test(requested))
    ) {
      throw new PolicyError(`${policy.name}: ${label} received an invalid ${key}.`);
    }
  }
  return scoped;
}

/** Turns access to anything outside the allowlist into a clear error instead of `undefined`. */
function refuseUnlisted<T extends object>(target: T, policyName: string, namespace?: string): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      // Symbols, `then` (so the client can be awaited safely) and Object.prototype members pass through.
      if (typeof prop === "symbol" || prop === "then" || prop in Object.prototype || Object.hasOwn(obj, prop)) {
        return Reflect.get(obj, prop, receiver);
      }
      const name = namespace ? `${namespace}.${prop}` : prop;
      throw new PolicyError(`The ${policyName} client does not allow ${name}.`);
    },
  });
}
