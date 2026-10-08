/**
 * Shared plumbing for the tools: brand lookup, entry loading, status, URLs,
 * and the response view that every tool returns for an entry. No HTTP here.
 */
import type { AssetProps, EntryProps } from "contentful-management";
import type { OpalClient } from "../contentful/policy";
import { ToolError, upstreamToToolError } from "./errors";
import { ID_PATTERN, TYPES, type TypeSpec } from "./fields";
import { buildPreviewUrl } from "./preview";
import { richTextToMarkdown } from "./markdown";

export const LOCALE = "en-US";

export interface ToolContext {
  client: OpalClient;
  /** Site origin, no trailing slash. */
  siteUrl: string;
  previewSecret: string;
  now: Date;
  /** Per-request memo, so repeated lookups inside one tool call cost one request. */
  memo: Map<string, Promise<unknown>>;
}

export type Entry = EntryProps;
export type Asset = AssetProps;

export function memoize<T>(ctx: ToolContext, key: string, load: () => Promise<T>): Promise<T> {
  let hit = ctx.memo.get(key) as Promise<T> | undefined;
  if (!hit) {
    hit = load();
    ctx.memo.set(key, hit);
  }
  return hit;
}

// ---------- field readers ----------

export function fieldValue(entry: Pick<Entry, "fields">, name: string): unknown {
  const localized = (entry.fields as Record<string, Record<string, unknown> | undefined>)[name];
  return localized?.[LOCALE];
}

export function linkId(value: unknown): string | undefined {
  const id = (value as { sys?: { id?: unknown } } | undefined)?.sys?.id;
  return typeof id === "string" ? id : undefined;
}

const text = (entry: Entry, name: string): string | undefined => {
  const value = fieldValue(entry, name);
  return typeof value === "string" && value !== "" ? value : undefined;
};

export const contentTypeOf = (entry: Entry): string => entry.sys.contentType.sys.id;

export type EntryStatus = "draft" | "published" | "changed" | "archived";

/** published: live and unchanged. changed: live, with newer unpublished edits. Works for entries and assets. */
export function entryStatus(sys: { version: number; publishedVersion?: number; archivedVersion?: number }): EntryStatus {
  if (sys.archivedVersion !== undefined) return "archived";
  if (sys.publishedVersion === undefined) return "draft";
  return sys.version > sys.publishedVersion + 1 ? "changed" : "published";
}

// ---------- brands ----------

export interface Brand {
  id: string;
  slug: string;
  name: string;
  vertical: string;
  shortDescription: string;
  tagline?: string;
  voiceDescription: string;
  voiceDos: string[];
  voiceDonts: string[];
  photoDirection?: string;
  homePageId?: string;
}

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);

function toBrand(entry: Entry): Brand {
  return {
    id: entry.sys.id,
    slug: text(entry, "slug") ?? "",
    name: text(entry, "name") ?? "",
    vertical: text(entry, "vertical") ?? "",
    shortDescription: text(entry, "shortDescription") ?? "",
    tagline: text(entry, "tagline"),
    voiceDescription: text(entry, "voiceDescription") ?? "",
    voiceDos: strings(fieldValue(entry, "voiceDos")),
    voiceDonts: strings(fieldValue(entry, "voiceDonts")),
    photoDirection: text(entry, "photoDirection"),
    homePageId: linkId(fieldValue(entry, "homePage")),
  };
}

export function loadBrands(ctx: ToolContext): Promise<Brand[]> {
  return memoize(ctx, "brands", async () => {
    const result = await ctx.client.entry.getMany({ query: { content_type: "brand", limit: 100, order: "fields.name" } });
    return result.items.map(toBrand);
  });
}

/** Matches a brand by slug or exact name (case-insensitive). Never guesses. */
export async function resolveBrand(ctx: ToolContext, input: string): Promise<Brand> {
  const wanted = input.trim().toLowerCase();
  const brands = await loadBrands(ctx);
  const found = brands.find((brand) => brand.slug.toLowerCase() === wanted || brand.name.toLowerCase() === wanted);
  if (found) return found;
  throw new ToolError(
    "unknown_brand",
    `"${input.trim().slice(0, 60)}" is not one of this site's brands. Do not guess: ask the user which brand they mean. Available brands: ${brands.map((b) => b.slug).join(", ")}.`,
  );
}

export async function brandOfEntry(ctx: ToolContext, entry: Entry): Promise<Brand> {
  const brands = await loadBrands(ctx);
  const brandId = contentTypeOf(entry) === "brand" ? entry.sys.id : linkId(fieldValue(entry, "brand"));
  const found = brands.find((brand) => brand.id === brandId);
  if (!found) throw new ToolError("not_allowed", "This entry does not belong to a known brand, so it cannot be used here.");
  return found;
}

// ---------- entries and assets ----------

export async function loadEntry(ctx: ToolContext, entryId: string): Promise<Entry> {
  if (!ID_PATTERN.test(entryId)) throw new ToolError("invalid_input", "entry_id must be a Contentful entry ID.");
  try {
    return await ctx.client.entry.get({ entryId });
  } catch (error) {
    throw upstreamToToolError(error, `Entry "${entryId}"`);
  }
}

export function specFor(entry: Entry): TypeSpec | undefined {
  return TYPES[contentTypeOf(entry)];
}

/** The agent says which brand it means; the entry must agree. A mix-up is refused, not fixed. */
export async function assertEntryInBrand(ctx: ToolContext, entry: Entry, brand: Brand): Promise<void> {
  const owner = await brandOfEntry(ctx, entry);
  if (owner.id !== brand.id) {
    throw new ToolError(
      "not_allowed",
      `Entry "${entry.sys.id}" belongs to ${owner.name} (${owner.slug}), not ${brand.name}. Check the entry ID and the brand with the user.`,
    );
  }
}

