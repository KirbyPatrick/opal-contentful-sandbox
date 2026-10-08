/**
 * Typed builders for seed content. Each brand file calls defineBrand() and
 * uses the returned helpers. Every entry gets a deterministic ID
 * (<prefix>-<type code>-<key>) and an automatic brand reference.
 *
 *   const s = defineBrand("lumenwork", "lw");   // the brand key, see brands.ts
 *   const demo = s.page("book-a-demo", { title: "Book a demo", ... });
 *   s.cta("book-demo", { label: "Book a demo", goalType: "book_demo", destinationPage: demo, ... });
 *   export default s.entries;
 *
 * Every builder returns a link to the entry it created, ready to use in
 * other entries' reference fields. Rich text fields take md("Markdown").
 */

import type { BrandKey } from "./brands";
export type { BrandKey };

export interface EntryLink { sys: { type: "Link"; linkType: "Entry"; id: string } }
export interface AssetLink { sys: { type: "Link"; linkType: "Asset"; id: string } }
export interface Markdown { markdown: string }

export const entryLink = (id: string): EntryLink => ({ sys: { type: "Link", linkType: "Entry", id } });
export const assetLink = (id: string): AssetLink => ({ sys: { type: "Link", linkType: "Asset", id } });
/** Rich text source. Converted to a Contentful rich text document at seed time. */
export const md = (markdown: string): Markdown => ({ markdown });

export type Font =
  | "Space Grotesk" | "Inter" | "Libre Caslon Text" | "Source Sans 3" | "DM Serif Display" | "DM Sans"
  | "Merriweather Sans" | "Nunito Sans" | "Manrope" | "IBM Plex Sans" | "Playfair Display" | "Lato";

export interface BrandFields {
  name: string;
  /** The URL part, for example stoutware. Not the brand key used in IDs (see brands.ts). */
  slug: string;
  vertical: "b2b_saas" | "apparel_retail" | "insurance" | "healthcare" | "financial_services" | "travel";
  shortDescription: string;
  tagline?: string;
  logo: AssetLink;
  favicon?: AssetLink;
  colorBrand: string; colorButton: string; colorButtonText: string; colorAccent: string;
  colorBackground: string; colorSurface: string; colorText: string; colorMuted: string;
  fontHeading: Font;
  fontBody: Font;
  buttonRadius: 0 | 4 | 6 | 8 | 12 | 999;
  buttonTextCase: "normal" | "uppercase";
  voiceDescription: string;
  voiceDos: string[];
  voiceDonts: string[];
  photoDirection?: string;
  navigation?: EntryLink[];
  headerCta?: EntryLink;
  footerLinks?: EntryLink[];
  promoBarText?: string;
  address: string;
  phone?: string;
  legalDisclaimer: string;
  homePage: EntryLink;
  freeShippingThreshold?: number;
}

interface Seo { seoTitle?: string; seoDescription?: string }

export type PageType = "home" | "standard" | "goal" | "article_index" | "offering_detail" | "collection_detail" | "person_detail";

export interface PageFields extends Seo {
  title: string;
  slug: string;
  pageType: PageType;
  funnelStep: 0 | 1 | 2 | 3 | 4;
  nextStep?: EntryLink;
  hero?: EntryLink;
  primaryCta?: EntryLink;
  sections?: EntryLink[];
  detailSections?: EntryLink[];
}

export interface ArticleFields extends Seo {
  title: string;
  slug: string;
  summary: string;
  body: Markdown;
  heroImage: AssetLink;
  author?: EntryLink;
  /** YYYY-MM-DD */
  publishDate: string;
  topics?: string[];
  relatedPage?: EntryLink;
  cta?: EntryLink;
  faq?: EntryLink;
}

export interface PersonFields extends Seo {
  name: string;
  slug: string;
  role: "author" | "provider" | "customer";
  jobTitle?: string;
  organization?: string;
  bio?: string;
  photo?: AssetLink;
  credentials?: string;
  locations?: string[];
  languages?: string[];
  acceptingNewPatients?: boolean;
}

