import type { Block, Document, Inline, Text } from "@contentful/rich-text-types";
import type { Metadata } from "next";
import { DraftBanner } from "@/components/site/chrome";
import { Img } from "@/components/site/primitives";
import { EXAMPLE_BRAND_SLUG } from "@/lib/site/contentful";
import { text, type BrandGraph } from "@/lib/site/graph";
import { heroDesign, heroDesignCss, quoteLabel, type HeroDesign } from "@/lib/site/hero-design";
import { isPreview, loadBrandIn, nonce, previewRequested } from "@/lib/site/load";
import type { SiteEntry } from "@/lib/site/types";

export const metadata: Metadata = {
  title: "Sunrooms, Three Season Rooms, Solariums, Screen Rooms | Patio Enclosures",
  robots: { index: false, follow: false },
};

const SITE = "https://www.patioenclosures.com";
const PHONE = "800-230-8301";
/** The corporate line in the footer. The brand entry's phone field must hold a fictional number, so it lives here. */
const FOOTER_PHONE = "888-468-0700";
/** Optimizely Web Experimentation snippet for the demo project. src/proxy.ts allows it on /example only. */
const OPTIMIZELY_SNIPPET = "https://cdn.optimizely.com/js/6231585842790400.js";

/**
 * The Example page: a sandbox for recreating a prospect's page during a demo. Its copy lives in the
 * Example brand (seed/brands/example.ts) so Opal can edit it; this file only draws the layout. With no
 * Example content in Contentful, the page stays blank.
 *
 * It currently recreates a sunroom company's home page. Elements an experiment is likely to change carry
 * stable IDs: #hero-banner, #hero-headline, #hero-subhead, #hero-cta (the sticky bar's Schedule Now button),
 * #sticky-cta-bar, #offers-cta, #phone-cta, #zip-locator, #product-grid, #product-<name> for each card,
 * #get-started, #our-products and #chat-button. The Quote-first hero design (a draft hero's designLayout field)
 * adds #hero-subheadline, #hero-proof-points and #hero-quote-cta.
 *
 * ?preview=true shows drafts (for Contentful Live Preview); see previewRequested in src/lib/site/load.ts.
 */
export default async function ExamplePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [preview, draftCookie, scriptNonce] = await Promise.all([previewRequested(searchParams), isPreview(), nonce()]);
  const g = await loadBrandIn(EXAMPLE_BRAND_SLUG, preview);
  const page = g?.homePage;
  if (!g || !page) {
    return (
      <main id="main" className="example-page">
        <h1 className="sr-only">Patio Enclosures</h1>
      </main>
    );
  }
  const hero = g.entry(page.fields.hero);
  const sections = g.entries(page.fields.sections);
  const schedule = g.entry(hero?.fields.cta);

  return (
    <div className="pe">
      {/* Loaded synchronously and first, as Optimizely recommends, so variations apply before the page paints. */}
      <script src={OPTIMIZELY_SNIPPET} nonce={scriptNonce} />
      {draftCookie && <DraftBanner />}
      <Header offers={g.entry(page.fields.primaryCta)} />
      <main id="main">
        <Hero g={g} hero={hero} styleNonce={scriptNonce} />
        {sections.map((entry) => <Section key={entry.id} g={g} entry={entry} />)}
      </main>
      <Footer g={g} />
      <StickyBar cta={schedule} />
    </div>
  );
}

// ---------- Header ----------

