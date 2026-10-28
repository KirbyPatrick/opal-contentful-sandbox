import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DraftBanner } from "@/components/site/chrome";
import { Img, RichText } from "@/components/site/primitives";
import { EXAMPLE_BRAND_SLUG } from "@/lib/site/contentful";
import { list, text, type BrandGraph } from "@/lib/site/graph";
import { isPreview, loadBrand } from "@/lib/site/load";
import type { SiteEntry } from "@/lib/site/types";

export const metadata: Metadata = {
  title: "UPC, Barcodes & Prefixes | Example",
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
  const intro = section("ex-rt-get-barcodes");
  const compare = section("ex-cm-compare");
  const estimator = section("ex-ct-estimator");
  const overview = section("ex-rt-overview");
  const why = section("ex-cg-why");
  const howTo = section("ex-cg-how-to");
  const pricing = section("ex-rt-pricing");
  const help = section("ex-ct-help");
  // FAQs Opal adds with create_faq are new sections, so they are found by type, not by ID, and drawn right
  // after the section they follow. One that follows a section this layout does not draw goes before the help band.
  const drawn = ["ex-rt-get-barcodes", "ex-cm-compare", "ex-ct-estimator", "ex-rt-overview", "ex-cg-why", "ex-cg-how-to", "ex-rt-pricing", "ex-ct-help"];
  const faqsByPrevious = new Map<string, SiteEntry[]>();
  let previous = "start";
  for (const entry of g.entries(page.fields.sections)) {
    if (entry.type !== "faq") {
      previous = drawn.includes(entry.id) ? entry.id : "before-help";
      continue;
    }
    faqsByPrevious.set(previous, [...(faqsByPrevious.get(previous) ?? []), entry]);
  }
  const faqsAfter = (...ids: string[]) =>
    ids.flatMap((id) => faqsByPrevious.get(id) ?? []).map((faq) => <Faq key={faq.id} g={g} entry={faq} />);

  return (
    <div className="gs1">
      {preview && <DraftBanner />}
      {/* Checking this hides the promo bar, as their close button does, without client-side script. */}
      <input type="checkbox" id="gs1-promo-hide" className="gs1-promo-toggle" aria-label="Hide the offer bar" />
      <Promo />
      <Header />

      <main id="main">
        <nav className="gs1-wrap gs1-crumb" aria-label="Breadcrumb">
          <ol>
            <li><a href="#main"><Chevron back />Home</a><Chevron /></li>
            <li aria-current="page">{ones(headline)}</li>
          </ol>
        </nav>

        <section className="gs1-hero">
          <div className="gs1-wrap"><h1>{ones(headline)}</h1></div>
        </section>

        {faqsAfter("start")}

        <section className="gs1-wrap gs1-intro">
          {intro && <h2 className="gs1-h2">{ones(text(intro, "heading"))}</h2>}
          <RichText document={intro?.fields.body} className="gs1-lead" renderText={ones} />
          <Compare g={g} entry={compare} />
        </section>

        {faqsAfter("ex-rt-get-barcodes", "ex-cm-compare")}

        {estimator && (
          <section className="gs1-band" aria-label={text(estimator, "heading")}>
            <div className="gs1-wrap gs1-band-row">
              <h3>{ones(text(estimator, "heading"))}</h3>
              <a className="gs1-btn" href="#main">{ones(text(estimator, "label"))}</a>
            </div>
          </section>
        )}

        {faqsAfter("ex-ct-estimator")}

        {overview && (
          <section className="gs1-overview">
            <div className="gs1-wrap gs1-overview-cols">
              <div>
                <h3 className="gs1-h3">{ones(text(overview, "heading"))}</h3>
                <RichText document={overview.fields.body} className="gs1-steps" renderText={ones} />
              </div>
              <div className="gs1-video" role="img" aria-label="Video: How do I get a barcode?">
                <span className="gs1-video-title" aria-hidden="true">How do I get a barcode?</span>
                <span className="gs1-video-play" aria-hidden="true" />
              </div>
            </div>
          </section>
        )}

        {faqsAfter("ex-rt-overview")}

        {why && (
          <section className="gs1-wrap gs1-why">
            <div className="gs1-why-head">
              <h2 className="gs1-h2">{ones(text(why, "heading"))}</h2>
              <a className="gs1-btn gs1-btn-outline" href="#main">Learn More</a>
            </div>
            <p className="gs1-lead">{ones(text(why, "intro"))}</p>
            <ul className="gs1-why-icons">
              {g.entries(why.fields.items).map((item, index) => (
                <li key={item.id}>
                  <WhyIcon index={index} />
                  <span>{ones(text(item, "title"))}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {faqsAfter("ex-cg-why")}

        <hr className="gs1-rule" />

        {howTo && (
          <section className="gs1-wrap gs1-howto">
            <h2 className="gs1-h2">{ones(text(howTo, "heading"))}</h2>
            <ul>
              {g.entries(howTo.fields.items).map((item) => (
                <li key={item.id}>
                  <a href="#main" className="gs1-card">
                    <Img asset={g.asset(item.fields.image)} sizes="(min-width: 900px) 33vw, 100vw" />
                    <span className="gs1-card-body">
                      <strong>{ones(text(item, "title"))}</strong>
                      <span>{ones(text(item, "text"))}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {faqsAfter("ex-cg-how-to")}

        {pricing && (
          <section className="gs1-wrap gs1-pricing" aria-labelledby="gs1-pricing-title">
            <div className="gs1-pricing-card">
              <h2 id="gs1-pricing-title" className="gs1-pricing-title">{ones(text(pricing, "heading"))}</h2>
              <div className="gs1-table-scroll" role="region" aria-labelledby="gs1-pricing-title" tabIndex={0}>
                <RichText document={pricing.fields.body} renderText={ones} />
              </div>
            </div>
          </section>
        )}

        {faqsAfter("ex-rt-pricing", "before-help")}

        {help && (
          <section className="gs1-help">
            <div className="gs1-wrap">
              <h2>{ones(text(help, "heading"))}</h2>
              <p>{ones(text(help, "body"))}</p>
              <a className="gs1-btn" href="#main">
                {ones(text(help, "label"))}
                <svg viewBox="0 0 13 11" width="13" height="11" aria-hidden="true"><path d="M1 5.5h10.5M7 1l4.5 4.5L7 10" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              </a>
            </div>
          </section>
        )}
        {faqsAfter("ex-ct-help")}
      </main>
      <Footer />
    </div>
  );
}

function Faq({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const items = g.entries(entry.fields.items);
  if (items.length === 0) return null;
  const heading = text(entry, "heading");
  return (
    <section className="gs1-wrap gs1-faq" aria-label={heading ?? "Frequently asked questions"}>
      {heading && <h2 className="gs1-h2">{ones(heading)}</h2>}
      <div className="gs1-faq-list">
        {items.map((item) => (
          <details key={item.id}>
            <summary>{ones(text(item, "title"))}</summary>
            <p>{ones(text(item, "text"))}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Compare({ g, entry }: { g: BrandGraph; entry: SiteEntry | undefined }) {
  if (!entry) return null;
  const products = g.entries(entry.fields.offerings);
  const rows = list(entry, "rows");
  const value = (product: SiteEntry, row: string) => {
    const spec = list(product, "specs").find((s) => s.split(":")[0]?.trim().toLowerCase() === row.toLowerCase());
    return spec?.slice(spec.indexOf(":") + 1).trim().toLowerCase() === "yes";
  };
  return (
    <>
      <div className="gs1-table-scroll gs1-compare-scroll" role="region" aria-label={text(entry, "heading") ?? "Compare barcode options"} tabIndex={0}>
        <table className="gs1-compare">
          <thead>
            <tr>
              <td aria-hidden="true" />
              {products.map((product, index) => (
                <th key={product.id} scope="col" className={index === 0 ? "is-featured" : undefined}>
                  <ProductIcon index={index} />
                  <span className="gs1-product-name">{ones(text(product, "name"))}</span>
                  <span className="gs1-product-price">{ones(text(product, "priceLabel"))}</span>
                  <a className="gs1-btn gs1-btn-block" href="#main">{ones(list(product, "features")[0] ?? "Get started")}</a>
                  {text(product, "finePrint") && <span className="gs1-fine">{ones(text(product, "finePrint"))}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <th scope="row">{ones(row)}</th>
                {products.map((product) => (
                  <td key={product.id}>
                    {value(product, row)
                      ? <svg className="gs1-yes" viewBox="0 0 21 21" role="img" aria-label="Included"><path d="M1.9 10.4l6.7 6.1L18.8 4.4" fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      : <svg className="gs1-no" viewBox="0 0 21 21" role="img" aria-label="Not included"><rect x="1.75" y="8.75" width="17.5" height="3.5" fill="currentColor" /></svg>}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="gs1-learn">
              <td aria-hidden="true" />
              {products.map((product) => <td key={product.id}><a href="#main">Learn More</a></td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="gs1-mcards">
        {products.map((product, index) => (
          <article key={product.id} className={index === 0 ? "gs1-mcard is-featured" : "gs1-mcard"}>
            <div className="gs1-mcard-head">
              <ProductIcon index={index} />
              <h3>{ones(text(product, "name"))}</h3>
              <p className="gs1-product-price">{ones(text(product, "priceLabel"))}</p>
              <a className="gs1-btn" href="#main">{ones(list(product, "features")[0] ?? "Get started")}</a>
              {text(product, "finePrint") && <p className="gs1-fine">{ones(text(product, "finePrint"))}</p>}
            </div>
            <details className="gs1-mcard-list" open>
              <summary>What’s included?<Chevron /></summary>
              <ul>
                {rows.filter((row) => value(product, row)).map((row) => <li key={row}>{ones(row)}</li>)}
                <li><a href="#main">Learn More</a></li>
              </ul>
            </details>
          </article>
        ))}
      </div>
    </>
  );
}

/** Their Gotham has a wide "1" and Montserrat's tabular "1" matches it, so each "1" gets the tabular figure. */
function ones(value: string | undefined): ReactNode {
  if (!value?.includes("1")) return value;
  // One wrapper, so a flex parent such as a button still sees a single item.
  return <span>{value.split("1").flatMap((part, i) => (i === 0 ? [part] : [<span key={i} className="gs1-one">1</span>, part]))}</span>;
}

const ONE = <span className="gs1-one">1</span>;

// ---------- Chrome: fixed labels, not content ----------

function Promo() {
  return (
    <div className="gs1-promo">
      <div className="gs1-promo-left" aria-hidden="true">
        <span className="gs1-promo-lockup">Prefix +<em>Free</em><em>Course</em></span>
      </div>
      <div className="gs1-promo-stack" aria-hidden="true">
        <span className="gs1-promo-tile"><BarcodeMini /><i>GS{ONE}<br />Company<br />Prefix</i></span>
        <span className="gs1-promo-plus">+</span>
        <span className="gs1-promo-tile"><CapMini /><i>Assign<br />GTINs<br />Course</i></span>
      </div>
      <div className="gs1-promo-price" aria-hidden="true">
        <s>$79</s><b>Free</b><i>Course</i>
      </div>
      <p className="gs1-promo-copy">
        <strong>Join other confident brand owners!</strong>
        Master barcode basics today - course included free with every GS{ONE} Company Prefix.
      </p>
      <div className="gs1-promo-actions">
        <a className="gs1-promo-cta" href="#main">Get Prefix</a>
        <details className="gs1-promo-offer">
          <summary>
            <span>Offer details</span>
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="5" fill="rgba(255,255,255,0.35)" /><path d="M5 2.6v4.8M2.6 5h4.8" stroke="#fff" strokeWidth="1.2" /></svg>
          </summary>
          <p>Offer runs through 12/31/2027. A new GS{ONE} Company Prefix includes free access to the recorded Assign GTINs course. Demo mockup: offer terms are placeholders.</p>
        </details>
      </div>
      <label className="gs1-promo-close" htmlFor="gs1-promo-hide" aria-label="Close offer">×</label>
    </div>
  );
}

function Header() {
  return (
    <header className="gs1-header">
      <div className="gs1-wrap gs1-header-top">
        <a className="gs1-logo" href="#main" aria-label="GS1 US home">
          {/* The prospect's logo, supplied for the demo mockup. */}
          <img src="/example/gs1-us-logo.png" alt="GS1 US" width={89} height={69} />
        </a>
        <div className="gs1-header-compact" aria-hidden="true">
          <svg viewBox="0 0 22 22" width="22" height="22"><circle cx="9" cy="9" r="7.3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M14.4 14.4L20.5 20.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          <svg viewBox="0 0 22 18" width="22" height="18"><path d="M1 1.5h20M1 9h20M1 16.5h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <div className="gs1-header-right">
          <ul className="gs1-toplinks">
            <li className="gs1-tagline">The Global Language of Business</li>
            <li><a href="#main">Pay My Bill</a></li>
            <li><a href="#main">GS{ONE} US Store</a></li>
            <li><a href="#main">GS{ONE} Connect Conference</a></li>
            <li><a href="#main">Small Business</a></li>
          </ul>
          <div className="gs1-header-actions">
            <svg className="gs1-search" viewBox="0 0 16 16" role="img" aria-label="Search"><circle cx="6.6" cy="6.6" r="5.3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M10.5 10.5L15 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            <a className="gs1-btn" href="#main">Get a Barcode <svg viewBox="0 0 13 8" width="13" height="8" aria-hidden="true"><path d="M1 1l5.5 5.5L12 1" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></a>
            <a className="gs1-btn gs1-btn-outline gs1-btn-login" href="#main">Login</a>
          </div>
        </div>
      </div>
      <nav className="gs1-nav" aria-label="Main">
        <div className="gs1-wrap">
          <ul>
            <li><a href="#main">UPC, Barcodes &amp; Prefixes</a></li>
            <li><a href="#main">Tools &amp; Resources</a></li>
            <li><a href="#main">Industries &amp; Insights</a></li>
            <li><a href="#main">Education &amp; Events</a></li>
            <li><a href="#main">Who We Are</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="gs1-footer">
      <div className="gs1-wrap">
        <ul className="gs1-footer-main">
          <li><a href="#main">Who We Are</a></li>
          <li><a href="#main">GS{ONE} Connect Conference</a></li>
          <li><a href="#main">Careers</a></li>
          <li><a href="#main">Contact Us</a></li>
        </ul>
        <hr />
        <div className="gs1-footer-row">
          <ul className="gs1-social" aria-hidden="true">
            <li><SocialIcon kind="linkedin" /></li>
            <li><SocialIcon kind="x" /></li>
            <li><SocialIcon kind="facebook" /></li>
            <li><SocialIcon kind="youtube" /></li>
          </ul>
          <div>
            <ul className="gs1-footer-links">
              {["Terms of Use", "Privacy", "Antitrust Policy", "IP Policy", "GS1 Global", "GS1 Connect", "Sitemap", "Cookie Preferences"].map((label) => (
                <li key={label}><a href="#main">{ones(label)}</a></li>
              ))}
            </ul>
            <p className="gs1-copy">© 2026 GS{ONE} US. All Rights Reserved</p>
            <p className="gs1-legal">
              GS{ONE} US<sup>®</sup> and design is a registered trademark of GS{ONE} US, Inc. Trademarks appearing on this site are owned by GS{ONE} US, Inc. unless otherwise noted, and may not be used without the permission of <a href="#main">GS{ONE} US, Inc</a>.
              {" "}Demo mockup for illustration only; prices and links are placeholders.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Icons ----------

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg className={back ? "gs1-crumb-back" : "gs1-crumb-chevron"} viewBox="0 0 6.2 11" width="6.2" height="11" aria-hidden="true">
      <path d={back ? "M5.6 0.6l-5 4.9 5 4.9" : "M0.6 0.6l5 4.9-5 4.9"} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarcodeMini() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="#002c6c">
      <rect x="2" y="4" width="2" height="16" /><rect x="5.5" y="4" width="1" height="16" /><rect x="8" y="4" width="2.2" height="16" />
      <rect x="11.6" y="4" width="1" height="16" /><rect x="14" y="4" width="2" height="16" /><rect x="17.4" y="4" width="1" height="16" /><rect x="20" y="4" width="2" height="16" />
    </svg>
  );
}

function CapMini() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#002c6c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4 2 9l10 5 10-5-10-5z" /><path d="M6 11.5V17c0 1.3 2.7 3 6 3s6-1.7 6-3v-5.5" /><path d="M22 9v6" />
    </svg>
  );
}

function ProductIcon({ index }: { index: number }) {
  // A white barcode card on a blue disc, traced from the prospect page's 56px icons.
  const pattern: [number, number, string][] = [
    [0, 1.8, "#0d2b63"], [2.3, 0.9, "#8a9cc0"], [3.8, 1.6, "#0d2b63"], [6.1, 0.9, "#0d2b63"], [7.6, 1.2, "#8a9cc0"], [9.5, 1.7, "#0d2b63"],
    [11.9, 0.9, "#0d2b63"], [13.4, 0.9, "#8a9cc0"], [14.9, 1.8, "#0d2b63"], [17.4, 1, "#8a9cc0"], [19, 1.3, "#0d2b63"], [21.1, 0.9, "#0d2b63"],
    [22.7, 1.2, "#8a9cc0"], [24.6, 1.3, "#0d2b63"],
  ];
  const card = (x: number, y: number, w: number, h: number) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#fff" />
      {pattern.map(([bx, bw, color]) => (
        <rect key={bx} x={x + 3.3 + (bx * (w - 6.6)) / 25.9} y={y + 3.8} width={(bw * (w - 6.6)) / 25.9} height={h - 7.6} fill={color} />
      ))}
    </g>
  );
  return (
    <span className="gs1-product-icon" aria-hidden="true">
      <svg viewBox="0 0 56 56">
        {index === 2 ? (
          <>
            <ellipse cx="28.5" cy="42" rx="12.5" ry="4.5" fill="#5873a6" />
            <path d="M28.5 41C25.3 36.3 17.5 30 17.5 21.5A11 11 0 0 1 39.5 21.5C39.5 30 31.7 36.3 28.5 41Z" fill="#0b2a63" />
            <circle cx="28.5" cy="20.5" r="7.3" fill="#fff" />
          </>
        ) : index === 0 ? (
          <>
            {([[-6.7, 5.7], [-4.4, 3.8], [-2.1, 1.5]] as const).map(([dx, dy]) => (
              <rect key={dx} x={15.2 + dx} y={12.9 + dy} width="32.1" height="24.9" fill="#3b5e98" stroke="#fff" strokeWidth="0.7" />
            ))}
            {card(15.2, 12.9, 32.1, 24.9)}
          </>
        ) : card(10.8, 14.8, 34.9, 26.2)}
      </svg>
    </span>
  );
}

function SocialIcon({ kind }: { kind: "linkedin" | "x" | "facebook" | "youtube" }) {
  const glyph = {
    linkedin: <path d="M7.4 9.8h2v6.6h-2zM8.4 6.6a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3zM11.1 9.8h1.9v.9c.3-.5 1-1.1 2.1-1.1 2.1 0 2.5 1.4 2.5 3.2v3.6h-2v-3.2c0-.8 0-1.8-1.1-1.8s-1.3.9-1.3 1.7v3.3h-2.1z" fill="#fff" />,
    x: <path d="M7 6.8h3l2.4 3.4 2.9-3.4h1.3l-3.6 4.2 4 5.7h-3l-2.6-3.7-3.2 3.7H6.9l3.9-4.5z" fill="#fff" />,
    facebook: <path d="M13.1 19.5v-6.2h2.1l.3-2.4h-2.4V9.4c0-.7.2-1.2 1.2-1.2h1.3V6.1a17 17 0 0 0-1.9-.1c-1.9 0-3.2 1.2-3.2 3.3v1.7H8.4v2.4h2.1v6.2z" fill="#fff" />,
    youtube: <><rect x="5.5" y="7.6" width="13" height="8.8" rx="2.4" fill="#fff" /><path d="M10.6 9.8v4.4l3.8-2.2z" fill="#002c6c" /></>,
  }[kind];
  return <svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="12" fill="#002c6c" />{glyph}</svg>;
}

function WhyIcon({ index }: { index: number }) {
  // Traced from the prospect page's illustrations at 144px: navy outlines over a pale blue fill.
  const line = { stroke: "#1a3563", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const tint = "#dee6f4";
  const shapes = [
    <g key="globe">
      <circle cx="72" cy="70.5" r="69" fill="#fff" />
      <path d="M77.7 3.5C77.9 4.8 79.1 8.1 78.9 11.0C78.7 13.9 77.4 20.0 76.4 21.0C75.4 22.0 73.9 17.7 72.7 17.2C71.4 16.8 69.7 17.0 68.9 18.5C68.1 20.0 67.3 23.5 67.7 26.0C68.0 28.5 70.5 31.0 70.9 33.5C71.3 36.0 71.1 38.9 70.2 41.0C69.2 43.1 66.5 44.5 65.2 46.0C63.8 47.5 62.2 47.9 61.9 49.8C61.6 51.6 63.4 55.0 63.4 57.2C63.4 59.5 63.1 62.2 61.9 63.5C60.7 64.8 58.4 64.5 56.4 64.8C54.4 65.0 52.1 64.1 50.1 64.8C48.2 65.4 45.3 66.6 44.6 68.5C44.0 70.4 45.5 74.5 46.4 76.0C47.3 77.5 48.7 77.2 50.1 77.2C51.6 77.2 53.9 75.6 55.1 76.0C56.4 76.4 56.4 79.3 57.6 79.8C58.9 80.2 60.8 78.1 62.6 78.5C64.5 78.9 66.6 82.5 68.9 82.2C71.2 82.0 73.9 78.2 76.4 77.2C78.9 76.3 80.6 75.7 83.9 76.5C87.2 77.3 91.8 80.2 96.4 82.2C101.0 84.2 108.3 86.4 111.4 88.5C114.5 90.6 115.6 91.8 115.2 94.8C114.7 97.7 111.2 102.5 108.9 106.0C106.6 109.5 104.3 112.5 101.4 116.0C98.5 119.5 93.7 125.8 91.4 127.2C89.1 128.7 88.5 126.6 87.7 124.8C86.8 122.9 87.2 118.1 86.4 116.0C85.6 113.9 84.5 113.5 82.7 112.2C80.8 111.0 77.0 110.0 75.2 108.5C73.3 107.0 72.4 105.8 71.4 103.5C70.4 101.2 70.2 97.0 68.9 94.8C67.7 92.5 66.4 91.0 63.9 89.8C61.4 88.5 58.1 88.9 53.9 87.2C49.7 85.6 43.1 82.5 38.9 79.8C34.7 77.0 31.6 75.0 28.9 71.0C26.2 67.0 24.1 61.0 22.6 56.0C21.2 51.0 21.0 45.4 20.1 41.0C19.3 36.6 18.1 31.6 17.6 29.8A69 69 0 0 1 77.7 3.5Z" fill={tint} />
      <path d="M89.4 3.8C89.9 4.8 91.1 8.1 92.7 9.8C94.2 11.4 96.6 12.0 98.9 13.5C101.2 15.0 104.1 16.8 106.4 18.5C108.7 20.2 111.4 21.8 112.7 23.5C113.9 25.2 112.9 26.8 113.9 28.5C114.9 30.2 117.7 31.0 118.9 33.5C120.2 36.0 120.6 40.2 121.4 43.5C122.2 46.8 123.1 50.6 123.9 53.5C124.7 56.4 124.9 59.3 126.4 61.0C127.9 62.7 130.3 63.2 132.7 63.5C135.0 63.8 139.1 63.1 140.4 63.0A69 69 0 0 0 89.4 3.8Z" fill={tint} />
      <path d="M77.7 3.5C77.9 4.8 79.1 8.1 78.9 11.0C78.7 13.9 77.4 20.0 76.4 21.0C75.4 22.0 73.9 17.7 72.7 17.2C71.4 16.8 69.7 17.0 68.9 18.5C68.1 20.0 67.3 23.5 67.7 26.0C68.0 28.5 70.5 31.0 70.9 33.5C71.3 36.0 71.1 38.9 70.2 41.0C69.2 43.1 66.5 44.5 65.2 46.0C63.8 47.5 62.2 47.9 61.9 49.8C61.6 51.6 63.4 55.0 63.4 57.2C63.4 59.5 63.1 62.2 61.9 63.5C60.7 64.8 58.4 64.5 56.4 64.8C54.4 65.0 52.1 64.1 50.1 64.8C48.2 65.4 45.3 66.6 44.6 68.5C44.0 70.4 45.5 74.5 46.4 76.0C47.3 77.5 48.7 77.2 50.1 77.2C51.6 77.2 53.9 75.6 55.1 76.0C56.4 76.4 56.4 79.3 57.6 79.8C58.9 80.2 60.8 78.1 62.6 78.5C64.5 78.9 66.6 82.5 68.9 82.2C71.2 82.0 73.9 78.2 76.4 77.2C78.9 76.3 80.6 75.7 83.9 76.5C87.2 77.3 91.8 80.2 96.4 82.2C101.0 84.2 108.3 86.4 111.4 88.5C114.5 90.6 115.6 91.8 115.2 94.8C114.7 97.7 111.2 102.5 108.9 106.0C106.6 109.5 104.3 112.5 101.4 116.0C98.5 119.5 93.7 125.8 91.4 127.2C89.1 128.7 88.5 126.6 87.7 124.8C86.8 122.9 87.2 118.1 86.4 116.0C85.6 113.9 84.5 113.5 82.7 112.2C80.8 111.0 77.0 110.0 75.2 108.5C73.3 107.0 72.4 105.8 71.4 103.5C70.4 101.2 70.2 97.0 68.9 94.8C67.7 92.5 66.4 91.0 63.9 89.8C61.4 88.5 58.1 88.9 53.9 87.2C49.7 85.6 43.1 82.5 38.9 79.8C34.7 77.0 31.6 75.0 28.9 71.0C26.2 67.0 24.1 61.0 22.6 56.0C21.2 51.0 21.0 45.4 20.1 41.0C19.3 36.6 18.1 31.6 17.6 29.8" fill="none" {...line} />
      <path d="M89.4 3.8C89.9 4.8 91.1 8.1 92.7 9.8C94.2 11.4 96.6 12.0 98.9 13.5C101.2 15.0 104.1 16.8 106.4 18.5C108.7 20.2 111.4 21.8 112.7 23.5C113.9 25.2 112.9 26.8 113.9 28.5C114.9 30.2 117.7 31.0 118.9 33.5C120.2 36.0 120.6 40.2 121.4 43.5C122.2 46.8 123.1 50.6 123.9 53.5C124.7 56.4 124.9 59.3 126.4 61.0C127.9 62.7 130.3 63.2 132.7 63.5C135.0 63.8 139.1 63.1 140.4 63.0" fill="none" {...line} />
      <circle cx="72" cy="70.5" r="69" fill="none" {...line} />
    </g>,
    <g key="cart">
      <rect x="2.5" y="6.8" width="94" height="93.5" rx="11" fill="#fff" {...line} />
      <path d="M2.5 27.1H96.5" fill="none" {...line} />
      <path d="M15.2 42.5H21L26.2 48" fill="none" {...line} />
      <path d="M26.2 48H79.5L72.9 70H32.8Z" fill={tint} {...line} />
      <circle cx="42.6" cy="79.9" r="4.4" fill="#fff" {...line} />
      <circle cx="59.1" cy="79.9" r="4.4" fill="#fff" {...line} />
      <path d="M84.5 70L94.4 131.6L109.8 115.1L126.8 134.9L133.4 127.7L118.5 110.7L141.6 103Z" fill={tint} {...line} />
    </g>,
    <g key="support">
      <defs><clipPath id="gs1-why-support"><circle cx="56" cy="82" r="53" /></clipPath></defs>
      <circle cx="56" cy="82" r="53" fill="#fff" {...line} />
      <path d="M15.4 111.3Q55.5 78 96.7 111.3L96.7 140H15.4Z" fill={tint} clipPath="url(#gs1-why-support)" />
      <path d="M17 108Q55.5 80 95 108" fill="none" {...line} clipPath="url(#gs1-why-support)" />
      <circle cx="56" cy="82" r="53" fill="none" {...line} />
      <circle cx="54.5" cy="70" r="19.3" fill={tint} {...line} />
      <path d="M30 76A25 25 0 0 1 80 76" fill="none" {...line} />
      <rect x="23" y="66" width="7" height="13" rx="3.5" fill="#fff" {...line} />
      <rect x="80" y="66" width="7" height="13" rx="3.5" fill="#fff" {...line} />
      <path d="M84 79C84 87 79 91 72 91" fill="none" {...line} />
      <circle cx="71" cy="91" r="2.4" fill="#1a3563" />
      <path d="M91 6.8H133A8 8 0 0 1 141 14.8V40A8 8 0 0 1 133 48H104L88 57L94 48H91A8 8 0 0 1 83 40V14.8A8 8 0 0 1 91 6.8Z" fill={tint} {...line} />
    </g>,
    <g key="monitor">
      <rect x="6.7" y="29.9" width="112.8" height="83" rx="5.5" fill="#fff" {...line} />
      <path d="M6.7 94.8H119.5M54.5 112.9L50.7 131.6M76.5 112.9L80.3 131.6M39 131.6H87.5" fill="none" {...line} />
      <path d="M27 39.8H49L51.8 46H24.3Z" fill={tint} {...line} />
      <rect x="24.3" y="46" width="27.5" height="37.8" fill={tint} {...line} />
      <rect x="30.5" y="69" width="15" height="10" fill="#fff" {...line} strokeWidth={1.4} />
      <path d="M33 71.5v5M35.5 71.5v5M38 71.5v5M40.5 71.5v5M43 71.5v5" fill="none" stroke="#1a3563" strokeWidth="1" />
      <path d="M63 43.1H101.5M63 56.8H101.5M63 70.5H101.5" fill="none" stroke="#1a3563" strokeWidth="5" />
      <circle cx="115.1" cy="35.4" r="24.8" fill={tint} {...line} />
      <path d="M104.1 37L112.4 45.3L126.1 27.1" fill="none" stroke="#1a3563" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    <g key="chart">
      <rect x="14.1" y="118.4" width="16.5" height="16.5" fill={tint} {...line} />
      <rect x="40.5" y="98.6" width="14.8" height="36.3" fill={tint} {...line} />
      <rect x="64.7" y="79.4" width="16.5" height="55.5" fill={tint} {...line} />
      <rect x="91.1" y="55.2" width="15.9" height="79.7" fill={tint} {...line} />
      <rect x="116.4" y="35.9" width="17" height="99" fill={tint} {...line} />
      <path d="M9.6 94.8L119.6 7.9M108.6 8.4L119.6 7.9L118.5 17.8" fill="none" {...line} />
    </g>,
  ];
  return <svg className="gs1-why-icon" viewBox="0 0 144 144" aria-hidden="true">{shapes[index % shapes.length]}</svg>;
}
