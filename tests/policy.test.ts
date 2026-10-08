import assert from "node:assert/strict";
import { describe, it } from "node:test";
// Tests may build a real SDK client to check the allowlists against it. No request is ever sent.
import { createClient } from "contentful-management";
import {
  OPAL_API_ALLOW,
  PolicyError,
  READ_ONLY_ALLOW,
  SANDBOX_ALLOW,
  restrictClient,
} from "../src/lib/contentful/policy";

function fakeClient() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = [];
  const record = (method: string) => async (params: Record<string, unknown>) => {
    calls.push({ method, params });
    return { ok: true };
  };
  const client = {
    entry: { get: record("entry.get"), update: record("entry.update"), delete: record("entry.delete") },
    environment: { get: record("environment.get"), delete: record("environment.delete") },
    raw: { get: record("raw.get") },
  };
  return { client, calls };
}

const testAllow = { entry: ["get", "update"], environment: ["get"] } as const;
const pinned = { spaceId: "space1", environmentId: "opal-sandbox" };

describe("restrictClient", () => {
  it("pins the space and environment into every call", async () => {
    const { client, calls } = fakeClient();
    const restricted = restrictClient(client, { name: "test", allow: testAllow, pin: pinned });
    await restricted.entry.get({ entryId: "abc" });
    assert.deepEqual(calls, [{ method: "entry.get", params: { entryId: "abc", ...pinned } }]);
  });

  it("refuses an attempt to switch to master, before any request", () => {
    const { client, calls } = fakeClient();
    const restricted = restrictClient(client, { name: "test", allow: testAllow, pin: pinned });
    assert.throws(() => restricted.entry.update({ entryId: "abc", environmentId: "master" }, {} as never), PolicyError);
    assert.equal(calls.length, 0);
  });

  it("refuses an attempt to switch spaces", () => {
    const { client, calls } = fakeClient();
    const restricted = restrictClient(client, { name: "test", allow: testAllow, pin: pinned });
    assert.throws(() => restricted.entry.get({ entryId: "abc", spaceId: "other" }), PolicyError);
    assert.equal(calls.length, 0);
  });

  it("refuses methods and namespaces that are not on the allowlist", () => {
    const { client } = fakeClient();
    const restricted = restrictClient(client, { name: "test", allow: testAllow, pin: pinned }) as unknown as Record<
      string,
      Record<string, unknown>
    >;
    assert.throws(() => restricted.entry!.delete, PolicyError);
    assert.throws(() => restricted.environment!.delete, PolicyError);
    assert.throws(() => restricted.raw, PolicyError);
  });

  it("validates an unpinned environment ID", () => {
    const { client } = fakeClient();
    const restricted = restrictClient(client, { name: "test", allow: testAllow, pin: {} });
    assert.throws(() => restricted.entry.get({ entryId: "abc", environmentId: "../../spaces" }), PolicyError);
  });

  it("can be awaited without tripping the allowlist", async () => {
    const { client } = fakeClient();
    const restricted = restrictClient(client, { name: "test", allow: testAllow, pin: pinned });
    const resolved = await Promise.resolve(restricted);
    assert.equal(resolved, restricted);
  });

  it("fails fast when a policy lists a method the SDK does not have", () => {
    const { client } = fakeClient();
    assert.throws(
      () => restrictClient(client, { name: "test", allow: { entry: ["teleport"] }, pin: pinned }),
      PolicyError,
    );
  });
});

describe("policies against the real SDK", () => {
  const sdk = createClient({ accessToken: "test-token-not-real-0000000000" });

  it("every sandbox method exists in this SDK version", () => {
    restrictClient(sdk, { name: "sandbox", allow: SANDBOX_ALLOW, pin: pinned });
  });

  it("every read-only method exists in this SDK version", () => {
    restrictClient(sdk, { name: "read-only", allow: READ_ONLY_ALLOW, pin: {} });
  });

  it("every Opal API method exists in this SDK version", () => {
    restrictClient(sdk, { name: "opal-api", allow: OPAL_API_ALLOW, pin: pinned });
  });

  it("the Opal API policy cannot delete, archive, or change anything but entries", () => {
    // Entries: read, create, update, publish, unpublish. Assets: read only. Nothing else exists.
    assert.deepEqual(Object.keys(OPAL_API_ALLOW).sort(), ["asset", "entry"]);
    assert.deepEqual([...OPAL_API_ALLOW.entry].sort(), ["create", "get", "getMany", "publish", "unpublish", "update"]);
    assert.deepEqual([...OPAL_API_ALLOW.asset].sort(), ["get", "getMany"]);
    for (const methods of Object.values(OPAL_API_ALLOW)) {
      for (const method of methods) assert.doesNotMatch(method, /delete|archive/i, `${method} must not be allowed`);
    }
    const restricted = restrictClient(sdk, { name: "opal-api", allow: OPAL_API_ALLOW, pin: pinned });
    assert.throws(() => (restricted.entry as unknown as Record<string, unknown>).delete, PolicyError);
    assert.throws(() => (restricted.entry as unknown as Record<string, unknown>).archive, PolicyError);
    assert.throws(() => (restricted as unknown as Record<string, unknown>).contentType, PolicyError);
    assert.throws(() => (restricted.asset as unknown as Record<string, unknown>).publish, PolicyError);
  });

  it("the read-only policy contains only reads", () => {
    for (const [namespace, methods] of Object.entries(READ_ONLY_ALLOW)) {
      for (const method of methods) {
        assert.match(method, /^get/, `${namespace}.${method} is not a read`);
      }
    }
  });

  it("the sandbox policy cannot change spaces, environments, aliases, keys, webhooks, roles, or apps", () => {
    const forbidden = [
      "raw", "space", "environmentAlias", "environmentTemplate", "apiKey", "previewApiKey", "accessToken",
      "personalAccessToken", "webhook", "role", "spaceMembership", "organization", "team", "appDefinition",
    ];
    for (const namespace of forbidden) {
      assert.equal(namespace in SANDBOX_ALLOW, false, `${namespace} must not be in the sandbox policy`);
    }
    assert.deepEqual(SANDBOX_ALLOW.environment, ["get"]);
    assert.deepEqual(SANDBOX_ALLOW.appInstallation, ["get", "getMany"]);
  });
});
