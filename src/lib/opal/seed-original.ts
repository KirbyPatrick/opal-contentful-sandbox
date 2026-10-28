/**
 * The site's original content, straight from the seed files, so revert_entry can put a seed entry back
 * the way it shipped. The sandbox environment keeps no version history (Contentful snapshots exist only
 * in master), so the seed is the record of "original". Same conversion as the seed script, so the result
 * matches what npm run seed writes.
 */
import clearwaterHealth from "../../../seed/brands/clearwater-health";
import example from "../../../seed/brands/example";
import harborlineMutual from "../../../seed/brands/harborline-mutual";
import ledgerwoodBank from "../../../seed/brands/ledgerwood-bank";
import lumenwork from "../../../seed/brands/lumenwork";
import stuchberys from "../../../seed/brands/stuchberys";
import tidewaterJourneys from "../../../seed/brands/tidewater-journeys";
import type { SeedEntry } from "../../../seed/lib/builders";
import { markdownToRichText } from "../richtext/markdown";
import { LOCALE } from "./context";

const SEED: readonly SeedEntry[] = [
  ...lumenwork, ...stuchberys, ...harborlineMutual, ...clearwaterHealth, ...ledgerwoodBank, ...tidewaterJourneys, ...example,
];

let byId: Map<string, SeedEntry> | undefined;

/** The entry's original fields in Contentful's localized shape, or undefined if it is not seed content. */
export function originalFields(entryId: string): Record<string, Record<string, unknown>> | undefined {
  byId ??= new Map(SEED.map((entry) => [entry.id, entry]));
  const entry = byId.get(entryId);
  if (!entry) return undefined;
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
