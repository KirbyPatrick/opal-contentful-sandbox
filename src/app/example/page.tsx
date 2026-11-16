import type { Block, Document, Inline, Text } from "@contentful/rich-text-types";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DraftBanner } from "@/components/site/chrome";
import { Img, RichText } from "@/components/site/primitives";
import { EXAMPLE_BRAND_SLUG } from "@/lib/site/contentful";
import { text, type BrandGraph } from "@/lib/site/graph";
import { isPreview, loadBrand, nonce } from "@/lib/site/load";
import type { SiteAsset, SiteEntry } from "@/lib/site/types";

export const metadata: Metadata = {
  title: "Send money online | Example",
  robots: { index: false, follow: false },
};

const HOME = "https://www.remitly.com/";
const BUSINESS = "https://www.remitly.com/us/en/business";
const HELP = "https://help.remitly.com/";
const BLOG = "https://blog.remitly.com/";
/** Optimizely Web Experimentation snippet for the demo project. src/proxy.ts allows it on /example only. */
const OPTIMIZELY_SNIPPET = "https://cdn.optimizely.com/js/6231585842790400.js";

/**
 * The Example page: a sandbox for recreating a prospect's page during a demo. Its copy lives in the
 * Example brand (seed/brands/example.ts) so Opal can edit it; this file only draws the layout. With no
 * Example content in Contentful, the page stays blank.
 *
 * It currently recreates a money transfer company's US home page. Elements an experiment is likely to
 * change carry stable IDs: #hero-banner, #hero-headline, #hero-subhead, #hero-cta, #rate-calculator,
 * #calculator-cta, #signup-cta, #ways-to-send, #trust-features, #money-map, #safety, #app-download,
 * #reviews, #blog, #countries and #faq.
 */
export default async function ExamplePage() {
  const [g, preview, scriptNonce] = await Promise.all([loadBrand(EXAMPLE_BRAND_SLUG), isPreview(), nonce()]);
  const page = g?.homePage;
  if (!g || !page) {
    return (
      <main id="main" className="example-page">
        <h1 className="sr-only">Example</h1>
      </main>
    );
  }
  const hero = g.entry(page.fields.hero);
  const sections = g.entries(page.fields.sections);
  const pool = (n: number) => g.asset({ sys: { id: `img-example-${String(n).padStart(2, "0")}` } });

  return (
    <div className="rmt">
      {/* Loaded synchronously and first, as Optimizely recommends, so variations apply before the page paints. */}
      <script src={OPTIMIZELY_SNIPPET} nonce={scriptNonce} />
      {preview && <DraftBanner />}
      <Header />
      <main id="main">
        <Hero g={g} hero={hero} second={pool(2)} />
        {sections.map((entry) => <Section key={entry.id} g={g} entry={entry} page={page} pool={pool} />)}
      </main>
      <Footer />
    </div>
  );
}

// ---------- Hero ----------