const IMAGE_POOL_TAG = (brand: Brand) => `brand-${brand.slug}`;

/** An image the brand may use: tagged for the brand, and an image file. */
export async function assertBrandImage(ctx: ToolContext, brand: Brand, assetId: string, field: string): Promise<void> {
  let asset: Asset;
  try {
    asset = await ctx.client.asset.get({ assetId });
  } catch (error) {
    const mapped = upstreamToToolError(error, `Asset "${assetId}"`);
    if (mapped instanceof ToolError && mapped.code === "not_found") {
      throw new ToolError("invalid_input", `${field}: asset "${assetId}" does not exist. Use an asset_id from list_brand_images.`);
    }
    throw mapped;
  }
  const tagged = (asset.metadata?.tags ?? []).some((tag) => tag.sys.id === IMAGE_POOL_TAG(brand));
  const contentType = (asset.fields.file?.[LOCALE] as { contentType?: string } | undefined)?.contentType ?? "";
  if (!tagged || !contentType.startsWith("image/")) {
    throw new ToolError(
      "invalid_input",
      `${field}: asset "${assetId}" is not in ${brand.name}'s image pool. Use an asset_id from list_brand_images for ${brand.slug}.`,
    );
  }
}

// ---------- URLs ----------

const TEMPLATE_PAGE_TYPE = {
  offering: "offering_detail",
  collection: "collection_detail",
  person: "person_detail",
  article: "article_index",
} as const;
type TemplateKind = keyof typeof TEMPLATE_PAGE_TYPE;

/** Slug of the brand's page that renders each kind of item (for example /journal for articles). */
function loadTemplates(ctx: ToolContext, brand: Brand): Promise<Map<string, string>> {
  return memoize(ctx, `templates:${brand.id}`, async () => {
    const result = await ctx.client.entry.getMany({
      query: {
        content_type: "page",
        "fields.brand.sys.id": brand.id,
        "fields.pageType[in]": Object.values(TEMPLATE_PAGE_TYPE).join(","),
        limit: 20,
      },
    });
    const byKind = new Map<string, string>();
    for (const page of result.items) {
      const kind = (Object.keys(TEMPLATE_PAGE_TYPE) as TemplateKind[]).find((k) => TEMPLATE_PAGE_TYPE[k] === text(page, "pageType"));
      const slug = text(page, "slug");
      if (kind && slug && !byKind.has(kind)) byKind.set(kind, slug);
    }
    return byKind;
  });
}

/** Site path of an entry, or null when it has no page of its own (blocks, plans, authors). */
export async function pathFor(ctx: ToolContext, entry: Entry, brand: Brand): Promise<string | null> {
  const type = contentTypeOf(entry);
  const slug = text(entry, "slug");
  if (type === "page") return entry.sys.id === brand.homePageId || !slug ? `/${brand.slug}` : `/${brand.slug}/${slug}`;
  if (!(type in TEMPLATE_PAGE_TYPE) || !slug) return null;
  if (type === "offering" && text(entry, "offeringType") === "saas_plan") return null;
  if (type === "person" && text(entry, "role") !== "provider") return null;
  const template = (await loadTemplates(ctx, brand)).get(type);
  return template ? `/${brand.slug}/${template}/${slug}` : null;
}

// ---------- the response view ----------

export interface EntryView {
  entry_id: string;
  content_type: string;
  brand: string;
  brand_name: string;
  title: string;
  slug?: string;
  status: EntryStatus;
  /** Send this back as `version` when updating, publishing, or unpublishing. */
  version: number;
  /** Signed draft link that expires; safe to show to the user. */
  preview_url: string;
  /** The live page, only while a published version exists and the entry has a page of its own. */
  live_url: string | null;
  updated_at: string;
}

export async function viewEntry(ctx: ToolContext, entry: Entry, brand: Brand): Promise<EntryView> {
  const spec = specFor(entry);
  const status = entryStatus(entry.sys);
  const path = status === "published" || status === "changed" ? await pathFor(ctx, entry, brand) : null;
  return {
    entry_id: entry.sys.id,
    content_type: contentTypeOf(entry),
    brand: brand.slug,
    brand_name: brand.name,
    title: text(entry, spec?.titleField ?? "title") ?? "(untitled)",
    slug: text(entry, "slug"),
    status,
    version: entry.sys.version,
    preview_url: buildPreviewUrl(ctx.siteUrl, ctx.previewSecret, entry.sys.id, ctx.now),
    live_url: path ? `${ctx.siteUrl}${path}` : null,
    updated_at: entry.sys.updatedAt,
  };
}

/** Current values of the editable fields, in the format update_entry accepts. */
export function editableValues(entry: Entry, spec: TypeSpec): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(spec.editable)) {
    const value = fieldValue(entry, name);
    if (value === undefined) continue;
    values[name] = field.kind === "richText" ? richTextToMarkdown(value) : field.kind === "asset" ? linkId(value) : value;
  }
  return values;
}

export function readOnlyValues(entry: Entry, spec: TypeSpec): { fields: Record<string, unknown>; links: Record<string, string[]> } {
  const fields: Record<string, unknown> = {};
  for (const name of spec.readOnly) {
    const value = fieldValue(entry, name);
    if (value !== undefined) fields[name] = value;
  }
  const links: Record<string, string[]> = {};
  for (const name of spec.links) {
    const value = fieldValue(entry, name);
    const ids = (Array.isArray(value) ? value : [value]).map(linkId).filter((id): id is string => Boolean(id));
    if (ids.length > 0) links[name] = ids;
  }
  return { fields, links };
}
