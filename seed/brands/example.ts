import { assetLink, defineBrand, md } from "../lib/builders";

const s = defineBrand("example", "ex");

/**
 * Example: a sandbox brand with one page, rendered at /example by src/app/example.
 * It currently recreates a money transfer company's US home page for a demo. The layout lives in
 * src/app/example; the copy below lives in Contentful so Opal can edit it, and npm run reset puts it back
 * after a demo. The copy is written for this sandbox and the page is a mockup.
 *
 * Conventions the layout reads:
 * - In rich text sections drawn as cards (ways to move money, reviews, blog), each level 3 heading starts a
 *   card. Text before the first card is the section's lead line (or its footnote, for reviews).
 * - Card photos come from the Example image pool in order (img-example-03 onward).
 * - The page's primary CTA is the button inside the rate calculator.
 */

const HOME = "https://www.remitly.com/";
const BUSINESS = "https://www.remitly.com/us/en/business";
const BLOG = "https://blog.remitly.com/";

// ---------- Hero and calculator ----------
const sendCta = s.cta("send-money", {
  internalName: "Example - Home - Hero send money", label: "Send money", goalType: "link", destinationUrl: HOME, style: "primary",
});

const createAccount = s.cta("create-account", {
  internalName: "Example - Home - Calculator create account", label: "Create your account", goalType: "link", destinationUrl: HOME, style: "primary",
});

const calculator = s.richText("calculator", {
  internalName: "Example - Home - Rate calculator", heading: "Send money fast worldwide",
  body: md(`Great everyday rates, low fees, and no hidden fees ever.

Serving over 175 countries and more than 100 currencies worldwide.`),
});

// ---------- Ways to move money ----------
const ways = s.richText("ways", {
  internalName: "Example - Home - Ways to move money", heading: "Move money your way",
  body: md(`Simple ways to send, manage and receive money

### I want to send money

Send money to support the people you love, and to invest in your future.

[Start sending](${HOME})

### I want to pay my team or vendors

Simple business payments worldwide. Pay partners, vendors and contractors directly.

[Send business payments](${BUSINESS})

### I want to receive money

Get fast, secure transfers straight to your bank account or mobile wallet, or pick up cash. Available in 130+ countries.

[Request money](${HOME})`),
});

// ---------- Trust ----------
const trust = s.cardGrid("trust", {
  internalName: "Example - Home - Trust", heading: "Trusted by millions of people worldwide",
  intro: "*Transfers arrive on time, or we refund the applicable transfer fee.",
  source: "manual", layout: "icons", columns: 3,
  items: [
    s.item("trust-track", { title: "Track your money transfers", text: "Know where your money is, every step of the way." }),
    s.item("trust-value", { title: "Great rates and value", text: "Competitive exchange rates, low fees and no hidden fees." }),
    s.item("trust-delivery", { title: "Guaranteed delivery times", text: "Your transfer arrives on time, or we refund your fees*." }),
  ],
});

// ---------- Map ----------
const map = s.mediaText("map", {
  internalName: "Example - Home - Money in motion", heading: "Life grows as money flows",
  body: "Every day, people keep life moving by sending money to their loved ones around the world, across 175+ countries in over 100 currencies.\n\nMap activity is illustrative only and does not show real transactions or volumes.",
  image: assetLink("img-example-10"), imagePosition: "left",
});

// ---------- Safety ----------
const safety = s.cardGrid("safety", {
  internalName: "Example - Home - Safety", heading: "Send money abroad safely",
  source: "manual", layout: "cards", columns: 2,
  items: [
    s.item("safety-regulated", { title: "Safe to use worldwide", text: "We meet regulations everywhere we operate to keep you safe online." }),
    s.item("safety-data", { title: "Secure data protection", text: "Your personal details and data stay private, so you stay protected online." }),
    s.item("safety-support", { title: "Support in 18 languages", text: "Whatever the time of day, we are here to help with your money transfers abroad." }),
  ],
});

// ---------- App ----------
const app = s.richText("app", {
  internalName: "Example - Home - App", heading: "Make global money moves with our app",
  body: md(`**App Store 4.9 stars** 4.5M+ ratings

**Google Play 4.8 stars** 1.4M+ ratings

App ratings are based on all countries and regions (App Store) and recent ratings across all countries (Google Play), and may vary by location and device.`),
});

// ---------- Reviews ----------
const reviews = s.richText("reviews", {
  internalName: "Example - Home - Reviews", heading: "See what our customers are saying",
  body: md(`Sample reviews written for this demo page. Individual experiences vary, including by destination.

### Quick and easy every month

I send money to my parents every month and it arrives within minutes. The app makes it simple.

**Daniela R., sending to Mexico**

### Rates I can plan around

The rate is shown up front, so I always know exactly what my family will receive.

**Joseph A., sending to the Philippines**

### Helpful support

I had a question about a first transfer and the support team sorted it out in my language.

**Priya S., sending to India**`),
});

