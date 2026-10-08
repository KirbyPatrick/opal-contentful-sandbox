/**
 * Small helpers for writing content type migrations.
 *
 * Every field gets help text (written for AI agents, at most 255 characters),
 * and every text field rejects the em dash character.
 */
import type { ContentType, IValidation } from "contentful-migration";

const EM_DASH = String.fromCharCode(0x2014);
const HELP_TEXT_LIMIT = 255;

export const SLUG_PATTERN = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
export const HEX_COLOR_PATTERN = "^#[0-9A-Fa-f]{6}$";
export const HTTP_URL_PATTERN = "^https?://[^\\s]+$";

const noEmDash: IValidation = {
  prohibitRegexp: { pattern: EM_DASH },
  message: "Use a hyphen instead of an em dash.",
};

export const SECTION_TYPES = [
  "richTextSection",
  "mediaText",
  "cardGrid",
  "cta",
  "faq",
  "testimonial",
  "stats",
  "comparisonTable",
  "form",
  "logoStrip",
];

export const ROUTABLE_TYPES = ["page", "article", "offering", "collection", "person"];

export const RICH_TEXT_VALIDATIONS: IValidation[] = [
  {
    enabledNodeTypes: [
      "heading-2", "heading-3", "heading-4", "ordered-list", "unordered-list",
      "hr", "blockquote", "hyperlink", "table",
    ],
    message: "Use headings 2 to 4, paragraphs, lists, quotes, tables, and web links only.",
  },
  { enabledMarks: ["bold", "italic"], message: "Only bold and italic formatting is allowed." },
  { nodes: {} },
];

interface Base {
  name: string;
  help: string;
  required?: boolean;
}

interface TextOptions extends Base {
  max: number;
  min?: number;
  pattern?: string;
  patternMessage?: string;
  prohibit?: string;
  prohibitMessage?: string;
  unique?: boolean;
  values?: readonly string[];
}

function checkHelp(id: string, help: string): string {
  if (help.length > HELP_TEXT_LIMIT) throw new Error(`Help text for ${id} is ${help.length} characters (max ${HELP_TEXT_LIMIT}).`);
  if (help.includes(EM_DASH)) throw new Error(`Help text for ${id} contains an em dash.`);
  return help;
}

function textValidations(o: TextOptions): IValidation[] {
  const v: IValidation[] = [];
  if (o.values) v.push({ in: [...o.values], message: `Use one of: ${o.values.join(", ")}.` });
  else v.push({ size: { min: o.min, max: o.max }, message: `Use at most ${o.max} characters.` });
  if (o.pattern) v.push({ regexp: { pattern: o.pattern }, message: o.patternMessage ?? "Invalid format." });
  if (o.prohibit) v.push({ prohibitRegexp: { pattern: o.prohibit }, message: o.prohibitMessage ?? "This value is not allowed." });
  if (o.unique) v.push({ unique: true });
  v.push(noEmDash);
  return v;
}

type Widget =
  | "singleLine" | "multipleLine" | "dropdown" | "slugEditor" | "numberEditor" | "boolean" | "datePicker"
  | "richTextEditor" | "entryLinkEditor" | "entryLinksEditor" | "assetLinkEditor" | "assetLinksEditor"
  | "checkbox" | "tagEditor";

