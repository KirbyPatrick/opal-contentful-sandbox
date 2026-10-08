import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBaseline, diffBaseline, hashFields, isClean, planFingerprint, planReset,
  type LiveEntry, type SeedExpectation,
} from "../seed/lib/baseline";

const loc = (value: unknown) => ({ "en-US": value });
const live = (id: string, over: Partial<LiveEntry> = {}): LiveEntry => ({
  id, type: "article", title: id, tags: ["seed"], published: true, fields: { title: loc(`Title ${id}`), summary: loc("S") }, ...over,
});
const seed = (id: string, fields = { title: loc(`Title ${id}`), summary: loc("S") }): SeedExpectation => ({ id, contentType: "article", fields });

describe("hashFields", () => {
  it("ignores key order and changes with content", () => {
    assert.equal(hashFields({ a: loc(1), b: loc(2) }), hashFields({ b: loc(2), a: loc(1) }));
    assert.notEqual(hashFields({ a: loc(1) }), hashFields({ a: loc(2) }));
    assert.match(hashFields({}), /^[0-9a-f]{64}$/);
  });
});

describe("baseline", () => {
  const entries = [live("b"), live("a"), live("op", { tags: ["opal"] })];

  it("excludes Opal-created entries and sorts by id", () => {
    const baseline = buildBaseline("opal-sandbox", "2026-10-08T00:00:00Z", entries);
    assert.deepEqual(baseline.entries.map((e) => e.id), ["a", "b"]);
    assert.equal(baseline.environmentId, "opal-sandbox");
  });

  it("is clean against the state it was built from, apart from the Opal entry it ignores", () => {
    const baseline = buildBaseline("opal-sandbox", "x", entries);
    const diff = diffBaseline(baseline, entries);
    assert.deepEqual(diff.added.map((a) => a.id), ["op"]);
    assert.deepEqual([diff.changed, diff.unpublished, diff.missing], [[], [], []]);
    assert.equal(isClean(diffBaseline(baseline, entries.filter((e) => e.id !== "op"))), true);
  });

  it("reports changed content, lost publication, missing, and added entries", () => {
    const baseline = buildBaseline("opal-sandbox", "x", [live("a"), live("b"), live("c")]);
    const now = [
      live("a", { fields: { title: loc("Edited"), summary: loc("S") } }),
      live("b", { published: false }),
      live("new", { tags: ["opal"] }),
    ];
    const diff = diffBaseline(baseline, now);
    assert.deepEqual(diff.changed, ["a"]);
    assert.deepEqual(diff.unpublished, ["b"]);
    assert.deepEqual(diff.missing, ["c"]);
    assert.deepEqual(diff.added.map((a) => a.id), ["new"]);
    assert.equal(isClean(diff), false);
  });

  it("does not flag an entry that was unpublished in the baseline too", () => {
    const baseline = buildBaseline("opal-sandbox", "x", [live("d", { published: false })]);
    assert.deepEqual(diffBaseline(baseline, [live("d", { published: false })]).unpublished, []);
  });
});

describe("planReset", () => {
  it("has nothing to do when the sandbox matches the seed", () => {
    const plan = planReset([live("a"), live("b")], [seed("a"), seed("b")]);
    assert.deepEqual(plan, { remove: [], restore: [], refused: [] });
  });

  it("deletes only entries tagged opal", () => {
    const plan = planReset(
      [live("a"), live("op1", { tags: ["opal"], published: false }), live("op2", { tags: ["opal"] }), live("untagged", { tags: [] })],
      [seed("a")],
    );
    assert.deepEqual(plan.remove.map((r) => r.id), ["op1", "op2"]);
    assert.ok(!plan.remove.some((r) => r.id === "a" || r.id === "untagged"));
  });

  it("never deletes a seed entry, even if it is tagged opal", () => {
    const plan = planReset(
      [live("a", { tags: ["opal"] }), live("b", { tags: ["opal", "seed"] }), live("c", { tags: ["opal"] })],
      [seed("a")],
    );
    assert.deepEqual(plan.remove.map((r) => r.id), ["c"]);
    assert.deepEqual(plan.refused.map((r) => r.id).sort(), ["a", "b"]);
  });

  it("restores seed entries that were edited, unpublished, or removed", () => {
    const plan = planReset(
      [live("a", { fields: { title: loc("Edited"), summary: loc("S") } }), live("b", { published: false }), live("ok")],
      [seed("a"), seed("b"), seed("ok"), seed("gone")],
    );
    assert.deepEqual(plan.restore, [
      { id: "a", reason: "edited" },
      { id: "b", reason: "unpublished or has unpublished changes" },
      { id: "gone", reason: "missing" },
    ]);
  });

  it("fingerprints a plan so --confirm can refuse a changed sandbox", () => {
    const base = planReset([live("op", { tags: ["opal"] })], []);
    assert.equal(planFingerprint(base), planFingerprint(planReset([live("op", { tags: ["opal"] })], [])));
    assert.notEqual(planFingerprint(base), planFingerprint(planReset([live("op", { tags: ["opal"] }), live("op2", { tags: ["opal"] })], [])));
    assert.notEqual(planFingerprint(base), planFingerprint(planReset([live("op", { tags: ["opal"] })], [seed("missing")])));
  });
});
