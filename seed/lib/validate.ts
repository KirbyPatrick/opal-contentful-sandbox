/**
 * Validates seed content (offline) or live sandbox content against:
 * - the content model, read from the migrations (required fields, limits,
 *   patterns, enums, link types)
 * - repo rules Contentful cannot express (one brand per entry, slugs unique
 *   per brand, funnels that run from step 1 to step 4, CTA destinations,
 *   illustrative figures, no em dashes)
 */
import { MIGRATIONS } from "../../migrations";
import { recordMigration, type RecordedField, type RecordedType, type RecordedValidation } from "../../migrations/lib/record";
import { markdownToRichText, richTextPlainText, isSafeHttpUrl, type RichTextDocument } from "../../src/lib/richtext/markdown";

export interface GraphEntry {
  id: string;
  contentType: string;
  fields: Record<string, unknown>;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

interface Link { sys: { type: "Link"; linkType: "Entry" | "Asset"; id: string } }

const EM_DASH = String.fromCharCode(0x2014);
const DISCLAIMER = "Fictional company. Sample content for illustration only.";
const GOAL_CTA_TYPES = new Set(["book_demo", "get_quote", "book_appointment", "start_application", "request_booking"]);
const TEMPLATE_KIND: Record<string, string> = {
  offering_detail: "offering",
  collection_detail: "collection",
  person_detail: "person",
  article_index: "article",
};

let modelCache: Map<string, RecordedType> | undefined;
export function contentModel(): Map<string, RecordedType> {
  if (!modelCache) {
    modelCache = new Map();
    for (const migration of MIGRATIONS) {
      for (const [id, type] of recordMigration((m) => migration.default(m))) modelCache.set(id, type);
    }
  }
  return modelCache;
}

const isLink = (value: unknown, linkType?: "Entry" | "Asset"): value is Link =>
  typeof value === "object" && value !== null && (value as Link).sys?.type === "Link" &&
  (linkType === undefined || (value as Link).sys.linkType === linkType) && typeof (value as Link).sys.id === "string";

const isMarkdown = (value: unknown): value is { markdown: string } =>
  typeof value === "object" && value !== null && typeof (value as { markdown?: unknown }).markdown === "string";

const isRichText = (value: unknown): value is RichTextDocument =>
  typeof value === "object" && value !== null && (value as { nodeType?: unknown }).nodeType === "document";

/** Entry links found anywhere in a field value (not inside rich text). */
function entryLinksIn(value: unknown): string[] {
  if (isLink(value, "Entry")) return [value.sys.id];
  if (Array.isArray(value)) return value.flatMap(entryLinksIn);
  return [];
}

function hyperlinks(node: { nodeType: string; data?: { uri?: string }; content?: unknown[] }): string[] {
  const own = node.nodeType === "hyperlink" && node.data?.uri ? [node.data.uri] : [];
  return [...own, ...(node.content ?? []).flatMap((child) => hyperlinks(child as typeof node))];
}

function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (isMarkdown(value)) return [value.markdown];
  if (isRichText(value)) return [richTextPlainText(value)];
  return [];
}

function checkScalar(where: string, field: { type?: string; validations?: RecordedValidation[] }, value: unknown, errors: string[]): void {
  const type = field.type;
  if (type === "Symbol" || type === "Text") {
    if (typeof value !== "string") return void errors.push(`${where}: must be text.`);
  } else if (type === "Integer") {
    if (!Number.isInteger(value)) return void errors.push(`${where}: must be a whole number.`);
  } else if (type === "Number") {
    if (typeof value !== "number" || !Number.isFinite(value)) return void errors.push(`${where}: must be a number.`);
  } else if (type === "Boolean") {
    if (typeof value !== "boolean") return void errors.push(`${where}: must be true or false.`);
  } else if (type === "Date") {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return void errors.push(`${where}: must be a date like 2026-09-14.`);
  }
  for (const v of field.validations ?? []) {
    if (v.in && !(v.in as unknown[]).includes(value)) errors.push(`${where}: "${String(value)}" is not one of ${v.in.join(", ")}.`);
    if (v.size && typeof value === "string") {
      if (v.size.max !== undefined && value.length > v.size.max) errors.push(`${where}: ${value.length} characters (max ${v.size.max}).`);
      if (v.size.min !== undefined && value.length < v.size.min) errors.push(`${where}: ${value.length} characters (min ${v.size.min}).`);
    }
    if (v.range && typeof value === "number") {
      if (v.range.max !== undefined && value > v.range.max) errors.push(`${where}: ${value} is above ${v.range.max}.`);
      if (v.range.min !== undefined && value < v.range.min) errors.push(`${where}: ${value} is below ${v.range.min}.`);
    }
    if (v.regexp && typeof value === "string" && !new RegExp(v.regexp.pattern).test(value)) errors.push(`${where}: "${value}" has the wrong format (${v.message ?? v.regexp.pattern}).`);
    if (v.prohibitRegexp && typeof value === "string" && new RegExp(v.prohibitRegexp.pattern).test(value)) errors.push(`${where}: ${v.message ?? "contains a disallowed value"}.`);
  }
}

