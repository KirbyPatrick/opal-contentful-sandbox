/**
 * Write tools: create_article, create_faq, update_entry, publish_entry, unpublish_entry.
 *
 * Rules every one of them follows:
 * - the agent names the brand, and the entry must belong to it
 * - only fields on the allowlist (fields.ts) can be written, each validated
 * - updates, publishes, and unpublishes carry the version the agent last read;
 *   a stale version is refused (and Contentful enforces it again)
 * - images are asset IDs from the brand's own image pool
 * - FAQs and their questions can only be changed if this API created them
 * - a page's sections only ever change by create_faq adding the FAQ it just made
 * - nothing here deletes or archives; delete_entry (tools-undo.ts) is the only delete, and nothing can archive
 */
import { z } from "zod";
import type { RichTextDocument } from "../richtext/markdown";
import {
  LOCALE,
  assertBrandImage,
  assertEntryInBrand,
  brandOfEntry,
  contentTypeOf,
  entryStatus,
  fieldValue,
  linkId,
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
export const localized = (value: unknown) => ({ [LOCALE]: value });
export const version = intParam(1, 1_000_000);

const shortText = z.string().max(1_000);

export const isOpalCreated = (entry: Entry): boolean => entry.metadata?.tags.some((tag) => tag.sys.id === "opal") ?? false;
export const linkIds = (value: unknown): string[] => (Array.isArray(value) ? value.map(linkId).filter((id): id is string => Boolean(id)) : []);

/** Never pass raw error text through: only a ToolError message is safe for the agent. */
export const safeMessage = (error: unknown, fallback: string): string => (error instanceof ToolError ? error.message : fallback);

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
      publishError = safeMessage(upstreamToToolError(error, "The article"), "Publishing failed unexpectedly. Try publish_entry again.");
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
export async function loadForWrite(ctx: ToolContext, brandInput: string, entryId: string, expectedVersion: number) {
  const brand = await resolveBrand(ctx, brandInput);
  const entry = await loadEntry(ctx, entryId);
  const spec = specFor(entry);
  if (!spec) {
    throw new ToolError("not_allowed", `${contentTypeOf(entry)} entries cannot be changed through this API. Editable types: ${Object.keys(TYPES).filter((t) => Object.keys(TYPES[t]?.editable ?? {}).length > 0).join(", ")}.`);
  }
  await assertEntryInBrand(ctx, entry, brand);
  if (spec.opalOnly && !isOpalCreated(entry)) {
    throw new ToolError(
      "not_allowed",
      `Entry "${entryId}" is a ${spec.label} from the site's original content, which cannot be changed through this API. Only ${spec.label} entries made with create_faq can be edited.`,
    );
  }
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
      if (("required" in rule && rule.required) || spec.keep?.includes(name)) throw new ToolError("invalid_input", `${name}: is required and cannot be cleared.`);
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

/** Publishes an entry unless it is already live and unchanged. */
export async function publishIfNeeded(ctx: ToolContext, entry: Entry): Promise<Entry> {
  if (entryStatus(entry.sys) === "published") return entry;
  try {
    return await ctx.client.entry.publish({ entryId: entry.sys.id }, entry);
  } catch (error) {
    throw upstreamToToolError(error, `Entry "${entry.sys.id}"`);
  }
}

/** Loads entries by ID in one request, in the order given. Missing IDs are left out. */
export async function loadMany(ctx: ToolContext, ids: readonly string[]): Promise<Entry[]> {
  if (ids.length === 0) return [];
  let found: Entry[];
  try {
    found = (await ctx.client.entry.getMany({ query: { "sys.id[in]": ids.join(","), limit: ids.length } })).items;
  } catch (error) {
    throw upstreamToToolError(error, "The linked entries");
  }
  const byId = new Map(found.map((entry) => [entry.sys.id, entry]));
  return ids.map((id) => byId.get(id)).filter((entry): entry is Entry => Boolean(entry));
}

/**
 * Publishing a page or an FAQ first publishes the never-published FAQs and questions this API created
 * for it in the same brand, so a live page never links to a draft. Original site content, and later
 * edits to an already live FAQ, are never published as a side effect.
 */
async function publishOpalFaqsIn(ctx: ToolContext, entry: Entry, brandId: string): Promise<string[]> {
  const type = contentTypeOf(entry);
  const ours = (candidate: Entry) =>
    isOpalCreated(candidate) && linkId(fieldValue(candidate, "brand")) === brandId && entryStatus(candidate.sys) === "draft";
  const faqs = type === "page"
    ? (await loadMany(ctx, linkIds(fieldValue(entry, "sections")))).filter((section) => contentTypeOf(section) === "faq" && ours(section))
    : [];
  const published: string[] = [];
  for (const faq of type === "faq" ? [entry] : faqs) {
    const items = (await loadMany(ctx, linkIds(fieldValue(faq, "items")))).filter((item) => contentTypeOf(item) === "item" && ours(item));
    for (const item of items) {
      await publishIfNeeded(ctx, item);
      published.push(item.sys.id);
    }
    if (faq !== entry) {
      await publishIfNeeded(ctx, faq);
      published.push(faq.sys.id);
    }
  }
  return published;
}

export async function publishEntry(ctx: ToolContext, input: z.infer<typeof publishEntrySchema>) {
  const { brand, entry, spec } = await loadForWrite(ctx, input.brand, input.entry_id, input.version);
  if (!spec.canPublish) throw new ToolError("not_allowed", `${spec.label} entries cannot be published through this API.`);
  const alsoPublished = await publishOpalFaqsIn(ctx, entry, brand.id);
  if (entryStatus(entry.sys) === "published" && alsoPublished.length === 0) {
    return { ...(await viewEntry(ctx, entry, brand)), changed: false, note: "Already published with no newer changes. Nothing to do." };
  }
  const published = await publishIfNeeded(ctx, entry);
  return {
    ...(await viewEntry(ctx, published, brand)),
    changed: true,
    also_published: alsoPublished.length > 0 ? alsoPublished : undefined,
    note: `Published${alsoPublished.length > 0 ? `, together with ${alsoPublished.length} FAQ ${alsoPublished.length === 1 ? "entry" : "entries"} it links to` : ""}. The live site refreshes automatically within a few seconds.`,
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

// ---------- create_faq ----------

const MAX_SECTIONS = 12;
const MAX_QUESTIONS = 10;

export const createFaqSchema = z.strictObject({
  brand: brandParam,
  page_id: entryIdParam,
  page_version: version,
  questions: z.union([z.string().max(20_000), z.array(z.unknown()).max(50)]),
  heading: shortText.optional(),
  after_entry_id: entryIdParam.optional(),
  publish: boolParam.optional(),
});

function rule(type: "faq" | "item", name: string): FieldSpec {
  const spec = TYPES[type]?.editable[name];
  if (!spec) throw new Error(`The ${type} content type has no ${name} rule.`);
  return spec;
}

const QUESTIONS_FORMAT = 'questions: must be a JSON array such as [{"question": "How long does it take?", "answer": "Most orders ship in two days."}].';

function parseQuestions(input: string | unknown[]): Array<{ question: string; answer: string }> {
  let value: unknown = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch {
      throw new ToolError("invalid_input", QUESTIONS_FORMAT);
    }
  }
  if (!Array.isArray(value) || value.length === 0) throw new ToolError("invalid_input", QUESTIONS_FORMAT);
  if (value.length > MAX_QUESTIONS) throw new ToolError("invalid_input", `questions: has ${value.length} questions; the limit is ${MAX_QUESTIONS}.`);
  const seen = new Set<string>();
  return value.map((raw, index) => {
    const pair = raw as { question?: unknown; answer?: unknown } | null;
    if (typeof pair !== "object" || pair === null) throw new ToolError("invalid_input", QUESTIONS_FORMAT);
    const where = `questions[${index}]`;
    if (pair.answer === undefined || pair.answer === null || pair.answer === "") {
      throw new ToolError("invalid_input", `${where}.answer: is required. Every question needs an answer.`);
    }
    const question = validateField(`${where}.question`, rule("item", "title"), pair.question) as string;
    const answer = validateField(`${where}.answer`, rule("item", "text"), pair.answer) as string;
    const key = question.toLowerCase();
    if (seen.has(key)) throw new ToolError("invalid_input", `${where}.question: "${question}" is asked twice.`);
    seen.add(key);
    return { question, answer };
  });
}

/**
 * Creates an FAQ (questions shown as an accordion) and adds it to a page as a new section: after
 * after_entry_id, or at the end. Existing sections are never removed or reordered. The questions,
 * the FAQ, and the page change are drafts until the page is published.
 */
export async function createFaq(ctx: ToolContext, input: z.infer<typeof createFaqSchema>) {
  // Validate everything that needs no network first, so a bad request costs nothing.
  const questions = parseQuestions(input.questions);
  const heading = input.heading ? (validateField("heading", rule("faq", "heading"), input.heading) as string) : undefined;

  const { brand, entry: page } = await loadForWrite(ctx, input.brand, input.page_id, input.page_version);
  if (contentTypeOf(page) !== "page") {
    throw new ToolError("invalid_input", `page_id: entry "${input.page_id}" is a ${contentTypeOf(page)}, not a page. Use find_pages with type page.`);
  }
  const current = Array.isArray(fieldValue(page, "sections")) ? (fieldValue(page, "sections") as unknown[]) : [];
  if (current.length >= MAX_SECTIONS) {
    throw new ToolError("not_allowed", `This page already has ${current.length} sections, the most a page can hold. Ask the user which page to use instead.`);
  }
  let at = current.length;
  if (input.after_entry_id) {
    const index = current.findIndex((value) => linkId(value) === input.after_entry_id);
    if (index < 0) {
      throw new ToolError(
        "invalid_input",
        `after_entry_id: "${input.after_entry_id}" is not one of this page's sections. Its sections, in order: ${linkIds(current).join(", ") || "none"}. Leave after_entry_id out to add the FAQ at the end.`,
      );
    }
    at = index + 1;
  }
  // Only publish in this call if that publishes nothing but the new FAQ: a page with other unpublished
  // changes waits for the user to see them in the preview.
  const pageHadPendingChanges = entryStatus(page.sys) !== "published";

  const brandLink = localized(link("Entry", brand.id));
  const pageTitle = String(fieldValue(page, "title") ?? "Page");
  const created: Entry[] = [];
  const leftover = () => (created.length > 0 ? ` These drafts were created but are not on any page: ${created.map((e) => e.sys.id).join(", ")}.` : "");
  const fail = (error: unknown, subject: string): never => {
    const mapped = upstreamToToolError(error, subject);
    // Unexpected errors keep their details for the server log; the agent only ever sees a ToolError message.
    if (!(mapped instanceof ToolError)) throw mapped;
    throw new ToolError(mapped.code, `${mapped.message}${leftover()}`);
  };

  try {
    for (const { question, answer } of questions) {
      created.push(await ctx.client.entry.create(
        { contentTypeId: "item" },
        { fields: { title: localized(question), text: localized(answer), brand: brandLink }, metadata: { tags: [OPAL_TAG] } },
      ));
    }
    const faqFields: Record<string, unknown> = {
      internalName: localized(`${brand.name} - ${pageTitle} - FAQ`.slice(0, 80)),
      brand: brandLink,
      items: localized(created.map((item) => link("Entry", item.sys.id))),
    };
    if (heading) faqFields.heading = localized(heading);
    created.push(await ctx.client.entry.create({ contentTypeId: "faq" }, { fields: faqFields, metadata: { tags: [OPAL_TAG] } }));
  } catch (error) {
    fail(error, "The FAQ");
  }
  const faq = created[created.length - 1] as Entry;
  const items = created.slice(0, -1);

  let saved: Entry;
  try {
    const sections = [...current];
    sections.splice(at, 0, link("Entry", faq.sys.id));
    const next = structuredClone(page);
    (next.fields as Record<string, unknown>).sections = localized(sections);
    saved = await ctx.client.entry.update({ entryId: page.sys.id }, next);
  } catch (error) {
    return fail(error, `Page "${page.sys.id}"`);
  }

  let publishError: string | undefined;
  if (input.publish === true) {
    if (pageHadPendingChanges) {
      publishError = `Not published: the page already had unpublished changes, and publishing it would publish those too. Show the user preview_url, then call publish_entry on the page with version ${saved.sys.version}.`;
    } else {
      try {
        for (const entry of [...items, faq]) await publishIfNeeded(ctx, entry);
        saved = await publishIfNeeded(ctx, saved);
      } catch (error) {
        publishError = safeMessage(error, "Publishing failed unexpectedly. Try publish_entry on the page again.");
      }
    }
  }

  const view = await viewEntry(ctx, saved, brand);
  return {
    ...view,
    faq_entry_id: faq.sys.id,
    question_entry_ids: items.map((item) => item.sys.id),
    section_position: at + 1,
    publish_error: publishError,
    note:
      view.status === "published"
        ? `FAQ added as section ${at + 1} and published with its ${questions.length} questions. The live site refreshes within a few seconds.`
        : `FAQ added as section ${at + 1} of ${current.length + 1}, as a draft tagged "opal". The live page does not change yet. Show the user preview_url and ask before publishing. ` +
          `To publish, call publish_entry on the page (${page.sys.id}) with version ${view.version}; that also publishes the FAQ and its questions.` +
          (publishError ? " Publishing was attempted and failed; see publish_error." : ""),
  };
}
