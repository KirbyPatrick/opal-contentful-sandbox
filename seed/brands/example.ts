import { assetLink, defineBrand, md } from "../lib/builders";

const s = defineBrand("example", "ex");

/**
 * Example: a sandbox brand with one page, rendered at /example by src/app/example.
 * It currently recreates a sunroom company's home page for a demo. The layout lives in
 * src/app/example; the copy below lives in Contentful so Opal can edit it, and npm run reset puts it back
 * after a demo. The page is a mockup.
 *
 * Conventions the layout reads:
 * - The product grid's cards are card grid items: title, photo, and the two links come from the layout by title.
 * - In the "How to get started" section, each level 3 heading starts a column and the list under it is its links.
 * - In the "Our products" section, the first list is the main product row and the second list is the smaller row.
 * - The intro section's paragraph is the line under the hero (#hero-subhead).
 * - The hero CTA is the "Schedule Now" button in the sticky bar at the bottom of the screen; its heading and
 *   body are the bar's two text lines. The page's primary CTA is the "View Offers" button in the header.
 */

const SITE = "https://www.patioenclosures.com";
const link = (label: string, path: string) => `- [${label}](${SITE}${path})`;

// ---------- CTAs ----------
const schedule = s.cta("schedule", {
  internalName: "Example - Home - Sticky bar schedule", label: "Schedule Now", goalType: "book_appointment",
  destinationUrl: `${SITE}/schedule-design-consultation.aspx`, style: "primary",
  heading: "In-Home Estimates", body: "Call: 800-230-8301",
});

const offers = s.cta("offers", {
  internalName: "Example - Home - Header view offers", label: "View Offers", goalType: "link",
  destinationUrl: `${SITE}/special-offers-and-financing.aspx`, style: "primary",
});

// ---------- Intro ----------
const intro = s.richText("intro", {
  internalName: "Example - Home - Intro",
  body: md("Don't just remodel your home, refresh the way you live with a Patio Enclosures brand sunroom, screen room or enclosed porch. From simple to spectacular, every room is custom designed and custom built to fit your needs, budget and lifestyle."),
});

// ---------- Product grid ----------
const product = (key: string, title: string, image: string) => s.item(`prod-${key}`, { title, image: assetLink(image) });

const products = s.cardGrid("products", {
  internalName: "Example - Home - Product grid", heading: "Our sunroom collection",
  source: "manual", layout: "cards", columns: 4,
  items: [
    product("sunrooms", "Sunrooms", "img-example-02"),
    product("three-season", "Three Season Rooms", "img-example-03"),
    product("four-season", "Four Season Rooms", "img-example-04"),
    product("screen", "Screen Rooms", "img-example-05"),
    product("porches", "Enclosed Porches", "img-example-06"),
    product("covers", "Porch & Patio Covers", "img-example-07"),
    product("kits", "Sunroom Kits", "img-example-08"),
    product("windows", "Windows & Doors", "img-example-09"),
  ],
});

// ---------- How to get started ----------
const getStarted = s.richText("get-started", {
  internalName: "Example - Home - How to get started", heading: "How to Get Started",
  body: md(`### 1. Get Inspired

${link("Photo Gallery", "/photo-gallery.aspx")}
${link("Video Gallery", "/sunroom-video-gallery.aspx")}
${link("Sunroom Catalog", "/sunroom-catalog.aspx")}
${link("Sunroom Design Tips Blog", "/sunroom-design-tips-blog.aspx")}
${link("E-newsletter Signup", "/enewsletter-signup.aspx")}

### 2. Plan Your Sunroom

${link("Our Sunroom Collection", "/sunrooms.aspx")}
${link("Sunroom Types & Options", "/sunroom-types-options.aspx")}
${link("Specials & Financing", "/special-offers-and-financing.aspx")}
${link("Frequently Asked Questions", "/sunroom-frequently-asked-questions.aspx")}
${link("What to Expect: Our Process", "/patio-enclosures-process.aspx")}
${link("Sunroom Construction Guide", "/sunroom-construction-guide.aspx")}
${link("Glossary & Terms", "/sunroom-glossary-terms.aspx")}

### 3. Why Choose Us

${link("Customer Reviews", "/satisfied-customers.aspx")}
${link("What Makes Us Different", "/patio-enclosures-difference.aspx")}
${link("Our Story", "/about-patio-enclosures.aspx")}
${link("Specials & Financing", "/special-offers-and-financing.aspx")}
${link("What's New", "/whats-new.aspx")}

### 4. Free Consultation

${link("Schedule In-Home Estimate", "/schedule-design-consultation.aspx")}
${link("Find Your Location", "/design-center-locator.aspx")}
${link("General Contact Form", "/general-contact-form.aspx")}`),
});

