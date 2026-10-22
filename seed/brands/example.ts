import { assetLink, defineBrand, md } from "../lib/builders";

const s = defineBrand("example", "ex");

/**
 * Example: a sandbox brand with one page, rendered at /example by src/app/example.
 * It currently recreates a standards organization's "UPC, Barcodes & Prefixes" page for a demo. The layout
 * lives in src/app/example; the copy below lives in Contentful so Opal can edit it, and npm run reset puts it
 * back after a demo. The copy is written for this sandbox, and the mockup is not an official page.
 */

const ESTIMATOR_URL = "https://www.gs1us.org/upcs-barcodes-prefixes";

// ---------- Get barcodes: intro and the three products ----------
const intro = s.richText("get-barcodes", {
  internalName: "Example - Home - Get barcodes", heading: "Get Barcodes",
  body: md("Barcodes from GS1 US give your products and locations an authentic and unique identity in the supply chain and in e-commerce."),
});

const prefix = s.offering("company-prefix", {
  name: "Get Several UPC Barcodes", slug: "company-prefix", offeringType: "saas_plan",
  summary: "A GS1 Company Prefix lets you create many barcodes yourself as your product line grows.",
  priceLabel: "Starting at $250",
  features: ["Get a GS1 Company Prefix"],
  specs: [
    "Supports growing product lines: Yes",
    "Uniquely identifies locations (GLN): Yes",
    "Uniquely identifies products: Yes",
    "Supports mixed cases and pallets: Yes",
    "Supports coupon creation: Yes",
    "Identifies pharmaceutical products: Yes",
  ],
  finePrint: "*Annual renewal fee",
});

const single = s.offering("single-gtin", {
  name: "Get a Single UPC Barcode", slug: "single-gtin", offeringType: "saas_plan",
  summary: "One GS1 US GTIN for a single product.",
  priceLabel: "$30 Each",
  features: ["Get a GS1 US GTIN"],
  specs: [
    "Supports growing product lines: No",
    "Uniquely identifies locations (GLN): No",
    "Uniquely identifies products: Yes",
    "Supports mixed cases and pallets: No",
    "Supports coupon creation: No",
    "Identifies pharmaceutical products: No",
  ],
});

const gln = s.offering("gln", {
  name: "Global Location Number (GLN)", slug: "gln", offeringType: "saas_plan",
  summary: "A GLN identifies a physical or legal location, such as a warehouse or store.",
  priceLabel: "$30 Each",
  features: ["Get a GLN"],
  specs: [
    "Supports growing product lines: No",
    "Uniquely identifies locations (GLN): Yes",
    "Uniquely identifies products: No",
    "Supports mixed cases and pallets: No",
    "Supports coupon creation: No",
    "Identifies pharmaceutical products: No",
  ],
});

const compare = s.comparisonTable("compare", {
  internalName: "Example - Home - Barcode options", heading: "Compare barcode options",
  offerings: [prefix, single, gln],
  rows: [
    "Supports growing product lines",
    "Uniquely identifies locations (GLN)",
    "Uniquely identifies products",
    "Supports mixed cases and pallets",
    "Supports coupon creation",
    "Identifies pharmaceutical products",
  ],
});

const estimator = s.cta("estimator", {
  internalName: "Example - Home - Estimator", heading: "Not sure how many barcodes you need?",
  label: "Go to Barcode Estimator", goalType: "link", destinationUrl: ESTIMATOR_URL, style: "primary",
});

// ---------- Overview ----------
const overview = s.richText("overview", {
  internalName: "Example - Home - Overview", heading: "Overview",
  body: md(`Getting a barcode is easy! Checkout takes three simple steps.

1. Choose a GS1 US GTIN, a Global Location Number, or a GS1 Company Prefix and add it to your cart.
2. Enter your contact information.
3. Pay for your order online. Within minutes you will receive a welcome email from GS1 US with all of the important information you need to get started, including access to myGS1 US, your online member center.`),
});

// ---------- Why ----------
const why = s.cardGrid("why", {
  internalName: "Example - Home - Why choose us", heading: "Why GS1 US?",
  intro: "GS1 US is a not-for-profit information standards organization, and GS1 Standards are the most widely used supply chain standards in the world. If you have a question, Customer Support is ready to help.",
  source: "manual", layout: "icons", columns: 4,
  items: [
    s.item("why-accepted", { title: "Accepted by every retailer & supplier" }),
    s.item("why-marketplaces", { title: "Sell your products worldwide on any Marketplace" }),
    s.item("why-support", { title: "Get free live support" }),
    s.item("why-datahub", { title: "Instantly create and print your barcodes with our Data Hub tool" }),
    s.item("why-unique", { title: "Globally unique codes to improve your supply chain efficiency & visibility" }),
  ],
});

