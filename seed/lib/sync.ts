/**
 * Helpers shared by the seed, baseline, and reset scripts: loading the seed
 * definitions and turning them into Contentful field values, so every script
 * compares and writes exactly the same thing.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { markdownToRichText } from "../../src/lib/richtext/markdown";
import type { BrandSlug, SeedEntry } from "./builders";

export const LOCALE = "en-US";
export const BRANDS: BrandSlug[] = ["lumenwork", "stuchberys", "harborline-mutual", "clearwater-health", "ledgerwood-bank", "tidewater-journeys"];

export async function loadSeedEntries(slugs: readonly BrandSlug[]): Promise<SeedEntry[]> {
  const all: SeedEntry[] = [];
  for (const slug of slugs) {
    const module = (await import(`../brands/${slug}.ts`)) as { default?: SeedEntry[] };
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

export function toContentfulFields(entry: SeedEntry): Record<string, Record<string, unknown>> {
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
export function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
