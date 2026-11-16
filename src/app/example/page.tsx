import type { Block, Document, Inline, Text } from "@contentful/rich-text-types";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DraftBanner } from "@/components/site/chrome";
import { Img, RichText } from "@/components/site/primitives";
import { EXAMPLE_BRAND_SLUG } from "@/lib/site/contentful";
import { text, type BrandGraph } from "@/lib/site/graph";
import { isPreview, loadBrand } from "@/lib/site/load";
import type { SiteEntry } from "@/lib/site/types";

export const metadata: Metadata = {
  title: "Dementia testing | Example",
  robots: { index: false, follow: false },
};

const HOME = "https://www.mayocliniclabs.com/";
const CATALOG = "https://www.mayocliniclabs.com/test-catalog";
const INSIGHTS = "https://news.mayocliniclabs.com/";
/** The C2N PrecivityAD2 listing (Mayo ID AD2). Its link gets a stable ID for experiments. */
const C2N_TEST_PATH = "/test-catalog/overview/624462";

/**
 * The Example page: a sandbox for recreating a prospect's page during a demo. Its copy lives in the
 * Example brand (seed/brands/example.ts) so Opal can edit it; this file only draws the layout. With no
 * Example content in Contentful, the page stays blank.
 *
 * It currently recreates a clinical laboratory's dementia testing campaign page. Elements a landing page
 * experiment is likely to change carry stable IDs: #hero-banner, #hero-headline, #hero-subhead,
 * #hero-cta-slot (empty space under the subhead), #test-blood-biomarkers, #c2n-test-link,
 * #c2n-webinar-card and #primary-cta.
 */
export default async function ExamplePage() {
  const [g, preview] = await Promise.all([loadBrand(EXAMPLE_BRAND_SLUG), isPreview()]);
  const page = g?.homePage;
  if (!g || !page) {
    return (
      <main id="main" className="example-page">
        <h1 className="sr-only">Example</h1>
      </main>
    );
  }
  const hero = g.entry(page.fields.hero);
  const title = text(page, "title") ?? "Dementia testing";
  const headline = text(hero, "headline") ?? title;
  const subhead = text(hero, "subheadline");
  const sections = g.entries(page.fields.sections);
  const byId = (id: string) => sections.find((entry) => entry.id === id);

  // Pairs drawn as one block: the intro card holds the figures, the expertise text sits beside its quote.
  const pairs: Record<string, [string, string]> = {
    "ex-rt-intro": ["ex-rt-intro", "ex-st-figures"],
    "ex-st-figures": ["ex-rt-intro", "ex-st-figures"],
    "ex-rt-expertise": ["ex-rt-expertise", "ex-rt-expertise-quote"],
    "ex-rt-expertise-quote": ["ex-rt-expertise", "ex-rt-expertise-quote"],
  };
  const drawn = new Set<string>();
  const blocks: ReactNode[] = [];
  for (const entry of sections) {
    if (drawn.has(entry.id)) continue;
    const pair = pairs[entry.id];
    if (pair?.[0] === "ex-rt-intro") {
      pair.forEach((id) => drawn.add(id));
      blocks.push(<IntroCard key={entry.id} g={g} intro={byId(pair[0])} figures={byId(pair[1])} />);
      continue;
    }
    if (pair) {
      pair.forEach((id) => drawn.add(id));
      blocks.push(<Expertise key={entry.id} body={byId(pair[0])} quote={byId(pair[1])} />);
      continue;
    }
    drawn.add(entry.id);
    blocks.push(<Block key={entry.id} g={g} entry={entry} />);
  }

  return (
    <div className="mcl">
      {preview && <DraftBanner />}
      <Header />
      <main id="main">
        <section id="hero-banner" className="mcl-banner">
          <Img asset={g.asset(hero?.fields.image)} className="mcl-banner-img" sizes="100vw" priority decorative />
          <div className="mcl-banner-shade" aria-hidden="true" />
          <nav className="mcl-crumb" aria-label="Breadcrumb">
            <ol>
              <li><a href={HOME}>Mayo Clinic Laboratories</a></li>
              <li aria-current="page">{title}</li>
            </ol>
          </nav>
          <div className="mcl-wrap mcl-banner-copy">
            <h1 id="hero-headline" className="mcl-hero-headline">{emphasis(headline)}</h1>
            {subhead && <p id="hero-subhead" className="mcl-hero-subhead">{emphasis(subhead)}</p>}
            {/* Intentionally empty: room for a test variant to add a call to action under the subhead. */}
            <div id="hero-cta-slot" className="mcl-hero-slot" />
          </div>
        </section>
        {blocks}
      </main>
      <Footer />
    </div>
  );
}

