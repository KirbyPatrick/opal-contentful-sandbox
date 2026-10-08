/**
 * The nine Opal tools: name, the description the agent reads, parameters,
 * strict input schema, and handler. The discovery manifest is generated from
 * this list, and tests/opal-registry.test.ts checks the documented parameters
 * match the schemas, so what Opal is told cannot drift from what is enforced.
 */
import type { z } from "zod";
import type { ToolContext } from "./context";
import {
  findPages, findPagesSchema, getContentRules, getContentRulesSchema, getEntry, getEntrySchema,
  listBrandImages, listBrandImagesSchema, listBrands, listBrandsSchema,
} from "./tools-read";
import {
  createArticle, createArticleSchema, publishEntry, publishEntrySchema, unpublishEntry, unpublishEntrySchema,
  updateEntry, updateEntrySchema,
} from "./tools-write";

export interface ParameterDoc {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ParameterDoc[];
  schema: z.ZodType;
  /** Writes are rate limited more tightly. */
  write: boolean;
  run: (ctx: ToolContext, input: unknown) => Promise<object>;
}

function defineTool<S extends z.ZodType>(def: {
  name: string;
  description: string;
  parameters: ParameterDoc[];
  write: boolean;
  schema: S;
  run: (ctx: ToolContext, input: z.output<S>) => Promise<object>;
}): ToolDefinition {
  return { ...def, run: (ctx, input) => def.run(ctx, input as z.output<S>) };
}

const BRAND = "Brand slug from list_brands, for example defeo-mutual. If the user's brand is unclear, ask them.";
const VERSION = "The entry's current version number, from get_entry or the last write response.";

