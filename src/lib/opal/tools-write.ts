/**
 * Write tools: create_article, update_entry, publish_entry, unpublish_entry.
 *
 * Rules every one of them follows:
 * - the agent names the brand, and the entry must belong to it
 * - only fields on the allowlist (fields.ts) can be written, each validated
 * - updates, publishes, and unpublishes carry the version the agent last read;
 *   a stale version is refused (and Contentful enforces it again)
 * - images are asset IDs from the brand's own image pool
 * - nothing here can delete or archive (the client policy has no such methods)
 */
import { z } from "zod";
import { describeError } from "../contentful/errors";
import type { RichTextDocument } from "../richtext/markdown";
import {
  LOCALE,
  assertBrandImage,
  assertEntryInBrand,
  brandOfEntry,
  contentTypeOf,
  entryStatus,
  fieldValue,
  loadEntry,
  resolveBrand,
  specFor,
  viewEntry,
  type Entry,
  type ToolContext,
} from "./context";
import { ToolError, upstreamToToolError } from "./errors";
import { SLUG_MAX, SLUG_PATTERN, TYPES, slugify, validateField, type FieldSpec } from "./fields";
import { MAX_API_MARKDOWN_LENGTH } from "./markdown";
import { assetIdParam, boolParam, brandParam, entryIdParam, intParam } from "./params";

const OPAL_TAG = { sys: { type: "Link", linkType: "Tag", id: "opal" } } as const;
const link = (linkType: "Entry" | "Asset", id: string) => ({ sys: { type: "Link", linkType, id } });
const localized = (value: unknown) => ({ [LOCALE]: value });
const version = intParam(1, 1_000_000);

const shortText = z.string().max(1_000);

// ---------- create_article ----------

export const createArticleSchema = z.strictObject({
  brand: brandParam,
  title: shortText,
  summary: shortText,
  body_markdown: z.string().max(MAX_API_MARKDOWN_LENGTH),
  hero_image_id: assetIdParam,
  slug: shortText.optional(),
  publish_date: shortText.optional(),
  topics: shortText.optional(),
  related_page_id: entryIdParam.optional(),
  author_id: entryIdParam.optional(),
  seo_title: shortText.optional(),
  seo_description: shortText.optional(),
  publish: boolParam.optional(),
});

function articleField(name: string): FieldSpec {
  const spec = TYPES.article?.editable[name];
  if (!spec) throw new Error(`The article content type has no ${name} rule.`);
  return spec;
}

async function checkedRelated(ctx: ToolContext, brandId: string, brandName: string, entryId: string, label: string, types: readonly string[]): Promise<Entry> {
  const entry = await loadEntry(ctx, entryId).catch((error: unknown) => {
    if (error instanceof ToolError && error.code === "not_found") {
      throw new ToolError("invalid_input", `${label}: entry "${entryId}" does not exist. Use find_pages to look one up.`);
    }
    throw error;
  });
  if (!types.includes(contentTypeOf(entry))) {
    throw new ToolError("invalid_input", `${label}: entry "${entryId}" is a ${contentTypeOf(entry)}; it must be one of: ${types.join(", ")}.`);
  }
  const owner = await brandOfEntry(ctx, entry);
  if (owner.id !== brandId) {
    throw new ToolError("invalid_input", `${label}: entry "${entryId}" belongs to ${owner.name}, not ${brandName}. Articles can only link within their own brand.`);
  }
  return entry;
}

