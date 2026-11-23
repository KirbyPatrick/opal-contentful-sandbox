import { assetLink, defineBrand, md } from "../lib/builders";

const s = defineBrand("placeholder", "ph");

/**
 * Placeholder: a second sandbox brand with one page, rendered at /placeholder by src/app/placeholder. It is
 * kept apart from Example (/example) so two prospect pages can be live at once. It currently recreates a
 * gutter company's home page with the prospect's own images (assets/prospects/placeholder). The layout lives
 * in src/app/placeholder; the copy below lives in Contentful so Opal can edit it, and npm run reset puts it
 * back after a demo. Headings and labels match the prospect's page; longer copy is reworded.
 *
 * Conventions the layout reads:
 * - The hero is its own entry (ph-he-home). Its CTA's heading and body are the estimate box's two title
 *   lines, and its label is the box's button. The brand's promo bar text is the green call bar.
 * - The warranty media block is drawn with the stats entry that follows it, and the "Why choose" media block
 *   with the feature card grid that follows it.
 * - In the testimonials section, the first paragraph is the lead, a paragraph in italics is the demo note,
 *   and each level 3 heading starts a review card: the heading is the reviewer, then the quote, then the place.
 * - In the comparison section, each list item is one benefit row.
 * - The last CTA section is the closing offer: its body is the small label above the heading.
 */

const SITE = "https://leafguard.homes/";

// ---------- CTAs ----------
const getPrices = s.cta("get-prices", {
  internalName: "Placeholder - Home - Hero estimate box", label: "Get Prices", goalType: "get_quote",
  destinationUrl: SITE, style: "primary",
  heading: "Free No Obligation Estimate", body: "75% Off Installation + $200 Off*",
});

const offer = s.cta("offer", {
  internalName: "Placeholder - Home - Closing offer", label: "Get Prices", goalType: "get_quote",
  destinationUrl: SITE, style: "primary",
  heading: "Get 75% Off Installation + $200 Discount*", body: "Limited Time Offer",
});

// ---------- Our promise ----------
const promise = s.cardGrid("promise", {
  internalName: "Placeholder - Home - Our promise", heading: "Our Promise",
  intro: "Leafguard proudly protects the home by getting it right the first time… for a lifetime.",
  source: "manual", layout: "cards", columns: 3,
  items: [
    s.item("promise-maintenance", { title: "Maintenance-Free", text: "You never have to climb a ladder to clean your gutters again.", image: assetLink("img-placeholder-02") }),
    s.item("promise-clog", { title: "Clog-Free", text: "Our one-piece proprietary system is guaranteed not to clog, or we will clean your gutters for free.**", image: assetLink("img-placeholder-03") }),
    s.item("promise-trust", { title: "From a Company You Can Trust", text: "Leafguard prioritizes safety and treats our customers professionally and respectfully.", image: assetLink("img-placeholder-04") }),
  ],
});

// ---------- Warranty and figures ----------
const warranty = s.mediaText("warranty", {
  internalName: "Placeholder - Home - Lifetime warranty", heading: "Lifetime No-Clog Warranty",
  body: "We're the only gutter brand that offers a Lifetime No-Clog Warranty. What does that mean? It's simple: your gutters are guaranteed not to clog for as long as they're on your home. If they ever do, we'll clean them out for free!",
  image: assetLink("img-placeholder-05"), imagePosition: "left",
});

const figures = s.stats("figures", {
  internalName: "Placeholder - Home - Figures",
  items: [
    s.item("stat-usa", { title: "Made In USA", value: "100%" }),
    s.item("stat-financing", { title: "Special Financing", value: "0%" }),
    s.item("stat-customers", { title: "Customers", value: "500,000+" }),
  ],
});

// ---------- Worries ----------
const worry = (key: string, title: string, image: string) => s.item(`worry-${key}`, { title, image: assetLink(image) });

const worries = s.cardGrid("worries", {
  internalName: "Placeholder - Home - Worries", heading: "With Leafguard you don't have to worry about…",
  source: "manual", layout: "cards", columns: 4,
  items: [
    worry("clogging", "Clogging", "img-placeholder-06"),
    worry("cleaning", "Cleaning", "img-placeholder-07"),
    worry("leaks", "Leaks", "img-placeholder-08"),
    worry("water", "Water damage", "img-placeholder-09"),
    worry("ladder", "Ladder accidents", "img-placeholder-10"),
  ],
});

// ---------- Testimonials ----------
const reviews = s.richText("reviews", {
  internalName: "Placeholder - Home - Customer testimonials", heading: "Customer testimonials",
  body: md(`See what some of our 500,000+ satisfied homeowners have to say.

*Sample reviews written for this demo page.*

### Dana R.

"They checked every detail before the install and the crew was quick, careful and professional from start to finish."

Colorado

### Marcus T.

"Great product and even better service. You rarely see this kind of attention to detail anymore."

Illinois

### Erin K.

"If you're thinking about new gutters, look at Leafguard first. The quality speaks for itself."

Missouri

### Rosa M.

"The new gutters look sharp and they handle heavy rain without a single overflow."

Texas

### Paul D.

"The installers were friendly, cleaned up after themselves and finished in one day."

North Carolina

### Linda S.

"Worth every penny. I haven't been up a ladder since they went in."

Utah`),
});