// ---------- How to use ----------
const howTo = s.cardGrid("how-to", {
  internalName: "Example - Home - How to use barcodes", heading: "How to Use Your GS1 Barcodes",
  source: "manual", layout: "cards", columns: 4,
  items: [
    s.item("how-gtin-or-gln", { title: "GTIN or GLN?", text: "Find out what to do once you have your GS1 Company Prefix.", image: assetLink("img-example-01") }),
    s.item("how-barcode-type", { title: "Determine Barcode Type", text: "Check which type of barcode your retailers need from you.", image: assetLink("img-example-02") }),
    s.item("how-place", { title: "Place Barcodes on Products", text: "Create the barcode image and print it correctly on your items.", image: assetLink("img-example-03") }),
    s.item("how-share", { title: "Share Information Electronically", text: "Share your product and location information with all of your trading partners.", image: assetLink("img-example-04") }),
  ],
});

// ---------- Pricing ----------
const pricing = s.richText("pricing", {
  internalName: "Example - Home - Pricing", heading: "GS1 Company Prefix Pricing",
  body: md(`| Number of items needing a barcode/GTIN | Initial fee | Annual renewal fee |
| --- | --- | --- |
| 1 GS1 US GTIN | $30 | $0 |
| 10 | $250 | $50 |
| 100 | $750 | $150 |
| 1,000 | $2,500 | $500 |
| 10,000 | $6,500 | $1,300 |
| 100,000 | $10,500 | $2,100 |
| GS1 Company Prefix including U.S. FDA NDC Labeler Code | $2,100 | $2,100 |`),
});

// ---------- Help ----------
const help = s.cta("help", {
  internalName: "Example - Home - Need a hand", heading: "Need a hand?",
  body: "If you need help getting started, or support with any part of your GS1 US membership, please get in touch.",
  label: "Get in Touch", goalType: "link", destinationUrl: ESTIMATOR_URL, style: "primary",
});

// ---------- Page and brand ----------
const hero = s.hero("home", {
  internalName: "Example - Home - Hero", eyebrow: "Get a Barcode",
  headline: "UPC, Barcodes & Prefixes", layout: "text_only",
});

const home = s.page("home", {
  title: "UPC, Barcodes & Prefixes", slug: "home", pageType: "home", funnelStep: 0, hero,
  sections: [intro, compare, estimator, overview, why, howTo, pricing, help],
  seoTitle: "UPC, Barcodes & Prefixes",
  seoDescription: "Get UPC barcodes, a GS1 Company Prefix, or a Global Location Number, and learn how to use them with your products.",
});

s.brand({
  name: "Example",
  slug: "example",
  vertical: "b2b_saas",
  shortDescription: "Sandbox page for recreating a prospect's web page in a demo. Currently a standards organization's UPC, barcodes and prefixes page.",
  // A logo is required, but the Example page draws its own header, so it borrows an existing one.
  logo: assetLink("logo-ledgerwood-bank"),
  colorBrand: "#002C6C", colorButton: "#CD3C0D", colorButtonText: "#FFFFFF", colorAccent: "#CD3C0D",
  colorBackground: "#FFFFFF", colorSurface: "#C4D7ED", colorText: "#262626", colorMuted: "#5C6670",
  fontHeading: "Manrope", fontBody: "Manrope", buttonRadius: 0, buttonTextCase: "normal",
  voiceDescription: "Clear, friendly, and practical. Speaks to small business owners and brand managers who need barcodes, explaining each option and step in plain language without jargon.",
  voiceDos: [
    "Lead with what the reader can do next",
    "Explain each barcode option in plain terms",
    "Keep sentences short and direct",
    "Use exact fees and counts from the pricing table",
  ],
  voiceDonts: [
    "No hype or exclamation marks beyond the single reassuring one in the overview",
    "No unexplained acronyms; spell out GTIN and GLN on first use",
    "No em dashes",
  ],
  address: "75 Placeholder Way, Floor 12\nBoston, MA 02110",
  phone: "(617) 555-0142",
  legalDisclaimer: "Fictional company. Sample content for illustration only. This sandbox page recreates a prospect's web page for a product demo.",
  homePage: home,
});

export default s.entries;