// ---------- Blog ----------
const blog = s.richText("blog", {
  internalName: "Example - Home - Blog", heading: "Beyond Borders",
  body: md(`The official Remitly blog

### The 2026 U.S. Federal Remittance Tax Guide: What We Know So Far, and Why There's No Tax on Remitly Transfers

[Read more](${BLOG})

### How Do I Change the Address for My Green Card?

[Read more](${BLOG})

### What Is Dual Citizenship, and How Does It Work?

[Read more](${BLOG})

### How to Send Money for Lunar New Year 2026

[Read more](${BLOG})`),
});

// ---------- Countries ----------
const countries = s.richText("countries", {
  internalName: "Example - Home - Countries", heading: "Where can you send money with Remitly?",
  body: md(`Select a country to get started with international money transfers.

- [Albania](${HOME})
- [Algeria](${HOME})
- [Andorra](${HOME})
- [Angola](${HOME})
- [Anguilla](${HOME})
- [Antigua and Barbuda](${HOME})
- [Argentina](${HOME})
- [Armenia](${HOME})
- [Australia](${HOME})
- [Austria](${HOME})
- [Azerbaijan](${HOME})
- [Bahamas](${HOME})

[View more](${HOME})`),
});

// ---------- FAQ ----------
const faq = s.faq("help", {
  internalName: "Example - Home - FAQ", heading: "Get help with questions about using Remitly in the United States",
  items: [
    s.item("faq-what", { title: "What is Remitly and does it work in the United States?", text: "Remitly is an online money transfer service. You can use our website or app to send money from the United States to more than 175 countries." }),
    s.item("faq-where", { title: "Where can I send money from with Remitly?", text: "You can send from the United States and many other countries. Pick your country at the top of the page to see what is available to you." }),
    s.item("faq-safe", { title: "Is Remitly safe and trustworthy?", text: "Yes. We are licensed and regulated where we operate, we encrypt your data, and our teams monitor transfers to help prevent fraud." }),
    s.item("faq-bank", { title: "Is it safe to link your bank account to Remitly?", text: "Bank connections use secure, encrypted links, and we never share your bank login details." }),
    s.item("faq-signup", { title: "How do I sign up for Remitly in the United States?", text: "Create an account with your email address, verify your identity, then add a payment method and your recipient's details." }),
    s.item("faq-business", { title: "Can I use Remitly for business payments?", text: "Yes. A business account lets you pay suppliers, contractors and partners around the world." }),
    s.item("faq-large", { title: "Can I send large amounts of money with Remitly?", text: "Yes. Limits depend on your destination and verification level, and you can ask for higher limits in your account." }),
  ],
});

// ---------- Page and brand ----------
const hero = s.hero("home", {
  internalName: "Example - Home - Hero", eyebrow: "Personal",
  headline: "Send money. Make progress.",
  subheadline: "Send and receive money, and make payments worldwide. Reliably fast, easy, safe and affordable. Let's get moving.",
  image: assetLink("img-example-01"), layout: "split", cta: sendCta,
});

const home = s.page("home", {
  title: "Send money online", slug: "home", pageType: "home", funnelStep: 0, hero, primaryCta: createAccount,
  sections: [calculator, ways, trust, map, safety, app, reviews, blog, countries, faq],
  seoTitle: "Send money online",
  seoDescription: "Send money to more than 175 countries with great rates, low fees and guaranteed delivery times.",
});

s.brand({
  name: "Example",
  slug: "example",
  vertical: "financial_services",
  shortDescription: "Sandbox page for recreating a prospect's web page in a demo. Currently a money transfer company's home page.",
  // A logo is required, but the Example page draws its own header, so it borrows an existing one.
  logo: assetLink("logo-ledgerwood-bank"),
  colorBrand: "#2C415A", colorButton: "#2C415A", colorButtonText: "#FFFFFF", colorAccent: "#B2C8E9",
  colorBackground: "#FFFFFF", colorSurface: "#FAF8F5", colorText: "#242620", colorMuted: "#5B5E57",
  fontHeading: "DM Sans", fontBody: "DM Sans", buttonRadius: 999, buttonTextCase: "normal",
  voiceDescription: "Warm, direct and encouraging. Speaks to people sending money to family and to small businesses paying abroad, in short plain sentences that stress speed, value and safety.",
  voiceDos: [
    "Lead with what the customer can do",
    "Keep sentences short and plain",
    "Be specific about speed, fees and coverage",
    "Sound warm and supportive",
  ],
  voiceDonts: [
    "No jargon or legal language in headlines",
    "No promises the terms do not back up",
    "No em dashes",
  ],
  address: "1111 Placeholder Avenue, Suite 400\nSeattle, WA 98101",
  phone: "(206) 555-0142",
  legalDisclaimer: "Fictional company. Sample content for illustration only. This sandbox page recreates a prospect's home page for a product demo.",
  homePage: home,
});

export default s.entries;