// ---------- Why choose ----------
const why = s.mediaText("why", {
  internalName: "Placeholder - Home - Why choose", heading: "Why choose Leafguard gutter protection?",
  body: "With more than 30 years in business and over 500,000 customers across the country, Leafguard's maintenance-free protection is something you can count on. Our gutters help guard against the problems heavy rain can cause, including pests such as flies and roaches, and they're built to carry water where it needs to go and stand up to the worst weather.",
  image: assetLink("img-placeholder-11"), imagePosition: "left",
});

const features = s.cardGrid("features", {
  internalName: "Placeholder - Home - Why choose features",
  source: "manual", layout: "icons", columns: 2,
  items: [
    s.item("feature-leaks", { title: "Resists Leaks", text: "Resists leaks and drips, even in areas with heavy rainfall, preventing water damage to your home." }),
    s.item("feature-blockages", { title: "Prevents Blockages", text: "Prevents blockages from heavy fall leaves and keeps out insects, dirt and animals." }),
    s.item("feature-clog", { title: "Clog Free", text: "Removes the need for cleaning with our clog-free guarantee.*" }),
    s.item("feature-install", { title: "Easy Installation", text: "Offers easy installation and a custom design that fits your home perfectly." }),
  ],
});

// ---------- Estimate band ----------
const estimate = s.mediaText("estimate", {
  internalName: "Placeholder - Home - Request an estimate", heading: "Request a Free Estimate",
  body: "Our friendly team will reach out within a few hours to set up a free visit from an expert surveyor.\n\nEnter your zipcode to schedule a free estimate.",
  image: assetLink("img-placeholder-12"), imagePosition: "right", cta: getPrices,
});

// ---------- Comparison ----------
const compare = s.richText("compare", {
  internalName: "Placeholder - Home - Comparison", heading: "See How We Outperform in Every Area",
  body: md(`- Maintenance Free
- Eliminates leaks
- Customized to your home
- Never have to clean
- Lifetime no clog guarantee*`),
});

// ---------- FAQ ----------
const faq = s.faq("faq", {
  internalName: "Placeholder - Home - FAQs", heading: "FAQs",
  items: [
    s.item("faq-how", { title: "How Does Leafguard Work?", text: "Leafguard's one-piece design relies on liquid adhesion: rainwater follows the curved hood into the gutter, while leaves and other debris roll off the edge." }),
    s.item("faq-clog", { title: "Are Leafguard Gutters Guaranteed To Never Clog?", text: "Yes. Leafguard gutters are guaranteed never to clog with leaves, pine needles or other debris for as long as you own your home. If they do, we'll clean or repair them for free." }),
    s.item("faq-roof", { title: "Will Leafguard Void My Roofing Warranty?", text: "No. The one-piece system attaches to your fascia board, not under your shingles, so your roof warranty stays intact. Its built-in baffle also stops debris from getting in behind the gutter, a common problem with multi-piece gutters and covers." }),
    s.item("faq-cost", { title: "How Much do Leafguard Gutters Cost?", text: "Cost depends on several things, including the size of your home. Leafguard gutters are affordable and a worthwhile investment in protecting your home." }),
    s.item("faq-install", { title: "How Are Leafguard Gutters Installed?", text: "Our professional, licensed installers custom fit every system. Every installation is covered by our lifetime warranty, and most are finished in a day or less." }),
  ],
});

// ---------- Page and brand ----------
const hero = s.hero("home", {
  internalName: "Placeholder - Home - Hero",
  headline: "75% Off Installation + $200 Off*",
  subheadline: "Say Goodbye To Clogged Gutters",
  image: assetLink("img-placeholder-01"), layout: "split", cta: getPrices,
});

const home = s.page("home", {
  title: "Give up gutter cleaning for good", slug: "home", pageType: "home", funnelStep: 0, hero, primaryCta: getPrices,
  sections: [promise, warranty, figures, worries, reviews, why, features, estimate, compare, faq, offer],
  seoTitle: "Give up gutter cleaning for good",
  seoDescription: "Leafguard one-piece gutters with a Lifetime No-Clog Warranty. Get 75% off installation plus $200 off.",
});

s.brand({
  name: "Placeholder",
  slug: "placeholder",
  vertical: "insurance",
  shortDescription: "Second sandbox page for recreating a prospect's web page in a demo. Currently a gutter company's home page.",
  logo: assetLink("logo-placeholder"),
  colorBrand: "#1FA76F", colorButton: "#F01505", colorButtonText: "#FFFFFF", colorAccent: "#172A3A",
  colorBackground: "#FFFFFF", colorSurface: "#EFEFEF", colorText: "#000000", colorMuted: "#333333",
  fontHeading: "Inter", fontBody: "Inter", buttonRadius: 8, buttonTextCase: "normal",
  voiceDescription: "Direct, confident and offer-led. Speaks to homeowners tired of cleaning gutters, in short punchy lines that lead with the discount, the no-clog guarantee and a free estimate.",
  voiceDos: [
    "Lead with the offer and the guarantee",
    "Keep lines short and punchy",
    "Point to the free estimate",
    "Sound confident and reassuring",
  ],
  voiceDonts: [
    "No jargon in headlines",
    "No promises the offer terms do not back up",
    "No em dashes",
  ],
  promoBarText: "Call To Get 75% Off Installation + $200 Off*",
  address: "100 Sample Street\nAkron, OH 44308",
  phone: "(330) 555-0187",
  legalDisclaimer: "Fictional company. Sample content for illustration only. This sandbox page recreates a prospect's home page for a product demo and is not operated by the company shown.",
  homePage: home,
});

export default s.entries;