export async function createArticle(ctx: ToolContext, input: z.infer<typeof createArticleSchema>) {
  const brand = await resolveBrand(ctx, input.brand);

  // Validate everything that needs no network first, so a bad request costs nothing.
  const title = validateField("title", articleField("title"), input.title) as string;
  const summary = validateField("summary", articleField("summary"), input.summary) as string;
  const body = validateField("body_markdown", articleField("body"), input.body_markdown) as RichTextDocument;
  const heroImageId = validateField("hero_image_id", articleField("heroImage"), input.hero_image_id) as string;
  const publishDate = input.publish_date
    ? (validateField("publish_date", articleField("publishDate"), input.publish_date) as string)
    : ctx.now.toISOString().slice(0, 10);
  const topics = input.topics
    ? (validateField(
        "topics",
        articleField("topics"),
        input.topics.split(",").map((topic) => topic.trim().toLowerCase()).filter(Boolean),
      ) as string[])
    : undefined;
  const seoTitle = input.seo_title ? (validateField("seo_title", articleField("seoTitle"), input.seo_title) as string) : undefined;
  const seoDescription = input.seo_description
    ? (validateField("seo_description", articleField("seoDescription"), input.seo_description) as string)
    : undefined;

  const slug = input.slug ? input.slug.trim() : slugify(title);
  if (!slug || slug.length > SLUG_MAX || !SLUG_PATTERN.test(slug)) {
    throw new ToolError(
      "invalid_input",
      `slug: must be lowercase letters and numbers separated by single hyphens, at most ${SLUG_MAX} characters. Send a slug, or a title that contains letters or numbers.`,
    );
  }

  await assertBrandImage(ctx, brand, heroImageId, "hero_image_id");

  const taken = await ctx.client.entry.getMany({
    query: { content_type: "article", "fields.slug": slug, "fields.brand.sys.id": brand.id, limit: 1 },
  });
  const existing = taken.items[0];
  if (existing) {
    throw new ToolError(
      "slug_taken",
      `${brand.name} already has an article with the slug "${slug}" (entry_id ${existing.sys.id}). Update that entry instead, or send a different slug or title.`,
    );
  }

  if (input.related_page_id) {
    await checkedRelated(ctx, brand.id, brand.name, input.related_page_id, "related_page_id", ["page", "offering", "collection", "person"]);
  }
  if (input.author_id) {
    const author = await checkedRelated(ctx, brand.id, brand.name, input.author_id, "author_id", ["person"]);
    if (fieldValue(author, "role") !== "author") {
      throw new ToolError("invalid_input", `author_id: "${input.author_id}" is not an author. Pick a person whose role is author.`);
    }
  }

  const fields: Record<string, unknown> = {
    title: localized(title),
    slug: localized(slug),
    brand: localized(link("Entry", brand.id)),
    summary: localized(summary),
    body: localized(body),
    heroImage: localized(link("Asset", heroImageId)),
    publishDate: localized(publishDate),
  };
  if (topics && topics.length > 0) fields.topics = localized(topics);
  if (seoTitle) fields.seoTitle = localized(seoTitle);
  if (seoDescription) fields.seoDescription = localized(seoDescription);
  if (input.related_page_id) fields.relatedPage = localized(link("Entry", input.related_page_id));
  if (input.author_id) fields.author = localized(link("Entry", input.author_id));

  let created: Entry;
  try {
    created = await ctx.client.entry.create({ contentTypeId: "article" }, { fields, metadata: { tags: [OPAL_TAG] } });
  } catch (error) {
    throw upstreamToToolError(error, "The article");
  }

  let publishError: string | undefined;
  if (input.publish === true) {
    try {
      created = await ctx.client.entry.publish({ entryId: created.sys.id }, created);
    } catch (error) {
      const mapped = upstreamToToolError(error, "The article");
      publishError = mapped instanceof ToolError ? mapped.message : describeError(error);
    }
  }

  const view = await viewEntry(ctx, created, brand);
  return {
    ...view,
    created: true,
    publish_error: publishError,
    note:
      view.status === "published"
        ? "Created and published. The live site refreshes within a few seconds."
        : `Created as a draft tagged "opal". Show the user preview_url and ask before publishing. To publish, call publish_entry with version ${view.version}.${publishError ? " Publishing was attempted and failed; see publish_error." : ""}`,
  };
}

// ---------- update_entry ----------

export const updateEntrySchema = z.strictObject({
  brand: brandParam,
  entry_id: entryIdParam,
  version,
  fields: z.union([z.string().max(2 * MAX_API_MARKDOWN_LENGTH), z.record(z.string(), z.unknown())]),
});

function parseFields(input: string | Record<string, unknown>): Record<string, unknown> {
  let value: unknown = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch {
      throw new ToolError("invalid_input", 'fields: must be a JSON object such as {"headline": "New headline"}.');
    }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ToolError("invalid_input", 'fields: must be a JSON object such as {"headline": "New headline"}.');
  }
  return value as Record<string, unknown>;
}

/** Common checks for every write to an existing entry. Returns the entry and its brand. */
async function loadForWrite(ctx: ToolContext, brandInput: string, entryId: string, expectedVersion: number) {
  const brand = await resolveBrand(ctx, brandInput);
  const entry = await loadEntry(ctx, entryId);
  const spec = specFor(entry);
  if (!spec) {
    throw new ToolError("not_allowed", `${contentTypeOf(entry)} entries cannot be changed through this API. Editable types: ${Object.keys(TYPES).filter((t) => Object.keys(TYPES[t]?.editable ?? {}).length > 0).join(", ")}.`);
  }
  await assertEntryInBrand(ctx, entry, brand);
  if (entryStatus(entry.sys) === "archived") {
    throw new ToolError("not_allowed", `Entry "${entryId}" is archived and cannot be changed through this API.`);
  }
  if (entry.sys.version !== expectedVersion) {
    throw new ToolError(
      "version_conflict",
      `Entry "${entryId}" is at version ${entry.sys.version}, not ${expectedVersion}. Someone changed it since you read it. Call get_entry, apply your edit to the current content, and retry with version ${entry.sys.version}.`,
    );
  }
  return { brand, entry, spec };
}

