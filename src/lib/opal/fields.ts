/**
 * What the Opal API may read and change, per content type, and how each field
 * is validated. This is the single allowlist: a field that is not listed here
 * cannot be written through the API. The limits mirror the content model
 * (migrations/0001-content-model.ts); tests/opal-fields.test.ts fails if they drift.
 *
 * Never writable: brands, themes, slugs of existing entries, page types, funnel
 * links (nextStep and similar), content types, and anything that deletes.
 */
import { markdownToRichText, richTextPlainText, type RichTextDocument } from "../richtext/markdown";
import { ToolError } from "./errors";
import { markdownIssues } from "./markdown";

const EM_DASH = String.fromCharCode(0x2014);
export const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX = 80;

export type FieldSpec =
  | { kind: "text"; max: number; required?: boolean; pattern?: RegExp; values?: readonly string[] }
  | { kind: "richText"; required?: boolean }
  | { kind: "asset"; required?: boolean }
  | { kind: "list"; maxItems: number; itemMax: number; pattern?: RegExp }
  | { kind: "date"; required?: boolean };

export interface TypeSpec {
  label: string;
  /** Field that holds the display name. */
  titleField: string;
  editable: Readonly<Record<string, FieldSpec>>;
  /** Plain fields shown by get_entry, never writable. */
  readOnly: readonly string[];
  /** Reference fields listed by get_entry as entry IDs, never writable. */
  links: readonly string[];
  canCreate: boolean;
  canPublish: boolean;
  canUnpublish: boolean;
}

const seo = {
  seoTitle: { kind: "text", max: 60 },
  seoDescription: { kind: "text", max: 155 },
} as const satisfies Record<string, FieldSpec>;

export const TYPES: Readonly<Record<string, TypeSpec>> = {
  article: {
    label: "Article",
    titleField: "title",
    editable: {
      title: { kind: "text", max: 90, required: true },
      summary: { kind: "text", max: 200, required: true },
      body: { kind: "richText", required: true },
      heroImage: { kind: "asset", required: true },
      publishDate: { kind: "date", required: true },
      topics: { kind: "list", maxItems: 5, itemMax: 32, pattern: /^[a-z0-9]+(?:[ -][a-z0-9]+)*$/ },
      ...seo,
    },
    readOnly: ["slug"],
    links: ["author", "relatedPage", "cta", "faq"],
    canCreate: true,
    canPublish: true,
    canUnpublish: true,
  },
  page: {
    label: "Page",
    titleField: "title",
    editable: { title: { kind: "text", max: 70, required: true }, ...seo },
    readOnly: ["slug", "pageType", "funnelStep"],
    links: ["nextStep", "hero", "primaryCta", "sections", "detailSections"],
    canCreate: false,
    canPublish: true,
    canUnpublish: false,
  },
  hero: {
    label: "Hero",
    titleField: "internalName",
    editable: {
      eyebrow: { kind: "text", max: 40 },
      headline: { kind: "text", max: 70, required: true },
      subheadline: { kind: "text", max: 160 },
      image: { kind: "asset" },
    },
    readOnly: ["internalName", "layout"],
    links: ["cta", "secondaryCta"],
    canCreate: false,
    canPublish: true,
    canUnpublish: false,
  },
  cta: {
    label: "CTA",
    titleField: "internalName",
    editable: {
      label: { kind: "text", max: 24, required: true },
      heading: { kind: "text", max: 70 },
      body: { kind: "text", max: 200 },
    },
    readOnly: ["internalName", "goalType", "style", "destinationUrl"],
    links: ["destinationPage"],
    canCreate: false,
    canPublish: true,
    canUnpublish: false,
  },
  offering: {
    label: "Offering",
    titleField: "name",
    editable: {
      summary: { kind: "text", max: 160, required: true },
      description: { kind: "richText" },
      features: { kind: "list", maxItems: 8, itemMax: 80 },
      badge: { kind: "text", max: 24 },
      ...seo,
    },
    readOnly: ["name", "slug", "offeringType", "price", "priceLabel"],
    links: [],
    canCreate: false,
    canPublish: true,
    canUnpublish: false,
  },
  collection: {
    label: "Collection",
    titleField: "name",
    editable: {
      summary: { kind: "text", max: 200, required: true },
      description: { kind: "richText" },
      eyebrow: { kind: "text", max: 40 },
      image: { kind: "asset" },
      ...seo,
    },
    readOnly: ["name", "slug", "collectionType"],
    links: ["items"],
    canCreate: false,
    canPublish: true,
    canUnpublish: false,
  },
  // Readable (providers and authors appear in funnels) but nothing about a person is writable.
  person: {
    label: "Person",
    titleField: "name",
    editable: {},
    readOnly: ["name", "slug", "role", "jobTitle"],
    links: [],
    canCreate: false,
    canPublish: false,
    canUnpublish: false,
  },
};

