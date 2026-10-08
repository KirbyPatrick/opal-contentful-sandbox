/**
 * Read-only tools: list_brands, find_pages, get_entry, get_content_rules, list_brand_images.
 * Each handler takes a validated input and returns a plain object. No HTTP here.
 */
import { z } from "zod";
import {
  assertEntryInBrand,
  brandOfEntry,
  contentTypeOf,
  editableValues,
  entryStatus,
  fieldValue,
  loadBrands,
  loadEntry,
  readOnlyValues,
  resolveBrand,
  specFor,
  viewEntry,
  LOCALE,
  type ToolContext,
} from "./context";
import { ToolError } from "./errors";
import { SEARCHABLE_TYPES, TYPES, describeField } from "./fields";
import { brandParam, entryIdParam, intParam } from "./params";

// ---------- list_brands ----------

export const listBrandsSchema = z.strictObject({});

export async function listBrands(ctx: ToolContext) {
  const brands = await loadBrands(ctx);
  return {
    count: brands.length,
    brands: brands.map((brand) => ({
      slug: brand.slug,
      name: brand.name,
      vertical: brand.vertical,
      description: brand.shortDescription,
      tagline: brand.tagline ?? null,
      home_url: `${ctx.siteUrl}/${brand.slug}`,
    })),
    next: "Use a brand's slug as the brand parameter of the other tools. If the user's brand is not listed, ask them.",
  };
}

// ---------- find_pages ----------

export const findPagesSchema = z.strictObject({
  brand: brandParam,
  query: z.string().trim().min(1).max(100).optional(),
  type: z.enum(SEARCHABLE_TYPES).optional(),
  limit: intParam(1, 25).optional(),
});

const DEFAULT_TYPES = ["page", "article", "offering", "collection"];

export async function findPages(ctx: ToolContext, input: z.infer<typeof findPagesSchema>) {
  const brand = await resolveBrand(ctx, input.brand);
  const types = input.type ? [input.type] : DEFAULT_TYPES;
  const limit = input.limit ?? 10;
  const result = await ctx.client.entry.getMany({
    query: {
      links_to_entry: brand.id,
      "sys.contentType.sys.id[in]": types.join(","),
      limit,
      order: "-sys.updatedAt",
      ...(input.query ? { query: input.query } : {}),
    },
  });
  const results = [];
  for (const entry of result.items) {
    const view = await viewEntry(ctx, entry, brand);
    const type = contentTypeOf(entry);
    const details: Record<string, unknown> = {};
    if (type === "page") {
      details.page_type = fieldValue(entry, "pageType");
      details.funnel_step = fieldValue(entry, "funnelStep");
    } else if (type === "offering") {
      details.offering_type = fieldValue(entry, "offeringType");
    }
    results.push({ ...view, ...details });
  }
  return {
    brand: brand.slug,
    brand_name: brand.name,
    total: result.total,
    count: results.length,
    results,
    note:
      result.total > results.length
        ? `Showing ${results.length} of ${result.total}, most recently changed first. Narrow it with query or type.`
        : undefined,
  };
}

// ---------- get_entry ----------

export const getEntrySchema = z.strictObject({
  entry_id: entryIdParam,
  brand: brandParam.optional(),
});

export async function getEntry(ctx: ToolContext, input: z.infer<typeof getEntrySchema>) {
  const entry = await loadEntry(ctx, input.entry_id);
  const spec = specFor(entry);
  if (!spec) {
    throw new ToolError(
      "not_allowed",
      `get_entry reads these content types: ${Object.keys(TYPES).join(", ")}. This entry is a ${contentTypeOf(entry)}.`,
    );
  }
  const brand = await brandOfEntry(ctx, entry);
  if (input.brand) await assertEntryInBrand(ctx, entry, await resolveBrand(ctx, input.brand));
  const { fields, links } = readOnlyValues(entry, spec);
  return {
    ...(await viewEntry(ctx, entry, brand)),
    editable_fields: editableValues(entry, spec),
    read_only_fields: fields,
    links,
    can_update: Object.keys(spec.editable).length > 0,
    can_publish: spec.canPublish,
    can_unpublish: spec.canUnpublish,
    note:
      "editable_fields are in the format update_entry accepts (rich text as Markdown, images as asset IDs). " +
      "links lists the IDs of connected entries; call get_entry on one to edit it. Send version unchanged to update_entry.",
  };
}