function checkLink(where: string, linkType: "Entry" | "Asset" | undefined, validations: RecordedValidation[] | undefined, value: unknown,
  byId: Map<string, GraphEntry>, assets: ReadonlySet<string>, errors: string[]): void {
  if (!isLink(value, linkType)) return void errors.push(`${where}: must be a ${linkType === "Asset" ? "media" : "reference"} link.`);
  if (linkType === "Asset") {
    if (!assets.has(value.sys.id)) errors.push(`${where}: asset "${value.sys.id}" does not exist.`);
    return;
  }
  const target = byId.get(value.sys.id);
  if (!target) return void errors.push(`${where}: entry "${value.sys.id}" does not exist.`);
  const allowed = validations?.find((v) => v.linkContentType)?.linkContentType;
  if (allowed && !allowed.includes(target.contentType)) errors.push(`${where}: links to a ${target.contentType}, allowed: ${allowed.join(", ")}.`);
}

function checkField(entry: GraphEntry, field: RecordedField, value: unknown, byId: Map<string, GraphEntry>, assets: ReadonlySet<string>, errors: string[]): void {
  const where = `${entry.id}.${field.id}`;
  if (field.type === "Link") return checkLink(where, field.linkType, field.validations, value, byId, assets, errors);
  if (field.type === "RichText") {
    let doc: RichTextDocument;
    try {
      doc = isMarkdown(value) ? markdownToRichText(value.markdown) : (value as RichTextDocument);
    } catch (error) {
      return void errors.push(`${where}: ${(error as Error).message}`);
    }
    if (!isRichText(doc)) return void errors.push(`${where}: must be rich text, written as md("...").`);
    for (const uri of hyperlinks(doc)) if (!isSafeHttpUrl(uri)) errors.push(`${where}: link "${uri}" must be http or https.`);
    if (richTextPlainText(doc).trim().length < 20) errors.push(`${where}: rich text is nearly empty.`);
    return;
  }
  if (field.type === "Array") {
    if (!Array.isArray(value)) return void errors.push(`${where}: must be a list.`);
    for (const v of field.validations ?? []) {
      if (v.size?.max !== undefined && value.length > v.size.max) errors.push(`${where}: ${value.length} items (max ${v.size.max}).`);
      if (v.size?.min !== undefined && value.length < v.size.min) errors.push(`${where}: ${value.length} items (min ${v.size.min}).`);
    }
    const items = field.items;
    value.forEach((item, index) => {
      const itemWhere = `${where}[${index}]`;
      if (items?.type === "Link") checkLink(itemWhere, items.linkType, items.validations, item, byId, assets, errors);
      else checkScalar(itemWhere, { type: items?.type, validations: items?.validations }, item, errors);
    });
    return;
  }
  checkScalar(where, field, value, errors);
}

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

export interface ValidateOptions {
  /** IDs of assets that exist (photos and logos). */
  assets: ReadonlySet<string>;
  /** "seed" requires exactly two articles per brand; "live" allows more (Opal adds articles). */
  mode: "seed" | "live";
}