// ---------- Our products ----------
const ourProducts = s.richText("our-products", {
  internalName: "Example - Home - Our products", heading: "Our Products",
  body: md(`${link("Three Season Rooms", "/three-season-rooms.aspx")}
${link("Four Season Rooms", "/four-season-rooms.aspx")}
${link("Screen Rooms", "/screen-rooms.aspx")}
${link("Enclosed Porches", "/porch-enclosures.aspx")}
${link("Florida Rooms", "/florida-rooms.aspx")}
${link("Retractable Screens", "/retractable-screens.aspx")}
${link("Porch & Patio Covers", "/porch-patio-covers.aspx")}
${link("Windows & Doors", "/replacement-windows-doors.aspx")}

More rooms and options

${link("Florida Room Additions", "/florida-room-additions.aspx")}
${link("Commercial Patio Enclosures", "/commercial-patio-enclosures.aspx")}
${link("Traditional Sunrooms", "/traditional-sunroom-additions.aspx")}
${link("Sunroom Blinds & Shades", "/sunroom-blinds-shades.aspx")}
${link("Solariums", "/solariums.aspx")}
${link("Sunroom Kits", "/sunroom-kits.aspx")}`),
});

// ---------- Page and brand ----------
const hero = s.hero("home", {
  internalName: "Example - Home - Hero",
  headline: "The Patio Enclosures® Sunroom Collection",
  image: assetLink("img-example-01"), layout: "full_bleed", cta: schedule,
});

const home = s.page("home", {
  title: "Sunrooms, Three Season Rooms, Solariums, Screen Rooms", slug: "home", pageType: "home", funnelStep: 0, hero, primaryCta: offers,
  sections: [intro, products, getStarted, ourProducts],
  seoTitle: "Sunrooms, Three Season Rooms, Solariums, Screen Rooms",
  seoDescription: "Custom designed sunrooms, three and four season rooms, screen rooms and enclosed porches, with free in-home estimates.",
});

s.brand({
  name: "Patio Enclosures",
  slug: "example",
  vertical: "insurance",
  shortDescription: "Sandbox page for recreating a prospect's web page in a demo. Currently a sunroom company's home page.",
  // A logo is required, but the Example page draws its own header, so it borrows an existing one.
  logo: assetLink("logo-ledgerwood-bank"),
  colorBrand: "#00A7B7", colorButton: "#00A7B7", colorButtonText: "#FFFFFF", colorAccent: "#FA9D1C",
  colorBackground: "#FFFFFF", colorSurface: "#E5F4F4", colorText: "#494949", colorMuted: "#767676",
  fontHeading: "Inter", fontBody: "Inter", buttonRadius: 4, buttonTextCase: "normal",
  voiceDescription: "Friendly, practical and proud of craftsmanship. Speaks to homeowners planning a sunroom, screen room or porch, in plain words that stress custom design, quality and a free in-home estimate.",
  voiceDos: [
    "Lead with the room and how the family will use it",
    "Keep sentences short and plain",
    "Point to the free in-home estimate",
    "Sound warm and confident",
  ],
  voiceDonts: [
    "No construction jargon in headlines",
    "No pricing promises the offer terms do not back up",
    "No em dashes",
  ],
  address: "2500 E Enterprise Pkwy\nTwinsburg, OH 44087",
  phone: "(330) 555-0142",
  legalDisclaimer: "Fictional company. Sample content for illustration only. This sandbox page recreates a prospect's home page for a product demo and is not operated by the company shown.",
  homePage: home,
});

export default s.entries;
