import type { Block, Document, Inline, Text } from "@contentful/rich-text-types";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DraftBanner } from "@/components/site/chrome";
import { Carousel } from "./carousel";
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
          <div className="rmt-collage-photo rmt-collage-photo-a"><Img asset={g.asset(hero?.fields.image)} sizes="(min-width: 1280px) 180px, (min-width: 768px) 150px, 34vw" priority decorative /></div>
          <div className="rmt-collage-photo rmt-collage-photo-b"><Img asset={second} sizes="(min-width: 1280px) 240px, (min-width: 768px) 200px, 45vw" priority decorative /></div>
          <div className="rmt-chip rmt-chip-request">
            <div className="rmt-chip-head">
              <span className="rmt-chip-icon"><BankIcon /></span>
              <span><strong>Gcash</strong><small>Mobile Money</small></span>
            </div>
            <em>Money requested</em>
          </div>
          <div className="rmt-phone-card">
            <div className="rmt-phone">
              <div className="rmt-phone-status"><span>12:30</span><span className="rmt-phone-island" /><StatusIcons /></div>
              <div className="rmt-phone-top"><ShieldMark light={false} /><span className="rmt-phone-x" /></div>
              <div className="rmt-phone-progress"><span /></div>
              <span className="rmt-phone-rate">1 GBP = <u>84.00 PHP</u></span>
              <span className="rmt-phone-promo"><span>&#10022; Promo exchange rate applied</span><span className="rmt-phone-info">i</span></span>
              <div className="rmt-phone-sheet">
                <div className="rmt-phone-fee"><span>Fastest delivery available:<b><svg viewBox="0 0 8 12" aria-hidden="true"><path d="M5 0 0 7h3l-1 5 6-8H5z" fill="currentColor" /></svg>Instant</b></span><span>Flat fee:<b className="rmt-phone-teal">0.00 GBP</b></span></div>
                <span className="rmt-phone-btn">Continue</span>
                <span className="rmt-phone-sim">Simulated experience</span>
              </div>
            </div>
            <div className="rmt-phone-amounts">
              <div className="rmt-phone-row"><span><b>300.00</b><small>You send</small></span><span className="rmt-ccy"><Flag kind="gb" />GBP</span></div>
              <div className="rmt-phone-row"><span><b>25,200.00</b><small>They receive</small></span><span className="rmt-ccy rmt-ccy-pick"><Flag kind="ph" />PHP<Chevron /></span></div>
            </div>
          </div>
          <div className="rmt-chip rmt-chip-sent">
            <span className="rmt-chip-mark"><ShieldMark /></span>
            <span><strong className="rmt-chip-brand">REMITLY</strong><em>Money sent</em></span>
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
      <p className="rmt-wrap rmt-fineprint rmt-center">New customers only. One per customer. Limited-time offer. Rates shown may change. The promotional rate applies to the first 1,000.00 USD sent. See <a href={HOME}>Terms and Conditions</a> for details. Rates on this demo page are illustrative.</p>
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
        <Carousel label="Ways to move money" count={cards.length} className="rmt-ways">
          {cards.map((card, i) => (
            <li key={card.title} className="rmt-way">
              <div className={`rmt-way-media${i === 1 ? " rmt-way-media-panel" : ""}`}>
                {i !== 1 && <Img asset={photos[i === 0 ? 0 : 2]} sizes="(min-width: 900px) 500px, 85vw" />}
                <WayChip index={i} />
              </div>
              <h3 className="rmt-h3">{card.title}</h3>
              <RichText document={asDocument(card.nodes)} className="rmt-way-body" linkAttributes={() => ({ className: "rmt-btn rmt-btn-dark" })} />
            </li>
          ))}
        </Carousel>
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
  const [body, note] = (text(entry, "body") ?? "").split(/\n{2,}/);
  return (
    <section id="money-map" className="rmt-section rmt-cream" aria-labelledby="map-heading">
      <div className="rmt-wrap">
        <h2 id="map-heading" className="rmt-h2 rmt-center">{text(entry, "heading")}</h2>
        <div className="rmt-map">
          <div className="rmt-map-media">
            <Img asset={g.asset(entry.fields.image)} sizes="(min-width: 900px) 560px, 100vw" />
            <MapRoutes />
          </div>
          <p className="rmt-map-text">{body}</p>
        </div>
        {note && <p className="rmt-fineprint rmt-center">{note}</p>}
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
  const { ratings, note } = appParts(entry.fields.body);
  return (
    <section id="app-download" className="rmt-section rmt-app-section" aria-labelledby="app-heading">
      <div className="rmt-wrap rmt-app">
        <div className="rmt-app-copy">
          <h2 id="app-heading" className="rmt-h2">{text(entry, "heading")}</h2>
          <ul className="rmt-app-ratings">
            {ratings.map((line, i) => (
              <li key={line.label}>{i === 0 ? <PhoneIcon /> : <PlayIcon />}<b>{line.label}</b> {line.rest}</li>
            ))}
          </ul>
          <div className="rmt-badges"><StoreBadge kind="google" /><StoreBadge kind="apple" /></div>
          <QrCode />
        </div>
        <div className="rmt-app-phone" aria-hidden="true">
          <div className="rmt-device"><span className="rmt-device-notch" /><span className="rmt-device-time">9:41</span><span className="rmt-device-mark"><ShieldMark /></span></div>
        </div>
      </div>
      {note && <p className="rmt-wrap rmt-fineprint rmt-center rmt-app-note">{note}</p>}
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
        <Carousel label="Blog posts" count={cards.length} className="rmt-posts">
          {cards.map((card, i) => (
            <li key={card.title} className="rmt-post">
              <div className="rmt-post-media"><Img asset={photos[i]} sizes="(min-width: 900px) 500px, 85vw" /></div>
              <h3 className="rmt-h3">{card.title}</h3>
              <RichText document={asDocument(card.nodes)} className="rmt-post-body" linkAttributes={() => ({ className: "rmt-btn rmt-btn-dark" })} />
            </li>
          ))}
        </Carousel>
        <p className="rmt-center rmt-blog-more"><a className="rmt-text-link" href={BLOG}>Explore the blog</a></p>
      </div>
    </section>
  );
}

