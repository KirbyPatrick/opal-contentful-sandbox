import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { PlainClientAPI } from "contentful-management";
import { MasterGuardError } from "../src/lib/contentful/guard";
import { createOpalClientFrom, createSandboxClientFrom, getSandboxClient } from "../src/lib/contentful/management";

/** A stand-in SDK client: every method exists, and environment lookups come from a fixed table. */
function fakeRawClient(environments: Record<string, object>) {
  const requests: string[] = [];
  const environmentGet = async ({ environmentId }: { environmentId: string }) => {
    requests.push(`environment.get ${environmentId}`);
    const found = environments[environmentId];
    if (!found) {
      throw new Error("404 NotFound");
    }
    return found;
  };
  const namespace = (name: string) =>
    new Proxy(
      {},
      {
        get: (_target, method) =>
          name === "environment" && method === "get"
            ? environmentGet
            : async () => {
                requests.push(`${name}.${String(method)}`);
                return {};
              },
      },
    );
  const raw = new Proxy({}, { get: (_target, name) => namespace(String(name)) }) as unknown as PlainClientAPI;
  return { raw, requests };
}

const target = { spaceId: "space1", environmentId: "opal-sandbox" };

describe("createSandboxClientFrom", () => {
  it("returns a pinned client after the live check passes", async () => {
    const { raw, requests } = fakeRawClient({
      master: { sys: { id: "master" } },
      "opal-sandbox": { sys: { id: "opal-sandbox" } },
    });
    const client = await createSandboxClientFrom(raw, target);
    assert.deepEqual(requests.sort(), ["environment.get master", "environment.get opal-sandbox"]);
    assert.throws(() => client.entry.get({ entryId: "x", environmentId: "master" }));
  });

  it("refuses when master resolves to the sandbox, and hands out no client", async () => {
    const { raw, requests } = fakeRawClient({
      master: { sys: { id: "master", aliasedEnvironment: { sys: { id: "opal-sandbox" } } } },
      "opal-sandbox": { sys: { id: "opal-sandbox", aliases: [{ sys: { id: "master" } }] } },
    });
    await assert.rejects(createSandboxClientFrom(raw, target), MasterGuardError);
    assert.ok(requests.every((request) => request.startsWith("environment.get")));
  });
});

describe("createOpalClientFrom", () => {
  it("runs the live master check, then returns a pinned client without delete or archive", async () => {
    const { raw, requests } = fakeRawClient({
      master: { sys: { id: "master" } },
      "opal-sandbox": { sys: { id: "opal-sandbox" } },
    });
    const client = await createOpalClientFrom(raw, target);
    assert.deepEqual(requests.sort(), ["environment.get master", "environment.get opal-sandbox"]);
    assert.throws(() => client.entry.get({ entryId: "x", environmentId: "master" }));
    assert.throws(() => (client.entry as unknown as Record<string, unknown>).delete);
  });

  it("refuses, and hands out no client, when master resolves to the sandbox", async () => {
    const { raw } = fakeRawClient({
      master: { sys: { id: "master", aliasedEnvironment: { sys: { id: "opal-sandbox" } } } },
      "opal-sandbox": { sys: { id: "opal-sandbox", aliases: [{ sys: { id: "master" } }] } },
    });
    await assert.rejects(createOpalClientFrom(raw, target), MasterGuardError);
  });
});

describe("getSandboxClient", () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it("refuses CONTENTFUL_ENVIRONMENT_ID=master before creating a client", async () => {
    process.env.CONTENTFUL_SPACE_ID = "space1";
    process.env.CONTENTFUL_ENVIRONMENT_ID = "master";
    process.env.CONTENTFUL_MANAGEMENT_TOKEN = "test-token-not-real-0000000000";
    await assert.rejects(getSandboxClient(), MasterGuardError);
  });

  it("refuses when CONTENTFUL_ENVIRONMENT_ID is missing", async () => {
    process.env.CONTENTFUL_SPACE_ID = "space1";
    delete process.env.CONTENTFUL_ENVIRONMENT_ID;
    process.env.CONTENTFUL_MANAGEMENT_TOKEN = "test-token-not-real-0000000000";
    await assert.rejects(getSandboxClient(), MasterGuardError);
  });
});
