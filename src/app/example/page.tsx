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

      <main id="main">
        <nav className="gs1-wrap gs1-crumb" aria-label="Breadcrumb">
          <ol>
            <li><a href="#main">Home</a><Chevron /></li>
            <li aria-current="page">{headline}</li>
          </ol>
        </nav>

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
              <h3>{text(estimator, "heading")}</h3>
              <a className="gs1-btn" href="#main">{text(estimator, "label")}</a>
            </div>
          </section>
        )}

        {overview && (
          <section className="gs1-overview">
            <div className="gs1-wrap gs1-overview-cols">
              <div>
                <h3 className="gs1-h3">{text(overview, "heading")}</h3>
                <RichText document={overview.fields.body} className="gs1-steps" />
              </div>
              <div className="gs1-video" role="img" aria-label="Video: How do I get a barcode?">
                <span className="gs1-video-title" aria-hidden="true">How do I get a barcode?</span>
                <span className="gs1-video-play" aria-hidden="true" />
              </div>
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

        <hr className="gs1-rule" />

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
            <div className="gs1-pricing-card">
              <h2 id="gs1-pricing-title" className="gs1-pricing-title">{text(pricing, "heading")}</h2>
              <div className="gs1-table-scroll" role="region" aria-labelledby="gs1-pricing-title" tabIndex={0}>
                <RichText document={pricing.fields.body} />
              </div>
            </div>
          </section>
        )}

        {help && (
          <section className="gs1-help">
            <div className="gs1-wrap">
              <h2>{text(help, "heading")}</h2>
              <p>{text(help, "body")}</p>
              <a className="gs1-btn" href="#main">
                {text(help, "label")}
                <svg viewBox="0 0 13 11" width="13" height="11" aria-hidden="true"><path d="M1 5.5h10.5M7 1l4.5 4.5L7 10" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              </a>
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
    <div className="gs1-table-scroll gs1-compare-scroll" role="region" aria-label={text(entry, "heading") ?? "Compare barcode options"} tabIndex={0}>
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
              {products.map((product) => (
                <td key={product.id}>
                  {value(product, row)
                    ? <svg className="gs1-yes" viewBox="0 0 21 21" role="img" aria-label="Included"><path d="M2.5 11.2l5.3 5.3L18.8 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <svg className="gs1-no" viewBox="0 0 21 21" role="img" aria-label="Not included"><path d="M2.5 10.5h16" fill="none" stroke="currentColor" strokeWidth="3" /></svg>}
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
  );
}

// ---------- Chrome: fixed labels, not content ----------

function Promo() {
  return (
    <div className="gs1-promo">
      <div className="gs1-promo-left" aria-hidden="true">
        <span className="gs1-promo-lockup">Prefix +<em>Free</em><em>Course</em></span>
      </div>
      <div className="gs1-promo-stack" aria-hidden="true">
        <span className="gs1-promo-tile"><BarcodeMini /><i>GS1<br />Company<br />Prefix</i></span>
        <span className="gs1-promo-plus">+</span>
        <span className="gs1-promo-tile"><CapMini /><i>Assign<br />GTINs<br />Course</i></span>
      </div>
      <div className="gs1-promo-price" aria-hidden="true">
        <s>$79</s><b>Free</b><i>Course</i>
      </div>
      <p className="gs1-promo-copy">
        <strong>Join other confident brand owners!</strong>
        Master barcode basics today - course included free with every GS1 Company Prefix.
      </p>
      <div className="gs1-promo-actions">
        <a className="gs1-promo-cta" href="#main">Get Prefix</a>
        <a className="gs1-promo-offer" href="#main">
          <span>Offer details</span>
          <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="5" fill="rgba(255,255,255,0.35)" /><path d="M5 2.6v4.8M2.6 5h4.8" stroke="#fff" strokeWidth="1.2" /></svg>
        </a>
      </div>
      <span className="gs1-promo-close" aria-hidden="true">×</span>
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
        <div className="gs1-header-right">
          <ul className="gs1-toplinks">
            <li className="gs1-tagline">The Global Language of Business</li>
            <li><a href="#main">Pay My Bill</a></li>
            <li><a href="#main">GS1 US Store</a></li>
            <li><a href="#main">GS1 Connect Conference</a></li>
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
          <li><a href="#main">GS1 Connect Conference</a></li>
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
                <li key={label}><a href="#main">{label}</a></li>
              ))}
            </ul>
            <p className="gs1-copy">© 2026 GS1 US. All Rights Reserved</p>
            <p className="gs1-legal">
              GS1 US<sup>®</sup> and design is a registered trademark of GS1 US, Inc. Trademarks appearing on this site are owned by GS1 US, Inc. unless otherwise noted, and may not be used without the permission of <a href="#main">GS1 US, Inc</a>.
              {" "}Demo mockup for illustration only; prices and links are placeholders.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Icons ----------

function Chevron() {
  return <svg className="gs1-crumb-chevron" viewBox="0 0 7 11" width="7" height="11" aria-hidden="true"><path d="M1 1l4.5 4.5L1 10" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>;
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
  const card = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="26" height="20" rx="2" fill="#fff" stroke="#1d4b8f" strokeWidth="1.4" />
      <path d={`M${x + 4} ${y + 4}v12M${x + 7} ${y + 4}v12M${x + 9.5} ${y + 4}v12M${x + 13} ${y + 4}v12M${x + 15.5} ${y + 4}v12M${x + 18.5} ${y + 4}v12M${x + 21.5} ${y + 4}v12`} stroke="#1d4b8f" strokeWidth="1.5" />
    </g>
  );
  return (
    <span className="gs1-product-icon" aria-hidden="true">
      <svg viewBox="0 0 56 56">
        {index === 2 ? (
          <>
            <ellipse cx="28" cy="41" rx="9" ry="3.2" fill="#1d4b8f" opacity="0.35" />
            <path d="M28 12c-5.5 0-9.5 4.1-9.5 9.4 0 6.9 9.5 18.6 9.5 18.6s9.5-11.7 9.5-18.6c0-5.3-4-9.4-9.5-9.4z" fill="#0f3a7d" />
            <circle cx="28" cy="21.5" r="3.8" fill="#fff" />
          </>
        ) : index === 0 ? [card(17, 14), card(13, 18), card(9, 22)] : card(15, 18)}
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
  const line = { stroke: "#1b3d6e", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const tint = "#dce6f5";
  const shapes = [
    <g key="globe">
      <circle cx="72" cy="72" r="68" fill="#fff" {...line} />
      <path d="M50 14c-6 8-16 10-18 20-2 9 8 14 4 22-3 6-12 6-12 14 0 8 10 10 16 6 7-4 12 2 14 8 2 7-4 14 0 22 4 7 12 8 14 16l2 12c8-6 16-14 18-24 2-9-6-14-4-22s10-10 10-18c0-7-8-8-14-6-7 2-10-4-8-10s8-8 6-14c-2-7-12-12-28-26z" fill={tint} {...line} />
      <path d="M96 22c8 4 18 14 22 24-6 2-12-2-14-8s-10-8-8-16z" fill={tint} {...line} />
    </g>,
    <g key="cart">
      <rect x="6" y="10" width="104" height="84" rx="10" fill={tint} {...line} />
      <path d="M6 30h104" fill="none" {...line} />
      <rect x="18" y="40" width="80" height="44" fill="#fff" stroke="none" />
      <path d="M26 46h8l6 22h34l6-16H38" fill="none" {...line} />
      <circle cx="46" cy="76" r="4" fill="none" {...line} /><circle cx="68" cy="76" r="4" fill="none" {...line} />
      <path d="M84 70l10 62 12-20 14 18 10-8-14-18 22-6z" fill={tint} {...line} />
    </g>,
    <g key="support">
      <circle cx="56" cy="86" r="52" fill="#fff" {...line} />
      <circle cx="56" cy="76" r="18" fill={tint} {...line} />
      <path d="M24 126c6-18 18-26 32-26s26 8 32 26" fill={tint} {...line} />
      <path d="M34 78c0-14 10-24 22-24s22 10 22 24" fill="none" {...line} />
      <rect x="28" y="74" width="8" height="14" rx="3" fill="#fff" {...line} />
      <rect x="76" y="74" width="8" height="14" rx="3" fill="#fff" {...line} />
      <path d="M80 88c0 8-6 12-14 12" fill="none" {...line} />
      <path d="M88 8h44a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8h-30l-12 10v-10h-2a8 8 0 0 1-8-8V16a8 8 0 0 1 8-8z" fill={tint} {...line} />
    </g>,
    <g key="monitor">
      <rect x="6" y="28" width="116" height="80" rx="4" fill="#fff" {...line} />
      <path d="M6 96h116M52 108l-4 20h32l-4-20M40 130h48" fill="none" {...line} />
      <rect x="22" y="46" width="22" height="40" rx="2" fill={tint} {...line} />
      <path d="M22 58h22M28 70h10M28 76h10" fill="none" {...line} />
      <path d="M56 56h40M56 68h40M56 80h40" stroke="#1b3d6e" strokeWidth="6" />
      <circle cx="114" cy="28" r="22" fill={tint} {...line} />
      <path d="M103 28l8 8 14-15" stroke="#1b3d6e" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    <g key="chart">
      <rect x="10" y="112" width="14" height="18" fill={tint} {...line} />
      <rect x="36" y="94" width="14" height="36" fill={tint} {...line} />
      <rect x="62" y="74" width="14" height="56" fill={tint} {...line} />
      <rect x="88" y="52" width="14" height="78" fill={tint} {...line} />
      <rect x="114" y="32" width="14" height="98" fill={tint} {...line} />
      <path d="M10 88L118 8M104 8h14v14" fill="none" {...line} />
    </g>,
  ];
  return <svg className="gs1-why-icon" viewBox="0 0 144 144" aria-hidden="true">{shapes[index % shapes.length]}</svg>;
}