// ---------- get_content_rules ----------

export const getContentRulesSchema = z.strictObject({
  brand: brandParam,
  content_type: z.enum(Object.keys(TYPES) as [string, ...string[]]).optional(),
});

const GLOBAL_RULES = [
  "Follow the brand voice below. Write in the brand's voice, not a generic one.",
  "Never use the em dash character. Use a hyphen.",
  "All body text is Markdown: headings (levels 2 to 4), paragraphs, bold, italic, lists, quotes, tables, and full http or https links. No raw HTML and no images.",
  "Images are only ever set by asset ID. Get IDs from list_brand_images for the same brand; never use an image URL.",
  "The companies, people, and figures are fictional. Keep claims illustrative: no real prices, rates, or medical advice.",
  "New articles are drafts until publish_entry is called. Show the user the preview_url and ask before publishing.",
  "Slugs, page types, funnel links, brands, and themes cannot be changed through this API.",
  "Nothing can be deleted through this API.",
];

export async function getContentRules(ctx: ToolContext, input: z.infer<typeof getContentRulesSchema>) {
  const brand = await resolveBrand(ctx, input.brand);
  const names = input.content_type ? [input.content_type] : Object.keys(TYPES);
  const contentTypes: Record<string, unknown> = {};
  for (const name of names) {
    const spec = TYPES[name];
    if (!spec) continue;
    contentTypes[name] = {
      label: spec.label,
      can_create: spec.canCreate,
      can_update: Object.keys(spec.editable).length > 0,
      can_publish: spec.canPublish,
      can_unpublish: spec.canUnpublish,
      editable_fields: Object.fromEntries(
        Object.entries(spec.editable).map(([field, rule]) => [
          field,
          { required: "required" in rule && Boolean(rule.required), rule: describeField(rule) },
        ]),
      ),
    };
  }
  return {
    brand: brand.slug,
    brand_name: brand.name,
    voice: {
      description: brand.voiceDescription,
      do: brand.voiceDos,
      dont: brand.voiceDonts,
      photo_direction: brand.photoDirection ?? null,
    },
    rules: GLOBAL_RULES,
    content_types: contentTypes,
  };
}

// ---------- list_brand_images ----------

export const listBrandImagesSchema = z.strictObject({
  brand: brandParam,
  query: z.string().trim().min(1).max(100).optional(),
  limit: intParam(1, 25).optional(),
  offset: intParam(0, 10_000).optional(),
});

interface AssetFile { url?: string; contentType?: string; details?: { image?: { width?: number; height?: number } } }

export async function listBrandImages(ctx: ToolContext, input: z.infer<typeof listBrandImagesSchema>) {
  const brand = await resolveBrand(ctx, input.brand);
  const result = await ctx.client.asset.getMany({
    query: {
      "metadata.tags.sys.id[in]": `brand-${brand.slug}`,
      "fields.file.contentType[match]": "image",
      limit: input.limit ?? 12,
      skip: input.offset ?? 0,
      // Contentful cannot order by a Text field such as the title; creation order is stable for paging.
      order: "sys.createdAt",
      ...(input.query ? { query: input.query } : {}),
    },
  });
  const images = result.items.map((asset) => {
    const file = (asset.fields.file as Record<string, AssetFile> | undefined)?.[LOCALE];
    const raw = file?.url ?? "";
    const url = raw.startsWith("//") ? `https:${raw}` : raw;
    return {
      asset_id: asset.sys.id,
      alt_text: (asset.fields.title as Record<string, string> | undefined)?.[LOCALE] ?? "",
      credit: (asset.fields.description as Record<string, string> | undefined)?.[LOCALE] ?? null,
      width: file?.details?.image?.width ?? null,
      height: file?.details?.image?.height ?? null,
      published: entryStatus(asset.sys) === "published",
      thumbnail_url: url.startsWith("https://images.ctfassets.net/") ? `${url}?w=400&fm=jpg&q=70` : null,
    };
  });
  return {
    brand: brand.slug,
    brand_name: brand.name,
    total: result.total,
    count: images.length,
    images,
    note:
      "Pass asset_id as hero_image_id (create_article) or in the fields of update_entry. alt_text is stored with the image and shown automatically.",
  };
}