export const SEARCHABLE_TYPES = ["page", "article", "offering", "collection", "person"] as const;

/** One line an agent can read: what to send for this field. */
export function describeField(spec: FieldSpec): string {
  switch (spec.kind) {
    case "text":
      return `Plain text, at most ${spec.max} characters, no em dashes${spec.required ? "" : ". Send null to clear"}.`;
    case "richText":
      return `Markdown (headings, paragraphs, bold, italic, lists, quotes, tables, and full http or https links; no raw HTML, no images)${spec.required ? "" : ". Send null to clear"}.`;
    case "asset":
      return `An asset ID from list_brand_images for the same brand${spec.required ? "" : ". Send null to clear"}.`;
    case "list":
      return `Array of strings, at most ${spec.maxItems} items, each at most ${spec.itemMax} characters${spec.pattern ? ", lowercase words" : ""}. Send null to clear.`;
    case "date":
      return "Date as YYYY-MM-DD.";
  }
}

export type FieldValue = string | string[] | RichTextDocument;

const fail = (name: string, message: string): never => {
  throw new ToolError("invalid_input", `${name}: ${message}`);
};

function checkPlain(name: string, value: string, max: number): string {
  const text = value.trim();
  if (text === "") return fail(name, "must not be empty.");
  if (text.length > max) return fail(name, `is ${text.length} characters; the limit is ${max}. Shorten it.`);
  if (text.includes(EM_DASH)) return fail(name, "contains an em dash. Use a hyphen instead.");
  if (/[\r\n]/.test(text)) return fail(name, "must be a single line.");
  return text;
}

/**
 * Checks one value against its spec and returns what to store: text and
 * dates as strings, lists as string arrays, rich text as a document, and
 * assets as the asset ID (the caller confirms the asset belongs to the brand).
 */
export function validateField(name: string, spec: FieldSpec, value: unknown): FieldValue {
  switch (spec.kind) {
    case "text": {
      if (typeof value !== "string") return fail(name, "must be text.");
      const text = checkPlain(name, value, spec.max);
      if (spec.values && !spec.values.includes(text)) return fail(name, `must be one of: ${spec.values.join(", ")}.`);
      if (spec.pattern && !spec.pattern.test(text)) return fail(name, "has the wrong format.");
      return text;
    }
    case "richText": {
      if (typeof value !== "string") return fail(name, "must be Markdown text.");
      const issues = markdownIssues(value);
      if (issues.length > 0) return fail(name, `${issues.join("; ")}.`);
      const document = markdownToRichText(value);
      if (richTextPlainText(document).trim().length < 20) return fail(name, "is nearly empty. Write at least a full sentence.");
      return document;
    }
    case "asset": {
      if (typeof value !== "string" || !ID_PATTERN.test(value.trim())) return fail(name, "must be an asset ID from list_brand_images.");
      return value.trim();
    }
    case "list": {
      if (!Array.isArray(value)) return fail(name, "must be an array of strings.");
      if (value.length > spec.maxItems) return fail(name, `has ${value.length} items; the limit is ${spec.maxItems}.`);
      return value.map((item, index) => {
        if (typeof item !== "string") return fail(`${name}[${index}]`, "must be text.");
        const text = checkPlain(`${name}[${index}]`, item, spec.itemMax);
        if (spec.pattern && !spec.pattern.test(text)) return fail(`${name}[${index}]`, `"${text}" must be lowercase words.`);
        return text;
      });
    }
    case "date": {
      const ok = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
      if (!ok) return fail(name, "must be a date like 2026-09-14.");
      return value as string;
    }
  }
}

/** Lowercase, hyphenated, at most SLUG_MAX characters. Empty if the title has no letters or digits. */
export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/, "");
}
