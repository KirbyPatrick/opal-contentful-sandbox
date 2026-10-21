import { assetLink, defineBrand, md } from "../lib/builders";

const s = defineBrand("example", "ex");

/**
 * Example: a sandbox brand with one page, rendered at /example by src/app/example.
 * It currently recreates an asset manager's strategy page for a compliance demo, so it
 * deliberately ships with two problems for Opal to fix:
 * - the disclosures section shows an unrendered <disclaimer/> template tag
 * - there is no performance, risk, or regulatory disclosure copy anywhere on the page
 * npm run reset puts both back after a demo. The copy is written for this sandbox.
 */

// ---------- Facts and resources ----------
const facts = s.cardGrid("facts", {
  internalName: "Example - Home - Strategy facts", heading: "Strategy facts", source: "manual", layout: "icons", columns: 4,
  items: [
    s.item("fact-approach", { title: "Approach", text: "Thematic, Fundamental, Bottom up" }),
    s.item("fact-cap", { title: "Cap", text: "All-Cap, Agnostic" }),
    s.item("fact-benchmark", { title: "Benchmark", text: "Solactive U.S. Energy Transition and Adaptation Opportunities Index" }),
    s.item("fact-inception", { title: "Inception Date", text: "February 2023" }),
  ],
});

const resources = s.cardGrid("resources", {
  internalName: "Example - Home - Resources", heading: "Resources", source: "manual", layout: "cards", columns: 2,
  items: [
    s.item("resource-fact-sheet", { title: "AGF U.S. Energy Transition and Adaptation Strategy Fact Sheet" }),
    s.item("resource-commentary", { title: "AGF U.S. Energy Transition and Adaptation Strategy Commentary" }),
  ],
});

// ---------- Key reasons ----------
const reasons = s.cardGrid("key-reasons", {
  internalName: "Example - Home - Key reasons to invest", heading: "Key Reasons to Invest", source: "manual", layout: "cards", columns: 3,
  items: [
    s.item("reason-secular-themes", {
      title: "Long-term secular themes",
      text: "Targets durable growth themes that play out over decades, concentrating on businesses we believe are positioned to benefit as North America rebuilds its energy system and adapts its infrastructure.",
    }),
    s.item("reason-solution-providers", {
      title: "Solution providers",
      text: "Owns the companies supplying the building blocks of change, from grid and power infrastructure, storage, hydrogen and carbon capture to advanced materials, cleaner fuels, and flood and wildfire defenses*, which we expect to keep growing as the transition gathers pace.",
    }),
    s.item("reason-process", {
      title: "A differentiated process",
      text: "Applies a distinctive research discipline to find well-placed companies whose products make energy systems cleaner and critical infrastructure more resilient.",
    }),
  ],
});

// ---------- Overview ----------
const strategy = s.richText("strategy", {
  internalName: "Example - Home - Strategy", heading: "Strategy",
  body: md("The strategy seeks long-term capital growth. It invests mainly in the shares of companies whose products and services help reduce the environmental footprint of today's energy system, or help communities and infrastructure adapt to a changing climate."),
});

const philosophy = s.richText("philosophy", {
  internalName: "Example - Home - Philosophy", heading: "Philosophy",
  body: md("Two forces shape our view. The first is electrification: as more of the economy runs on power, North America needs a grid that can carry far more load, far more reliably. The second is a harsher climate, which is testing utilities, roads and buildings that were never designed for today's storms, floods and fires. Together they create what we believe is a generational investment cycle in clean generation, transmission, storage and resilience, and one that much of the market still underestimates."),
});

const process = s.richText("process", {
  internalName: "Example - Home - Process", heading: "Process",
  body: md(`We start from the top down, mapping the themes behind North America's energy transition and adaptation, then do the bottom-up work on individual companies. Our proven thematic framework covers established leaders as well as emerging pure-play innovators.

For each candidate we weigh business quality and maturity, policy and macroeconomic tailwinds, technology trends, competitive position, cost curves, and how the market currently prices the opportunity. Only companies where we see attractive long-term growth make it into the portfolio, which typically holds 10 to 30 names across the capitalization spectrum.

AGF Investments worked with Solactive to develop the Solactive U.S. Energy Transition and Adaptation Opportunities Index, which tracks this opportunity set. Solactive's ARTIS natural language processing tool helped define the index universe, reaching beyond a conventional rules-based screen.`),
});

