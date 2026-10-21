import type { Metadata } from "next";
import { DraftBanner } from "@/components/site/chrome";
import { RichText } from "@/components/site/primitives";
import { EXAMPLE_BRAND_SLUG } from "@/lib/site/contentful";
import { text, type BrandGraph } from "@/lib/site/graph";
import { isPreview, loadBrand } from "@/lib/site/load";
import type { SiteEntry } from "@/lib/site/types";

export const metadata: Metadata = {
  title: "AGF U.S. Energy Transition and Adaptation Strategy | Example",
  robots: { index: false, follow: false },
};

/**
 * The Example page: a sandbox for recreating a prospect's page during a demo. Its copy lives in the
 * Example brand (seed/brands/example.ts) so Opal can edit it; this file only draws the layout. With no
 * Example content in Contentful, the page stays blank.
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
  const section = (id: string) => g.entry({ sys: { id } });
  const hero = g.entry(page.fields.hero);
  const headline = text(hero, "headline") ?? text(page, "title") ?? "Example";

  return (
    <div className="agf">
      {preview && <DraftBanner />}
      <AgfHeader />
      <nav className="agf-crumb" aria-label="Breadcrumb">
        <div className="agf-wrap agf-crumb-row">
          <ol>
            <li><a href="#main">Home</a></li>
            {text(hero, "eyebrow") && <li><a href="#main">{text(hero, "eyebrow")}</a></li>}
            <li aria-current="page">{headline.replace(/^AGF U\.S\. /, "")}</li>
          </ol>
          <ShareIcons />
        </div>
      </nav>

      <main id="main">
        <section className="agf-hero">
          <div className="agf-wrap"><h1>{headline}</h1></div>
        </section>

        <div className="agf-wrap">
          <div className="agf-info">
            <div className="agf-facts">
              {g.entries(section("ex-cg-facts")?.fields.items).map((item) => (
                <div key={item.id}>
                  <h2 className="agf-fact-label">{text(item, "title")}</h2>
                  <p className="agf-fact-value">{text(item, "text")}</p>
                </div>
              ))}
            </div>
            <div className="agf-resources">
              <h2 className="agf-fact-label">{text(section("ex-cg-resources"), "heading")}</h2>
              <ul>
                {g.entries(section("ex-cg-resources")?.fields.items).map((item) => (
                  <li key={item.id}><PdfIcon /><span>{text(item, "title")}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="agf-tabs">
            <li><a href="#overview">Overview</a></li>
            <li><a href="#process">Process</a></li>
            <li><a href="#team">Investment Team</a></li>
          </ul>

          <section className="agf-reasons" aria-labelledby="agf-reasons">
            <h2 id="agf-reasons" className="agf-h2">{text(section("ex-cg-key-reasons"), "heading")}</h2>
            <ol>
              {g.entries(section("ex-cg-key-reasons")?.fields.items).map((item, index) => (
                <li key={item.id}>
                  <span className="agf-reason-num" aria-hidden="true">{index + 1}</span>
                  <p>{text(item, "text")}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="agf-overview">
            <section id="overview">
              <h2 className="agf-h3">Overview</h2>
              {["ex-rt-strategy", "ex-rt-philosophy", "ex-rt-process"].map((id) => <TextBlock key={id} entry={section(id)} />)}
            </section>
            <section id="process">
              <h2 className="agf-h3">{text(section("ex-fq-investment-process"), "heading")}</h2>
              <ProcessPanel entry={section("ex-rt-define-opportunities")} />
              <div className="agf-accordion">
                {g.entries(section("ex-fq-investment-process")?.fields.items).map((item) => (
                  <details key={item.id}>
                    <summary>{text(item, "title")}</summary>
                    <p>{text(item, "text")}</p>
                  </details>
                ))}
              </div>
              <ProcessPanel entry={section("ex-rt-portfolio-construction")} />
            </section>
          </div>

          <Team g={g} entry={section("ex-cg-team")} />

          <div className="agf-disclosures">
            <RichText document={section("ex-rt-disclosures")?.fields.body} />
          </div>
        </div>
      </main>
      <AgfFooter />
    </div>
  );
}

function TextBlock({ entry }: { entry: SiteEntry | undefined }) {
  if (!entry) return null;
  return (
    <div className="agf-text">
      {text(entry, "heading") && <h3 className="agf-h3">{text(entry, "heading")}</h3>}
      <RichText document={entry.fields.body} />
    </div>
  );
}

function ProcessPanel({ entry }: { entry: SiteEntry | undefined }) {
  if (!entry) return null;
  return (
    <div className="agf-panel">
      <h3 className="agf-panel-head">{text(entry, "heading")}</h3>
      <RichText document={entry.fields.body} className="agf-panel-body" />
    </div>
  );
}

function Team({ g, entry }: { g: BrandGraph; entry: SiteEntry | undefined }) {
  if (!entry) return null;
  return (
    <section id="team" className="agf-team" aria-labelledby="agf-team">
      <h2 id="agf-team" className="agf-h2">{text(entry, "heading")}</h2>
      <ul>
        {g.entries(entry.fields.items).map((item) => (
          <li key={item.id}>
            <div className="agf-team-photo" aria-hidden="true"><PersonIcon /></div>
            <h3>{text(item, "title")}</h3>
            {(text(item, "text") ?? "").split(", ").map((line) => <p key={line}>{line}</p>)}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Chrome: fixed labels, not content ----------

function AgfHeader() {
  return (
    <header className="agf-header">
      <div className="agf-topbar">
        <div className="agf-wrap agf-topbar-row">
          <span className="agf-audience">Public <Chevron /></span>
          <ul>
            <li>Change Site</li>
            <li>Newsroom</li>
            <li>Careers</li>
            <li>About AGF</li>
            <li className="agf-contact">Contact Us</li>
          </ul>
        </div>
      </div>
      <div className="agf-wrap agf-mainbar">
        <span className="agf-logo" aria-label="AGF Investments"><b>AGF</b><i aria-hidden="true" /><span>investments</span></span>
        <ul className="agf-nav">
          <li>Products <Chevron /></li>
          <li>Insights</li>
          <li>Resources</li>
          <li>About Us <Chevron /></li>
          <li aria-label="Search"><SearchIcon /></li>
        </ul>
      </div>
    </header>
  );
}

function AgfFooter() {
  const columns: Array<[string, string[]]> = [
    ["Client Service Contact Information", ["Toll Free: (800) 555-0142", "Phone: (617) 555-0142", "Fax: (800) 555-0143"]],
    ["", ["Accessibility", "Security", "Sitemap"]],
    ["AGF", ["About AGF", "Careers", "Contact Us"]],
    ["Important Information", ["Disclaimer", "Privacy", "Terms and Conditions"]],
    ["Stay Connected", ["Email Preference Centre", "Facebook", "YouTube", "LinkedIn Institutional", "RSS"]],
  ];
  return (
    <footer className="agf-footer">
      <div className="agf-wrap">
        <div className="agf-footer-grid">
          <span className="agf-footer-mark" aria-hidden="true">AGF</span>
          {columns.map(([heading, items], index) => (
            <div key={index}>
              {heading && <h2>{heading}</h2>}
              <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ))}
        </div>
        <ul className="agf-footer-sites">
          <li>Change Audience</li>
          <li>AGF Corporate</li>
          <li>AGF Capital Partners</li>
          <li>AGF Private Wealth</li>
        </ul>
        <p className="agf-mockup-note">Demo mockup for illustration only. Not an official page; contact details are placeholders.</p>
      </div>
    </footer>
  );
}

// ---------- Icons ----------

function Chevron() {
  return <svg className="agf-chevron" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function SearchIcon() {
  return <svg className="agf-search" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12.5 12.5L18 18" stroke="currentColor" strokeWidth="2" /></svg>;
}

function PdfIcon() {
  return (
    <svg className="agf-pdf" viewBox="0 0 16 20" aria-hidden="true">
      <path d="M1 1h9l5 5v13H1z" fill="#ED5A36" />
      <path d="M10 1v5h5" fill="#F7A58F" />
      <text x="8" y="15" textAnchor="middle" fontSize="5" fontWeight="700" fill="#fff">PDF</text>
    </svg>
  );
}

function PersonIcon() {
  return <svg viewBox="0 0 40 40"><circle cx="20" cy="15" r="7" fill="currentColor" /><path d="M6 38c1-9 7-13 14-13s13 4 14 13z" fill="currentColor" /></svg>;
}

function ShareIcons() {
  const icons = [
    <path key="rss" d="M3 3a14 14 0 0 1 14 14M3 8a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="2.2" />,
    <path key="in" d="M3 7h3v10H3zM4.5 2.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM8 7h3v1.5c.6-1 1.7-1.7 3.2-1.7 2.6 0 3.3 1.7 3.3 4V17h-3v-5.4c0-1.2-.3-2-1.4-2-1.2 0-2.1.8-2.1 2.2V17H8z" fill="currentColor" />,
    <path key="fb" d="M11 18v-7h2.4l.4-2.8H11V6.5c0-.8.3-1.4 1.4-1.4H14V2.6A19 19 0 0 0 11.8 2.5C9.6 2.5 8.2 3.8 8.2 6.2v2H5.8V11h2.4v7z" fill="currentColor" />,
    <path key="mail" d="M2 5h16v11H2zM2 5l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" />,
    <path key="print" d="M5 2h10v5H5zM3 7h14v7h-2v4H5v-4H3zM7 12h6v4H7z" fill="currentColor" />,
  ];
  return (
    <ul className="agf-share" aria-hidden="true">
      {icons.map((icon) => <li key={icon.key}><svg viewBox="0 0 20 20">{icon}</svg></li>)}
    </ul>
  );
}
