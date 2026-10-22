import type { Metadata } from "next";
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

  return (
    <div className="gs1">
      {preview && <DraftBanner />}
      <Promo />
      <Header />
      <nav className="gs1-crumb" aria-label="Breadcrumb">
        <div className="gs1-wrap">
          <ol>
            <li><a href="#main">Home</a></li>
            <li aria-current="page">{headline}</li>
          </ol>
        </div>
      </nav>

      <main id="main">
        <section className="gs1-hero">
          <div className="gs1-wrap"><h1>{headline}</h1></div>
        </section>

        <section className="gs1-wrap gs1-intro">
          {intro && <h2 className="gs1-h2">{text(intro, "heading")}</h2>}
          <RichText document={intro?.fields.body} className="gs1-lead" />
          <Compare g={g} entry={compare} />
        </section>

        {estimator && (
          <section className="gs1-band" aria-label={text(estimator, "heading")}>
            <div className="gs1-wrap gs1-band-row">
              <p>{text(estimator, "heading")}</p>
              <a className="gs1-btn" href="#main">{text(estimator, "label")}</a>
            </div>
          </section>
        )}

        {overview && (
          <section className="gs1-overview">
            <div className="gs1-wrap">
              <h2 className="gs1-h2">{text(overview, "heading")}</h2>
              <RichText document={overview.fields.body} className="gs1-steps" />
            </div>
          </section>
        )}

        {why && (
          <section className="gs1-wrap gs1-why">
            <div className="gs1-why-head">
              <h2 className="gs1-h2">{text(why, "heading")}</h2>
              <a className="gs1-btn gs1-btn-outline" href="#main">Learn More</a>
            </div>
            <p className="gs1-lead">{text(why, "intro")}</p>
            <ul className="gs1-why-icons">
              {g.entries(why.fields.items).map((item, index) => (
                <li key={item.id}>
                  <WhyIcon index={index} />
                  <span>{text(item, "title")}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {howTo && (
          <section className="gs1-wrap gs1-howto">
            <h2 className="gs1-h2">{text(howTo, "heading")}</h2>
            <ul>
              {g.entries(howTo.fields.items).map((item) => (
                <li key={item.id}>
                  <a href="#main" className="gs1-card">
                    <Img asset={g.asset(item.fields.image)} sizes="(min-width: 900px) 33vw, 100vw" />
                    <span className="gs1-card-body">
                      <strong>{text(item, "title")}</strong>
                      <span>{text(item, "text")}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pricing && (
          <section className="gs1-wrap gs1-pricing" aria-labelledby="gs1-pricing-title">
            <h2 id="gs1-pricing-title" className="gs1-pricing-title">{text(pricing, "heading")}</h2>
            <div className="gs1-table-scroll" role="region" aria-labelledby="gs1-pricing-title" tabIndex={0}>
              <RichText document={pricing.fields.body} />
            </div>
          </section>
        )}

        {help && (
          <section className="gs1-help">
            <div className="gs1-wrap">
              <h2>{text(help, "heading")}</h2>
              <p>{text(help, "body")}</p>
              <a className="gs1-btn" href="#main">{text(help, "label")} <span aria-hidden="true">→</span></a>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
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
    <div className="gs1-table-scroll" role="region" aria-label={text(entry, "heading") ?? "Compare barcode options"} tabIndex={0}>
      <table className="gs1-compare">
        <thead>
          <tr>
            <td aria-hidden="true" />
            {products.map((product, index) => (
              <th key={product.id} scope="col" className={index === 0 ? "is-featured" : undefined}>
                <ProductIcon index={index} />
                <span className="gs1-product-name">{text(product, "name")}</span>
                <span className="gs1-product-price">{text(product, "priceLabel")}</span>
                <a className="gs1-btn gs1-btn-block" href="#main">{list(product, "features")[0] ?? "Get started"}</a>
                {text(product, "finePrint") && <span className="gs1-fine">{text(product, "finePrint")}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <th scope="row">{row}</th>
              {products.map((product, index) => (
                <td key={product.id} className={index === 0 ? "is-featured" : undefined}>
                  {value(product, row)
                    ? <svg className="gs1-yes" viewBox="0 0 24 24" role="img" aria-label="Included"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <svg className="gs1-no" viewBox="0 0 24 24" role="img" aria-label="Not included"><path d="M6 12h12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>}
                </td>
              ))}
            </tr>
          ))}
          <tr className="gs1-learn">
            <td aria-hidden="true" />
            {products.map((product, index) => <td key={product.id} className={index === 0 ? "is-featured" : undefined}><a href="#main">Learn More</a></td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ---------- Chrome: fixed labels, not content ----------

function Promo() {
  return (
    <div className="gs1-promo">
      <div className="gs1-promo-left" aria-hidden="true">
        <span className="gs1-promo-title">PREFIX +<br /><b>FREE</b><br />COURSE</span>
        <span className="gs1-promo-tile"><BarcodeMini /><i>GS1 Company Prefix</i></span>
        <span className="gs1-promo-plus">+</span>
        <span className="gs1-promo-tile"><CapMini /><i>Assign GTINs Course</i></span>
      </div>
      <div className="gs1-promo-mid">
        <span className="gs1-promo-price" aria-hidden="true"><s>$79</s><b>FREE</b><i>COURSE</i></span>
        <p><strong>Join other confident brand owners!</strong><span>Master barcode basics today. The course is included free with every GS1 Company Prefix.</span></p>
      </div>
      <div className="gs1-promo-right">
        <a className="gs1-btn gs1-btn-small" href="#main">Get Prefix</a>
        <a className="gs1-promo-offer" href="#main">Offer details</a>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="gs1-header">
      <div className="gs1-wrap gs1-header-top">
        <a className="gs1-logo" href="#main" aria-label="GS1 US home">
          <span className="gs1-logo-mark" aria-hidden="true"><b>GS1</b><i>US</i></span>
        </a>
        <div className="gs1-header-right">
          <ul className="gs1-toplinks">
            <li className="gs1-tagline">The Global Language of Business</li>
            <li><a href="#main">Pay My Bill</a></li>
            <li><a href="#main">GS1 US Store</a></li>
            <li><a href="#main">GS1 Connect Conference</a></li>
            <li><a href="#main">Small Business</a></li>
          </ul>
          <div className="gs1-header-actions">
            <svg className="gs1-search" viewBox="0 0 20 20" role="img" aria-label="Search"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12.5 12.5L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <a className="gs1-btn gs1-btn-outline gs1-btn-small" href="#main">Get a Barcode <span aria-hidden="true">▾</span></a>
            <a className="gs1-btn gs1-btn-ghost gs1-btn-small" href="#main">Login</a>
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
          <li><a href="#main">GS1 Connect Conference</a></li>
          <li><a href="#main">Careers</a></li>
          <li><a href="#main">Contact Us</a></li>
        </ul>
        <ul className="gs1-footer-links">
          {["Terms of Use", "Privacy", "Antitrust Policy", "IP Policy", "GS1 Global", "GS1 Connect", "Sitemap", "Cookie Preferences"].map((label) => (
            <li key={label}><a href="#main">{label}</a></li>
          ))}
        </ul>
        <ul className="gs1-social" aria-hidden="true">
          {["in", "X", "f", "▶"].map((mark) => <li key={mark}>{mark}</li>)}
        </ul>
        <p className="gs1-copy">© 2026 GS1 US. All Rights Reserved</p>
        <p className="gs1-legal">GS1 US and its design are registered trademarks of GS1 US, Inc. Trademarks appearing on this site are owned by GS1 US, Inc. unless otherwise noted.</p>
        <p className="gs1-mockup-note">Demo mockup for illustration only. Not an official page; prices, links, and contact details are placeholders.</p>
      </div>
    </footer>
  );
}

// ---------- Icons ----------

function BarcodeMini() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5v14M6 5v14M9 5v14M13 5v14M16 5v14M19 5v14M21 5v14" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>;
}

function CapMini() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>;
}

function ProductIcon({ index }: { index: number }) {
  return (
    <span className="gs1-product-icon" aria-hidden="true">
      {index === 2 ? (
        <svg viewBox="0 0 40 40"><path d="M20 6c-6 0-10 4.4-10 10 0 7.5 10 18 10 18s10-10.5 10-18c0-5.600-4-10-10-10z" fill="#1d4b8f" /><circle cx="20" cy="16" r="4.2" fill="#fff" /></svg>
      ) : (
        <svg viewBox="0 0 40 40" fill="#1d4b8f"><rect x="8" y="10" width="2" height="20" /><rect x="12" y="10" width="1" height="20" /><rect x="15" y="10" width="3" height="20" /><rect x="20" y="10" width="1" height="20" /><rect x="23" y="10" width="2" height="20" /><rect x="27" y="10" width="1" height="20" /><rect x="30" y="10" width="2" height="20" /></svg>
      )}
    </span>
  );
}

function WhyIcon({ index }: { index: number }) {
  const common = { fill: "none", stroke: "#1d4b8f", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const shapes = [
    <g key="globe" {...common}><circle cx="40" cy="40" r="28" fill="#dbe7f5" /><path d="M12 40h56M40 12c10 8 10 48 0 56M40 12c-10 8-10 48 0 56M18 26c14 6 30 6 44 0M18 54c14-6 30-6 44 0" /></g>,
    <g key="cart" {...common}><rect x="14" y="16" width="52" height="40" rx="3" fill="#dbe7f5" /><path d="M20 24h6l4 18h24l4-14H28" /><circle cx="34" cy="48" r="2.5" fill="#1d4b8f" /><circle cx="50" cy="48" r="2.5" fill="#1d4b8f" /><path d="M54 52l8 14 3-6 6-2z" fill="#fff" /></g>,
    <g key="support" {...common}><circle cx="36" cy="42" r="20" fill="#dbe7f5" /><circle cx="36" cy="38" r="7" /><path d="M24 58c2-8 8-11 12-11s10 3 12 11M20 40a16 16 0 0 1 32 0" /><rect x="46" y="14" width="24" height="16" rx="4" fill="#fff" /><path d="M52 22h12" /></g>,
    <g key="monitor" {...common}><rect x="12" y="14" width="56" height="38" rx="3" fill="#dbe7f5" /><path d="M32 60h16M40 52v8M24 24h20M24 32h14" /><circle cx="56" cy="40" r="9" fill="#fff" /><path d="M52 40l3 3 6-6" /></g>,
    <g key="chart" {...common}><path d="M14 66h56" /><rect x="18" y="48" width="8" height="18" fill="#dbe7f5" /><rect x="32" y="38" width="8" height="28" fill="#dbe7f5" /><rect x="46" y="28" width="8" height="38" fill="#dbe7f5" /><rect x="60" y="18" width="8" height="48" fill="#dbe7f5" /><path d="M16 38l16-12 14 6 22-20M60 12h8v8" /></g>,
  ];
  return <svg className="gs1-why-icon" viewBox="0 0 80 80" aria-hidden="true">{shapes[index % shapes.length]}</svg>;
}
