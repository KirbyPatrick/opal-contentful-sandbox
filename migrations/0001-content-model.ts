/**
 * 0001: the full content model (18 content types). See docs/content-model.md.
 */
import type { MigrationFunction } from "contentful-migration";
import { HEX_COLOR_PATTERN, HTTP_URL_PATTERN, ROUTABLE_TYPES, SECTION_TYPES, fieldsFor } from "./lib/fields";

export const id = "0001-content-model";
export const description = "Create the 18 content types of the page-builder model";

const TYPE_IDS = [
  "brand", "page", "article", "person", "offering", "collection", "hero", "cta", "richTextSection",
  "mediaText", "cardGrid", "faq", "testimonial", "stats", "comparisonTable", "form", "logoStrip", "item",
];

/** Applied when every content type already exists. */
export function isApplied(existing: ReadonlySet<string>): boolean {
  return TYPE_IDS.every((typeId) => existing.has(typeId));
}

export const FONTS = [
  "Space Grotesk", "Inter", "Libre Caslon Text", "Source Sans 3", "DM Serif Display", "DM Sans",
  "Merriweather Sans", "Nunito Sans", "Manrope", "IBM Plex Sans", "Playfair Display", "Lato",
] as const;

const RESERVED_BRAND_SLUGS = "^(api|preview|draft|_next|static|assets|images|favicon|icon|robots|sitemap)$";

