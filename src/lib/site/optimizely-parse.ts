import { z } from "zod";

/** The Optimizely CMS demo site, which serves the same six brands from Optimizely CMS. */
export const OPTIMIZELY_SITE = "https://optimizely-cms-demo-two.vercel.app";
/** Where the Optimizely CMS demo serves its photos and logos from. */
export const OPTIMIZELY_IMAGE_ORIGIN = "https://app-epsakirbyas29ma1p001.cms.optimizely.com";

const HEX = /^#[0-9A-Fa-f]{6}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const brandSchema = z.object({
  slug: z.string().regex(SLUG).max(80),
  name: z.string().min(1).max(80),
  verticalLabel: z.string().max(60),
  summary: z.string().max(300),
  colorBrand: z.string().regex(HEX),
  colorBackground: z.string().regex(HEX),
  logoUrl: z.string().url().nullable(),
  logoAlt: z.string().max(200).nullable().optional(),
  url: z.string().url(),
});

export interface OptimizelyBrand {
  slug: string;
  name: string;
  verticalLabel: string;
  summary: string;
  colorBrand: string;
  colorBackground: string;
  /** Only ever an https address on the Optimizely CMS image host. */
  logoUrl: string | null;
  logoAlt: string;
  /** Always an address on the Optimizely CMS demo site. */
  url: string;
}

/**
 * Checks the brand list the Optimizely CMS demo publishes at /api/brands. It comes from another site, so
 * every value is validated and addresses are limited to the two known origins. Anything else is dropped.
 */
export function parseOptimizelyBrands(json: unknown): OptimizelyBrand[] {
  const list = (json as { brands?: unknown } | null)?.brands;
  if (!Array.isArray(list)) return [];
  const brands: OptimizelyBrand[] = [];
  for (const item of list) {
    const parsed = brandSchema.safeParse(item);
    if (!parsed.success) continue;
    const b = parsed.data;
    if (b.url !== `${OPTIMIZELY_SITE}/${b.slug}`) continue;
    const logoUrl = b.logoUrl && b.logoUrl.startsWith(`${OPTIMIZELY_IMAGE_ORIGIN}/`) ? b.logoUrl : null;
    brands.push({ slug: b.slug, name: b.name, verticalLabel: b.verticalLabel, summary: b.summary, colorBrand: b.colorBrand, colorBackground: b.colorBackground, logoUrl, logoAlt: b.logoAlt ?? b.name, url: b.url });
  }
  return brands;
}