export type OfferingType = "apparel_product" | "saas_solution" | "saas_plan" | "insurance_coverage" | "bank_product" | "travel_package";

export interface OfferingFields extends Seo {
  name: string;
  slug: string;
  offeringType: OfferingType;
  summary: string;
  description?: Markdown;
  images?: AssetLink[];
  price?: number;
  priceLabel?: string;
  badge?: string;
  features?: string[];
  /** "Label: Value" */
  specs?: string[];
  finePrint?: string;
  sizes?: Array<"XS" | "S" | "M" | "L" | "XL" | "XXL" | "One size">;
  /** "Name|#RRGGBB" */
  colors?: string[];
  materials?: string;
  fit?: "slim" | "classic" | "relaxed";
  sizeGuide?: EntryLink;
}

export interface CollectionFields extends Seo {
  name: string;
  slug: string;
  collectionType: "product_collection" | "destination" | "specialty";
  eyebrow?: string;
  summary: string;
  description?: Markdown;
  image?: AssetLink;
  items?: EntryLink[];
}

interface Block { internalName: string }

export interface HeroFields extends Block {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  image?: AssetLink;
  layout: "split" | "full_bleed" | "text_only";
  cta?: EntryLink;
  secondaryCta?: EntryLink;
}

export type GoalType = "book_demo" | "add_to_cart" | "get_quote" | "book_appointment" | "start_application" | "request_booking" | "next_step" | "link";

export interface CtaFields extends Block {
  label: string;
  goalType: GoalType;
  destinationPage?: EntryLink;
  destinationUrl?: string;
  style?: "primary" | "secondary";
  heading?: string;
  body?: string;
}

export interface RichTextSectionFields extends Block { heading?: string; body: Markdown }

export interface MediaTextFields extends Block {
  eyebrow?: string;
  heading: string;
  body: string;
  image: AssetLink;
  imagePosition?: "left" | "right";
  cta?: EntryLink;
}

export interface CardGridFields extends Block {
  heading?: string;
  intro?: string;
  source: "manual" | "collection" | "latest_articles";
  items?: EntryLink[];
  collection?: EntryLink;
  limit?: number;
  layout: "cards" | "icons" | "products" | "profiles" | "pricing";
  columns?: 2 | 3 | 4;
  cta?: EntryLink;
}

export interface FaqFields extends Block { heading?: string; items: EntryLink[] }
export interface TestimonialFields extends Block { quote: string; person: EntryLink; rating?: 1 | 2 | 3 | 4 | 5 }
export interface StatsFields extends Block { heading?: string; items: EntryLink[]; footnote?: string }
export interface ComparisonTableFields extends Block { heading?: string; intro?: string; offerings: EntryLink[]; rows: string[]; footnote?: string }

export type FormKind = "book_demo" | "quote_start" | "get_quote" | "book_appointment" | "start_application" | "request_booking" | "checkout";

export interface FormFields extends Block {
  formKind: FormKind;
  heading: string;
  intro?: string;
  submitLabel: string;
  successHeading: string;
  successMessage: string;
  privacyNote: string;
  prefillSample?: boolean;
}

export interface LogoStripFields extends Block { heading?: string; logos: AssetLink[] }

export interface ItemFields {
  title: string;
  text?: string;
  value?: string;
  image?: AssetLink;
  link?: EntryLink;
}

export interface FieldsByType {
  brand: BrandFields;
  page: PageFields;
  article: ArticleFields;
  person: PersonFields;
  offering: OfferingFields;
  collection: CollectionFields;
  hero: HeroFields;
  cta: CtaFields;
  richTextSection: RichTextSectionFields;
  mediaText: MediaTextFields;
  cardGrid: CardGridFields;
  faq: FaqFields;
  testimonial: TestimonialFields;
  stats: StatsFields;
  comparisonTable: ComparisonTableFields;
  form: FormFields;
  logoStrip: LogoStripFields;
  item: ItemFields;
}