export const TOOLS: readonly ToolDefinition[] = [
  defineTool({
    name: "list_brands",
    write: false,
    schema: listBrandsSchema,
    run: (ctx) => listBrands(ctx),
    parameters: [],
    description:
      "Lists the fictional brands on the demo site: slug, name, industry, one-line description, and home URL. " +
      "Call this first when the user names a company or asks which brands exist, and whenever you need a brand slug for another tool. " +
      "Match the user's company name to a slug. If nothing matches clearly, ask the user instead of guessing.",
  }),
  defineTool({
    name: "find_pages",
    write: false,
    schema: findPagesSchema,
    run: findPages,
    parameters: [
      { name: "brand", type: "string", required: true, description: BRAND },
      { name: "query", type: "string", required: false, description: "Optional words to search for, for example mortgage or onboarding." },
      { name: "type", type: "string", required: false, description: "Optional filter: page, article, offering, collection, or person. Default is pages, articles, offerings, and collections." },
      { name: "limit", type: "number", required: false, description: "How many results, 1 to 25. Default 10." },
    ],
    description:
      "Finds pages and content for one brand: pages, articles, offerings (products, plans, trips), collections, and optionally people. " +
      "Returns each entry's entry_id, type, title, slug, status (draft, published, or changed), version, preview_url, and live_url, most recently changed first. " +
      "Use it to locate the entry to read or edit. An unknown brand returns an error: ask the user which brand they mean.",
  }),
  defineTool({
    name: "get_entry",
    write: false,
    schema: getEntrySchema,
    run: getEntry,
    parameters: [
      { name: "entry_id", type: "string", required: true, description: "The entry_id from find_pages or another tool." },
      { name: "brand", type: "string", required: false, description: "Optional brand slug. If given, the entry must belong to it." },
    ],
    description:
      "Reads one entry: its current editable text (rich text as Markdown, images as asset IDs), read-only fields, the IDs of connected entries " +
      "(a page links to its hero and CTA entries, which are edited separately), status, version, and preview and live URLs. " +
      "Always call this before update_entry, publish_entry, or unpublish_entry, and pass the version it returns.",
  }),
  defineTool({
    name: "get_content_rules",
    write: false,
    schema: getContentRulesSchema,
    run: getContentRules,
    parameters: [
      { name: "brand", type: "string", required: true, description: BRAND },
      { name: "content_type", type: "string", required: false, description: "Optional: article, page, hero, cta, offering, collection, or person. Default is all." },
    ],
    description:
      "Returns the rules for writing and editing a brand's content: its voice (description, do and don't lists, photo direction), the global content rules, " +
      "and for each content type whether it can be created, updated, published, or unpublished, and which fields can be edited with their limits and formats. " +
      "Call this before writing or editing any copy for a brand, and follow the voice.",
  }),
  defineTool({
    name: "list_brand_images",
    write: false,
    schema: listBrandImagesSchema,
    run: listBrandImages,
    parameters: [
      { name: "brand", type: "string", required: true, description: BRAND },
      { name: "query", type: "string", required: false, description: "Optional words to search image titles and credits, for example kitchen or coastline." },
      { name: "limit", type: "number", required: false, description: "How many images, 1 to 25. Default 12." },
      { name: "offset", type: "number", required: false, description: "How many images to skip, for paging. Default 0." },
    ],
    description:
      "Lists the images in a brand's image pool: asset_id, alt text, credit, size, and a thumbnail URL. " +
      "Images are only ever referenced by asset_id, never by URL. Pass the chosen asset_id as hero_image_id to create_article, " +
      "or as an image field in update_entry. Only images from the same brand's pool are accepted.",
  }),
  defineTool({
    name: "create_article",
    write: true,
    schema: createArticleSchema,
    run: createArticle,
    parameters: [
      { name: "brand", type: "string", required: true, description: BRAND },
      { name: "title", type: "string", required: true, description: "Headline, at most 90 characters, sentence case, in the brand voice. No em dashes." },
      { name: "summary", type: "string", required: true, description: "One or two sentences, at most 200 characters, shown on cards and under the headline." },
      { name: "body_markdown", type: "string", required: true, description: "The article body as Markdown, at most 10,000 characters: headings (levels 2 to 4), paragraphs, lists, bold, italic, quotes, tables, and full http or https links. No raw HTML, no images, no em dashes." },
      { name: "hero_image_id", type: "string", required: true, description: "asset_id of an image from list_brand_images for the same brand." },
      { name: "slug", type: "string", required: false, description: "URL part, lowercase words separated by hyphens. Defaults to a slug made from the title." },
      { name: "publish_date", type: "string", required: false, description: "Date shown on the article as YYYY-MM-DD. Defaults to today." },
      { name: "topics", type: "string", required: false, description: "Up to 5 lowercase topics separated by commas, each at most 32 characters, for example approvals, onboarding." },
      { name: "related_page_id", type: "string", required: false, description: "entry_id of the funnel page, offering, collection, or provider this article leads into (use find_pages)." },
      { name: "author_id", type: "string", required: false, description: "entry_id of a person whose role is author, from find_pages with type person." },
      { name: "seo_title", type: "string", required: false, description: "Search result title, at most 60 characters." },
      { name: "seo_description", type: "string", required: false, description: "Search result description, at most 155 characters." },
      { name: "publish", type: "string", required: false, description: 'Send "true" only if the user asked to publish immediately. Default is a draft.' },
    ],
    description:
      "Creates a new article for a brand as a draft and tags it opal. Nothing goes live until publish_entry is called. " +
      "Call get_content_rules first and write in the brand's voice, then pick a hero image with list_brand_images. " +
      "Returns entry_id, version, and a preview_url: show the preview_url to the user and ask before publishing. " +
      "The article's live_url appears once it is published. An unknown brand returns an error: ask the user which brand they mean.",
  }),
  defineTool({
    name: "update_entry",
    write: true,
    schema: updateEntrySchema,
    run: updateEntry,
    parameters: [
      { name: "brand", type: "string", required: true, description: BRAND },
      { name: "entry_id", type: "string", required: true, description: "The entry to change, from find_pages or get_entry." },
      { name: "version", type: "number", required: true, description: VERSION },
      { name: "fields", type: "string", required: true, description: 'JSON object of field names to new values, for example {"headline": "Faster approvals", "subheadline": null}. Rich text values are Markdown, image fields take an asset_id, null clears an optional field. Only fields listed by get_content_rules are accepted.' },
    ],
    description:
      "Changes copy fields on an existing entry: articles, pages (title and SEO), heroes, CTAs, offerings, and collections. " +
      "Slugs, page types, funnel links, brands, themes, and prices cannot be changed. Call get_entry first for the current content and version, " +
      "and get_content_rules for the allowed fields and the brand voice. A stale version returns a version_conflict error: re-read and retry. " +
      "The change is saved as a draft: a live page does not change until publish_entry is called. Show the user the preview_url before publishing.",
  }),
  defineTool({
    name: "publish_entry",
    write: true,
    schema: publishEntrySchema,
    run: publishEntry,
    parameters: [
      { name: "brand", type: "string", required: true, description: BRAND },
      { name: "entry_id", type: "string", required: true, description: "The entry to publish." },
      { name: "version", type: "number", required: true, description: VERSION },
    ],
    description:
      "Publishes the saved version of an entry so it goes live; the site refreshes within a few seconds. " +
      "Only call this after the user has seen the preview and agreed. Pass the current version from get_entry or the last write. " +
      "Returns the live_url. Pages, heroes, CTAs, articles, offerings, and collections can be published.",
  }),
  defineTool({
    name: "unpublish_entry",
    write: true,
    schema: unpublishEntrySchema,
    run: unpublishEntry,
    parameters: [
      { name: "brand", type: "string", required: true, description: BRAND },
      { name: "entry_id", type: "string", required: true, description: "The article to take offline." },
      { name: "version", type: "number", required: true, description: VERSION },
    ],
    description:
      "Takes a published article off the live site. It returns to draft and nothing is deleted. Only articles can be unpublished. " +
      "Ask the user to confirm first. Pass the current version from get_entry.",
  }),
];

/** URL part for a tool: list_brands becomes list-brands. */
export const endpointSlug = (name: string): string => name.replace(/_/g, "-");

export function findTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => endpointSlug(tool.name) === slug);
}

/**
 * The discovery document. Endpoints are relative: Opal joins them to the
 * discovery URL with "/discovery" removed, so a registry at
 * https://<site>/api/opal/discovery calls https://<site>/api/opal/tools/<name>.
 */
export function buildManifest() {
  return {
    functions: TOOLS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      endpoint: `/tools/${endpointSlug(tool.name)}`,
      http_method: "POST",
    })),
  };
}
