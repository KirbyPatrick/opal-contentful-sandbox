import "server-only";
import { createClient, type ContentfulClientApi } from "contentful";
import { unstable_cache } from "next/cache";
import { siteConfig } from "./config";
import type { BrandGraphData, BrandSummary, SiteAsset, SiteEntry } from "./types";

/**
 * Reads published content (Delivery API) or drafts (Preview API) from the
 * configured sandbox environment. Published reads are cached per brand and
 * tagged, so the revalidation webhook can refresh one brand at a time. A
 * 30 second fallback window covers missed webhooks. Draft reads are never cached.
 */

export const CACHE_TAG_ALL = "contentful";
export const brandTag = (slug: string) => `brand:${slug}`;
const FALLBACK_REVALIDATE_SECONDS = 30;
const BRAND_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Client = ContentfulClientApi<"WITHOUT_LINK_RESOLUTION">;
const clients: { delivery?: Client; preview?: Client } = {};

function client(preview: boolean): Client {
  const key = preview ? "preview" : "delivery";
  if (!clients[key]) {
    const config = siteConfig();
    clients[key] = createClient({
      space: config.CONTENTFUL_SPACE_ID,
      environment: config.CONTENTFUL_ENVIRONMENT_ID,
      accessToken: preview ? config.CONTENTFUL_PREVIEW_TOKEN : config.CONTENTFUL_DELIVERY_TOKEN,
      host: preview ? "preview.contentful.com" : "cdn.contentful.com",
      timeout: 15_000,
      retryLimit: 3,
    }).withoutLinkResolution;
  }
  return clients[key]!;
}

interface RawEntry { sys: { id: string; updatedAt: string; contentType: { sys: { id: string } } }; fields: Record<string, unknown> }
interface RawAsset {
  sys: { id: string };
  fields: { title?: string; file?: { url?: string; contentType?: string; details?: { image?: { width?: number; height?: number } } } };
}

const toEntry = (raw: RawEntry): SiteEntry => ({
  id: raw.sys.id,
  type: raw.sys.contentType.sys.id,
  updatedAt: raw.sys.updatedAt,
  fields: raw.fields,
});

function toAsset(raw: RawAsset): SiteAsset | undefined {
  const file = raw.fields.file;
  if (!file?.url) return undefined;
  const url = file.url.startsWith("//") ? `https:${file.url}` : file.url;
  if (!url.startsWith("https://images.ctfassets.net/")) return undefined;
  return {
    id: raw.sys.id,
    url,
    contentType: file.contentType ?? "image/jpeg",
    width: file.details?.image?.width,
    height: file.details?.image?.height,
    alt: (raw.fields.title ?? "").slice(0, 125),
  };
}

async function allEntries(api: Client, query: Record<string, unknown>): Promise<RawEntry[]> {
  const items: RawEntry[] = [];
  for (let skip = 0; ; skip += 1000) {
    const page = await api.getEntries({ ...query, limit: 1000, skip, locale: "en-US" });
    items.push(...(page.items as unknown as RawEntry[]));
    if (skip + page.items.length >= page.total) return items;
  }
}

async function fetchBrandGraph(slug: string, preview: boolean): Promise<BrandGraphData | null> {
  const api = client(preview);
  const found = await api.getEntries({ content_type: "brand", "fields.slug": slug, limit: 1, locale: "en-US" });
  const brandRaw = found.items[0] as unknown as RawEntry | undefined;
  if (!brandRaw) return null;
  const [entries, assets] = await Promise.all([
    allEntries(api, { links_to_entry: brandRaw.sys.id }),
    api.getAssets({ "metadata.tags.sys.id[in]": [`brand-${slug}`], limit: 1000, locale: "en-US" }),
  ]);
  return {
    brand: toEntry(brandRaw),
    entries: entries.map(toEntry),
    assets: (assets.items as unknown as RawAsset[]).map(toAsset).filter((a): a is SiteAsset => Boolean(a)),
  };
}

export async function getBrandGraph(slug: string, preview: boolean): Promise<BrandGraphData | null> {
  if (!BRAND_SLUG.test(slug) || slug.length > 40) return null;
  if (preview) return fetchBrandGraph(slug, true);
  const cached = unstable_cache(() => fetchBrandGraph(slug, false), ["brand-graph", slug], {
    tags: [CACHE_TAG_ALL, brandTag(slug)],
    revalidate: FALLBACK_REVALIDATE_SECONDS,
  });
  return cached();
}

async function fetchBrandList(preview: boolean): Promise<BrandSummary[]> {
  const api = client(preview);
  const brands = (await allEntries(api, { content_type: "brand", order: ["fields.name"] })).map(toEntry);
  const logoIds = brands.map((brand) => (brand.fields.logo as { sys?: { id?: string } } | undefined)?.sys?.id).filter(Boolean) as string[];
  const logos = logoIds.length
    ? (await api.getAssets({ "sys.id[in]": logoIds, limit: 100, locale: "en-US" })).items as unknown as RawAsset[]
    : [];
  const logoById = new Map(logos.map(toAsset).filter((a): a is SiteAsset => Boolean(a)).map((a) => [a.id, a]));
  return brands.map((brand) => ({
    slug: String(brand.fields.slug ?? ""),
    name: String(brand.fields.name ?? ""),
    vertical: String(brand.fields.vertical ?? ""),
    shortDescription: String(brand.fields.shortDescription ?? ""),
    tagline: typeof brand.fields.tagline === "string" ? brand.fields.tagline : undefined,
    logo: logoById.get((brand.fields.logo as { sys?: { id?: string } } | undefined)?.sys?.id ?? ""),
    colorBrand: String(brand.fields.colorBrand ?? "#1c1c1c"),
    colorBackground: String(brand.fields.colorBackground ?? "#ffffff"),
  }));
}

export async function getBrandList(preview: boolean): Promise<BrandSummary[]> {
  if (preview) return fetchBrandList(true);
  return unstable_cache(() => fetchBrandList(false), ["brand-list"], {
    tags: [CACHE_TAG_ALL, "brands"],
    revalidate: FALLBACK_REVALIDATE_SECONDS,
  })();
}

/** Used by the draft route to find where an entry lives. Preview API, never cached. */
export async function findEntryForPreview(entryId: string): Promise<{ entry: SiteEntry; brandSlug?: string } | null> {
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(entryId)) return null;
  const api = client(true);
  try {
    const raw = (await api.getEntry(entryId, { locale: "en-US" })) as unknown as RawEntry;
    const entry = toEntry(raw);
    if (entry.type === "brand") return { entry, brandSlug: String(entry.fields.slug ?? "") };
    const brandId = (entry.fields.brand as { sys?: { id?: string } } | undefined)?.sys?.id;
    if (!brandId) return { entry };
    const brand = toEntry((await api.getEntry(brandId, { locale: "en-US" })) as unknown as RawEntry);
    return { entry, brandSlug: String(brand.fields.slug ?? "") };
  } catch {
    return null;
  }
}