export type ContentTypeId = keyof FieldsByType;

export const TYPE_CODES: Record<Exclude<ContentTypeId, "brand">, string> = {
  page: "pg", article: "ar", person: "pe", offering: "of", collection: "co", hero: "he", cta: "ct",
  richTextSection: "rt", mediaText: "mt", cardGrid: "cg", faq: "fq", testimonial: "te", stats: "st",
  comparisonTable: "cm", form: "fm", logoStrip: "ls", item: "it",
};

export interface SeedEntry {
  id: string;
  contentType: ContentTypeId;
  brand: BrandKey;
  fields: Record<string, unknown>;
}

const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function defineBrand(brandKey: BrandKey, prefix: string) {
  const entries: SeedEntry[] = [];
  const brandId = `brand-${brandKey}`;
  const ids = new Set<string>();

  function add<T extends Exclude<ContentTypeId, "brand">>(type: T, key: string, fields: FieldsByType[T]): EntryLink {
    if (!KEY_PATTERN.test(key)) throw new Error(`Seed key "${key}" must be lowercase words separated by hyphens.`);
    const id = `${prefix}-${TYPE_CODES[type]}-${key}`;
    if (id.length > 64) throw new Error(`Entry ID "${id}" is longer than 64 characters.`);
    if (ids.has(id)) throw new Error(`Duplicate seed entry "${id}".`);
    ids.add(id);
    entries.push({ id, contentType: type, brand: brandKey, fields: { ...fields, brand: entryLink(brandId) } });
    return entryLink(id);
  }

  return {
    entries,
    /** Links to entries created later in the file (for nextStep or homePage). */
    ref: (type: Exclude<ContentTypeId, "brand">, key: string) => entryLink(`${prefix}-${TYPE_CODES[type]}-${key}`),
    /** Photo n from this brand's pool in assets/manifest.json, for example img(3) for <key>-03. */
    img: (n: number) => assetLink(`img-${brandKey}-${String(n).padStart(2, "0")}`),
    logo: assetLink(`logo-${brandKey}`),
    favicon: assetLink(`favicon-${brandKey}`),
    brand(fields: BrandFields): EntryLink {
      if (ids.has(brandId)) throw new Error("Brand entry defined twice.");
      ids.add(brandId);
      entries.push({ id: brandId, contentType: "brand", brand: brandKey, fields: { ...fields } });
      return entryLink(brandId);
    },
    page: (key: string, f: PageFields) => add("page", key, f),
    article: (key: string, f: ArticleFields) => add("article", key, f),
    person: (key: string, f: PersonFields) => add("person", key, f),
    offering: (key: string, f: OfferingFields) => add("offering", key, f),
    collection: (key: string, f: CollectionFields) => add("collection", key, f),
    hero: (key: string, f: HeroFields) => add("hero", key, f),
    cta: (key: string, f: CtaFields) => add("cta", key, f),
    richText: (key: string, f: RichTextSectionFields) => add("richTextSection", key, f),
    mediaText: (key: string, f: MediaTextFields) => add("mediaText", key, f),
    cardGrid: (key: string, f: CardGridFields) => add("cardGrid", key, f),
    faq: (key: string, f: FaqFields) => add("faq", key, f),
    testimonial: (key: string, f: TestimonialFields) => add("testimonial", key, f),
    stats: (key: string, f: StatsFields) => add("stats", key, f),
    comparisonTable: (key: string, f: ComparisonTableFields) => add("comparisonTable", key, f),
    form: (key: string, f: FormFields) => add("form", key, f),
    logoStrip: (key: string, f: LogoStripFields) => add("logoStrip", key, f),
    item: (key: string, f: ItemFields) => add("item", key, f),
  };
}