// ---------- Investment process ----------
const defineOpportunities = s.richText("define-opportunities", {
  internalName: "Example - Home - Define opportunities", heading: "Define Opportunities",
  body: md("We look for opportunities created by the ongoing energy transition and climate adaptation across North America.\n\nThey are driven by new energy technologies, shifting regulation and policy, and changes in the competitive landscape."),
});

const investmentProcess = s.faq("investment-process", {
  internalName: "Example - Home - Investment process", heading: "Investment Process",
  items: [
    s.item("step-universe", {
      title: "1. Create Investment Universe",
      text: "We screen listed North American companies for meaningful exposure to energy transition and adaptation themes, building a focused universe of potential holdings.",
    }),
    s.item("step-selection", {
      title: "2. Security Selection",
      text: "Thematic and fundamental research narrows the universe to companies with strong competitive positions, sound balance sheets, and growth we believe the market has not fully priced.",
    }),
    s.item("step-construction", {
      title: "3. Portfolio Construction and Ongoing Stewardship",
      text: "Position sizes reflect our conviction in each company. The team monitors every holding, engages with management, and rebalances as themes and valuations change.",
    }),
  ],
});

const portfolioConstruction = s.richText("portfolio-construction", {
  internalName: "Example - Home - Portfolio construction", heading: "Portfolio Construction",
  body: md("A concentrated portfolio of 10 to 30 investments."),
});

// ---------- Team and disclosures ----------
const team = s.cardGrid("team", {
  internalName: "Example - Home - Investment team", heading: "Investment Team", source: "manual", layout: "profiles", columns: 3,
  items: [
    s.item("team-portfolio-manager", { title: "Daniel Ferrante, MES, MBA", text: "VP & Portfolio Manager, AGF Investments" }),
    s.item("team-analysts", { title: "Analysts", text: "Investment Team" }),
  ],
});

// The template tag is escaped so it reaches the page as visible text, the way a broken CMS tag would.
const disclosures = s.richText("disclosures", {
  internalName: "Example - Home - Disclosures",
  body: md("\\*Subject to change\n\n&lt;disclaimer/&gt;"),
});

// ---------- Page and brand ----------
const hero = s.hero("home", {
  internalName: "Example - Home - Hero", eyebrow: "Separately Managed Accounts",
  headline: "AGF U.S. Energy Transition and Adaptation Strategy", layout: "text_only",
});

const home = s.page("home", {
  title: "AGF U.S. Energy Transition and Adaptation Strategy", slug: "home", pageType: "home", funnelStep: 0, hero,
  sections: [facts, resources, reasons, strategy, philosophy, process, defineOpportunities, investmentProcess, portfolioConstruction, team, disclosures],
  seoTitle: "AGF U.S. Energy Transition and Adaptation Strategy",
  seoDescription: "A thematic, all-cap separately managed account strategy investing in North America's energy transition and climate adaptation.",
});

s.brand({
  name: "Example",
  slug: "example",
  vertical: "financial_services",
  shortDescription: "Sandbox page for recreating a prospect's web page in a demo. Currently an asset manager's energy transition strategy page.",
  // A logo is required, but the Example page draws its own header, so it borrows an existing one.
  logo: assetLink("logo-ledgerwood-bank"),
  colorBrand: "#ED5A36", colorButton: "#203232", colorButtonText: "#FFFFFF", colorAccent: "#ED5A36",
  colorBackground: "#FFFFFF", colorSurface: "#E8EAEA", colorText: "#203232", colorMuted: "#5C6666",
  fontHeading: "DM Sans", fontBody: "DM Sans", buttonRadius: 0, buttonTextCase: "normal",
  voiceDescription: "Institutional, measured, and research-led. Writes for financial advisors and investors about long-term thematic strategies, explaining objective, philosophy, and process in precise investment language with a confident, unhurried tone.",
  voiceDos: [
    "Use precise investment terms such as thematic, fundamental, and bottom up",
    "Lead with the strategy's objective, then its philosophy and process",
    "Name sectors and solution areas specifically",
    "Write complete, formal sentences in the first person plural",
  ],
  voiceDonts: [
    "No slang, exclamation marks, or consumer marketing tone",
    "No vague buzzwords without a concrete example",
    "No em dashes",
  ],
  address: "75 Placeholder Way, Floor 12\nBoston, MA 02110",
  phone: "(617) 555-0142",
  legalDisclaimer: "Fictional company. Sample content for illustration only. This sandbox page recreates a prospect's web page for a product demo.",
  homePage: home,
});

export default s.entries;
