/**
 * A minimal brand that passes validation: the four funnel steps, an article
 * index, two articles, and the blocks they use. Used by tests and as a
 * pattern for writing seed/brands/<slug>.ts files.
 */
import { defineBrand, md } from "../../seed/lib/builders";

const s = defineBrand("lumenwork", "lw");

// People
const author = s.person("dana-whitfield", { name: "Dana Whitfield", slug: "dana-whitfield", role: "author", jobTitle: "Operations editor" });
const customer = s.person("marcus-hale", {
  name: "Marcus Hale", slug: "marcus-hale", role: "customer", jobTitle: "Director of operations",
  organization: "Pinecrest Freight", photo: s.img(11),
});

// Offerings (solutions get detail pages through the template page)
const intake = s.offering("intake", {
  name: "Intake and requests", slug: "intake-and-requests", offeringType: "saas_solution",
  summary: "Collect every request in one place and route it to the right team automatically.",
  description: md("## One front door for requests\n\nForms, email, and chat requests land in a single queue."),
  images: [s.img(5)], features: ["Shared request forms", "Automatic routing rules"],
});

// CTAs
const bookDemo = s.cta("book-demo", { internalName: "Lumenwork - Global - Book a demo", label: "Book a demo", goalType: "book_demo", destinationPage: s.ref("page", "book-a-demo") });
const nextStep = s.cta("see-results", { internalName: "Lumenwork - Solutions - See results", label: "See customer results", goalType: "next_step" });

// Blocks
const homeHero = s.hero("home", {
  internalName: "Lumenwork - Home - Hero", headline: "Run operations without the chase",
  subheadline: "Requests, approvals, and handoffs in one clear workflow.", image: s.img(1), layout: "split", cta: bookDemo,
});
const solutionsGrid = s.cardGrid("home-solutions", {
  internalName: "Lumenwork - Home - Solutions", heading: "Built for the work operations teams do", source: "manual",
  items: [intake], layout: "cards", columns: 3,
});
const stats = s.stats("home-results", {
  internalName: "Lumenwork - Home - Results", heading: "What teams report",
  items: [s.item("stat-faster", { title: "faster approvals", value: "38%" }), s.item("stat-handoffs", { title: "fewer missed handoffs", value: "2x" })],
  footnote: "Figures are illustrative.",
});
const quote = s.testimonial("pinecrest", { internalName: "Lumenwork - Case study - Quote", quote: "We stopped chasing approvals in email.", person: customer, rating: 5 });
const demoForm = s.form("book-demo", {
  internalName: "Lumenwork - Book a demo - Form", formKind: "book_demo", heading: "See Lumenwork with your workflow",
  submitLabel: "Request my demo", successHeading: "Thanks, your demo request is in",
  successMessage: "This is a demo site, so no one will contact you.", privacyNote: "Demo only. Nothing you enter is sent or stored.", prefillSample: true,
});
const latest = s.cardGrid("resources-latest", { internalName: "Lumenwork - Resources - Latest", heading: "Latest articles", source: "latest_articles", layout: "cards", limit: 6 });

// Pages: step 1 to 4, plus the article index
const home = s.page("home", {
  title: "Lumenwork", slug: "home", pageType: "home", funnelStep: 1, nextStep: s.ref("page", "solutions"),
  hero: homeHero, primaryCta: bookDemo, sections: [solutionsGrid, stats], seoTitle: "Lumenwork | Workflow software for operations teams",
});
s.page("solutions", {
  title: "Solutions", slug: "solutions", pageType: "offering_detail", funnelStep: 2, nextStep: s.ref("page", "customers"),
  primaryCta: nextStep, sections: [solutionsGrid],
});
const customers = s.page("customers", {
  title: "Pinecrest Freight case study", slug: "customers", pageType: "standard", funnelStep: 3, nextStep: s.ref("page", "book-a-demo"),
  primaryCta: bookDemo, sections: [quote, bookDemo],
});
s.page("book-a-demo", { title: "Book a demo", slug: "book-a-demo", pageType: "goal", funnelStep: 4, sections: [demoForm] });
s.page("resources", { title: "Resources", slug: "resources", pageType: "article_index", funnelStep: 0, sections: [latest] });

// Articles
s.article("approvals-stall", {
  title: "Why approvals stall, and how to keep them moving", slug: "why-approvals-stall",
  summary: "Most delays happen between steps. Here is how operations teams find them.",
  body: md("## Where the time goes\n\nApprovals rarely stall at the decision itself.\n\n- Unclear owners\n- Missing information"),
  heroImage: s.img(8), author, publishDate: "2026-09-02", topics: ["approvals"], relatedPage: intake, cta: bookDemo,
});
s.article("handoffs", {
  title: "Five handoffs worth automating first", slug: "handoffs-to-automate",
  summary: "Start with the handoffs that happen every day and fail quietly.",
  body: md("## Start small\n\nPick one handoff your team repeats daily, then measure it for a week."),
  heroImage: s.img(9), author, publishDate: "2026-09-16", topics: ["handoffs"], relatedPage: customers, cta: bookDemo,
});

// Brand (references pages defined above)
const navSolutions = s.item("nav-solutions", { title: "Solutions", link: s.ref("page", "solutions") });
s.brand({
  name: "Lumenwork", slug: "lumenwork", vertical: "b2b_saas", shortDescription: "Workflow and operations software for operations teams.",
  tagline: "Operations, in clear view.", logo: s.logo, favicon: s.favicon,
  colorBrand: "#1F2A44", colorButton: "#F2A33A", colorButtonText: "#1F2A44", colorAccent: "#2F7F7A",
  colorBackground: "#F7F6F2", colorSurface: "#FFFFFF", colorText: "#1C1F26", colorMuted: "#5B6170",
  fontHeading: "Space Grotesk", fontBody: "Inter", buttonRadius: 8, buttonTextCase: "normal",
  voiceDescription: "Clear, practical, and confident.", voiceDos: ["Use short sentences.", "Lead with outcomes."], voiceDonts: ["No hype.", "No buzzwords."],
  navigation: [navSolutions], headerCta: bookDemo, address: "410 Foundry Lane, Suite 300\nHalverton, CO 80999", phone: "(970) 555-0142",
  legalDisclaimer: "Fictional company. Sample content for illustration only.", homePage: home,
});

export default s.entries;
