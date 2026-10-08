/**
 * Pure logic for the baseline and reset scripts (no network, no files), so it
 * can be tested without Contentful.
 *
 * - baseline: a fingerprint of every non-Opal entry in the sandbox, so a later
 *   check can say exactly what changed.
 * - reset plan: what to delete (content created through the Opal API) and what
 *   to restore (seed entries that were edited, unpublished, or removed).
 */
import { createHash } from "node:crypto";
import { stable } from "./sync";

export type LocalizedFields = Record<string, Record<string, unknown>>;

export interface LiveEntry {
  id: string;
  type: string;
  title: string;
  tags: string[];
  /** True only when a published version exists and there are no newer unpublished changes. */
  published: boolean;
  fields: LocalizedFields;
}

export const hashFields = (fields: LocalizedFields): string => createHash("sha256").update(stable(fields)).digest("hex");

// ---------- baseline ----------

export interface BaselineEntry {
  id: string;
  type: string;
  hash: string;
  published: boolean;
}

export interface Baseline {
  version: 1;
  environmentId: string;
  exportedAt: string;
  entries: BaselineEntry[];
}

/** Entries created through the Opal API are never part of the baseline. */
export function buildBaseline(environmentId: string, exportedAt: string, live: readonly LiveEntry[]): Baseline {
  const entries = live
    .filter((entry) => !entry.tags.includes("opal"))
    .map((entry) => ({ id: entry.id, type: entry.type, hash: hashFields(entry.fields), published: entry.published }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return { version: 1, environmentId, exportedAt, entries };
}

export interface BaselineDiff {
  /** Content differs from the baseline. */
  changed: string[];
  /** Was published in the baseline, now a draft, unpublished, or has unpublished changes. */
  unpublished: string[];
  /** In the baseline but gone. */
  missing: string[];
  /** Not in the baseline (for example created through the Opal API). */
  added: Array<{ id: string; type: string; title: string; tags: string[] }>;
}

export function diffBaseline(baseline: Baseline, live: readonly LiveEntry[]): BaselineDiff {
  const liveById = new Map(live.map((entry) => [entry.id, entry]));
  const known = new Set(baseline.entries.map((entry) => entry.id));
  const diff: BaselineDiff = { changed: [], unpublished: [], missing: [], added: [] };
  for (const expected of baseline.entries) {
    const current = liveById.get(expected.id);
    if (!current) {
      diff.missing.push(expected.id);
      continue;
    }
    if (hashFields(current.fields) !== expected.hash) diff.changed.push(expected.id);
    if (expected.published && !current.published) diff.unpublished.push(expected.id);
  }
  for (const entry of live) {
    if (!known.has(entry.id)) diff.added.push({ id: entry.id, type: entry.type, title: entry.title, tags: entry.tags });
  }
  return diff;
}

export const isClean = (diff: BaselineDiff): boolean =>
  diff.changed.length + diff.unpublished.length + diff.missing.length + diff.added.length === 0;

// ---------- reset ----------

export interface SeedExpectation {
  id: string;
  contentType: string;
  fields: LocalizedFields;
}

export type RestoreReason = "missing" | "edited" | "unpublished or has unpublished changes";

export interface ResetPlan {
  /** Created through the Opal API: unpublished if needed, then deleted. */
  remove: Array<{ id: string; type: string; title: string; published: boolean }>;
  /** Seed entries the seed script will put back (and republish). */
  restore: Array<{ id: string; reason: RestoreReason }>;
  /** Tagged opal but also a seed entry: never deleted. */
  refused: Array<{ id: string; why: string }>;
}

export function planReset(live: readonly LiveEntry[], seed: readonly SeedExpectation[]): ResetPlan {
  const seedIds = new Set(seed.map((entry) => entry.id));
  const plan: ResetPlan = { remove: [], restore: [], refused: [] };

  for (const entry of live) {
    if (!entry.tags.includes("opal")) continue;
    if (seedIds.has(entry.id) || entry.tags.includes("seed")) {
      plan.refused.push({ id: entry.id, why: "it is also a seed entry, so it is restored, never deleted" });
      continue;
    }
    plan.remove.push({ id: entry.id, type: entry.type, title: entry.title, published: entry.published });
  }

  const liveById = new Map(live.map((entry) => [entry.id, entry]));
  for (const expected of seed) {
    const current = liveById.get(expected.id);
    if (!current) plan.restore.push({ id: expected.id, reason: "missing" });
    else if (stable(current.fields) !== stable(expected.fields)) plan.restore.push({ id: expected.id, reason: "edited" });
    else if (!current.published) plan.restore.push({ id: expected.id, reason: "unpublished or has unpublished changes" });
  }

  plan.remove.sort((a, b) => a.id.localeCompare(b.id));
  return plan;
}

/** The plan as a comparable string, so --confirm can refuse if the sandbox changed since the dry run. */
export const planFingerprint = (plan: ResetPlan): string =>
  JSON.stringify([plan.remove.map((item) => item.id).sort(), plan.restore.map((item) => `${item.id}:${item.reason}`).sort()]);
