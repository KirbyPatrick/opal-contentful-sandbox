import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MasterGuardError,
  assertDoesNotResolveToMaster,
  assertSafeEnvironmentId,
  type EnvironmentSnapshot,
} from "../src/lib/contentful/guard";

describe("assertSafeEnvironmentId (static check)", () => {
  const refused: unknown[] = [undefined, null, 42, "", "   ", "master", "MASTER", "Master", " master", "master ", "\tmaster\n"];
  for (const value of refused) {
    it(`refuses ${JSON.stringify(value)}`, () => {
      assert.throws(() => assertSafeEnvironmentId(value), MasterGuardError);
    });
  }

  it("refuses surrounding whitespace on other IDs", () => {
    assert.throws(() => assertSafeEnvironmentId(" opal-sandbox"), MasterGuardError);
  });

  it("accepts a sandbox ID unchanged", () => {
    assert.equal(assertSafeEnvironmentId("opal-sandbox"), "opal-sandbox");
  });

  it("does not refuse names that merely contain master", () => {
    assert.equal(assertSafeEnvironmentId("not-master"), "not-master");
  });
});

const env = (id: string, sys: Partial<EnvironmentSnapshot["sys"]> = {}): EnvironmentSnapshot => ({
  sys: { id, ...sys },
});
const link = (id: string) => ({ sys: { id } });

function lookupFrom(environments: Record<string, EnvironmentSnapshot>) {
  const calls: string[] = [];
  const lookup = async (id: string) => {
    calls.push(id);
    const found = environments[id];
    if (!found) {
      throw new Error(`404 NotFound: ${id}`);
    }
    return found;
  };
  return { lookup, calls };
}

describe("assertDoesNotResolveToMaster (live check)", () => {
  it("accepts a separate environment", async () => {
    const { lookup, calls } = lookupFrom({ master: env("master"), "opal-sandbox": env("opal-sandbox") });
    await assertDoesNotResolveToMaster("opal-sandbox", lookup);
    assert.deepEqual(calls.sort(), ["master", "opal-sandbox"]);
  });

  it("refuses master before making any request", async () => {
    const { lookup, calls } = lookupFrom({ master: env("master") });
    await assert.rejects(assertDoesNotResolveToMaster("master", lookup), MasterGuardError);
    assert.equal(calls.length, 0);
  });

  it("refuses when the target is itself an alias", async () => {
    const { lookup } = lookupFrom({
      master: env("master"),
      "opal-sandbox": env("opal-sandbox", { aliasedEnvironment: link("some-env") }),
    });
    await assert.rejects(assertDoesNotResolveToMaster("opal-sandbox", lookup), MasterGuardError);
  });

  it("refuses when the lookup resolves to a different environment", async () => {
    const { lookup } = lookupFrom({ master: env("master"), "opal-sandbox": env("other-env") });
    await assert.rejects(assertDoesNotResolveToMaster("opal-sandbox", lookup), MasterGuardError);
  });

  it("refuses when master is one of the target's aliases", async () => {
    const { lookup } = lookupFrom({
      master: env("master", { aliasedEnvironment: link("master-2026-01") }),
      "master-2026-01": env("master-2026-01", { aliases: [link("master")] }),
    });
    await assert.rejects(assertDoesNotResolveToMaster("master-2026-01", lookup), MasterGuardError);
  });

  it("refuses when the master alias points at the target", async () => {
    const { lookup } = lookupFrom({
      master: env("master", { aliasedEnvironment: link("release-7") }),
      "release-7": env("release-7"),
    });
    await assert.rejects(assertDoesNotResolveToMaster("release-7", lookup), MasterGuardError);
  });

  it("fails closed when the master lookup fails", async () => {
    const { lookup } = lookupFrom({ "opal-sandbox": env("opal-sandbox") });
    await assert.rejects(assertDoesNotResolveToMaster("opal-sandbox", lookup), MasterGuardError);
  });

  it("fails closed when the target does not exist", async () => {
    const { lookup } = lookupFrom({ master: env("master") });
    await assert.rejects(assertDoesNotResolveToMaster("opal-sandbox", lookup), MasterGuardError);
  });
});