function Hero({ g, hero, second }: { g: BrandGraph; hero?: SiteEntry; second?: SiteAsset }) {
  const cta = g.entry(hero?.fields.cta);
  const href = safeUrl(text(cta, "destinationUrl"));
  return (
    <section id="hero-banner" className="rmt-hero">
      <Ratings className="rmt-hero-ratings" />
      <div className="rmt-wrap rmt-hero-grid">
        <div className="rmt-hero-copy">
          <h1 id="hero-headline" className="rmt-hero-headline">{lines(text(hero, "headline"))}</h1>
          {text(hero, "subheadline") && <p id="hero-subhead" className="rmt-hero-subhead">{text(hero, "subheadline")}</p>}
          {cta && <a id="hero-cta" className="rmt-btn rmt-btn-light" href={href}>{text(cta, "label") ?? "Send money"}</a>}
        </div>
        <div className="rmt-collage" aria-hidden="true">
          <div className="rmt-collage-photo rmt-collage-photo-a"><Img asset={g.asset(hero?.fields.image)} sizes="(min-width: 900px) 220px, 40vw" priority decorative /></div>
          <div className="rmt-collage-photo rmt-collage-photo-b"><Img asset={second} sizes="(min-width: 900px) 260px, 45vw" priority decorative /></div>
          <div className="rmt-chip rmt-chip-request">
            <span className="rmt-chip-icon"><BankIcon /></span>
            <span><strong>Mobile wallet</strong><small>Mobile money</small><em>Money requested</em></span>
          </div>
          <div className="rmt-phone-card">
            <div className="rmt-phone">
              <div className="rmt-phone-row"><span><b>300.00</b><small>You send</small></span><span className="rmt-ccy">GBP</span></div>
              <div className="rmt-phone-row"><span><b>25,200.00</b><small>They receive</small></span><span className="rmt-ccy">PHP</span></div>
              <span className="rmt-phone-rate">1 GBP = 84.00 PHP</span>
              <span className="rmt-phone-btn">Continue</span>
            </div>
          </div>
          <div className="rmt-chip rmt-chip-sent">
            <span className="rmt-chip-mark"><ShieldMark /></span>
            <span><strong>Transfer</strong><em>Money sent</em></span>
            <span className="rmt-check" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Section blocks ----------

function Section({ g, entry, page, pool }: { g: BrandGraph; entry: SiteEntry; page: SiteEntry; pool: (n: number) => SiteAsset | undefined }) {
  switch (entry.id) {
    case "ex-rt-calculator": return <Calculator entry={entry} cta={g.entry(page.fields.primaryCta)} />;
    case "ex-rt-ways": return <Ways entry={entry} photos={[pool(3), pool(4), pool(5)]} />;
    case "ex-cg-trust": return <Trust g={g} entry={entry} />;
    case "ex-mt-map": return <MoneyMap g={g} entry={entry} />;
    case "ex-cg-safety": return <Safety g={g} entry={entry} />;
    case "ex-rt-app": return <App entry={entry} />;
    case "ex-rt-reviews": return <Reviews entry={entry} />;
    case "ex-rt-blog": return <Blog entry={entry} photos={[pool(6), pool(7), pool(8), pool(9)]} />;
    case "ex-rt-countries": return <Countries entry={entry} />;
  }
  if (entry.type === "faq") return <Faq g={g} entry={entry} />;
  if (entry.type === "richTextSection") {
    return (
      <section className="rmt-section rmt-cream">
        <div className="rmt-wrap rmt-narrow">
          {text(entry, "heading") && <h2 className="rmt-h2">{text(entry, "heading")}</h2>}
          <RichText document={entry.fields.body} />
        </div>
      </section>
    );
  }
  return null;
}

function Calculator({ entry, cta }: { entry: SiteEntry; cta?: SiteEntry }) {
  return (
    <section className="rmt-section rmt-cream rmt-calc-section" aria-labelledby="calc-heading">
      <div className="rmt-wrap rmt-calc-grid">
        <div className="rmt-calc-copy">
          <h2 id="calc-heading" className="rmt-h2">{text(entry, "heading")}</h2>
          <RichText document={entry.fields.body} className="rmt-calc-body" />
        </div>
        <div id="rate-calculator" className="rmt-calc" role="group" aria-label="Transfer estimate">
          <label className="rmt-field">
            <span>You send</span>
            <span className="rmt-input"><input name="send" defaultValue="1,000.00" inputMode="decimal" aria-label="Amount you send" /><span className="rmt-ccy-pill"><Flag kind="us" />USD</span></span>
          </label>
          <label className="rmt-field">
            <span>They receive</span>
            <span className="rmt-input"><input name="receive" defaultValue="18,810.00" inputMode="decimal" aria-label="Amount they receive" /><span className="rmt-ccy-pill rmt-ccy-select"><Flag kind="mx" />MXN<Chevron /></span></span>
          </label>
          <div className="rmt-welcome">
            <span><span className="rmt-welcome-label">Welcome rate</span><span>1 USD = 18.81 MXN</span></span>
            <span className="rmt-toggle" aria-hidden="true"><span /></span>
          </div>
          <dl className="rmt-fees">
            <div><dt>Fee</dt><dd>1.99 USD</dd></div>
            <div className="rmt-discount"><dt>Fee discount</dt><dd>-1.99 USD</dd></div>
            <div><dt>Total</dt><dd>1,000.00 USD</dd></div>
          </dl>
          {cta && (
            <a id="calculator-cta" className="rmt-btn rmt-btn-dark rmt-btn-block" href={safeUrl(text(cta, "destinationUrl"))}>
              {text(cta, "label") ?? "Create your account"}
            </a>
          )}
        </div>
      </div>
      <p className="rmt-wrap rmt-fineprint">Illustrative rates and fees for this demo page. New customers only, one offer per customer, for a limited time. Rates change often. The promotional rate applies to the first 1,000.00 USD sent.</p>
    </section>
  );
}

function Ways({ entry, photos }: { entry: SiteEntry; photos: (SiteAsset | undefined)[] }) {
  const { lead, cards } = splitCards(entry.fields.body);
  return (
    <section id="ways-to-send" className="rmt-section rmt-sky" aria-labelledby="ways-heading">
      <div className="rmt-wrap">
        <h2 id="ways-heading" className="rmt-h2 rmt-center">{text(entry, "heading")}</h2>
        {lead.length > 0 && <RichText document={asDocument(lead)} className="rmt-lead rmt-center" />}
        <ul className="rmt-ways">
          {cards.map((card, i) => (
            <li key={card.title} className="rmt-way">
              <div className={`rmt-way-media${i === 1 ? " rmt-way-media-dark" : ""}`}>
                <Img asset={photos[i]} sizes="(min-width: 900px) 33vw, 100vw" />
                <WayChip index={i} />
              </div>
              <h3 className="rmt-h3">{card.title}</h3>
              <RichText document={asDocument(card.nodes)} className="rmt-way-body" linkAttributes={() => ({ className: "rmt-btn rmt-btn-dark" })} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Trust({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const items = g.entries(entry.fields.items);
  return (
    <section id="trust-features" className="rmt-section" aria-labelledby="trust-heading">
      <div className="rmt-wrap">
        <h2 id="trust-heading" className="rmt-h2 rmt-center">{text(entry, "heading")}</h2>
        <ul className="rmt-trust">
          {items.map((item, i) => (
            <li key={item.id}>
              <TrustIcon index={i} />
              <h3 className="rmt-h3">{text(item, "title")}</h3>
              <p>{text(item, "text")}</p>
            </li>
          ))}
        </ul>
        {text(entry, "intro") && <p className="rmt-fineprint rmt-center">{text(entry, "intro")}</p>}
      </div>
    </section>
  );
}

function MoneyMap({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  return (
    <section id="money-map" className="rmt-section rmt-cream" aria-labelledby="map-heading">
      <div className="rmt-wrap">
        <h2 id="map-heading" className="rmt-h2 rmt-center">{text(entry, "heading")}</h2>
        <div className="rmt-map">
          <div className="rmt-map-media"><Img asset={g.asset(entry.fields.image)} sizes="(min-width: 900px) 50vw, 100vw" /></div>
          <p className="rmt-map-text">{text(entry, "body")}</p>
        </div>
      </div>
    </section>
  );
}

function Safety({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const items = g.entries(entry.fields.items);
  return (
    <section id="safety" className="rmt-section rmt-navy" aria-labelledby="safety-heading">
      <div className="rmt-wrap">
        <h2 id="safety-heading" className="rmt-h2 rmt-center">{text(entry, "heading")}</h2>
        <ul className="rmt-safety">
          {items.map((item, i) => (
            <li key={item.id} className={i % 2 === 1 ? "rmt-safety-flip" : undefined}>
              <div className="rmt-safety-text">
                <h3 className="rmt-h3">{text(item, "title")}</h3>
                <p>{text(item, "text")}</p>
              </div>
              <div className={`rmt-safety-tile rmt-safety-tile-${i}`} aria-hidden="true"><SafetyArt index={i} /></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function App({ entry }: { entry: SiteEntry }) {
  return (
    <section id="app-download" className="rmt-section" aria-labelledby="app-heading">
      <div className="rmt-wrap rmt-app">
        <div className="rmt-app-copy">
          <h2 id="app-heading" className="rmt-h2">{text(entry, "heading")}</h2>
          <RichText document={entry.fields.body} className="rmt-app-body" />
          <div className="rmt-badges"><StoreBadge kind="google" /><StoreBadge kind="apple" /></div>
          <QrCode />
        </div>
        <div className="rmt-app-phone" aria-hidden="true">
          <div className="rmt-device"><span className="rmt-device-notch" /><span className="rmt-device-time">9:41</span><span className="rmt-device-mark"><ShieldMark /></span></div>
        </div>
      </div>
    </section>
  );
}

function Reviews({ entry }: { entry: SiteEntry }) {
  const { lead, cards } = splitCards(entry.fields.body);
  return (
    <section id="reviews" className="rmt-section rmt-midnight" aria-labelledby="reviews-heading">
      <div className="rmt-wrap">
        <h2 id="reviews-heading" className="rmt-h2 rmt-center">{text(entry, "heading")}</h2>
        <ul className="rmt-reviews">
          {cards.map((card) => (
            <li key={card.title} className="rmt-review">
              <span className="rmt-stars" aria-label="Rated 5 out of 5">★★★★★</span>
              <h3 className="rmt-h3">{card.title}</h3>
              <RichText document={asDocument(card.nodes)} className="rmt-review-body" />
            </li>
          ))}
        </ul>
        {lead.length > 0 && <RichText document={asDocument(lead)} className="rmt-fineprint rmt-center" />}
      </div>
    </section>
  );
}

function Blog({ entry, photos }: { entry: SiteEntry; photos: (SiteAsset | undefined)[] }) {
  const { lead, cards } = splitCards(entry.fields.body);
  return (
    <section id="blog" className="rmt-section rmt-cream" aria-labelledby="blog-heading">
      <div className="rmt-wrap">
        <h2 id="blog-heading" className="rmt-h2 rmt-center">{text(entry, "heading")}</h2>
        {lead.length > 0 && <RichText document={asDocument(lead)} className="rmt-lead rmt-center" />}
        <ul className="rmt-posts">
          {cards.map((card, i) => (
            <li key={card.title} className="rmt-post">
              <div className="rmt-post-media"><Img asset={photos[i]} sizes="(min-width: 1100px) 25vw, (min-width: 700px) 50vw, 100vw" /></div>
              <h3 className="rmt-h3">{card.title}</h3>
              <RichText document={asDocument(card.nodes)} className="rmt-post-body" linkAttributes={() => ({ className: "rmt-btn rmt-btn-dark" })} />
            </li>
          ))}
        </ul>
        <p className="rmt-center"><a className="rmt-text-link" href={BLOG}>Explore the blog</a></p>
      </div>
    </section>
  );
}

function Countries({ entry }: { entry: SiteEntry }) {
  return (
    <section id="countries" className="rmt-section" aria-labelledby="countries-heading">
      <div className="rmt-wrap">
        <h2 id="countries-heading" className="rmt-h2 rmt-center">{text(entry, "heading")}</h2>
        <RichText document={entry.fields.body} className="rmt-countries" linkAttributes={() => ({ className: "rmt-country-link" })} />
      </div>
    </section>
  );
}

function Faq({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const items = g.entries(entry.fields.items);
  if (items.length === 0) return null;
  return (
    <section id={entry.id === "ex-fq-help" ? "faq" : undefined} className="rmt-section rmt-cream" aria-labelledby={`${entry.id}-heading`}>
      <div className="rmt-wrap rmt-narrow">
        <h2 id={`${entry.id}-heading`} className="rmt-h2 rmt-center">{text(entry, "heading") ?? "Frequently asked questions"}</h2>
        <div className="rmt-faq">
          {items.map((item) => (
            <details key={item.id}>
              <summary><Chevron />{text(item, "title")}</summary>
              <p>{text(item, "text")}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Chrome ----------

function Logo({ footer = false }: { footer?: boolean }) {
  return <img className={`rmt-logo-img${footer ? " rmt-logo-footer" : ""}`} src="/example/remitly-logo.svg" alt="Remitly" width={135} height={32} />;
}

function Header() {
  return (
    <header className="rmt-header">
      <div className="rmt-header-row">
        <a className="rmt-logo" href={HOME}><Logo /></a>
        <nav className="rmt-segment" aria-label="Account type">
          <a className="rmt-segment-on" href={HOME} aria-current="page">Personal</a>
          <a href={BUSINESS}>Business</a>
        </nav>
        <nav className="rmt-header-links" aria-label="Site">
          <a href={HOME} className="rmt-header-flag"><Flag kind="us" /><Chevron /><span className="sr-only">Sending from the United States</span></a>
          <a href={HOME} className="rmt-header-dest"><GlobeIcon />Destination<Chevron /></a>
          <a href={HOME}>English<Chevron /></a>
          <a href={HELP}>Help</a>
          <a href={HOME}>Log in</a>
        </nav>
        <a id="signup-cta" className="rmt-btn rmt-btn-dark rmt-btn-small" href={HOME}>Sign up</a>
        <details className="rmt-menu">
          <summary aria-label="Menu"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" /></svg></summary>
          <nav className="rmt-menu-panel" aria-label="Menu">
            <a href={HOME}>Personal</a>
            <a href={BUSINESS}>Business</a>
            <a href={HOME}>Destination</a>
            <a href={HOME}>English</a>
            <a href={HELP}>Help</a>
            <a href={HOME}>Log in</a>
          </nav>
        </details>
      </div>
    </header>
  );
}

const FOOTER: { heading: string; links: string[] }[] = [
  { heading: "Company", links: ["About", "Blog", "Newsroom", "Press", "Careers", "Investors", "Reviews"] },
  { heading: "Products", links: ["Send money", "Global card", "Business", "Large transfers", "Log in", "Sign up"] },
  { heading: "Resources", links: ["Rates and fees", "SWIFT codes", "Fraud and scam help", "Partners", "Routing numbers", "IBAN numbers", "Currency converter", "Refer friends"] },
  { heading: "Support", links: ["Help", "File a complaint"] },
];
const LEGAL = ["User agreement", "Business user agreement", "Privacy notice", "Your privacy choices", "Security", "Licenses", "Accessibility", "Cookies"];

function Footer() {
  return (
    <footer className="rmt-footer">
      <div className="rmt-wrap">
        <div className="rmt-footer-cols">
          {FOOTER.map((col) => (
            <div key={col.heading}>
              <h2>{col.heading}</h2>
              <ul>{col.links.map((label) => <li key={label}><a href={label === "Blog" ? BLOG : label === "Help" ? HELP : HOME}>{label}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <ul className="rmt-legal">{LEGAL.map((label) => <li key={label}><a href={HOME}>{label}</a></li>)}</ul>
        <div className="rmt-badges rmt-badges-center"><StoreBadge kind="google" /><StoreBadge kind="apple" /></div>
        <p className="rmt-footer-note">Demo mockup for illustration only. Not an official Remitly page; links, rates and reviews are placeholders.</p>
      </div>
    </footer>
  );
}

// ---------- Small pieces ----------

function Ratings({ className }: { className?: string }) {
  return (
    <p className={className}>
      <span><PlayIcon /><b>Google Play 4.8 stars</b> 1.4M+ ratings</span>
      <span><PhoneIcon /><b>App Store 4.9 stars</b> 4.5M+ ratings</span>
    </p>
  );
}

function StoreBadge({ kind }: { kind: "apple" | "google" }) {
  return (
    <a className="rmt-badge" href={HOME}>
      {kind === "google" ? <PlayIcon /> : <PhoneIcon />}
      <span><small>{kind === "google" ? "Get it on" : "Download on the"}</small>{kind === "google" ? "Google Play" : "App Store"}</span>
    </a>
  );
}

function WayChip({ index }: { index: number }) {
  if (index === 0) return <span className="rmt-way-chip" aria-hidden="true"><span><b>500.00</b><small>You send</small></span><span className="rmt-ccy">GBP</span><span><b>65,005.00</b><small>They receive</small></span><span className="rmt-ccy">INR</span></span>;
  if (index === 1) return <span className="rmt-way-chip rmt-way-chip-paid" aria-hidden="true"><em>Delivered</em><b>Supplier payment</b><small>59,200.00 PHP</small></span>;
  return <span className="rmt-way-chip rmt-way-chip-request" aria-hidden="true"><b>Request money</b><small>Delivered</small></span>;
}

function TrustIcon({ index }: { index: number }) {
  const paths = [
    <g key="t"><circle cx="40" cy="40" r="38" fill="#fbe3c4" /><path d="M40 18c-8 0-14 6-14 14 0 11 14 28 14 28s14-17 14-28c0-8-6-14-14-14z" fill="#e8613a" /><circle cx="40" cy="32" r="5" fill="#fff" /></g>,
    <g key="v"><circle cx="40" cy="40" r="38" fill="#fde9b8" /><circle cx="40" cy="38" r="17" fill="#f6a623" /><circle cx="40" cy="38" r="11" fill="none" stroke="#fff" strokeWidth="3" /><path d="M26 64h28" stroke="#2c415a" strokeWidth="4" strokeLinecap="round" /></g>,
    <g key="d"><circle cx="40" cy="40" r="38" fill="#2c415a" /><path d="M18 42l42-18-14 38-8-14z" fill="#b2c8e9" /><path d="M38 48l8-10" stroke="#2c415a" strokeWidth="2" /></g>,
  ];
  return <svg className="rmt-trust-icon" viewBox="0 0 80 80" width="96" height="96" aria-hidden="true">{paths[index % 3]}</svg>;
}

function SafetyArt({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 200 160" width="240" height="192" aria-hidden="true">
        <circle cx="100" cy="80" r="62" fill="#5b9aa8" />
        <path d="M58 48c10-10 26-12 34-4s-2 16 8 22 22-6 30 4-4 20-16 22-14 10-20 20-18 6-22-6-4-16-14-22-10-26 0-36z" fill="#9db75a" />
        <path d="M126 110c8-4 18-2 20 6s-8 14-16 12-10-14-4-18z" fill="#9db75a" />
        <ellipse cx="100" cy="80" rx="62" ry="22" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
        <ellipse cx="100" cy="80" rx="24" ry="62" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
        <path d="M30 140c14-12 32-16 46-10M170 140c-14-12-32-16-46-10" fill="none" stroke="#e8613a" strokeWidth="10" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 1) return <span className="rmt-safety-badge"><ShieldMark /></span>;
  return <span className="rmt-safety-chat"><svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
}

/** A decorative QR-style pattern (not a working code). */
function QrCode() {
  const cells: ReactNode[] = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      const on = finder ? (x % 6 === 0 || y % 6 === 0 || (x % 7 > 1 && x % 7 < 5 && y % 7 > 1 && y % 7 < 5) || x === 20 || y === 20) : (x * 7 + y * 13 + x * y) % 3 === 0;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  return (
    <figure className="rmt-qr">
      <svg viewBox="0 0 21 21" width="88" height="88" aria-hidden="true" shapeRendering="crispEdges">{cells}</svg>
      <figcaption>Scan with your phone camera</figcaption>
    </figure>
  );
}

/** Remitly's shield mark, cut from the logo (public/example/remitly-mark*.svg). */
function ShieldMark({ light = true }: { light?: boolean }) {
  return <img className="rmt-mark" src={light ? "/example/remitly-mark-white.svg" : "/example/remitly-mark.svg"} alt="" width={32} height={32} />;
}

function Flag({ kind }: { kind: "us" | "mx" }) {
  return kind === "us" ? (
    <svg className="rmt-flag" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><clipPath id="rmt-flag-us"><circle cx="10" cy="10" r="10" /></clipPath><g clipPath="url(#rmt-flag-us)"><rect width="20" height="20" fill="#fff" />{[0, 4, 8, 12, 16].map((y) => <rect key={y} y={y} width="20" height="2" fill="#c8102e" />)}<rect width="10" height="10" fill="#1f3a93" /></g></svg>
  ) : (
    <svg className="rmt-flag" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><clipPath id="rmt-flag-mx"><circle cx="10" cy="10" r="10" /></clipPath><g clipPath="url(#rmt-flag-mx)"><rect width="7" height="20" fill="#006847" /><rect x="7" width="6" height="20" fill="#fff" /><rect x="13" width="7" height="20" fill="#ce1126" /><circle cx="10" cy="10" r="1.8" fill="#8c5a2b" /></g></svg>
  );
}

function Chevron() {
  return <svg className="rmt-chevron" viewBox="0 0 16 10" width="14" height="9" aria-hidden="true"><path d="M1.5 1.5 8 8l6.5-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function GlobeIcon() {
  return <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M2 10h16M10 2c3 3 3 13 0 16M10 2c-3 3-3 13 0 16" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>;
}
function PlayIcon() {
  return <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4 2l13 8-13 8z" fill="#34a853" /><path d="M4 2l8 8-8 8z" fill="#4285f4" /></svg>;
}
function PhoneIcon() {
  return <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="5" y="1.5" width="10" height="17" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="10" cy="15.5" r="1" fill="currentColor" /></svg>;
}
function BankIcon() {
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>;
}

// ---------- Helpers ----------

/** Splits a headline at its sentence breaks onto separate lines, as the source page does. */
function lines(value: string | undefined): ReactNode {
  if (!value) return null;
  const parts = value.split(/(?<=\.)\s+/);
  return parts.map((part, i) => <span key={i} className="rmt-line">{part}</span>);
}

const safeUrl = (url: string | undefined) => (url && /^https?:\/\//i.test(url) ? url : HOME);

type RichNode = Block | Inline | Text;
const plainText = (node: RichNode): string => (node.nodeType === "text" ? (node as Text).value : ((node as Block).content ?? []).map((child) => plainText(child as RichNode)).join(""));

/** Splits rich text into the lead (before the first level 3 heading) and one card per level 3 heading. */
function splitCards(document: unknown): { lead: Block[]; cards: { title: string; nodes: Block[] }[] } {
  const out = { lead: [] as Block[], cards: [] as { title: string; nodes: Block[] }[] };
  if (!document || typeof document !== "object" || (document as Document).nodeType !== "document") return out;
  for (const node of (document as Document).content as Block[]) {
    if (node.nodeType === "heading-3") out.cards.push({ title: plainText(node).trim(), nodes: [] });
    else if (out.cards.length) out.cards.at(-1)!.nodes.push(node);
    else out.lead.push(node);
  }
  out.cards = out.cards.filter((card) => card.title !== "");
  return out;
}

const asDocument = (nodes: Block[]): Document => ({ nodeType: "document", data: {}, content: nodes } as unknown as Document);