export async function updateEntry(ctx: ToolContext, input: z.infer<typeof updateEntrySchema>) {
  const { brand, entry, spec } = await loadForWrite(ctx, input.brand, input.entry_id, input.version);
  const type = contentTypeOf(entry);
  const allowed = Object.keys(spec.editable);
  if (allowed.length === 0) {
    throw new ToolError("not_allowed", `${spec.label} entries are read only through this API.`);
  }

  const requested = parseFields(input.fields);
  const names = Object.keys(requested);
  if (names.length === 0) throw new ToolError("invalid_input", `fields: is empty. Editable fields for ${type}: ${allowed.join(", ")}.`);
  const notEditable = names.filter((name) => !Object.hasOwn(spec.editable, name));
  if (notEditable.length > 0) {
    throw new ToolError(
      "invalid_input",
      `fields: cannot change ${notEditable.join(", ")}. Editable fields for ${type}: ${allowed.join(", ")}. Slugs, page types, funnel links, brands, and themes are never editable here.`,
    );
  }

  const next = structuredClone(entry);
  for (const name of names) {
    const rule = spec.editable[name] as FieldSpec;
    const raw = requested[name];
    if (raw === null) {
      if ("required" in rule && rule.required) throw new ToolError("invalid_input", `${name}: is required and cannot be cleared.`);
      delete (next.fields as Record<string, unknown>)[name];
      continue;
    }
    const value = validateField(name, rule, raw);
    if (rule.kind === "asset") {
      await assertBrandImage(ctx, brand, value as string, name);
      (next.fields as Record<string, unknown>)[name] = localized(link("Asset", value as string));
    } else {
      (next.fields as Record<string, unknown>)[name] = localized(value);
    }
  }

  let saved: Entry;
  try {
    saved = await ctx.client.entry.update({ entryId: entry.sys.id }, next);
  } catch (error) {
    throw upstreamToToolError(error, `Entry "${entry.sys.id}"`);
  }
  const view = await viewEntry(ctx, saved, brand);
  return {
    ...view,
    changed_fields: names,
    note:
      view.status === "changed"
        ? `Saved as a draft change. The live page still shows the previous published version until publish_entry is called with version ${view.version}.`
        : `Saved. To publish, call publish_entry with version ${view.version}.`,
  };
}

// ---------- publish_entry / unpublish_entry ----------

const stateChangeSchema = z.strictObject({ brand: brandParam, entry_id: entryIdParam, version });
export const publishEntrySchema = stateChangeSchema;
export const unpublishEntrySchema = stateChangeSchema;

export async function publishEntry(ctx: ToolContext, input: z.infer<typeof publishEntrySchema>) {
  const { brand, entry, spec } = await loadForWrite(ctx, input.brand, input.entry_id, input.version);
  if (!spec.canPublish) throw new ToolError("not_allowed", `${spec.label} entries cannot be published through this API.`);
  if (entryStatus(entry.sys) === "published") {
    return { ...(await viewEntry(ctx, entry, brand)), changed: false, note: "Already published with no newer changes. Nothing to do." };
  }
  let published: Entry;
  try {
    published = await ctx.client.entry.publish({ entryId: entry.sys.id }, entry);
  } catch (error) {
    throw upstreamToToolError(error, `Entry "${entry.sys.id}"`);
  }
  return {
    ...(await viewEntry(ctx, published, brand)),
    changed: true,
    note: "Published. The live site refreshes automatically within a few seconds.",
  };
}

export async function unpublishEntry(ctx: ToolContext, input: z.infer<typeof unpublishEntrySchema>) {
  const { brand, entry, spec } = await loadForWrite(ctx, input.brand, input.entry_id, input.version);
  if (!spec.canUnpublish) {
    throw new ToolError("not_allowed", `${spec.label} entries cannot be unpublished through this API. Only articles can.`);
  }
  if (entryStatus(entry.sys) === "draft") {
    return { ...(await viewEntry(ctx, entry, brand)), changed: false, note: "Already unpublished. Nothing to do." };
  }
  let unpublished: Entry;
  try {
    unpublished = await ctx.client.entry.unpublish({ entryId: entry.sys.id }, entry);
  } catch (error) {
    throw upstreamToToolError(error, `Entry "${entry.sys.id}"`);
  }
  return {
    ...(await viewEntry(ctx, unpublished, brand)),
    changed: true,
    note: "Unpublished. The page leaves the live site within a few seconds, so its live URL will now show not found.",
  };
}