export function validateGraph(entries: readonly GraphEntry[], options: ValidateOptions): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const model = contentModel();
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  if (byId.size !== entries.length) errors.push("Duplicate entry IDs in the content set.");

  // ---- Field-level checks against the content model ----
  for (const entry of entries) {
    const type = model.get(entry.contentType);
    if (!type) {
      errors.push(`${entry.id}: unknown content type "${entry.contentType}".`);
      continue;
    }
    if (!/^[A-Za-z0-9._-]{1,64}$/.test(entry.id)) errors.push(`${entry.id}: invalid entry ID.`);
    for (const key of Object.keys(entry.fields)) {
      if (!type.fields.has(key)) errors.push(`${entry.id}: unknown field "${key}" on ${entry.contentType}.`);
    }
    for (const field of type.fields.values()) {
      const value = entry.fields[field.id];
      if (isEmpty(value)) {
        if (field.required) errors.push(`${entry.id}.${field.id}: required.`);
        continue;
      }
      checkField(entry, field, value, byId, options.assets, errors);
      for (const text of stringsIn(value)) if (text.includes(EM_DASH)) errors.push(`${entry.id}.${field.id}: contains an em dash. Use a hyphen.`);
    }
  }

  // ---- Global uniqueness (brand name and slug) ----
  const brands = entries.filter((entry) => entry.contentType === "brand");
  for (const fieldId of ["name", "slug"]) {
    const seen = new Set<string>();
    for (const brand of brands) {
      const value = String(brand.fields[fieldId] ?? "");
      if (seen.has(value)) errors.push(`${brand.id}.${fieldId}: "${value}" is used by another brand.`);
      seen.add(value);
    }
  }

  // ---- Per-brand rules ----
  for (const brand of brands) {
    const brandEntries = entries.filter((entry) => isLink(entry.fields.brand, "Entry") && (entry.fields.brand as Link).sys.id === brand.id);
    const label = String(brand.fields.slug ?? brand.id);
    const inBrand = new Set([brand.id, ...brandEntries.map((entry) => entry.id)]);

    // One brand per entry: every reference stays in the brand.
    for (const entry of [brand, ...brandEntries]) {
      for (const [fieldId, value] of Object.entries(entry.fields)) {
        for (const target of entryLinksIn(value)) {
          if (byId.has(target) && !inBrand.has(target)) errors.push(`${entry.id}.${fieldId}: links to "${target}" from another brand.`);
        }
      }
    }

    // Slugs unique per brand and type.
    const slugs = new Map<string, string>();
    for (const entry of brandEntries) {
      const slug = entry.fields.slug;
      if (typeof slug !== "string") continue;
      const key = `${entry.contentType}:${slug}`;
      if (slugs.has(key)) errors.push(`${entry.id}.slug: "${slug}" is already used by ${slugs.get(key)} in ${label}.`);
      slugs.set(key, entry.id);
    }

    if (typeof brand.fields.legalDisclaimer === "string" && !brand.fields.legalDisclaimer.startsWith(DISCLAIMER)) {
      errors.push(`${brand.id}.legalDisclaimer: must start with "${DISCLAIMER}"`);
    }

    const pages = brandEntries.filter((entry) => entry.contentType === "page");
    const pageType = (page: GraphEntry) => String(page.fields.pageType);
    const step = (page: GraphEntry) => Number(page.fields.funnelStep);

    // Home page.
    const home = isLink(brand.fields.homePage) ? byId.get(brand.fields.homePage.sys.id) : undefined;
    if (!home || home.contentType !== "page" || pageType(home) !== "home" || step(home) !== 1) {
      errors.push(`${brand.id}.homePage: must be a page of type home at funnel step 1.`);
    }
    if (pages.filter((page) => pageType(page) === "home").length !== 1) errors.push(`${label}: needs exactly one home page.`);

    // Templates: at most one per kind, exactly one article index.
    const templates = new Map<string, GraphEntry>();
    for (const page of pages) {
      const kind = TEMPLATE_KIND[pageType(page)];
      if (!kind) continue;
      if (templates.has(kind)) errors.push(`${label}: more than one ${pageType(page)} page.`);
      templates.set(kind, page);
    }
    if (!templates.has("article")) errors.push(`${label}: needs an article_index page.`);
    const stepOfEntry = (entry: GraphEntry | undefined): number | undefined => {
      if (!entry) return undefined;
      if (entry.contentType === "page") return step(entry);
      const template = templates.get(entry.contentType);
      return template ? step(template) : undefined;
    };

    // Funnel steps 1 to 4: one page each, chained by nextStep.
    const stepPages = new Map<number, GraphEntry>();
    for (const page of pages) {
      const s = step(page);
      if (s >= 1 && s <= 4) {
        if (stepPages.has(s)) errors.push(`${label}: more than one page at funnel step ${s} (${stepPages.get(s)!.id}, ${page.id}).`);
        stepPages.set(s, page);
      }
      if (s === 0 && page.fields.nextStep) errors.push(`${page.id}.nextStep: off-funnel pages must not have a next step.`);
    }
    for (let s = 1; s <= 4; s++) if (!stepPages.has(s)) errors.push(`${label}: no page at funnel step ${s}.`);
    for (let s = 1; s <= 3; s++) {
      const page = stepPages.get(s);
      const next = stepPages.get(s + 1);
      if (!page || !next) continue;
      const nextId = isLink(page.fields.nextStep) ? page.fields.nextStep.sys.id : undefined;
      if (nextId !== next.id) errors.push(`${page.id}.nextStep: must point to the step ${s + 1} page (${next.id}).`);
    }
    const goal = stepPages.get(4);
    if (goal) {
      if (pageType(goal) !== "goal") errors.push(`${goal.id}: the step 4 page must be of type goal.`);
      if (goal.fields.nextStep) errors.push(`${goal.id}.nextStep: the goal page must not have a next step.`);
    }

    // Funnel navigation: each step's content links into the next step.
    const outbound = (page: GraphEntry): Set<string> => {
      const found = new Set<string>();
      const visit = (id: string, depth: number) => {
        const entry = byId.get(id);
        if (!entry || depth > 4) return;
        if (entry !== page && ["page", "offering", "collection", "person", "article"].includes(entry.contentType)) {
          found.add(entry.id);
          if (entry.contentType === "collection" && depth <= 2) for (const child of entryLinksIn(entry.fields.items)) found.add(child);
          return;
        }
        for (const [fieldId, value] of Object.entries(entry.fields)) {
          if (fieldId === "brand" || fieldId === "nextStep") continue;
          for (const target of entryLinksIn(value)) visit(target, depth + 1);
        }
      };
      visit(page.id, 0);
      // A collection template's detail views list each collection's items.
      if (pageType(page) === "collection_detail") {
        for (const collection of brandEntries.filter((entry) => entry.contentType === "collection")) {
          for (const child of entryLinksIn(collection.fields.items)) found.add(child);
        }
      }
      return found;
    };
    for (let s = 1; s <= 3; s++) {
      const page = stepPages.get(s);
      const next = stepPages.get(s + 1);
      if (!page || !next) continue;
      const nextKind = TEMPLATE_KIND[pageType(next)];
      const primary = isLink(page.fields.primaryCta) ? byId.get(page.fields.primaryCta.sys.id) : undefined;
      const followsNextStep = primary?.fields.goalType === "next_step" || primary?.fields.goalType === "add_to_cart";
      const targets = outbound(page);
      const reaches = followsNextStep || targets.has(next.id) ||
        (nextKind !== undefined && [...targets].some((id) => byId.get(id)?.contentType === nextKind));
      if (!reaches) errors.push(`${page.id}: nothing on the step ${s} page links into step ${s + 1} (${next.id}).`);
    }

    // CTAs.
    for (const cta of brandEntries.filter((entry) => entry.contentType === "cta")) {
      const goalType = String(cta.fields.goalType);
      const destination = isLink(cta.fields.destinationPage) ? byId.get(cta.fields.destinationPage.sys.id) : undefined;
      if (GOAL_CTA_TYPES.has(goalType) && (!destination || pageType(destination) !== "goal")) {
        errors.push(`${cta.id}: goal type ${goalType} must point to the brand's goal page.`);
      }
      if (goalType === "link" && !destination && !cta.fields.destinationUrl) errors.push(`${cta.id}: goal type link needs a destination page or URL.`);
      if (goalType === "add_to_cart" && (destination || cta.fields.destinationUrl)) errors.push(`${cta.id}: add_to_cart opens the cart and takes no destination.`);
    }

    // Goal page holds a form.
    if (goal) {
      const forms = entryLinksIn(goal.fields.sections).map((id) => byId.get(id)).filter((e) => e?.contentType === "form");
      if (forms.length !== 1) errors.push(`${goal.id}: the goal page needs exactly one form section.`);
    }

    // Articles: exactly two in seed content, each leading into step 2 or 3.
    const articles = brandEntries.filter((entry) => entry.contentType === "article");
    if (options.mode === "seed" && articles.length !== 2) errors.push(`${label}: seed content needs exactly 2 articles (found ${articles.length}).`);
    for (const article of articles) {
      const related = isLink(article.fields.relatedPage) ? byId.get(article.fields.relatedPage.sys.id) : undefined;
      const s = stepOfEntry(related);
      if (s !== 2 && s !== 3) errors.push(`${article.id}.relatedPage: must lead to funnel step 2 or 3.`);
    }

    // Offerings: detail pages and apparel fields.
    for (const offering of brandEntries.filter((entry) => entry.contentType === "offering")) {
      const offeringType = String(offering.fields.offeringType);
      if (offeringType !== "saas_plan" && !templates.has("offering")) errors.push(`${offering.id}: no offering_detail page renders this offering.`);
      if (offeringType === "apparel_product") {
        for (const required of ["price", "sizes", "colors", "materials", "fit", "sizeGuide", "images"]) {
          if (isEmpty(offering.fields[required])) errors.push(`${offering.id}.${required}: required for apparel products.`);
        }
        const images = Array.isArray(offering.fields.images) ? offering.fields.images.length : 0;
        if (images < 2 || images > 3) errors.push(`${offering.id}.images: apparel products need 2 to 3 images.`);
      }
      if (offeringType === "bank_product") {
        const finePrint = String(offering.fields.finePrint ?? "");
        if (!/illustrative/i.test(finePrint)) errors.push(`${offering.id}.finePrint: bank products must say figures are illustrative.`);
      }
    }
    for (const collection of brandEntries.filter((entry) => entry.contentType === "collection")) {
      if (!templates.has("collection") && collection.fields.collectionType !== "product_collection") {
        warnings.push(`${collection.id}: no collection_detail page renders this collection.`);
      }
    }

    // Figures must be labelled illustrative.
    for (const stats of brandEntries.filter((entry) => entry.contentType === "stats")) {
      if (!/illustrative/i.test(String(stats.fields.footnote ?? ""))) errors.push(`${stats.id}.footnote: must say the figures are illustrative.`);
    }

    // Grids: 3 to 6 picked items, except product grids.
    for (const grid of brandEntries.filter((entry) => entry.contentType === "cardGrid")) {
      const source = grid.fields.source;
      const count = Array.isArray(grid.fields.items) ? grid.fields.items.length : 0;
      if (source === "manual" && (count < 2 || (count > 6 && grid.fields.layout !== "products"))) {
        warnings.push(`${grid.id}.items: manual grids should have 3 to 6 items (has ${count}).`);
      }
      if (source === "manual" && count === 0) errors.push(`${grid.id}.items: manual grids need items.`);
      if (source === "collection" && !grid.fields.collection) errors.push(`${grid.id}.collection: required when the source is collection.`);
    }

    // Navigation items need links.
    for (const fieldId of ["navigation", "footerLinks"]) {
      for (const id of entryLinksIn(brand.fields[fieldId])) {
        const item = byId.get(id);
        if (item && !item.fields.link) errors.push(`${id}.link: required for ${fieldId} items.`);
        if (item && fieldId === "navigation" && String(item.fields.title ?? "").length > 24) errors.push(`${id}.title: nav labels must be 24 characters or fewer.`);
      }
    }
  }

  // Entries without a known brand.
  const brandIds = new Set(brands.map((brand) => brand.id));
  for (const entry of entries) {
    if (entry.contentType === "brand") continue;
    const brandId = isLink(entry.fields.brand) ? entry.fields.brand.sys.id : undefined;
    if (!brandId || !brandIds.has(brandId)) errors.push(`${entry.id}.brand: must reference a brand in this content set.`);
  }

  return { errors, warnings };
}
