/**
 * The six brands, in one place.
 *
 * - key:  the original brand name. It never changes, because it is part of entry IDs (brand-<key>),
 *         asset IDs (img-<key>-NN, logo-<key>), the seed file names in seed/brands/, and the logo folders in
 *         assets/brand/. IDs cannot be renamed in Contentful.
 * - slug: the URL part (/<slug>) and the image pool tag (brand-<slug>). This is what visitors and agents see.
 * - name: the brand name shown on the site and in logos.
 *
 * To rebrand, change slug and name here and in the brand's seed file, regenerate logos, then follow
 * docs/rebrand.md.
 */
export const BRAND_INFO = [
  { key: "lumenwork", slug: "stoutware", name: "StoutWare" },
  { key: "stuchberys", slug: "stuchbery-acres", name: "Stuchbery Acres" },
  { key: "harborline-mutual", slug: "defeo-mutual", name: "DeFeo Mutual" },
  { key: "clearwater-health", slug: "st-isaacs-health", name: "St. Isaac's Health" },
  { key: "ledgerwood-bank", slug: "ledgerwood-bank", name: "Ledgerwood Bank" },
  { key: "tidewater-journeys", slug: "tidewater-journeys", name: "Tidewater Journeys" },
] as const;

/**
 * Sandbox brands: a single off-funnel page with no logo, photos, or funnel of its own, seeded with the six
 * brands so Opal can edit it and npm run reset restores it. The Example brand holds the /example page, used
 * to recreate a prospect's page during a demo. Its URL is a fixed route (src/app/example), not /[brand].
 */
export const SANDBOX_BRAND_INFO = [
  { key: "example", slug: "example", name: "Example" },
] as const;

export type BrandKey = (typeof BRAND_INFO)[number]["key"] | (typeof SANDBOX_BRAND_INFO)[number]["key"];

/** The six full brands. Logos, photo pools, and tags exist only for these. */
export const BRAND_KEYS: BrandKey[] = BRAND_INFO.map((brand) => brand.key);

/** Every brand the seed writes: the six full brands, then the sandbox brands. */
export const SEED_BRAND_KEYS: BrandKey[] = [...BRAND_KEYS, ...SANDBOX_BRAND_INFO.map((brand) => brand.key)];

export function brandInfo(key: string): (typeof BRAND_INFO)[number] {
  const found = BRAND_INFO.find((brand) => brand.key === key);
  if (!found) throw new Error(`Unknown brand key "${key}".`);
  return found;
}