const migration: MigrationFunction = (m) => {
  // ---------- brand ----------
  {
    const ct = m.createContentType("brand", {
      name: "Brand",
      description: "A fictional company: profile, theme tokens, voice, navigation, and footer. One per brand.",
    });
    const f = fieldsFor(ct);
    f.symbol("name", { name: "Name", required: true, max: 40, unique: true, help: "Required. The company name exactly as it appears on the site." });
    f.symbol("slug", {
      name: "Slug", required: true, max: 40, unique: true, widget: "slugEditor", trackingFieldId: "name",
      pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", patternMessage: "Lowercase letters and numbers separated by single hyphens.",
      prohibit: RESERVED_BRAND_SLUGS, prohibitMessage: "This slug is reserved by the site.",
      help: "Required. First part of every URL for this brand, for example harborline-mutual. Never change it after publishing.",
    });
    f.symbol("vertical", {
      name: "Vertical", required: true, max: 40,
      values: ["b2b_saas", "apparel_retail", "insurance", "healthcare", "financial_services", "travel"],
      help: "Required. The industry this brand represents.",
    });
    f.symbol("shortDescription", {
      name: "Short description", required: true, max: 160,
      help: "Required. One literal sentence on what the company does and for whom. Agents use it to choose the right brand.",
    });
    f.symbol("tagline", { name: "Tagline", max: 70, help: "Short brand line in the brand voice, 70 characters or fewer." });
    f.asset("logo", { name: "Logo", required: true, help: "Required. SVG wordmark for the header. Its title is the alt text." });
    f.asset("favicon", { name: "Favicon", help: "Square SVG icon for browser tabs." });
    const colors: Array<[string, string, string]> = [
      ["colorBrand", "Color: brand", "Main brand color for the header, links, and accents."],
      ["colorButton", "Color: button", "Primary button background."],
      ["colorButtonText", "Color: button text", "Primary button label. Must contrast at least 4.5 to 1 with the button color."],
      ["colorAccent", "Color: accent", "Badges, highlights, and dividers."],
      ["colorBackground", "Color: background", "Page background."],
      ["colorSurface", "Color: surface", "Cards and alternating sections."],
      ["colorText", "Color: text", "Body text. Must contrast at least 4.5 to 1 with the background."],
      ["colorMuted", "Color: muted text", "Secondary text such as captions."],
    ];
    for (const [fieldId, name, help] of colors) {
      f.symbol(fieldId, {
        name, required: true, max: 7, pattern: HEX_COLOR_PATTERN, patternMessage: "Use a hex color like #1F2A44.",
        help: `Required. ${help} Hex format #RRGGBB.`,
      });
    }
    f.symbol("fontHeading", { name: "Heading font", required: true, max: 40, values: FONTS, help: "Required. Font for headings. Only these bundled fonts are supported." });
    f.symbol("fontBody", { name: "Body font", required: true, max: 40, values: FONTS, help: "Required. Font for body text. Only these bundled fonts are supported." });
    f.integer("buttonRadius", { name: "Button corner radius", required: true, values: [0, 4, 6, 8, 12, 999], help: "Required. Button corner radius in pixels. 0 is square, 999 is a pill." });
    f.symbol("buttonTextCase", { name: "Button text case", required: true, max: 20, values: ["normal", "uppercase"], help: "Required. Whether button labels are shown in uppercase." });
    f.text("voiceDescription", {
      name: "Voice description", required: true, max: 500,
      help: "Required. How this brand sounds, in two or three sentences. Agents must follow it when writing for this brand.",
    });
    f.list("voiceDos", { name: "Voice: do", minItems: 2, maxItems: 8, itemMax: 120, help: "2 to 8 short rules for writing in this voice, for example: Use short sentences." });
    f.list("voiceDonts", { name: "Voice: don't", minItems: 2, maxItems: 8, itemMax: 120, help: "2 to 8 things to avoid in this voice, for example: No hype or buzzwords." });
    f.text("photoDirection", { name: "Photo direction", max: 500, help: "What this brand's photos show and avoid. Used to pick images." });
    f.entries("navigation", { name: "Navigation", types: ["item"], max: 6, help: "Header links, in order. Each item needs a title (24 characters or fewer) and a link." });
    f.entry("headerCta", { name: "Header button", types: ["cta"], help: "The button at the right of the header, usually the brand's goal." });
    f.entries("footerLinks", { name: "Footer links", types: ["item"], max: 8, help: "Footer links, in order. Each item needs a title and a link." });
    f.symbol("promoBarText", { name: "Promo bar text", max: 90, help: "One line shown above the header, 90 characters or fewer. Leave empty to hide the bar." });
    f.text("address", { name: "Address", required: true, max: 200, help: "Required. Fictional street address on two lines. Must not match a real business." });
    f.symbol("phone", {
      name: "Phone", max: 20, pattern: "^\\(\\d{3}\\) 555-01\\d{2}$", patternMessage: "Use a fictional number like (802) 555-0118.",
      help: "Fictional phone number in the reserved 555-01xx range, for example (802) 555-0118.",
    });
    f.text("legalDisclaimer", {
      name: "Legal disclaimer", required: true, max: 300,
      help: "Required. Footer disclaimer. Must start with: Fictional company. Sample content for illustration only.",
    });
    f.entry("homePage", { name: "Home page", required: true, types: ["page"], help: "Required. The page shown at the brand's root URL. Must be a page of type home." });
    f.integer("freeShippingThreshold", { name: "Free shipping threshold (USD)", min: 0, max: 10000, help: "Order total in whole US dollars that earns free shipping. Only for brands that sell products." });
    ct.displayField("name");
  }

  // ---------- page ----------
  {
    const ct = m.createContentType("page", {
      name: "Page",
      description: "A routable page made of a hero and ordered sections. Detail templates also render offerings, collections, people, or articles.",
    });
    const f = fieldsFor(ct);
    f.symbol("title", { name: "Title", required: true, max: 70, help: "Required. Page name, 70 characters or fewer. Shown in lists and used as the fallback SEO title." });
    f.slug("slug", "title", "Required. URL part after the brand, for example book-a-demo. Unique within the brand. Do not change after publishing.");
    f.brand();
    f.symbol("pageType", {
      name: "Page type", required: true, max: 40,
      values: ["home", "standard", "goal", "article_index", "offering_detail", "collection_detail", "person_detail"],
      help: "Required. home is the brand root, goal holds a conversion form, and *_detail and article_index are templates that also render items at their URL plus a slug.",
    });
    f.integer("funnelStep", { name: "Funnel step", required: true, values: [0, 1, 2, 3, 4], help: "Required. Position in the brand's funnel: 1 to 4, where 4 is the goal. Use 0 for pages outside the funnel." });
    f.entry("nextStep", { name: "Next step", types: ["page"], help: "The page for the next funnel step (this step plus 1) in the same brand. Required for steps 1 to 3, empty otherwise." });
    f.entry("hero", { name: "Hero", types: ["hero"], help: "The top block of the page. Empty on detail views, which build their hero from the item." });
    f.entry("primaryCta", { name: "Primary CTA", types: ["cta"], help: "The main action for this page. On detail templates it applies to every item." });
    f.entries("sections", { name: "Sections", types: SECTION_TYPES, max: 12, help: "Blocks shown below the hero, in order." });
    f.entries("detailSections", { name: "Detail sections", types: SECTION_TYPES, max: 8, help: "Detail templates only. Blocks shown below each item, for example shared FAQs." });
    f.seo();
    ct.displayField("title");
  }

  // ---------- article ----------
  {
    const ct = m.createContentType("article", {
      name: "Article",
      description: "An article that acts as a side entrance into the brand's funnel.",
    });
    const f = fieldsFor(ct);
    f.symbol("title", { name: "Title", required: true, max: 90, help: "Required. Article headline, 90 characters or fewer, in the brand voice. Sentence case." });
    f.slug("slug", "title", "Required. URL part, for example how-approvals-stall. Unique within the brand. Do not change after publishing.");
    f.brand();
    f.symbol("summary", { name: "Summary", required: true, max: 200, help: "Required. One or two sentences, 200 characters or fewer, shown on cards and under the headline." });
    f.richText("body", { name: "Body", required: true, help: "Required. Main text. Use headings, short paragraphs, and lists. No images or raw HTML. Links must start with http:// or https://." });
    f.asset("heroImage", { name: "Hero image", required: true, help: "Required. Pick an image from this brand's image pool. Its title is the alt text." });
    f.entry("author", { name: "Author", types: ["person"], help: "A person with the role author, from the same brand." });
    f.date("publishDate", { name: "Publish date", required: true, help: "Required. Date shown on the article." });
    f.list("topics", {
      name: "Topics", maxItems: 5, itemMax: 32, pattern: "^[a-z0-9]+(?:[ -][a-z0-9]+)*$", patternMessage: "Use lowercase words.",
      help: "Up to 5 lowercase topics, each 32 characters or fewer, for example approvals.",
    });
    f.entry("relatedPage", {
      name: "Related funnel page", types: ["page", "offering", "collection", "person"],
      help: "Where this article leads: a funnel page, offering, collection, or person at step 2 or 3 of the same brand.",
    });
    f.entry("cta", { name: "CTA", types: ["cta"], help: "The action at the end of the article. Leave empty to link to the related funnel page." });
    f.entry("faq", { name: "FAQ", types: ["faq"], help: "Optional questions and answers shown after the body." });
    f.seo();
    ct.displayField("title");
  }

  // ---------- person ----------
  {
    const ct = m.createContentType("person", {
      name: "Person",
      description: "A fictional author, care provider, or customer quoted in a testimonial.",
    });
    const f = fieldsFor(ct);
    f.symbol("name", { name: "Name", required: true, max: 70, help: "Required. Full fictional name. Never use a real person." });
    f.slug("slug", "name", "Required. URL part for provider profiles, for example amara-osei. Unique within the brand.");
    f.brand();
    f.symbol("role", { name: "Role", required: true, max: 20, values: ["author", "provider", "customer"], help: "Required. author writes articles, provider is a care provider with a profile page, customer is quoted in testimonials." });
    f.symbol("jobTitle", { name: "Job title", max: 70, help: "For example Family medicine physician or Operations director." });
    f.symbol("organization", { name: "Organization", max: 70, help: "Fictional company for customers. Never a real company." });
    f.text("bio", { name: "Bio", max: 800, help: "Short third-person bio, 800 characters or fewer. Providers: no medical claims or advice." });
    f.asset("photo", { name: "Photo", help: "Portrait image. Its title is the alt text. Leave empty to show initials." });
    f.symbol("credentials", { name: "Credentials", max: 40, help: "Providers only, for example MD or NP." });
    f.list("locations", { name: "Locations", maxItems: 4, itemMax: 60, help: "Providers only. Clinic names where this provider sees patients." });
    f.list("languages", { name: "Languages", maxItems: 5, itemMax: 30, help: "Providers only. Languages spoken." });
    f.boolean("acceptingNewPatients", { name: "Accepting new patients", help: "Providers only." });
    f.seo();
    ct.displayField("name");
  }

  // ---------- offering ----------
  {
    const ct = m.createContentType("offering", {
      name: "Offering",
      description: "Anything a brand sells: an apparel product, software solution or plan, insurance coverage, bank product, or trip.",
    });
    const f = fieldsFor(ct);
    f.symbol("name", { name: "Name", required: true, max: 70, help: "Required. Product or service name, 70 characters or fewer." });
    f.slug("slug", "name", "Required. URL part, for example fieldstone-merino-crew. Unique within the brand. Do not change after publishing.");
    f.brand();
    f.symbol("offeringType", {
      name: "Offering type", required: true, max: 40,
      values: ["apparel_product", "saas_solution", "saas_plan", "insurance_coverage", "bank_product", "travel_package"],
      help: "Required. What kind of offering this is. saas_plan offerings appear on pricing only and have no detail page.",
    });
    f.symbol("summary", { name: "Summary", required: true, max: 160, help: "Required. One sentence, 160 characters or fewer, shown on cards." });
    f.richText("description", { name: "Description", help: "Detail page text. No images or raw HTML. Financial and medical claims must be clearly illustrative." });
    f.assets("images", { name: "Images", min: 1, max: 4, help: "1 to 4 images from the brand's pool. The first is the main image. Titles are alt text." });
    f.number("price", { name: "Price (USD)", min: 0, max: 100000, help: "Numeric price in US dollars. Apparel: unit price used in the cart. Leave empty when there is no fixed price." });
    f.symbol("priceLabel", { name: "Price label", max: 40, help: "How the price reads, for example From $3,850 per person (illustrative)." });
    f.symbol("badge", { name: "Badge", max: 24, help: "Optional short label such as Most popular or New." });
    f.list("features", { name: "Features", maxItems: 8, itemMax: 80, help: "Up to 8 short bullet points, each 80 characters or fewer." });
    f.list("specs", {
      name: "Specs", maxItems: 10, itemMax: 120, pattern: "^[^:]{1,40}: .{1,78}$", patternMessage: "Use Label: Value.",
      help: "Up to 10 facts as Label: Value, for example Monthly fee: $0. Comparison tables match on the label.",
    });
    f.text("finePrint", { name: "Fine print", max: 300, help: "Disclosures, for example Illustrative rate, not an offer." });
    f.list("sizes", { name: "Sizes", maxItems: 7, itemMax: 10, values: ["XS", "S", "M", "L", "XL", "XXL", "One size"], help: "Apparel only. Sizes offered." });
    f.list("colors", {
      name: "Colors", maxItems: 6, itemMax: 40, pattern: "^[A-Z][A-Za-z ]{0,23}\\|#[0-9A-Fa-f]{6}$", patternMessage: "Use Name|#RRGGBB.",
      help: "Apparel only. Up to 6 colors as Name|#RRGGBB, for example Moss|#5B6B4A. Drives the swatches.",
    });
    f.symbol("materials", { name: "Materials", max: 160, help: "Apparel only. For example 100% merino wool, horn buttons." });
    f.symbol("fit", { name: "Fit", max: 20, values: ["slim", "classic", "relaxed"], help: "Apparel only." });
    f.entry("sizeGuide", { name: "Size guide", types: ["richTextSection"], help: "Apparel only. The brand's shared size guide." });
    f.seo();
    ct.displayField("name");
  }

  // ---------- collection ----------
  {
    const ct = m.createContentType("collection", {
      name: "Collection",
      description: "A curated group of offerings or people, such as a seasonal collection, a destination, or a medical specialty.",
    });
    const f = fieldsFor(ct);
    f.symbol("name", { name: "Name", required: true, max: 70, help: "Required. Collection name, 70 characters or fewer." });
    f.slug("slug", "name", "Required. URL part, for example coastal-portugal. Unique within the brand.");
    f.brand();
    f.symbol("collectionType", { name: "Collection type", required: true, max: 40, values: ["product_collection", "destination", "specialty"], help: "Required. What this group represents." });
    f.symbol("eyebrow", { name: "Eyebrow", max: 40, help: "Short label above the name, for example Fall 2026." });
    f.symbol("summary", { name: "Summary", required: true, max: 200, help: "Required. One or two sentences, 200 characters or fewer, shown on cards and the detail hero." });
    f.richText("description", { name: "Description", help: "Detail page text. Medical specialties: describe services only, never give advice." });
    f.asset("image", { name: "Image", help: "Hero and card image from the brand's pool." });
    f.entries("items", { name: "Items", types: ["offering", "person"], max: 24, help: "Offerings or providers in this group, in display order. Same brand only." });
    f.seo();
    ct.displayField("name");
  }

  // ---------- hero ----------
  {
    const ct = m.createContentType("hero", { name: "Hero", description: "The top block of a page: headline, supporting line, image, and actions." });
    const f = fieldsFor(ct);
    f.internalName("Lumenwork - Home - Hero");
    f.brand();
    f.symbol("eyebrow", { name: "Eyebrow", max: 40, help: "Short label above the headline, 40 characters or fewer." });
    f.symbol("headline", { name: "Headline", required: true, max: 70, help: "Required. The page's main promise, 70 characters or fewer, in the brand voice. Sentence case, no ending period." });
    f.symbol("subheadline", { name: "Subheadline", max: 160, help: "One supporting sentence, 160 characters or fewer." });
    f.asset("image", { name: "Image", help: "Image from the brand's pool. Its title is the alt text. Leave empty for a branded placeholder." });
    f.symbol("layout", { name: "Layout", required: true, max: 20, values: ["split", "full_bleed", "text_only"], help: "Required. split puts the image beside the text, full_bleed behind it, text_only hides it." });
    f.entry("cta", { name: "CTA", types: ["cta"], help: "Main button." });
    f.entry("secondaryCta", { name: "Secondary CTA", types: ["cta"], help: "Optional second button." });
    ct.displayField("internalName");
  }

  // ---------- cta ----------
  {
    const ct = m.createContentType("cta", { name: "CTA", description: "A call to action. Used as a button, or as a band when heading or body is set." });
    const f = fieldsFor(ct);
    f.internalName("Lumenwork - Home - Book a demo CTA");
    f.brand();
    f.symbol("label", { name: "Label", required: true, max: 24, help: "Required. Button text, 24 characters or fewer. Start with a verb, for example Book a demo. No ending punctuation." });
    f.symbol("goalType", {
      name: "Goal type", required: true, max: 40,
      values: ["book_demo", "add_to_cart", "get_quote", "book_appointment", "start_application", "request_booking", "next_step", "link"],
      help: "Required. Goal types go to the brand's goal page, add_to_cart opens the cart, next_step follows the page's next step, link needs a destination.",
    });
    f.entry("destinationPage", { name: "Destination page", types: ["page"], help: "Page this CTA opens. Same brand only. Not needed for add_to_cart or next_step." });
    f.symbol("destinationUrl", {
      name: "Destination URL", max: 255, pattern: HTTP_URL_PATTERN, patternMessage: "Use a full http or https URL.",
      help: "External http or https URL, only for goal type link when there is no destination page.",
    });
    f.symbol("style", { name: "Style", max: 20, values: ["primary", "secondary"], help: "primary is the filled button, secondary the outlined one. Defaults to primary." });
    f.symbol("heading", { name: "Heading", max: 70, help: "Only when used as a section: band heading, 70 characters or fewer." });
    f.symbol("body", { name: "Body", max: 200, help: "Only when used as a section: one supporting sentence, 200 characters or fewer." });
    ct.displayField("internalName");
  }

  // ---------- richTextSection ----------
  {
    const ct = m.createContentType("richTextSection", { name: "Rich text section", description: "A section of formatted text." });
    const f = fieldsFor(ct);
    f.internalName("Stuchbery's - Size guide - Table");
    f.brand();
    f.symbol("heading", { name: "Heading", max: 70, help: "Section heading, 70 characters or fewer." });
    f.richText("body", { name: "Body", required: true, help: "Required. Formatted text. Tables are allowed. No images or raw HTML. Links must start with http:// or https://." });
    ct.displayField("internalName");
  }

  // ---------- mediaText ----------
  {
    const ct = m.createContentType("mediaText", { name: "Media and text", description: "An image beside a short block of text." });
    const f = fieldsFor(ct);
    f.internalName("Stuchbery's - Home - Craft story");
    f.brand();
    f.symbol("eyebrow", { name: "Eyebrow", max: 40, help: "Short label above the heading." });
    f.symbol("heading", { name: "Heading", required: true, max: 70, help: "Required. 70 characters or fewer." });
    f.text("body", { name: "Body", required: true, max: 600, help: "Required. One or two short paragraphs, 600 characters or fewer. Separate paragraphs with a blank line." });
    f.asset("image", { name: "Image", required: true, help: "Required. Image from the brand's pool. Its title is the alt text." });
    f.symbol("imagePosition", { name: "Image position", max: 10, values: ["left", "right"], help: "Which side the image sits on. Defaults to right." });
    f.entry("cta", { name: "CTA", types: ["cta"], help: "Optional button below the text." });
    ct.displayField("internalName");
  }

  // ---------- cardGrid ----------
  {
    const ct = m.createContentType("cardGrid", { name: "Card grid", description: "A grid of cards from picked entries, a collection, or the brand's latest articles." });
    const f = fieldsFor(ct);
    f.internalName("Tidewater Journeys - Home - Destinations grid");
    f.brand();
    f.symbol("heading", { name: "Heading", max: 70, help: "Grid heading, 70 characters or fewer." });
    f.symbol("intro", { name: "Intro", max: 255, help: "One sentence under the heading." });
    f.symbol("source", {
      name: "Source", required: true, max: 20, values: ["manual", "collection", "latest_articles"],
      help: "Required. manual shows the Items field, collection shows a collection's items, latest_articles shows the brand's newest articles.",
    });
    f.entries("items", { name: "Items", types: ["item", ...ROUTABLE_TYPES.filter((t) => t !== "page")], max: 12, help: "Source manual only. Up to 12 items, offerings, articles, people, or collections from the same brand." });
    f.entry("collection", { name: "Collection", types: ["collection"], help: "Source collection only. The collection whose items fill the grid." });
    f.integer("limit", { name: "Limit", min: 1, max: 12, help: "How many cards to show, 1 to 12. Defaults to all items, or 3 latest articles." });
    f.symbol("layout", {
      name: "Layout", required: true, max: 20, values: ["cards", "icons", "products", "profiles", "pricing"],
      help: "Required. cards for general content, icons for small features, products with price and swatches, profiles for people, pricing for plans.",
    });
    f.integer("columns", { name: "Columns", values: [2, 3, 4], help: "Cards per row on wide screens. Defaults to 3." });
    f.entry("cta", { name: "CTA", types: ["cta"], help: "Optional button below the grid, for example View all." });
    ct.displayField("internalName");
  }

  // ---------- faq ----------
  {
    const ct = m.createContentType("faq", { name: "FAQ", description: "Questions and answers shown as an accordion." });
    const f = fieldsFor(ct);
    f.internalName("Stuchbery's - Product - Shipping FAQ");
    f.brand();
    f.symbol("heading", { name: "Heading", max: 70, help: "For example Common questions." });
    f.entries("items", { name: "Questions", required: true, types: ["item"], min: 1, max: 10, help: "Required. 1 to 10 items: the item title is the question, the item text is the answer." });
    ct.displayField("internalName");
  }

  // ---------- testimonial ----------
  {
    const ct = m.createContentType("testimonial", { name: "Testimonial", description: "A quote from a fictional customer." });
    const f = fieldsFor(ct);
    f.internalName("Lumenwork - Case study - Quote");
    f.brand();
    f.text("quote", { name: "Quote", required: true, max: 280, help: "Required. What the person said, 280 characters or fewer. No quotation marks; the site adds them." });
    f.entry("person", { name: "Person", required: true, types: ["person"], help: "Required. A person with the role customer, from the same brand." });
    f.integer("rating", { name: "Rating", min: 1, max: 5, help: "Optional star rating from 1 to 5." });
    ct.displayField("internalName");
  }

  // ---------- stats ----------
  {
    const ct = m.createContentType("stats", { name: "Stats", description: "Two to four figures with labels." });
    const f = fieldsFor(ct);
    f.internalName("Lumenwork - Home - Results");
    f.brand();
    f.symbol("heading", { name: "Heading", max: 70, help: "Optional heading, 70 characters or fewer." });
    f.entries("items", { name: "Figures", required: true, types: ["item"], min: 2, max: 4, help: "Required. 2 to 4 items: the item value is the figure, the item title is its label." });
    f.symbol("footnote", { name: "Footnote", max: 160, help: "Required for any number: say the figures are illustrative." });
    ct.displayField("internalName");
  }

  // ---------- comparisonTable ----------
  {
    const ct = m.createContentType("comparisonTable", { name: "Comparison table", description: "Two to four offerings side by side, one row per spec label." });
    const f = fieldsFor(ct);
    f.internalName("Ledgerwood Bank - Rates - Account comparison");
    f.brand();
    f.symbol("heading", { name: "Heading", max: 70, help: "Table heading, 70 characters or fewer." });
    f.symbol("intro", { name: "Intro", max: 255, help: "One sentence under the heading." });
    f.entries("offerings", { name: "Offerings", required: true, types: ["offering"], min: 2, max: 4, help: "Required. 2 to 4 offerings from the same brand, one per column." });
    f.list("rows", { name: "Rows", required: true, minItems: 2, maxItems: 10, itemMax: 40, help: "Required. Spec labels to compare, in order. Each must match a label in the offerings' Specs, for example Monthly fee." });
    f.symbol("footnote", { name: "Footnote", max: 200, help: "Disclosures, for example Rates are illustrative and not offers." });
    ct.displayField("internalName");
  }

  // ---------- form ----------
  {
    const ct = m.createContentType("form", {
      name: "Form",
      description: "Copy for a mock form. Fields are defined in code for each form kind. Nothing submitted is sent or stored.",
    });
    const f = fieldsFor(ct);
    f.internalName("Lumenwork - Book a demo - Form");
    f.brand();
    f.symbol("formKind", {
      name: "Form kind", required: true, max: 40,
      values: ["book_demo", "quote_start", "get_quote", "book_appointment", "start_application", "request_booking", "checkout"],
      help: "Required. Which mock form to show. The fields come from code for each kind.",
    });
    f.symbol("heading", { name: "Heading", required: true, max: 70, help: "Required. 70 characters or fewer." });
    f.text("intro", { name: "Intro", max: 300, help: "One or two sentences above the form. For checkout, the promo code text." });
    f.symbol("submitLabel", { name: "Submit label", required: true, max: 24, help: "Required. Button text, 24 characters or fewer, starting with a verb." });
    f.symbol("successHeading", { name: "Success heading", required: true, max: 70, help: "Required. Shown after a valid submission." });
    f.text("successMessage", { name: "Success message", required: true, max: 300, help: "Required. Explains what happens next and that this is a demo." });
    f.text("privacyNote", { name: "Privacy note", required: true, max: 200, help: "Required. Must say this is a demo and nothing entered is sent or stored." });
    f.boolean("prefillSample", { name: "Prefill sample values", help: "Fill the form with fictional sample values so demos are faster." });
    ct.displayField("internalName");
  }

  // ---------- logoStrip ----------
  {
    const ct = m.createContentType("logoStrip", { name: "Logo strip", description: "A row of logos or trust badges." });
    const f = fieldsFor(ct);
    f.internalName("Lumenwork - Home - Customer logos");
    f.brand();
    f.symbol("heading", { name: "Heading", max: 70, help: "For example Trusted by operations teams." });
    f.assets("logos", { name: "Logos", required: true, min: 3, max: 8, help: "Required. 3 to 8 images of fictional logos or badges. Titles are alt text." });
    ct.displayField("internalName");
  }

  // ---------- item ----------
  {
    const ct = m.createContentType("item", {
      name: "Item (link, card, question, or stat)",
      description: "A small piece used inside other entries: a nav link, a card, an FAQ question and answer, or a stat.",
    });
    const f = fieldsFor(ct);
    f.symbol("title", {
      name: "Title", required: true, max: 90,
      help: "Required. Nav label (24 characters or fewer), card title, FAQ question, or stat label, depending on where it is used.",
    });
    f.brand();
    f.text("text", { name: "Text", max: 600, help: "Card text or FAQ answer, 600 characters or fewer. Leave empty for nav links and stats." });
    f.symbol("value", { name: "Value", max: 16, help: "Stats only. The figure, for example 4.8/5 or 32%." });
    f.asset("image", { name: "Image", help: "Card image or icon. Its title is the alt text." });
    f.entry("link", { name: "Link", types: ROUTABLE_TYPES, help: "Where the item links. Required for nav and footer links. Same brand only." });
    ct.displayField("title");
  }
};

export default migration;