function Countries({ entry }: { entry: SiteEntry }) {
  const { lead, countries, more } = countryParts(entry.fields.body);
  return (
    <section id="countries" className="rmt-section" aria-labelledby="countries-heading">
      <div className="rmt-wrap">
        <h2 id="countries-heading" className="rmt-h2 rmt-center">{text(entry, "heading")}</h2>
        {lead && <p className="rmt-lead rmt-center">{lead}</p>}
        <ul className="rmt-country-grid">
          {countries.map((c) => (
            <li key={c.name}><a className="rmt-country-link" href={c.href}><CountryFlag name={c.name} />{c.name}</a></li>
          ))}
        </ul>
        {more && <p className="rmt-center"><a className="rmt-btn rmt-btn-dark" href={more.href}>{more.name}</a></p>}
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
        <p className="rmt-faq-kicker">Remitly FAQ</p>
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

const FOOTER: { heading: string; links: string[] }[][] = [
  [{ heading: "Company", links: ["About", "Blog", "Newsroom", "Press", "Careers", "Investors", "Reviews"] }],
  [{ heading: "Products", links: ["Send Money", "Remitly Global Card", "Remitly Business", "Large Money Transfer", "Log in", "Sign up"] }],
  [{ heading: "Resources", links: ["Rates and Fees", "Swift codes", "Fraud and Scam Resources", "Partners", "Routing numbers", "IBAN numbers", "Currency Converter", "Refer friends", "Ambassador Program", "Seafarers", "Insights"] }],
  [{ heading: "Communities", links: ["Find Communities"] }, { heading: "Support", links: ["Help", "File a complaint"] }],
];
const LEGAL = ["User Agreement", "Business User Agreement", "Privacy Notice", "Your Privacy Choices", "Privacy Help Center", "Security", "Licenses", "Accessibility", "Cookies"];
const SOCIAL = ["Facebook", "X", "Instagram", "LinkedIn", "YouTube", "TikTok"] as const;

function Footer() {
  return (
    <footer className="rmt-footer">
      <div className="rmt-wrap">
        <div className="rmt-footer-cols">
          {FOOTER.map((col, ci) => (
            <div key={ci}>
              {col.map((group) => (
                <div key={group.heading} className="rmt-footer-group">
                  <h2>{group.heading}</h2>
                  <ul>{group.links.map((label) => <li key={label}><a href={label === "Blog" ? BLOG : label === "Help" ? HELP : HOME}>{label}</a></li>)}</ul>
                </div>
              ))}
              {ci === FOOTER.length - 1 && (
                <div className="rmt-footer-group">
                  <h2>Connect</h2>
                  <ul className="rmt-social">{SOCIAL.map((name) => <li key={name}><a href={HOME} aria-label={name}><SocialIcon name={name} /></a></li>)}</ul>
                </div>
              )}
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
  if (index === 0) return <span className="rmt-way-chip" aria-hidden="true"><span><b>500.00</b><small>You send</small></span><span className="rmt-ccy">GBP</span><span><b>65,005.00</b><small>They receive</small></span><span className="rmt-ccy">IND</span></span>;
  if (index === 1) {
    return (
      <span className="rmt-way-panel" aria-hidden="true">
        <span className="rmt-way-delivered"><em>Delivered</em><span><b>Maria Santos</b><b>59,200.00 PHP</b></span><small>GCash Wallet</small><small>January 3, 2026</small></span>
        <span className="rmt-way-assistant"><span className="rmt-way-avatar" />Virtual Assistant</span>
      </span>
    );
  }
  return <span className="rmt-way-chip rmt-way-chip-request" aria-hidden="true"><b>Request money</b><small>Delivered</small></span>;
}

function TrustIcon({ index }: { index: number }) {
  const art = [
    <g key="t"><rect x="54" y="24" width="40" height="30" rx="3" fill="#f6b26b" /><path d="M54 26l20 15 20-15" fill="none" stroke="#e8613a" strokeWidth="2.5" /><path d="M20 82c0-12 10-20 24-20h22l10-12h12l-6 14 10 18H20z" fill="#e8613a" /><path d="M76 50l8 28" stroke="#2c415a" strokeWidth="4" strokeLinecap="round" /><circle cx="34" cy="90" r="11" fill="#2c415a" /><circle cx="34" cy="90" r="4" fill="#fff" /><circle cx="90" cy="90" r="11" fill="#2c415a" /><circle cx="90" cy="90" r="4" fill="#fff" /><path d="M14 104h92" stroke="#d9d4cc" strokeWidth="3" strokeLinecap="round" /></g>,
    <g key="v"><circle cx="60" cy="38" r="26" fill="#f6a623" /><circle cx="60" cy="38" r="17" fill="none" stroke="#fde9b8" strokeWidth="4" /><path d="M36 60c-6 10-10 22-10 50h68c0-28-4-40-10-50" fill="#e8613a" /><circle cx="60" cy="78" r="10" fill="#2c415a" /><path d="M44 110c0-14 7-22 16-22s16 8 16 22z" fill="#2c415a" /><path d="M96 12l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f6a623" /></g>,
    <g key="d"><circle cx="60" cy="60" r="48" fill="#3e5a78" /><path d="M24 64l76-34-26 66-14-24z" fill="#cfe3f3" /><path d="M60 72l14-26" stroke="#3e5a78" strokeWidth="3" /><path d="M14 84l20-10M18 96l22-12M30 104l18-10" stroke="#fff" strokeWidth="4" strokeLinecap="round" /></g>,
  ];
  return <svg className="rmt-trust-icon" viewBox="0 0 120 120" width="130" height="130" aria-hidden="true">{art[index % 3]}</svg>;
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
      <figcaption>Scan the code with your phone to get the app</figcaption>
    </figure>
  );
}

/** Remitly's shield mark, cut from the logo (public/example/remitly-mark*.svg). */
function ShieldMark({ light = true }: { light?: boolean }) {
  return <img className="rmt-mark" src={light ? "/example/remitly-mark-white.svg" : "/example/remitly-mark.svg"} alt="" width={32} height={32} />;
}

function Flag({ kind }: { kind: "us" | "mx" | "gb" | "ph" }) {
  if (kind === "gb") return (
    <svg className="rmt-flag" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><clipPath id="rmt-flag-gb"><circle cx="10" cy="10" r="10" /></clipPath><g clipPath="url(#rmt-flag-gb)"><rect width="20" height="20" fill="#012169" /><path d="M0 0l20 20M20 0L0 20" stroke="#fff" strokeWidth="4" /><path d="M0 0l20 20M20 0L0 20" stroke="#c8102e" strokeWidth="1.5" /><path d="M10 0v20M0 10h20" stroke="#fff" strokeWidth="6" /><path d="M10 0v20M0 10h20" stroke="#c8102e" strokeWidth="3.4" /></g></svg>
  );
  if (kind === "ph") return (
    <svg className="rmt-flag" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><clipPath id="rmt-flag-ph"><circle cx="10" cy="10" r="10" /></clipPath><g clipPath="url(#rmt-flag-ph)"><rect width="20" height="10" fill="#0038a8" /><rect y="10" width="20" height="10" fill="#ce1126" /><path d="M0 0l10 10L0 20z" fill="#fff" /><circle cx="3.6" cy="10" r="1.4" fill="#fcd116" /></g></svg>
  );
  return kind === "us" ? (
    <svg className="rmt-flag" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><clipPath id="rmt-flag-us"><circle cx="10" cy="10" r="10" /></clipPath><g clipPath="url(#rmt-flag-us)"><rect width="20" height="20" fill="#fff" />{[0, 4, 8, 12, 16].map((y) => <rect key={y} y={y} width="20" height="2" fill="#c8102e" />)}<rect width="10" height="10" fill="#1f3a93" /></g></svg>
  ) : (
    <svg className="rmt-flag" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><clipPath id="rmt-flag-mx"><circle cx="10" cy="10" r="10" /></clipPath><g clipPath="url(#rmt-flag-mx)"><rect width="7" height="20" fill="#006847" /><rect x="7" width="6" height="20" fill="#fff" /><rect x="13" width="7" height="20" fill="#ce1126" /><circle cx="10" cy="10" r="1.8" fill="#8c5a2b" /></g></svg>
  );
}

function StatusIcons() {
  return <svg className="rmt-phone-icons" viewBox="0 0 36 10" aria-hidden="true"><path d="M1 4.5a8 8 0 0 1 10 0L6 9.5z" fill="currentColor" /><path d="M15 9.5h8v-8z" fill="currentColor" /><rect x="27" y="1" width="5" height="8.5" rx="1" fill="currentColor" /></svg>;
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

/** Splits the app section's rich text into the two rating lines (bold label, then the rest) and the note. */
function appParts(document: unknown): { ratings: { label: string; rest: string }[]; note?: string } {
  const out: { ratings: { label: string; rest: string }[]; note?: string } = { ratings: [] };
  if (!document || typeof document !== "object" || (document as Document).nodeType !== "document") return out;
  for (const node of (document as Document).content as Block[]) {
    if (node.nodeType !== "paragraph") continue;
    const runs = node.content as Text[];
    const bold = runs.find((r) => r.nodeType === "text" && r.marks?.some((m) => m.type === "bold"));
    if (bold && out.ratings.length < 2) out.ratings.push({ label: bold.value.trim(), rest: plainText(node).replace(bold.value, "").trim() });
    else out.note = plainText(node).trim();
  }
  return out;
}

/** Reads the countries section: lead paragraph, the linked list items, and the closing "View more" link. */
function countryParts(document: unknown): { lead?: string; countries: { name: string; href: string }[]; more?: { name: string; href: string } } {
  const out: { lead?: string; countries: { name: string; href: string }[]; more?: { name: string; href: string } } = { countries: [] };
  if (!document || typeof document !== "object" || (document as Document).nodeType !== "document") return out;
  const firstLink = (node: RichNode): { name: string; href: string } | undefined => {
    if (node.nodeType === "hyperlink") return { name: plainText(node).trim(), href: safeUrl((node as Inline).data.uri as string) };
    for (const child of ((node as Block).content ?? []) as RichNode[]) { const found = firstLink(child); if (found) return found; }
    return undefined;
  };
  for (const node of (document as Document).content as Block[]) {
    if (node.nodeType === "unordered-list") {
      for (const item of node.content as Block[]) { const link = firstLink(item); if (link) out.countries.push(link); }
    } else if (node.nodeType === "paragraph") {
      const link = firstLink(node);
      if (link && out.countries.length) out.more = link;
      else if (!out.lead) out.lead = plainText(node).trim();
    }
  }
  return out;
}

/** Simplified round flags for the countries in the list (horizontal or vertical bands, plus a detail). */
const FLAGS: Record<string, { dir: "h" | "v"; bands: string[]; extra?: ReactNode }> = {
  Albania: { dir: "h", bands: ["#e41e20"], extra: <path d="M7 6l3 3 3-3v5l-3 4-3-4z" fill="#000" /> },
  Algeria: { dir: "v", bands: ["#006233", "#fff"], extra: <circle cx="10" cy="10" r="3.2" fill="none" stroke="#d21034" strokeWidth="1.6" /> },
  Andorra: { dir: "v", bands: ["#10069f", "#fedf00", "#d50032"] },
  Angola: { dir: "h", bands: ["#cc092f", "#000"], extra: <circle cx="10" cy="10" r="2.6" fill="none" stroke="#ffcb00" strokeWidth="1.2" /> },
  Anguilla: { dir: "h", bands: ["#00247d"], extra: <circle cx="13" cy="10" r="3" fill="#fff" /> },
  "Antigua and Barbuda": { dir: "h", bands: ["#000", "#0072c6", "#fff"], extra: <path d="M0 0l10 20L20 0v20H0z" fill="#ce1126" /> },
  Argentina: { dir: "h", bands: ["#74acdf", "#fff", "#74acdf"], extra: <circle cx="10" cy="10" r="1.8" fill="#f6b40e" /> },
  Armenia: { dir: "h", bands: ["#d90012", "#0033a0", "#f2a800"] },
  Australia: { dir: "h", bands: ["#012169"], extra: <><circle cx="14" cy="6" r="1.2" fill="#fff" /><circle cx="15" cy="13" r="1.2" fill="#fff" /><circle cx="6" cy="14" r="1.6" fill="#fff" /></> },
  Austria: { dir: "h", bands: ["#c8102e", "#fff", "#c8102e"] },
  Azerbaijan: { dir: "h", bands: ["#0092bc", "#e4002b", "#00af66"] },
  Bahamas: { dir: "h", bands: ["#00abc9", "#fae042", "#00abc9"], extra: <path d="M0 0l9 10-9 10z" fill="#000" /> },
};

function CountryFlag({ name }: { name: string }) {
  const flag = FLAGS[name] ?? { dir: "h" as const, bands: ["#b2c8e9", "#2c415a"] };
  const n = flag.bands.length;
  const id = `rmt-cf-${name.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <svg className="rmt-flag rmt-country-flag" viewBox="0 0 20 20" width="24" height="24" aria-hidden="true">
      <clipPath id={id}><circle cx="10" cy="10" r="10" /></clipPath>
      <g clipPath={`url(#${id})`}>
        {flag.bands.map((color, i) => flag.dir === "h"
          ? <rect key={i} x="0" y={(20 / n) * i} width="20" height={20 / n + 0.2} fill={color} />
          : <rect key={i} x={(20 / n) * i} y="0" width={20 / n + 0.2} height="20" fill={color} />)}
        {flag.extra}
      </g>
      <circle cx="10" cy="10" r="9.5" fill="none" stroke="rgb(0 0 0 / 0.12)" />
    </svg>
  );
}

/** Transfer routes drawn over the map image, from the United States to popular destinations. */
function MapRoutes() {
  const from: [number, number] = [205, 175];
  const to: [number, number][] = [[240, 270], [270, 300], [330, 390], [640, 330], [890, 290], [1065, 300], [700, 160], [760, 140]];
  return (
    <svg className="rmt-map-routes" viewBox="0 0 1280 655" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {to.map(([x, y], i) => {
        const cx = (from[0] + x) / 2; const cy = Math.min(from[1], y) - 60 - i * 6;
        return <path key={i} d={`M${from[0]} ${from[1]} Q${cx} ${cy} ${x} ${y}`} fill="none" stroke="#2c415a" strokeOpacity="0.55" strokeWidth="2" />;
      })}
      {[from, ...to].map(([x, y], i) => <circle key={`d${i}`} cx={x} cy={y} r={i === 0 ? 7 : 5} fill="#2c415a" />)}
    </svg>
  );
}

function SocialIcon({ name }: { name: (typeof SOCIAL)[number] }) {
  const paths: Record<(typeof SOCIAL)[number], ReactNode> = {
    Facebook: <><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="M13.4 20v-6.4h2.2l.3-2.6h-2.5V9.4c0-.8.2-1.3 1.3-1.3H16V5.8c-.2 0-1.1-.1-2-.1-2 0-3.3 1.2-3.3 3.4V11H8.4v2.6h2.3V20z" fill="#16273c" /></>,
    X: <path d="M3 3h5l4.3 6L17.5 3H20l-6.5 7.6L21 21h-5l-4.7-6.4L5.8 21H3.3l6.9-8z" fill="currentColor" />,
    Instagram: <><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" /></>,
    LinkedIn: <><rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" /><path d="M7 10v7M7 7v.1M11 17v-7M11 13c0-2 1-3 2.5-3S16 11 16 13v4" stroke="#16273c" strokeWidth="2" strokeLinecap="round" fill="none" /></>,
    YouTube: <><rect x="1.5" y="5" width="21" height="14" rx="4" fill="currentColor" /><path d="M10 9v6l5-3z" fill="#16273c" /></>,
    TikTok: <path d="M14 3h3c.2 2 1.6 3.4 3.5 3.6v3c-1.3 0-2.5-.4-3.5-1v6.4A5 5 0 1 1 12 10v3a2 2 0 1 0 2 2z" fill="currentColor" />,
  };
  return <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">{paths[name]}</svg>;
}