const UTILITY: { label: string; links: [string, string][] }[] = [
  { label: "Photo Gallery", links: [["View All Photo Galleries", "/photo-gallery.aspx"], ["Three Season Room Photos", "/three-season-rooms-pictures.aspx"], ["Four Season Room Photos", "/four-season-rooms-pictures.aspx"], ["Screen Room Photos", "/screen-room-pictures.aspx"], ["Patio & Porch Conversion Photos", "/patio-and-porch-conversions-before-and-after.aspx"], ["Porch Enclosure Photos", "/porch-enclosure-pictures.aspx"], ["Interior Sunroom Photos", "/interior-sunroom-pictures.aspx"], ["Exterior Sunroom Photos", "/exterior-sunroom-pictures.aspx"], ["Before & After Sunroom Photos", "/home-additions-before-and-after.aspx"], ["Our Favorite Sunroom Photos", "/our-favorite-sunroom-photos.aspx"], ["Porch & Patio Cover Photos", "/porch-patio-covers-pictures.aspx"]] },
  { label: "Get Inspired", links: [["Photo Gallery", "/photo-gallery.aspx"], ["Video Gallery", "/sunroom-video-gallery.aspx"], ["Customer Sunroom Additions", "/customer-sunroom-additions.aspx"], ["Create Your Perfect Room", "/creating-the-perfect-sunroom.aspx"], ["Sunroom Catalog", "/sunroom-catalog.aspx"], ["Sunroom Design Tips Blog", "/sunroom-design-tips-blog.aspx"], ["E-newsletter Signup", "/enewsletter-signup.aspx"]] },
  { label: "Plan Your Sunroom", links: [["Our Sunroom Collection", "/sunrooms.aspx"], ["Sunroom Types & Options", "/sunroom-types-options.aspx"], ["Sunroom Comparison Chart", "/sunroom-comparison-chart.aspx"], ["Sunroom Visualizer", "/patio-enclosures-sunroom-designer.aspx"], ["Sunroom Buying Resource Center", "/sunroom-buying-resource-center.aspx"], ["Sunroom Planning Tips", "/planning-sunroom-addition.aspx"], ["Specials & Financing", "/special-offers-and-financing.aspx"], ["Frequently Asked Questions", "/sunroom-frequently-asked-questions.aspx"], ["What to Expect: Our Process", "/patio-enclosures-process.aspx"], ["Sunroom Construction Guide", "/sunroom-construction-guide.aspx"], ["Glossary & Terms", "/sunroom-glossary-terms.aspx"]] },
  { label: "Why Choose Us", links: [["Customer Reviews", "/satisfied-customers.aspx"], ["What Makes Us Different", "/patio-enclosures-difference.aspx"], ["What's New", "/whats-new.aspx"], ["Specials & Financing", "/special-offers-and-financing.aspx"], ["Certifications & Associations", "/certifications-associations.aspx"], ["Our Story", "/about-patio-enclosures.aspx"], ["About Great Day Improvements", "/about-great-day-improvements.aspx"]] },
  { label: "Specials & Financing", links: [] },
  { label: "Support", links: [["Schedule In-Home Estimate", "/schedule-design-consultation.aspx"], ["Find Your Location", "/design-center-locator.aspx"], ["Request A Catalog", "/sunroom-catalog.aspx"], ["General Contact Form", "/general-contact-form.aspx"], ["Request Service Form", "/customer-service-form.aspx"], ["Order Replacement Parts", "/sunroom-replacement-parts.aspx"], ["Project Financing", "/special-offers-and-financing.aspx"], ["Submit A Review", "/submit-a-review.aspx"], ["Refer A Friend", "/refer-a-friend.aspx"], ["Careers", "/patio-enclosures-careers.aspx"]] },
];

const MAIN_NAV: [string, string][] = [
  ["Sunrooms", "/sunrooms.aspx"], ["Three Season Rooms", "/three-season-rooms.aspx"], ["Four Season Rooms", "/four-season-rooms.aspx"],
  ["Screen Rooms", "/screen-rooms.aspx"], ["Enclosed Porches", "/porch-enclosures.aspx"], ["Porch & Patio Covers", "/porch-patio-covers.aspx"],
  ["Windows & Doors", "/replacement-windows-doors.aspx"],
];