// ---------- Section blocks ----------

function Block({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  switch (entry.id) {
    case "ex-rt-test-categories": return <Categories entry={entry} />;
    case "ex-rt-test-menu": return <TestMenu entry={entry} />;
    case "ex-rt-highlights": return <Highlights entry={entry} />;
    case "ex-rt-resources": return <Resources entry={entry} />;
    case "ex-rt-references": return <References entry={entry} />;
  }
  switch (entry.type) {
    case "cta": return <CtaBand g={g} entry={entry} />;
    case "faq": return <Faq g={g} entry={entry} />;
    case "stats": return <section className="mcl-wrap mcl-section"><Figures g={g} entry={entry} /></section>;
    case "richTextSection": return <GenericText entry={entry} />;
    default: return null;
  }
}

function IntroCard({ g, intro, figures }: { g: BrandGraph; intro?: SiteEntry; figures?: SiteEntry }) {
  return (
    <section className="mcl-intro" aria-labelledby={intro ? "intro-heading" : undefined}>
      <div className="mcl-intro-card">
        {intro && (
          <>
            {text(intro, "heading") && <h2 id="intro-heading" className="mcl-intro-heading">{emphasis(text(intro, "heading"))}</h2>}
            <RichText document={intro.fields.body} className="mcl-intro-body" />
          </>
        )}
        {figures && <Figures g={g} entry={figures} />}
      </div>
    </section>
  );
}

function Figures({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const items = g.entries(entry.fields.items);
  if (items.length === 0) return null;
  const footnote = text(entry, "footnote");
  return (
    <div className="mcl-stats">
      {text(entry, "heading") && <h2 className="mcl-h2">{emphasis(text(entry, "heading"))}</h2>}
      <ul className="mcl-stat-tiles">
        {items.map((item) => (
          <li key={item.id} className="mcl-stat">
            <span className="mcl-stat-value">{text(item, "value")}</span>
            <span className="mcl-stat-label">{text(item, "title")}</span>
          </li>
        ))}
      </ul>
      {footnote && <p className="mcl-footnote">{footnote}</p>}
    </div>
  );
}

function Expertise({ body, quote }: { body?: SiteEntry; quote?: SiteEntry }) {
  return (
    <section className="mcl-wrap mcl-expertise" aria-labelledby={body ? "expertise-heading" : undefined}>
      {body && (
        <div className="mcl-expertise-text">
          {text(body, "heading") && <h2 id="expertise-heading" className="mcl-expertise-heading">{emphasis(text(body, "heading"))}</h2>}
          <RichText document={body.fields.body} />
        </div>
      )}
      {quote && <RichText document={quote.fields.body} className="mcl-quote" />}
    </section>
  );
}

function Categories({ entry }: { entry: SiteEntry }) {
  const groups = splitByHeading(entry.fields.body);
  if (groups.length === 0) return null;
  const heading = text(entry, "heading");
  return (
    <section className="mcl-wrap mcl-section mcl-categories" aria-label={heading ?? "Dementia testing by category"}>
      {heading && <h2 className="mcl-h2">{emphasis(heading)}</h2>}
      <div className="mcl-accordions">
        {groups.map((group, index) => (
          <details key={group.title + index} className="mcl-acc" id={index === 0 ? "test-blood-biomarkers" : `test-${slugify(group.title)}`}>
            <summary>
              <span className="mcl-acc-title">{group.title}</span>
              <span className="mcl-acc-toggle"><span className="mcl-acc-more">Show more</span><span className="mcl-acc-less">Show less</span><Chevron /></span>
            </summary>
            <RichText
              document={asDocument(group.nodes)}
              className="mcl-acc-body"
              linkAttributes={(uri) => (uri.includes(C2N_TEST_PATH) ? { id: "c2n-test-link", className: "mcl-arrow-link" } : { className: "mcl-arrow-link" })}
            />
          </details>
        ))}
      </div>
    </section>
  );
}

function TestMenu({ entry }: { entry: SiteEntry }) {
  return (
    <section className="mcl-wrap mcl-section mcl-menu-section" aria-labelledby="test-menu-heading">
      <h2 id="test-menu-heading" className="mcl-h3">{emphasis(text(entry, "heading") ?? "Test menu")}</h2>
      <div className="mcl-table-scroll" role="region" aria-labelledby="test-menu-heading" tabIndex={0}>
        <RichText document={entry.fields.body} className="mcl-testmenu" />
      </div>
      <p className="mcl-scroll-hint" aria-hidden="true">Scroll sideways to see the full menu</p>
    </section>
  );
}

function Highlights({ entry }: { entry: SiteEntry }) {
  const cards = splitByHeading(entry.fields.body);
  if (cards.length === 0) return null;
  return (
    <section className="mcl-highlights" aria-labelledby="highlights-heading">
      <div className="mcl-wrap">
        <h2 id="highlights-heading" className="mcl-h3">{emphasis(text(entry, "heading") ?? "Highlights")}</h2>
        <ul className="mcl-cards">
          {cards.map((card, index) => (
            <li key={card.title + index} id={/\bC2N\b/.test(card.title) ? "c2n-webinar-card" : undefined} className="mcl-card">
              <h3 className="mcl-card-title">{card.title}</h3>
              <RichText document={asDocument(card.nodes)} className="mcl-card-body" linkAttributes={() => ({ className: "mcl-card-link" })} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CtaBand({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const url = text(entry, "destinationUrl");
  const href = url && /^https?:\/\//i.test(url) ? url : HOME;
  return (
    <section className="mcl-wrap mcl-cta" aria-labelledby={`${entry.id}-heading`}>
      <div className="mcl-cta-media">
        <Img asset={g.asset({ sys: { id: "img-example-02" } })} sizes="(min-width: 900px) 40vw, 100vw" />
      </div>
      <div className="mcl-cta-panel">
        <h2 id={`${entry.id}-heading`} className="mcl-cta-heading">{emphasis(text(entry, "heading"))}</h2>
        {text(entry, "body") && <p>{text(entry, "body")}</p>}
        <a id="primary-cta" className="mcl-btn" href={href} rel="noopener noreferrer" target="_blank">
          {text(entry, "label") ?? "Schedule an appointment"}<span aria-hidden="true"> →</span>
        </a>
      </div>
    </section>
  );
}

function Resources({ entry }: { entry: SiteEntry }) {
  return (
    <section className="mcl-wrap mcl-section mcl-resources" aria-labelledby="resources-heading">
      <h2 id="resources-heading" className="mcl-label-heading">{text(entry, "heading") ?? "Resources"}</h2>
      <RichText document={entry.fields.body} className="mcl-resource-list" />
    </section>
  );
}

function References({ entry }: { entry: SiteEntry }) {
  return (
    <section className="mcl-wrap mcl-references" aria-labelledby="references-heading">
      <h2 id="references-heading" className="mcl-label-heading">{text(entry, "heading") ?? "References"}</h2>
      <RichText document={entry.fields.body} className="mcl-reference-list" />
    </section>
  );
}

function GenericText({ entry }: { entry: SiteEntry }) {
  const heading = text(entry, "heading");
  return (
    <section className="mcl-wrap mcl-section" aria-label={heading ?? undefined}>
      {heading && <h2 className="mcl-h2">{emphasis(heading)}</h2>}
      <RichText document={entry.fields.body} className="mcl-prose" />
    </section>
  );
}

/** FAQ sections Opal adds with create_faq, drawn as accordions in the page's style. */
function Faq({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const items = g.entries(entry.fields.items);
  if (items.length === 0) return null;
  const heading = text(entry, "heading");
  return (
    <section className="mcl-wrap mcl-section" aria-label={heading ?? "Frequently asked questions"}>
      {heading && <h2 className="mcl-h2">{emphasis(heading)}</h2>}
      <div className="mcl-accordions">
        {items.map((item) => (
          <details key={item.id} className="mcl-acc">
            <summary>
              <span className="mcl-acc-title">{text(item, "title")}</span>
              <span className="mcl-acc-toggle"><span className="mcl-acc-more">Show more</span><span className="mcl-acc-less">Show less</span><Chevron /></span>
            </summary>
            <div className="mcl-acc-body"><p>{text(item, "text")}</p></div>
          </details>
        ))}
      </div>
    </section>
  );
}

// ---------- Chrome ----------

const UTILITY = [
  { label: "MayoACCESS", href: HOME },
  { label: "MayoLINK", href: HOME },
  { label: "Register", href: HOME },
  { label: "My Dashboard", href: HOME },
];
const MAIN_NAV = [
  { label: "Test catalog", href: CATALOG },
  { label: "Specimen handling", href: HOME },
  { label: "Ordering and billing", href: HOME },
  { label: "Education", href: INSIGHTS },
  { label: "Insights", href: INSIGHTS },
  { label: "About us", href: HOME },
];

function Wordmark() {
  return (
    <span className="mcl-wordmark">
      <span className="mcl-wordmark-top">Mayo Clinic</span>
      <span className="mcl-wordmark-bottom">Laboratories</span>
    </span>
  );
}

function Header() {
  return (
    <header className="mcl-header">
      <div className="mcl-header-row">
        <a className="mcl-logo" href={HOME} aria-label="Mayo Clinic Laboratories home"><Wordmark /></a>
        <nav className="mcl-utility" aria-label="Account">
          {UTILITY.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
        </nav>
        <a className="mcl-icon-link" href={CATALOG} aria-label="Search">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="1.8" /></svg>
        </a>
        <details className="mcl-menu">
          <summary aria-label="Menu">
            <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true"><path d="M0 1h28M0 10h28M0 19h28" stroke="currentColor" strokeWidth="2" /></svg>
          </summary>
          <nav className="mcl-menu-panel" aria-label="Main menu">
            {MAIN_NAV.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
            {UTILITY.map((link) => <a key={`m-${link.label}`} className="mcl-menu-utility" href={link.href}>{link.label}</a>)}
          </nav>
        </details>
      </div>
      <nav className="mcl-mainnav" aria-label="Main">
        <div className="mcl-mainnav-row">
          {MAIN_NAV.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
        </div>
      </nav>
    </header>
  );
}

const FOOTER = [
  { heading: "Mayo Clinic Labs", links: ["Mayo Clinic", "About us", "Newsroom", "Operational resources"] },
  { heading: "Resources", links: ["FAQ", "Policies", "Quality", "Careers", "Insights"] },
  { heading: "Accounts", links: ["Mayo account", "MayoLINK", "Register", "Dashboard"] },
  { heading: "Contacts", links: ["Contacts", "Customer service"] },
];

function Footer() {
  return (
    <footer className="mcl-footer">
      <div className="mcl-wrap mcl-footer-main">
        <a className="mcl-logo" href={HOME} aria-label="Mayo Clinic Laboratories home"><Wordmark /></a>
        <div className="mcl-footer-cols">
          {FOOTER.map((col) => (
            <div key={col.heading}>
              <h2>{col.heading}</h2>
              <ul>{col.links.map((label) => <li key={label}><a href={label === "Insights" ? INSIGHTS : HOME}>{label}</a></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mcl-wrap mcl-footer-base">
        <p>Demo mockup for illustration only. Not an official Mayo Clinic Laboratories page; links and figures are placeholders.</p>
      </div>
    </footer>
  );
}

function Chevron() {
  return <svg className="mcl-chevron" viewBox="0 0 16 10" width="16" height="10" aria-hidden="true"><path d="M1 1.5 8 8.5l7-7" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>;
}

// ---------- Helpers ----------

/** Renders **bold** runs as <strong>; everything else stays plain text. */
function emphasis(value: string | undefined): ReactNode {
  if (!value) return null;
  return value.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

type RichNode = Block | Inline | Text;
const plainText = (node: RichNode): string => (node.nodeType === "text" ? (node as Text).value : ((node as Block).content ?? []).map((child) => plainText(child as RichNode)).join(""));

/** Splits a rich text document into groups, each starting at a level 3 heading. Content before the first heading is dropped. */
function splitByHeading(document: unknown): { title: string; nodes: Block[] }[] {
  if (!document || typeof document !== "object" || (document as Document).nodeType !== "document") return [];
  const groups: { title: string; nodes: Block[] }[] = [];
  for (const node of (document as Document).content as Block[]) {
    if (node.nodeType === "heading-3") groups.push({ title: plainText(node).trim(), nodes: [] });
    else groups.at(-1)?.nodes.push(node);
  }
  return groups.filter((group) => group.title !== "");
}

const asDocument = (nodes: Block[]): Document => ({ nodeType: "document", data: {}, content: nodes } as unknown as Document);