/** Field builder bound to one content type. */
export function fieldsFor(ct: ContentType) {
  const control = (id: string, widget: Widget, help: string, extra = {}) =>
    ct.changeFieldControl(id, "builtin", widget, { helpText: checkHelp(id, help), ...extra });

  return {
    symbol(id: string, o: TextOptions & { widget?: "singleLine" | "dropdown" | "slugEditor"; trackingFieldId?: string }) {
      ct.createField(id).name(o.name).type("Symbol").required(Boolean(o.required)).validations(textValidations(o));
      const widget = o.widget ?? (o.values ? "dropdown" : "singleLine");
      control(id, widget, o.help, o.trackingFieldId ? { trackingFieldId: o.trackingFieldId } : {});
    },
    slug(id: string, trackingFieldId: string, help: string) {
      this.symbol(id, {
        name: "Slug", help, required: true, max: 80,
        pattern: SLUG_PATTERN, patternMessage: "Lowercase letters and numbers separated by single hyphens.",
        widget: "slugEditor", trackingFieldId,
      });
    },
    text(id: string, o: TextOptions) {
      ct.createField(id).name(o.name).type("Text").required(Boolean(o.required)).validations(textValidations(o));
      control(id, "multipleLine", o.help);
    },
    integer(id: string, o: Base & { values?: number[]; min?: number; max?: number }) {
      const v: IValidation[] = o.values
        ? [{ in: o.values, message: `Use one of: ${o.values.join(", ")}.` }]
        : [{ range: { min: o.min, max: o.max }, message: "Number is out of range." }];
      ct.createField(id).name(o.name).type("Integer").required(Boolean(o.required)).validations(v);
      control(id, o.values ? "dropdown" : "numberEditor", o.help);
    },
    number(id: string, o: Base & { min?: number; max?: number }) {
      ct.createField(id).name(o.name).type("Number").required(Boolean(o.required))
        .validations([{ range: { min: o.min, max: o.max }, message: "Number is out of range." }]);
      control(id, "numberEditor", o.help);
    },
    boolean(id: string, o: Base) {
      ct.createField(id).name(o.name).type("Boolean").required(Boolean(o.required));
      control(id, "boolean", o.help);
    },
    date(id: string, o: Base) {
      ct.createField(id).name(o.name).type("Date").required(Boolean(o.required));
      control(id, "datePicker", o.help, { format: "dateonly" });
    },
    richText(id: string, o: Base) {
      ct.createField(id).name(o.name).type("RichText").required(Boolean(o.required)).validations(RICH_TEXT_VALIDATIONS);
      control(id, "richTextEditor", o.help);
    },
    entry(id: string, o: Base & { types: readonly string[] }) {
      ct.createField(id).name(o.name).type("Link").linkType("Entry").required(Boolean(o.required))
        .validations([{ linkContentType: [...o.types] }]);
      control(id, "entryLinkEditor", o.help);
    },
    entries(id: string, o: Base & { types: readonly string[]; min?: number; max: number }) {
      ct.createField(id).name(o.name).type("Array").required(Boolean(o.required))
        .items({ type: "Link", linkType: "Entry", validations: [{ linkContentType: [...o.types] }] })
        .validations([{ size: { min: o.min, max: o.max }, message: `Add at most ${o.max}.` }]);
      control(id, "entryLinksEditor", o.help);
    },
    asset(id: string, o: Base) {
      ct.createField(id).name(o.name).type("Link").linkType("Asset").required(Boolean(o.required))
        .validations([{ linkMimetypeGroup: ["image"], message: "Use an image." }]);
      control(id, "assetLinkEditor", o.help);
    },
    assets(id: string, o: Base & { min?: number; max: number }) {
      ct.createField(id).name(o.name).type("Array").required(Boolean(o.required))
        .items({ type: "Link", linkType: "Asset", validations: [{ linkMimetypeGroup: ["image"] }] })
        .validations([{ size: { min: o.min, max: o.max }, message: `Use ${o.min ?? 0} to ${o.max} images.` }]);
      control(id, "assetLinksEditor", o.help);
    },
    list(id: string, o: Base & { maxItems: number; minItems?: number; itemMax: number; values?: readonly string[]; pattern?: string; patternMessage?: string }) {
      const items: IValidation[] = o.values
        ? [{ in: [...o.values] }]
        : [{ size: { max: o.itemMax }, message: `Each item at most ${o.itemMax} characters.` }];
      if (o.pattern) items.push({ regexp: { pattern: o.pattern }, message: o.patternMessage ?? "Invalid format." });
      items.push(noEmDash);
      ct.createField(id).name(o.name).type("Array").required(Boolean(o.required))
        .items({ type: "Symbol", validations: items })
        .validations([{ size: { min: o.minItems, max: o.maxItems }, message: `Use at most ${o.maxItems} items.` }]);
      control(id, o.values ? "checkbox" : "tagEditor", o.help);
    },
    brand() {
      this.entry("brand", {
        name: "Brand", required: true, types: ["brand"],
        help: "Required. The one brand this entry belongs to. Everything it references must belong to the same brand.",
      });
    },
    internalName(example: string) {
      this.symbol("internalName", {
        name: "Internal name", required: true, max: 80,
        help: `Required. Label for finding this entry, never shown on the site. Format: Brand - Page - Block, for example "${example}".`,
      });
    },
    seo() {
      this.symbol("seoTitle", {
        name: "SEO title", max: 60,
        help: "Search result title, 60 characters or fewer. Lead with the topic. Leave empty to use the name or title.",
      });
      this.symbol("seoDescription", {
        name: "SEO description", max: 155,
        help: "One or two plain sentences, 155 characters or fewer, saying what the visitor will find. Leave empty to use the summary.",
      });
    },
  };
}