function Header({ offers }: { offers?: SiteEntry }) {
  const offersLabel = (text(offers, "label") ?? "View Offers").split(/\s+/);
  return (
    <header className="pe-header" id="pe-header">
      <div className="pe-header-top pe-wrap">
        <a className="pe-mobile-call" href={`tel:${PHONE.replace(/\D/g, "")}`}>
          <span className="pe-round"><PhoneIcon /></span>
          <small>In-Home Estimates<br />Call Today</small>
        </a>
        <a className="pe-logo" href={SITE} aria-label="Patio Enclosures home">
          <img src="/example/pe-logo.png" alt="Patio Enclosures" width={170} height={96} />
        </a>
        <div className="pe-contact">
          <p className="pe-hours"><strong>Reps available:</strong> Mon-Thurs 8:00am-9:30pm<br />Fri 8:00am-8:00pm &nbsp;|&nbsp; Sat-Sun 8:30am-5:30pm EST</p>
          <a id="phone-cta" className="pe-phone" href={`tel:${PHONE.replace(/\D/g, "")}`}>{PHONE}</a>
        </div>
        <a id="offers-cta" className="pe-offers" href={safeUrl(text(offers, "destinationUrl"), "/special-offers-and-financing.aspx")}>
          <ScissorsIcon />
          <span><span>{offersLabel[0]} <ChevronRight /></span><span>{offersLabel.slice(1).join(" ")}</span></span>
        </a>
        <Locator className="pe-locator-desktop" />
        <details className="pe-menu">
          <summary aria-label="Menu"><span className="pe-round"><MenuIcon /></span><small>MENU</small></summary>
          <nav className="pe-menu-panel" aria-label="Menu">
            {MAIN_NAV.map(([label, path]) => <a key={label} href={`${SITE}${path}`}>{label}</a>)}
            {UTILITY.map((group) => <a key={group.label} className="pe-menu-minor" href={`${SITE}${group.links[0]?.[1] ?? "/special-offers-and-financing.aspx"}`}>{group.label}</a>)}
          </nav>
        </details>
      </div>
      <nav className="pe-utility" aria-label="Site sections">
        <ul>
          {UTILITY.map((group) => (
            <li key={group.label}>
              <a href={`${SITE}${group.links[0]?.[1] ?? "/special-offers-and-financing.aspx"}`}>{group.label}{group.links.length > 0 && <ChevronDown />}</a>
              {group.links.length > 0 && (
                <div className="pe-dropdown">
                  <a className="pe-dropdown-cta" href={`${SITE}/schedule-design-consultation.aspx`}><strong>Free Design Consultation</strong><span>Schedule your in-home estimate <ChevronRight /></span></a>
                  <ul>{group.links.map(([label, path]) => <li key={label}><a href={`${SITE}${path}`}>{label}</a></li>)}</ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <nav className="pe-mainnav" aria-label="Products">
        <ul>{MAIN_NAV.map(([label, path]) => <li key={label}><a href={`${SITE}${path}`}>{label}</a></li>)}</ul>
      </nav>
      <div className="pe-locator-bar"><Locator /></div>
    </header>
  );
}

function Locator({ className }: { className?: string }) {
  return (
    <form id={className ? "zip-locator" : undefined} className={`pe-locator ${className ?? ""}`} method="get" role="search">
      {/* The site's CSP keeps form posts on this site, so the demo locator submits back to this page. */}
      <label htmlFor={className ? "pe-zip" : "pe-zip-mobile"}>Find Your Location</label>
      <span className="pe-locator-field">
        <input id={className ? "pe-zip" : "pe-zip-mobile"} name="zip" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} placeholder="5-Digit Zip Code" autoComplete="postal-code" />
        <button type="submit" aria-label="Find locations"><ChevronRight /></button>
      </span>
    </form>
  );
}

// ---------- Hero ----------

function Hero({ g, hero, styleNonce }: { g: BrandGraph; hero?: SiteEntry; styleNonce?: string }) {
  const design = heroDesign(hero);
  if (design.layout === "quote-first") return <QuoteFirstHero g={g} hero={hero} design={design} styleNonce={styleNonce} />;
  return (
    <>
      <section id="hero-banner" className="pe-hero">
        <div className="pe-hero-media">
          <Img asset={g.asset(hero?.fields.image)} sizes="100vw" priority />
          <AnniversaryBadge topRight={design.badge === "top-right"} />
        </div>
        <div className="pe-hero-band">
          <h1 id="hero-headline">{text(hero, "headline")}</h1>
          <a className="pe-scroll" href="#hero-scroll" aria-label="Scroll to the sunroom collection"><ChevronDown /></a>
        </div>
      </section>
    </>
  );
}

/**
 * The Quote-first hero (the hero's designLayout field): a full-width photo with a color gradient on the left,
 * left-aligned headline, subheadline, proof points with check marks, one large quote button, and the seal in
 * the top-right corner. No title band; the intro paragraph follows directly.
 */
function QuoteFirstHero({ g, hero, design, styleNonce }: { g: BrandGraph; hero?: SiteEntry; design: HeroDesign; styleNonce?: string }) {
  const cta = g.entry(hero?.fields.cta);
  const css = heroDesignCss("#hero-banner", design);
  return (
    <section id="hero-banner" className="pe-qf">
      {css && <style nonce={styleNonce}>{css}</style>}
      <div className="pe-qf-media" aria-hidden="true"><Img asset={g.asset(hero?.fields.image)} sizes="100vw" priority decorative /></div>
      <div className="pe-qf-inner">
        <div className="pe-qf-copy">
          <h1 id="hero-headline">{text(hero, "headline")}</h1>
          {text(hero, "subheadline") && <p id="hero-subheadline" className="pe-qf-sub">{text(hero, "subheadline")}</p>}
          {design.proofPoints.length > 0 && (
            <ul id="hero-proof-points" className="pe-qf-proof">
              {design.proofPoints.map((point) => <li key={point}><CheckMark />{point}</li>)}
            </ul>
          )}
          {cta && <a id="hero-quote-cta" className="pe-qf-btn" href={safeUrl(text(cta, "destinationUrl"), "/schedule-design-consultation.aspx")}>{quoteLabel(text(cta, "label"), "Get a Free Quote")}</a>}
        </div>
      </div>
      <AnniversaryBadge topRight={design.badge === "top-right"} />
    </section>
  );
}

function CheckMark() {
  return <svg className="pe-qf-check" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M3.5 10.5l4.2 4.2L16.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** The anniversary seal over the hero photo, drawn here rather than baked into the photo. */
function AnniversaryBadge({ topRight = false }: { topRight?: boolean }) {
  return (
    <svg className={topRight ? "pe-badge pe-badge-tr" : "pe-badge"} viewBox="0 0 240 240" aria-hidden="true">
      <defs>
        <path id="pe-badge-arc" d="M48 112a72 72 0 0 1 144 0" />
        <linearGradient id="pe-gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f6e3a1" /><stop offset=".5" stopColor="#c99a2e" /><stop offset="1" stopColor="#8a6514" /></linearGradient>
      </defs>
      <circle cx="120" cy="120" r="118" fill="#00a7b7" />
      <circle cx="120" cy="120" r="118" fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="2" />
      <text fontFamily="Georgia, serif" fontStyle="italic" fontSize="27" fill="#fff"><textPath href="#pe-badge-arc" startOffset="50%" textAnchor="middle">Celebrating</textPath></text>
      <text x="120" y="122" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="74" fill="#fff" stroke="#0b6f78" strokeWidth="1.5">60</text>
      <path d="M14 108l22 4 168 0 22-4-8 18 8 18-22-4H36l-22 4 8-18z" fill="url(#pe-gold)" />
      <text x="120" y="139" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="30" letterSpacing="3" fill="#fff" stroke="#6b4c0c" strokeWidth=".8">YEARS</text>
      <path d="M78 196v-30l42-22 42 22v30" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="160" cy="160" r="9" fill="#fa9d1c" />
      <text x="120" y="183" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="20" fill="#fff">PATIO</text>
      <text x="120" y="199" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11.5" fill="#fff">ENCLOSURES</text>
    </svg>
  );
}

// ---------- Sections ----------

function Section({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  switch (entry.id) {
    case "ex-rt-intro": return <Intro entry={entry} />;
    case "ex-cg-products": return <Products g={g} entry={entry} />;
    case "ex-rt-get-started": return <GetStarted entry={entry} />;
    case "ex-rt-our-products": return <OurProducts entry={entry} />;
  }
  return null;
}

/** The paragraph under the hero, which the scroll button jumps to. */
function Intro({ entry }: { entry: SiteEntry }) {
  const paragraph = blocksOf(entry.fields.body).map((node) => plainText(node).trim()).filter(Boolean).join(" ");
  return <div className="pe-intro" id="hero-scroll"><p id="hero-subhead">{paragraph}</p></div>;
}

/** Photo gallery and product page for each card, by card title. */
const PRODUCT_LINKS: Record<string, [string, string]> = {
  "Sunrooms": ["/photo-gallery.aspx", "/sunrooms.aspx"],
  "Three Season Rooms": ["/three-season-rooms-pictures.aspx", "/three-season-rooms.aspx"],
  "Four Season Rooms": ["/four-season-rooms-pictures.aspx", "/four-season-rooms.aspx"],
  "Screen Rooms": ["/screen-room-pictures.aspx", "/screen-rooms.aspx"],
  "Enclosed Porches": ["/porch-enclosure-pictures.aspx", "/porch-enclosures.aspx"],
  "Porch & Patio Covers": ["/porch-patio-covers-pictures.aspx", "/porch-patio-covers.aspx"],
  "Sunroom Kits": ["/sunroom-kits-pictures.aspx", "/sunroom-kits.aspx"],
  "Windows & Doors": ["/replacement-windows-doors-pictures.aspx", "/replacement-windows-doors.aspx"],
};

function Products({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const items = g.entries(entry.fields.items);
  return (
    <section id="product-grid" className="pe-products" aria-label={text(entry, "heading") ?? "Our sunroom collection"}>
      <ul className="pe-wrap pe-product-list">
        {items.map((item) => {
          const title = text(item, "title") ?? "";
          const [photos, learn] = PRODUCT_LINKS[title] ?? ["/photo-gallery.aspx", "/sunrooms.aspx"];
          return (
            <li key={item.id} id={`product-${slug(title)}`} className="pe-card">
              <h3><a href={`${SITE}${learn}`}>{title}</a></h3>
              <a className="pe-card-photo" href={`${SITE}${photos}`} tabIndex={-1} aria-hidden="true"><Img asset={g.asset(item.fields.image)} sizes="(min-width: 1000px) 303px, (min-width: 600px) 45vw, 50vw" decorative /></a>
              <nav className="pe-card-links" aria-label={title}>
                <a href={`${SITE}${photos}`}><CameraIcon />View Photos</a>
                <a href={`${SITE}${learn}`}><BookIcon />Learn More</a>
              </nav>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function GetStarted({ entry }: { entry: SiteEntry }) {
  const columns = columnsOf(entry.fields.body);
  return (
    <section id="get-started" className="pe-get-started">
      <div className="pe-wrap">
        <h2 className="pe-start-title"><img src="/example/pe-sun.png" alt="" width={55} height={55} /><span>{text(entry, "heading")}</span></h2>
        <div className="pe-start-grid">
          {columns.map((column) => (
            <div key={column.title} className="pe-start-col">
              <h3>{column.title}</h3>
              <ul>{column.links.map((l) => <li key={l.label + l.href}><a href={safeUrl(l.href)}>{l.label}</a></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurProducts({ entry }: { entry: SiteEntry }) {
  const [main = [], more = []] = linkLists(entry.fields.body);
  return (
    <section id="our-products" className="pe-our-products">
      <h2>{text(entry, "heading")}</h2>
      <ul className="pe-products-main">{main.map((l) => <li key={l.label}><a href={safeUrl(l.href)}>{l.label}</a></li>)}</ul>
      <ul className="pe-products-more">{more.map((l) => <li key={l.label}><a href={safeUrl(l.href)}>{l.label}</a></li>)}</ul>
    </section>
  );
}

// ---------- Footer and sticky bar ----------

const SOCIAL = [
  ["YouTube", "https://www.youtube.com/user/PatioEnclosures"], ["Pinterest", "https://www.pinterest.com/PatioEnclosures/"],
  ["Facebook", "https://www.facebook.com/patioenclosures"], ["Instagram", "https://www.instagram.com/patio_enclosures/"],
] as const;

function Footer({ g }: { g: BrandGraph }) {
  const brand = g.brand;
  const address = (text(brand, "address") ?? "").split("\n").join(", ");
  return (
    <footer className="pe-footer">
      <div className="pe-social">{SOCIAL.map(([name, href]) => <a key={name} href={href} aria-label={name}><SocialIcon name={name} /></a>)}</div>
      <p>&copy; 2026 Patio Enclosures by Great Day Improvements</p>
      <p className="pe-footer-links"><a href={`${SITE}/terms-of-use.aspx`}>Terms of Use</a><span>|</span><a href={`${SITE}/privacy-policy.aspx`}>Privacy Policy</a></p>
      <p className="pe-footer-links"><a href={`${SITE}/enewsletter-signup.aspx`}>E-newsletter Signup</a><span>|</span><a href={`${SITE}/sitemap.aspx`}>Site Map</a><span>|</span><a href={`${SITE}/patio-enclosures-careers.aspx`}>Careers</a></p>
      <p className="pe-address">{address}<br />Phone: <span>{FOOTER_PHONE}</span></p>
      <p className="pe-licenses">State contractor license numbers are listed here on the live site.</p>
      <a className="pe-gdi" href="https://www.greatdayimprovements.com"><img src="/example/pe-gdi-tag.png" alt="Patio Enclosures is part of the Great Day Improvements family of brands" width={200} height={51} /></a>
      {text(brand, "legalDisclaimer") && <p className="pe-demo-note">{text(brand, "legalDisclaimer")}</p>}
    </footer>
  );
}

function StickyBar({ cta }: { cta?: SiteEntry }) {
  const body = text(cta, "body") ?? `Call: ${PHONE}`;
  const phone = body.match(/[\d-]{12}/)?.[0];
  // The button draws its own chevron, so a label that already ends in one (a Quote-first CTA) drops it here.
  const label = (text(cta, "label") ?? "Schedule Now").replace(/\s*[›>]\s*$/, "");
  return (
    <div id="sticky-cta-bar" className="pe-sticky">
      <a id="chat-button" className="pe-chat" href={`${SITE}/general-contact-form.aspx`}><ChatIcon /><span>Chat</span></a>
      <div className="pe-sticky-inner">
        <p>
          <span>{text(cta, "heading") ?? "In-Home Estimates"}</span>
          <span>{phone ? <>{body.slice(0, body.indexOf(phone))}<a href={`tel:${phone.replace(/\D/g, "")}`}>{phone}</a>{body.slice(body.indexOf(phone) + phone.length)}</> : body}</span>
        </p>
        <a id="hero-cta" className={label.length > 14 ? "pe-schedule pe-schedule-long" : "pe-schedule"} href={safeUrl(text(cta, "destinationUrl"), "/schedule-design-consultation.aspx")}>{label}<ChevronRight /></a>
      </div>
    </div>
  );
}

// ---------- Icons ----------

function ChevronRight() {
  return <svg className="pe-chev-r" viewBox="0 0 10 16" width="10" height="16" aria-hidden="true"><path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChevronDown() {
  return <svg className="pe-chev-d" viewBox="0 0 16 10" width="10" height="7" aria-hidden="true"><path d="M2 2l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PhoneIcon() {
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" fill="currentColor" /></svg>;
}
function MenuIcon() {
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>;
}
function ScissorsIcon() {
  return (
    <svg className="pe-scissors" viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <circle cx="46" cy="12" r="7" /><circle cx="46" cy="30" r="7" /><path d="M40 16L20 26M40 26L22 18" />
        <path d="M14 30a20 20 0 1 0 22 16" strokeDasharray="7 7" />
      </g>
    </svg>
  );
}
function CameraIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 7h4l2-3h6l2 3h4v13H3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>;
}
function BookIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3zM21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M5.5 9h4M5.5 12h4M14.5 9h4M14.5 12h4" stroke="currentColor" strokeWidth="1.4" /></svg>;
}
function ChatIcon() {
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 3h18v13H8l-5 5z" fill="currentColor" /><path d="M7 8h10M7 11.5h7" stroke="#00a7b7" strokeWidth="1.8" /></svg>;
}
function SocialIcon({ name }: { name: (typeof SOCIAL)[number][0] }) {
  switch (name) {
    case "YouTube": return <svg viewBox="0 0 34 24" width="33" height="23" aria-hidden="true"><rect width="34" height="24" rx="6" fill="currentColor" /><path d="M13.5 7v10l9-5z" fill="#00a7b7" /></svg>;
    case "Pinterest": return <svg viewBox="0 0 26 26" width="26" height="26" aria-hidden="true"><circle cx="13" cy="13" r="12" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M12 7.5c3.4-.5 5.6 1.6 5.4 4.2-.2 2.8-2.2 4.4-4 4.1-1-.2-1.5-.9-1.5-.9L10.6 21M12.4 10l-1.4 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>;
    case "Facebook": return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M0 0h24v24h-8v-9h3l.5-3.5H16V9.3c0-1 .3-1.7 1.8-1.7h1.8V4.5A24 24 0 0 0 17 4.4c-2.6 0-4.4 1.6-4.4 4.5v2.6h-3V15h3v9H0z" fill="currentColor" /></svg>;
    case "Instagram": return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="1.5" y="1.5" width="21" height="21" rx="3" fill="currentColor" /><circle cx="12" cy="12.5" r="5" fill="none" stroke="#00a7b7" strokeWidth="2" /><path d="M1.5 9h5M17.5 9h5" stroke="#00a7b7" strokeWidth="2" /><circle cx="18" cy="5.5" r="1.4" fill="#00a7b7" /></svg>;
  }
}

// ---------- Helpers ----------

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Absolute http(s) URLs pass through; anything else becomes a page on the prospect's site. */
const safeUrl = (url: string | undefined, fallback = "/") => (url && /^https?:\/\//i.test(url) ? url : `${SITE}${fallback}`);

type RichNode = Block | Inline | Text;
type Link = { label: string; href: string };
const plainText = (node: RichNode): string => (node.nodeType === "text" ? (node as Text).value : ((node as Block).content ?? []).map((child) => plainText(child as RichNode)).join(""));

/** The first hyperlink in a node, or its plain text with no target. */
function firstLink(node: RichNode): Link | undefined {
  if (node.nodeType === "hyperlink") return { label: plainText(node).trim(), href: String((node as Inline).data?.uri ?? "") };
  for (const child of (node as Block).content ?? []) {
    const found = firstLink(child as RichNode);
    if (found) return found;
  }
  return undefined;
}

const listLinks = (list: Block): Link[] => (list.content as Block[]).map((item) => firstLink(item) ?? { label: plainText(item).trim(), href: "" }).filter((l) => l.label);

const blocksOf = (document: unknown): Block[] =>
  document && typeof document === "object" && (document as Document).nodeType === "document" ? ((document as Document).content as Block[]) : [];

/** Every bulleted or numbered list in a rich text field, as link lists. */
function linkLists(document: unknown): Link[][] {
  return blocksOf(document).filter((n) => n.nodeType === "unordered-list" || n.nodeType === "ordered-list").map(listLinks);
}

/** One column per level 3 heading, with the links listed under it. */
function columnsOf(document: unknown): { title: string; links: Link[] }[] {
  const columns: { title: string; links: Link[] }[] = [];
  for (const node of blocksOf(document)) {
    if (node.nodeType === "heading-3") columns.push({ title: plainText(node).trim(), links: [] });
    else if (columns.length && (node.nodeType === "unordered-list" || node.nodeType === "ordered-list")) columns.at(-1)!.links.push(...listLinks(node));
  }
  return columns.filter((c) => c.title);
}

