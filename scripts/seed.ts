/**
 * Seeds the sandbox with the brand content in seed/brands/.
 *
 *   npm run seed -- --dry-run                    Validate everything offline. No network.
 *   npm run seed -- --dry-run --brand lumenwork  Validate one brand offline.
 *   npm run seed                                 Validate, then create or update entries and publish them.
 *
 * Idempotent: entry IDs are deterministic, unchanged entries are skipped, and
 * changed ones are updated in place. Everything is tagged seed.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describeError } from "../src/lib/contentful/errors";
import { getSandboxClient } from "../src/lib/contentful/management";
import { readSandboxTarget } from "../src/lib/contentful/config";
import { markdownToRichText } from "../src/lib/richtext/markdown";
import type { BrandSlug, SeedEntry } from "../seed/lib/builders";
import { validateGraph } from "../seed/lib/validate";

const LOCALE = "en-US";
const BRANDS: BrandSlug[] = ["lumenwork", "stuchberys", "harborline-mutual", "clearwater-health", "ledgerwood-bank", "tidewater-journeys"];
const BULK_LIMIT = 200;
const POLL_MS = 2_000;

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export async function loadSeedEntries(slugs: readonly BrandSlug[]): Promise<SeedEntry[]> {
  const all: SeedEntry[] = [];
  for (const slug of slugs) {
    const module = (await import(`../seed/brands/${slug}.ts`)) as { default?: SeedEntry[] };
    if (!Array.isArray(module.default)) throw new Error(`seed/brands/${slug}.ts must export default an array of entries (s.entries).`);
    all.push(...module.default);
  }
  return all;
}

/** Asset IDs the seed may reference: photos from the manifest plus logos and favicons. */
export function knownAssetIds(): Set<string> {
  const manifest = JSON.parse(readFileSync(join("assets", "manifest.json"), "utf8")) as { images: Array<{ key: string }> };
  const ids = new Set(manifest.images.map((image) => `img-${image.key}`));
  for (const slug of BRANDS) {
    ids.add(`logo-${slug}`);
    ids.add(`favicon-${slug}`);
  }
  return ids;
}

function toContentfulFields(entry: SeedEntry): Record<string, Record<string, unknown>> {
  const fields: Record<string, Record<string, unknown>> = {};
  for (const [key, value] of Object.entries(entry.fields)) {
    if (value === undefined) continue;
    const converted = typeof value === "object" && value !== null && "markdown" in value
      ? markdownToRichText((value as { markdown: string }).markdown)
      : value;
    fields[key] = { [LOCALE]: converted };
  }
  return fields;
}

/** JSON with sorted keys, for comparing field values. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function report(errors: string[], warnings: string[]): void {
  for (const warning of warnings) console.log(`warning  ${warning}`);
  for (const error of errors) console.log(`error    ${error}`);
  console.log(`\n${errors.length} errors, ${warnings.length} warnings.`);
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const only = arg("--brand") as BrandSlug | undefined;
  if (only && !BRANDS.includes(only)) throw new Error(`Unknown brand "${only}". Use one of: ${BRANDS.join(", ")}.`);

  const entries = await loadSeedEntries(only ? [only] : BRANDS);
  const counts = entries.reduce<Record<string, number>>((acc, entry) => ((acc[entry.contentType] = (acc[entry.contentType] ?? 0) + 1), acc), {});
  console.log(`Loaded ${entries.length} entries: ${Object.entries(counts).map(([type, n]) => `${type} ${n}`).join(", ")}`);

  const { errors, warnings } = validateGraph(entries, { assets: knownAssetIds(), mode: "seed" });
  report(errors, warnings);
  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }
  if (dryRun) {
    console.log("Dry run only. Nothing was written.");
    return;
  }
  if (only) throw new Error("Seeding a single brand is not supported; validate with --brand, then seed everything.");

  const client = await getSandboxClient();
  const { spaceId, environmentId } = readSandboxTarget();

  // Existing entries, for idempotent updates.
  const existing = new Map<string, Awaited<ReturnType<typeof client.entry.get>>>();
  for (let skip = 0; ; skip += 1000) {
    const page = await client.entry.getMany({ query: { limit: 1000, skip } });
    page.items.forEach((item) => existing.set(item.sys.id, item));
    if (skip + page.items.length >= page.total) break;
  }

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  const seedTag = { sys: { type: "Link" as const, linkType: "Tag" as const, id: "seed" } };
  for (const entry of entries) {
    const fields = toContentfulFields(entry);
    const current = existing.get(entry.id);
    if (!current) {
      await client.entry.createWithId({ entryId: entry.id, contentTypeId: entry.contentType }, { fields, metadata: { tags: [seedTag] } });
      created++;
      continue;
    }
    if (current.sys.contentType.sys.id !== entry.contentType) throw new Error(`${entry.id} exists with a different content type.`);
    const hasTag = current.metadata?.tags.some((tag) => tag.sys.id === "seed") ?? false;
    if (hasTag && stable(current.fields) === stable(fields)) {
      unchanged++;
      continue;
    }
    const tags = hasTag ? current.metadata!.tags : [...(current.metadata?.tags ?? []), seedTag];
    await client.entry.update({ entryId: entry.id }, { ...current, fields, metadata: { ...current.metadata, tags } });
    updated++;
  }
  console.log(`Entries: ${created} created, ${updated} updated, ${unchanged} unchanged.`);

  // Publish everything that is new or has unpublished changes.
  const toPublish: Array<{ sys: { type: "Link"; linkType: "Entry"; id: string; version: number } }> = [];
  const ids = entries.map((entry) => entry.id);
  for (let i = 0; i < ids.length; i += 100) {
    const page = await client.entry.getMany({ query: { "sys.id[in]": ids.slice(i, i + 100).join(","), limit: 100 } });
    for (const item of page.items) {
      const published = item.sys.publishedVersion;
      if (!published || item.sys.version > published + 1) {
        toPublish.push({ sys: { type: "Link", linkType: "Entry", id: item.sys.id, version: item.sys.version } });
      }
    }
  }
  for (let i = 0; i < toPublish.length; i += BULK_LIMIT) {
    const batch = toPublish.slice(i, i + BULK_LIMIT);
    const action = await client.bulkAction.publish({ spaceId, environmentId }, { entities: { sys: { type: "Array" }, items: batch } });
    for (;;) {
      const state = await client.bulkAction.get({ spaceId, environmentId, bulkActionId: action.sys.id });
      if (state.sys.status === "succeeded") break;
      if (state.sys.status === "failed") {
        const details = (state.error?.details?.errors ?? []) as Array<{ entity?: { sys?: { id?: string } }; error?: { sys?: { id?: string }; details?: unknown } }>;
        for (const detail of details.slice(0, 25)) {
          console.log(`publish failed  ${detail.entity?.sys?.id}: ${detail.error?.sys?.id} ${JSON.stringify(detail.error?.details ?? "").slice(0, 300)}`);
        }
        throw new Error(`Bulk publish failed for ${details.length} entries.`);
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
    console.log(`Published ${Math.min(i + BULK_LIMIT, toPublish.length)} of ${toPublish.length}.`);
  }

  const stale = [...existing.keys()].filter((id) => !ids.includes(id) && existing.get(id)?.metadata?.tags.some((tag) => tag.sys.id === "seed"));
  if (stale.length) console.log(`Note: ${stale.length} seed-tagged entries are no longer in seed/ (left in place): ${stale.slice(0, 10).join(", ")}`);
  console.log("Seed complete.");
}

main().catch((error: unknown) => {
  console.error(`Seed stopped: ${describeError(error)}`);
  process.exitCode = 1;
});
