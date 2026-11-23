/**
 * Contentful's Live Preview pane opens one URL per platform, and Contentful remembers the platform last
 * picked for a content type. Patio Enclosures (/example) and Leafguard (/placeholder) share the Page and
 * Hero types, so a fixed URL per platform shows the wrong page after switching between their entries. The
 * platforms open /api/live-preview?entry={entry.sys.id} instead, and this picks the page from the entry.
 */

/** Seeded sandbox entry IDs start with the brand's prefix (seed/brands/*.ts, defineBrand). */
const PREFIX_TO_SLUG: Readonly<Record<string, string>> = { ex: "example", ph: "placeholder" };
const SANDBOX_PATHS: Readonly<Record<string, string>> = { example: "/example", placeholder: "/placeholder" };
const ENTRY_ID = /^[A-Za-z0-9._-]{1,64}$/;

export const isEntryId = (value: string | null): value is string => value !== null && ENTRY_ID.test(value);

/** The brand slug a seeded sandbox entry belongs to, from its ID alone, or undefined. */
export function sandboxSlugFromId(entryId: string): string | undefined {
  const prefix = /^([a-z]+)-/.exec(entryId)?.[1];
  return prefix ? PREFIX_TO_SLUG[prefix] : undefined;
}

/** The draft URL for a sandbox brand slug. Only fixed paths come out, so the redirect cannot go elsewhere. */
export function livePreviewPath(slug: string | undefined): string | undefined {
  const path = slug ? SANDBOX_PATHS[slug] : undefined;
  return path ? `${path}?preview=true` : undefined;
}
