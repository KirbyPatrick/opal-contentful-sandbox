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
  internalName: "Example - Home - Rate calculator", heading: "Fast transfers to almost anywhere",
  body: md(`Strong everyday rates, low fees and no surprise charges.

Available in more than 175 countries and over 100 currencies.`),
});

// ---------- Ways to move money ----------
const ways = s.richText("ways", {
  internalName: "Example - Home - Ways to move money", heading: "Move money on your terms",
  body: md(`Easy ways to send, manage and receive money

### Send money to people you love

Support family and friends at home, or put money toward your own plans.

[Start sending](${HOME})

### Pay your team or suppliers

Straightforward business payments around the world. Pay partners, suppliers and contractors directly.

[Send business payments](${BUSINESS})

### Get paid from abroad

Receive quick, secure transfers to a bank account or mobile wallet, or collect cash. Available in 130+ countries.

[Request money](${HOME})`),
});

// ---------- Trust ----------
const trust = s.cardGrid("trust", {
  internalName: "Example - Home - Trust", heading: "Trusted by millions around the world",
  intro: "*If a transfer arrives late, we refund the applicable transfer fee.",
  source: "manual", layout: "icons", columns: 3,
  items: [
    s.item("trust-track", { title: "Follow every transfer", text: "See where your money is at each step, from the moment you send it." }),
    s.item("trust-value", { title: "Strong rates, real value", text: "Competitive exchange rates and low fees, with nothing hidden." }),
    s.item("trust-delivery", { title: "Delivery times you can count on", text: "Your money arrives when we say it will, or we refund your fees*." }),
  ],
});

// ---------- Map ----------
const map = s.mediaText("map", {
  internalName: "Example - Home - Money in motion", heading: "Every transfer keeps life moving",
  body: "Each day, people support the ones they love by sending money across more than 175 countries in over 100 currencies.",
  image: assetLink("img-example-10"), imagePosition: "left",
});

// ---------- Safety ----------
const safety = s.cardGrid("safety", {
  internalName: "Example - Home - Safety", heading: "Send money abroad with confidence",
  source: "manual", layout: "cards", columns: 2,
  items: [
    s.item("safety-regulated", { title: "Built for safety everywhere", text: "We follow the rules in every country where we operate, so your money is protected online." }),
    s.item("safety-data", { title: "Your data stays protected", text: "Your personal details stay private and secure, every time you use us." }),
    s.item("safety-support", { title: "Help in 18 languages", text: "Day or night, our team is ready to help with your international transfers." }),
  ],
});

// ---------- App ----------
const app = s.richText("app", {
  internalName: "Example - Home - App", heading: "Manage every transfer from our app",
  body: md(`**App Store 4.9 stars** 4.5M+ ratings

**Google Play 4.8 stars** 1.4M+ ratings

Scan the code with your phone to download the app.`),
});

// ---------- Reviews ----------
const reviews = s.richText("reviews", {
  internalName: "Example - Home - Reviews", heading: "What our customers say",
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
  body: md(`Guides and stories from our blog

### The 2026 US remittance tax: what we know so far

What the new federal rules mean for people sending money abroad, and how they apply to your transfers.

[Read more](${BLOG})

### How to update the address on your green card

The steps, forms and timing to keep your records current after a move.

[Read more](${BLOG})

### Dual citizenship explained

What it means to hold two nationalities and how the process works.

[Read more](${BLOG})

### Sending money for Lunar New Year

Tips for getting gifts to family on time for the celebrations.

[Read more](${BLOG})`),
});

// ---------- Countries ----------
const countries = s.richText("countries", {
  internalName: "Example - Home - Countries", heading: "Where you can send money",
  body: md(`Choose a country to start an international transfer.

- [Mexico](${HOME})
- [India](${HOME})
- [Philippines](${HOME})
- [Colombia](${HOME})
- [Guatemala](${HOME})
- [Dominican Republic](${HOME})
- [El Salvador](${HOME})
- [Honduras](${HOME})
- [Vietnam](${HOME})
- [Nigeria](${HOME})
- [Pakistan](${HOME})
- [Brazil](${HOME})

[View all countries](${HOME})`),
});

// ---------- FAQ ----------
const faq = s.faq("help", {
  internalName: "Example - Home - FAQ", heading: "Answers to common questions",
  items: [
    s.item("faq-what", { title: "What is this service and does it work in the United States?", text: "We are an online money transfer service. You can send money from the United States to more than 175 countries using our website or app." }),
    s.item("faq-where", { title: "Where can I send money from?", text: "You can send from the United States and many other countries. Choose your country at the top of the page to see the options available to you." }),
    s.item("faq-safe", { title: "Is it safe and trustworthy?", text: "Yes. We are licensed and regulated where we operate, we encrypt your data, and our teams monitor transfers to help prevent fraud." }),
    s.item("faq-bank", { title: "Is it safe to link my bank account?", text: "Bank connections use secure, encrypted links, and we never share your bank login details." }),
    s.item("faq-signup", { title: "How do I sign up?", text: "Create an account with your email address, verify your identity, then add a payment method and your recipient's details." }),
    s.item("faq-business", { title: "Can I use it for business payments?", text: "Yes. Our business account lets you pay suppliers, contractors and partners around the world." }),
    s.item("faq-large", { title: "Can I send large amounts?", text: "Yes. Sending limits depend on your destination and verification level, and you can request higher limits in your account." }),
  ],
});

// ---------- Page and brand ----------
const hero = s.hero("home", {
  internalName: "Example - Home - Hero", eyebrow: "Personal",
  headline: "Send money home. Keep life moving.",
  subheadline: "Send and receive money and pay for things around the world. Fast, simple, secure and good value. Ready when you are.",
  image: assetLink("img-example-01"), layout: "split", cta: sendCta,
});

const home = s.page("home", {
  title: "Send money online", slug: "home", pageType: "home", funnelStep: 0, hero, primaryCta: createAccount,
  sections: [calculator, ways, trust, map, safety, app, reviews, blog, countries, faq],
  seoTitle: "Send money online",
  seoDescription: "Send money to more than 175 countries with strong rates, low fees and delivery times you can count on.",
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
