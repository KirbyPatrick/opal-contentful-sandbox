import type { Block, Document, Inline, Text } from "@contentful/rich-text-types";
import type { Metadata } from "next";
import { DraftBanner } from "@/components/site/chrome";
import { Img } from "@/components/site/primitives";
import { PLACEHOLDER_BRAND_SLUG } from "@/lib/site/contentful";
import { text, type BrandGraph } from "@/lib/site/graph";
import { isPreview, loadBrand, nonce } from "@/lib/site/load";
import type { SiteEntry } from "@/lib/site/types";
import { Carousel } from "./carousel";

export const metadata: Metadata = {
  title: "Give up gutter cleaning for good | Leafguard",
  robots: { index: false, follow: false },
};

const SITE = "https://leafguard.homes/";
/** The call-tracking number the prospect's page showed at 1440px wide on 2026-11-23. */
const PHONE = "(866) 822 - 7228";
/** The prospect's page fills these from the visitor's location; the demo shows what it showed during capture. */
const LOCATION = "Dripping Springs, TX";
const ZIP = "78620";
/** The phone-width hero photo, from the brand's image pool (assets/prospects/placeholder). */
const MOBILE_HERO = "img-placeholder-13";
/** Optimizely Web Experimentation snippet for the demo project. src/proxy.ts allows it on this page. */
const OPTIMIZELY_SNIPPET = "https://cdn.optimizely.com/js/6231585842790400.js";

/**
 * The Placeholder page: a second sandbox for recreating a prospect's page during a demo, separate from
 * /example. Its copy lives in the Placeholder brand (seed/brands/placeholder.ts) so Opal can edit it,
 * including as an unpublished draft; this file only draws the layout. With no content, the page stays blank.
 *
 * It currently recreates a gutter company's home page. Stable IDs for experiments: #call-banner, #call-cta,
 * #hero-banner, #hero-headline, #hero-subhead, #hero-form, #hero-cta, #promise, #warranty, #worries,
 * #testimonials, #why-choose, #estimate-band, #estimate-cta, #comparison, #faq, #closing-offer and #offer-cta.
 */
export default async function PlaceholderPage() {
  const [g, preview, scriptNonce] = await Promise.all([loadBrand(PLACEHOLDER_BRAND_SLUG), isPreview(), nonce()]);
  const page = g?.homePage;
  if (!g || !page) {
    return (
      <main id="main" className="example-page">
        <h1 className="sr-only">Leafguard</h1>
      </main>
    );
  }
  const hero = g.entry(page.fields.hero);
  const sections = g.entries(page.fields.sections);

  // A media block is drawn together with the stats or icon grid right after it, as on the source page.
  const blocks: { main: SiteEntry; extra?: SiteEntry }[] = [];
  for (let i = 0; i < sections.length; i++) {
    const entry = sections[i]!;
    const next = sections[i + 1];
    const pairs = entry.type === "mediaText" && next && (next.type === "stats" || (next.type === "cardGrid" && next.fields.layout === "icons"));
    blocks.push({ main: entry, extra: pairs ? next : undefined });
    if (pairs) i++;
  }

  return (
    <div className="lgd">
      {/* Loaded synchronously and first, as Optimizely recommends, so variations apply before the page paints. */}
      <script src={OPTIMIZELY_SNIPPET} nonce={scriptNonce} />
      {preview && <DraftBanner />}
      <Header g={g} />
      <main id="main">
        <Hero g={g} hero={hero} />
        {blocks.map(({ main, extra }) => <Section key={main.id} g={g} entry={main} extra={extra} />)}
      </main>
      <Footer g={g} />
    </div>
  );
}

// ---------- Header and hero ----------

function Header({ g }: { g: BrandGraph }) {
  const promo = text(g.brand, "promoBarText");
  return (
    <header className="lgd-header">
      <div className="lgd-wrap lgd-topbar">
        <a className="lgd-logo" href={SITE}><Img asset={g.asset(g.brand.fields.logo)} sizes="200px" priority /></a>
        <span className="lgd-location"><PinIcon />{LOCATION}</span>
      </div>
      <div id="call-banner" className="lgd-call">
        <div className="lgd-wrap lgd-call-row">
          {promo && <p className="lgd-call-text">{promo}</p>}
          <a id="call-cta" className="lgd-call-btn" href={`tel:${PHONE.replace(/\D/g, "")}`}>{PHONE}</a>
        </div>
      </div>
    </header>
  );
}

function Hero({ g, hero }: { g: BrandGraph; hero?: SiteEntry }) {
  const cta = g.entry(hero?.fields.cta);
  return (
    <section id="hero-banner" className="lgd-hero">
      <div className="lgd-hero-bg" aria-hidden="true">
        <Img asset={g.asset(hero?.fields.image)} sizes="100vw" priority decorative className="lgd-hero-wide" />
        {/* Like the source page, phones get a different photo (a house front) when the image pool has one. */}
        {g.asset({ sys: { id: MOBILE_HERO } }) && <Img asset={g.asset({ sys: { id: MOBILE_HERO } })} sizes="100vw" decorative className="lgd-hero-narrow" />}
      </div>
      <div className="lgd-wrap lgd-hero-grid">
        <div className="lgd-hero-copy">
          <h1 id="hero-headline">{text(hero, "headline")}</h1>
          {text(hero, "subheadline") && <p id="hero-subhead">{text(hero, "subheadline")}</p>}
        </div>
        {cta && (
          <div id="hero-form" className="lgd-estimate-box">
            {text(cta, "heading") && <h2>{text(cta, "heading")}</h2>}
            {text(cta, "body") && <p className="lgd-estimate-offer">{text(cta, "body")}</p>}
            <div className="lgd-question">
              <label htmlFor="lgd-hero-zip">Enter details in under 2 Minutes</label>
              <input id="lgd-hero-zip" name="zip" defaultValue={ZIP} inputMode="numeric" maxLength={5} autoComplete="postal-code" />
              <a id="hero-cta" className="lgd-btn lgd-btn-big" href={safeUrl(text(cta, "destinationUrl"))}>{text(cta, "label")}<ArrowCircle /></a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- Sections ----------

function Section({ g, entry, extra }: { g: BrandGraph; entry: SiteEntry; extra?: SiteEntry }) {
  switch (entry.id) {
    case "ph-cg-promise": return <OurPromise g={g} entry={entry} />;
    case "ph-mt-warranty": return <Warranty g={g} entry={entry} stats={extra} />;
    case "ph-cg-worries": return <Worries g={g} entry={entry} />;
    case "ph-rt-reviews": return <Reviews entry={entry} />;
    case "ph-mt-why": return <Why g={g} entry={entry} features={extra} />;
    case "ph-mt-estimate": return <EstimateBand g={g} entry={entry} />;
    case "ph-rt-compare": return <Comparison g={g} entry={entry} />;
    case "ph-fq-faq": return <Faq g={g} entry={entry} />;
    case "ph-ct-offer": return <ClosingOffer entry={entry} />;
  }
  return null;
}

function OurPromise({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  return (
    <section id="promise" className="lgd-section lgd-promise">
      <div className="lgd-wrap">
        <h2 className="lgd-h2">{text(entry, "heading")}</h2>
        {text(entry, "intro") && <p className="lgd-lead">{text(entry, "intro")}</p>}
        <ul className="lgd-promise-grid">
          {g.entries(entry.fields.items).map((item) => (
            <li key={item.id}>
              <div className="lgd-promise-card">
                <Img asset={g.asset(item.fields.image)} sizes="(min-width: 768px) 393px, 100vw" />
                <h3>{text(item, "title")}</h3>
              </div>
              {text(item, "text") && <p>{text(item, "text")}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Warranty({ g, entry, stats }: { g: BrandGraph; entry: SiteEntry; stats?: SiteEntry }) {
  return (
    <section id="warranty" className="lgd-warranty">
      <div className="lgd-wrap lgd-warranty-grid">
        <div className="lgd-warranty-badge"><Img asset={g.asset(entry.fields.image)} sizes="300px" /></div>
        <div>
          <h2 className="lgd-h3">{text(entry, "heading")}</h2>
          {paragraphs(text(entry, "body")).map((p, i) => <p key={i} className="lgd-warranty-text">{p}</p>)}
          {stats && (
            <ul className="lgd-stats">
              {g.entries(stats.fields.items).map((item) => (
                <li key={item.id}><span className="lgd-stat-value">{text(item, "value")}</span><span className="lgd-stat-label">{text(item, "title")}</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Worries({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  return (
    <section id="worries" className="lgd-section lgd-worries">
      <div className="lgd-wrap">
        <h2 className="lgd-h2">{text(entry, "heading")}</h2>
        <ul className="lgd-worry-grid">
          {g.entries(entry.fields.items).map((item) => (
            <li key={item.id}>
              <Img asset={g.asset(item.fields.image)} sizes="(min-width: 768px) 216px, 100vw" />
              <p>{text(item, "title")}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Reviews({ entry }: { entry: SiteEntry }) {
  const { lead, note, cards } = reviewParts(entry.fields.body);
  return (
    <section id="testimonials" className="lgd-reviews">
      <div className="lgd-wrap">
        <h2 className="lgd-h2 lgd-left">{text(entry, "heading")}</h2>
        {lead && <p className="lgd-lead lgd-left">{lead}</p>}
        <Carousel label="Customer reviews" count={cards.length}>
          {cards.map((card) => (
            <li key={card.name} className="lgd-review">
              <span className="lgd-stars" role="img" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, i) => <StarIcon key={i} />)}</span>
              <p className="lgd-quote">{card.quote}</p>
              <p className="lgd-reviewer"><strong>{card.name}</strong><span>{card.place}</span></p>
            </li>
          ))}
        </Carousel>
        {note && <p className="lgd-review-note">{note}</p>}
      </div>
    </section>
  );
}

function Why({ g, entry, features }: { g: BrandGraph; entry: SiteEntry; features?: SiteEntry }) {
  return (
    <section id="why-choose" className="lgd-why">
      <div className="lgd-wrap lgd-why-grid">
        <div className="lgd-why-photo"><Img asset={g.asset(entry.fields.image)} sizes="(min-width: 768px) 600px, 100vw" /></div>
        <div className="lgd-why-copy">
          <h2 className="lgd-h2 lgd-left">{text(entry, "heading")}</h2>
          {paragraphs(text(entry, "body")).map((p, i) => <p key={i} className="lgd-why-text">{p}</p>)}
          {features && (
            <ul className="lgd-features">
              {g.entries(features.fields.items).map((item) => (
                <li key={item.id}><h3>{text(item, "title")}</h3><p>{text(item, "text")}</p></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function EstimateBand({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const cta = g.entry(entry.fields.cta);
  return (
    <section id="estimate-band" className="lgd-band">
      <div className="lgd-band-bg" aria-hidden="true"><Img asset={g.asset(entry.fields.image)} sizes="100vw" decorative /></div>
      <div className="lgd-wrap lgd-band-copy">
        <h2 className="lgd-h3">{text(entry, "heading")}</h2>
        {paragraphs(text(entry, "body")).map((p, i) => <p key={i}>{p}</p>)}
        <ZipRow id="estimate-cta" cta={cta} inputId="lgd-band-zip" />
      </div>
    </section>
  );
}

function Comparison({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  const rows = listItems(entry.fields.body);
  return (
    <section id="comparison" className="lgd-compare-section">
      <div className="lgd-wrap">
        <div className="lgd-compare">
          <h2 className="lgd-h3">{text(entry, "heading")}</h2>
          <table>
            <thead>
              <tr>
                <th scope="col" className="lgd-benefit-head">Benefit</th>
                <th scope="col"><Img asset={g.asset({ sys: { id: "img-placeholder-logo-white" } })} sizes="198px" className="lgd-compare-logo" /><span className="sr-only">Leafguard</span></th>
                <th scope="col" className="lgd-others">Others</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row}>
                  <th scope="row">{row}</th>
                  <td><CheckIcon /><span className="sr-only">Yes</span></td>
                  <td><CrossIcon /><span className="sr-only">No</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Faq({ g, entry }: { g: BrandGraph; entry: SiteEntry }) {
  return (
    <section id="faq" className="lgd-section lgd-faq">
      <div className="lgd-wrap">
        <h2 className="lgd-h2">{text(entry, "heading")}</h2>
        <p className="lgd-lead lgd-faq-lead">Find some answers to common questions homeowners have below. If you need more help, call us today!</p>
        <div className="lgd-faq-list">
          {g.entries(entry.fields.items).map((item) => (
            <details key={item.id}>
              <summary><span>{text(item, "title")}</span><ChevronIcon /></summary>
              <p>{text(item, "text")}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingOffer({ entry }: { entry: SiteEntry }) {
  return (
    <section id="closing-offer" className="lgd-section lgd-offer">
      <div className="lgd-wrap">
        {text(entry, "body") && <p className="lgd-offer-kicker">{text(entry, "body")}</p>}
        <h2 className="lgd-h2">{text(entry, "heading")}</h2>
        <ZipRow id="offer-cta" cta={entry} inputId="lgd-offer-zip" centered />
      </div>
    </section>
  );
}

function ZipRow({ id, cta, inputId, centered = false }: { id: string; cta?: SiteEntry; inputId: string; centered?: boolean }) {
  return (
    <div className={`lgd-zip-row${centered ? " lgd-zip-center" : ""}`}>
      <label htmlFor={inputId} className="sr-only">Zip code</label>
      <input id={inputId} name="zip" defaultValue={ZIP} inputMode="numeric" maxLength={5} autoComplete="postal-code" />
      <a id={id} className="lgd-btn" href={safeUrl(text(cta, "destinationUrl"))}>{text(cta, "label") ?? "Get Prices"}<ArrowCircle /></a>
    </div>
  );
}

// ---------- Footer ----------

function Footer({ g }: { g: BrandGraph }) {
  return (
    <footer className="lgd-footer">
      <div className="lgd-wrap">
        <div className="lgd-footer-top">
          <div>
            <Img asset={g.asset({ sys: { id: "img-placeholder-logo-white" } })} sizes="235px" className="lgd-footer-logo" />
            <p className="lgd-credit">&copy; 2026 Leafguard. All rights reserved.</p>
          </div>
          <nav className="lgd-legal" aria-label="Legal">
            <a href={`${SITE}privacy-policy`}>Privacy Policy</a>
            <a href={`${SITE}terms-of-service`}>Terms of Service</a>
            <a href={`${SITE}ccpa`}>CCPA</a>
            <a href={`${SITE}contact-us`}>Contact Us</a>
          </nav>
        </div>
        <p className="lgd-fine">* Offer excludes the cost of materials and is open to homeowners 18 and older. Employees of Leafguard and affiliated companies, their immediate families, anyone who had an in-home consultation in the past 12 months, and current or former customers are not eligible. Past or future purchases do not qualify for a discount or price adjustment, and sales tax is not discounted. Cannot be combined with any other offer and has no cash value. Leafguard may end the promotion at any time without notice. Offer valid until 11/30/2026.</p>
        <p className="lgd-fine lgd-licenses">State contractor license numbers are listed here on the live site.</p>
        {text(g.brand, "legalDisclaimer") && <p className="lgd-fine lgd-demo-note">{text(g.brand, "legalDisclaimer")}</p>}
      </div>
    </footer>
  );
}

// ---------- Icons ----------

function PinIcon() {
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor" /></svg>;
}
function ArrowCircle() {
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M10.5 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function StarIcon() {
  return <svg viewBox="0 0 24 23" width="24" height="23" aria-hidden="true"><path d="M12 0l3.1 7.6 8.2.6-6.3 5.3 2 8-7-4.4-7 4.4 2-8L.7 8.2l8.2-.6z" fill="currentColor" /></svg>;
}
function ChevronIcon() {
  return <svg className="lgd-chev" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 34 34" width="34" height="34" aria-hidden="true"><path d="M3 18l9 9L31 8" fill="none" stroke="#1fa76f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CrossIcon() {
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M3.5 3.5l17 17M20.5 3.5l-17 17" stroke="#f03a2e" strokeWidth="3.2" strokeLinecap="round" /></svg>;
}

// ---------- Helpers ----------

/** Absolute http(s) URLs pass through; anything else goes to the prospect's home page. */
const safeUrl = (url: string | undefined) => (url && /^https?:\/\//i.test(url) ? url : SITE);

const paragraphs = (value: string | undefined) => (value ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

type RichNode = Block | Inline | Text;
const plainText = (node: RichNode): string => (node.nodeType === "text" ? (node as Text).value : ((node as Block).content ?? []).map((child) => plainText(child as RichNode)).join(""));
const blocksOf = (document: unknown): Block[] =>
  document && typeof document === "object" && (document as Document).nodeType === "document" ? ((document as Document).content as Block[]) : [];
const isItalic = (node: Block) => {
  const runs = (node.content ?? []).filter((n) => n.nodeType === "text" && (n as Text).value.trim()) as Text[];
  return runs.length > 0 && runs.every((run) => run.marks?.some((mark) => mark.type === "italic"));
};

/** Every list item in a rich text field, as plain text. */
function listItems(document: unknown): string[] {
  return blocksOf(document)
    .filter((n) => n.nodeType === "unordered-list" || n.nodeType === "ordered-list")
    .flatMap((list) => (list.content as Block[]).map((item) => plainText(item).trim()))
    .filter(Boolean);
}

/** The testimonials field: the lead, an italic demo note, and one card per level 3 heading (name, quote, place). */
function reviewParts(document: unknown): { lead?: string; note?: string; cards: { name: string; quote: string; place: string }[] } {
  const out: { lead?: string; note?: string; cards: { name: string; quote: string; place: string }[] } = { cards: [] };
  let current: { name: string; lines: string[] } | undefined;
  const flush = () => {
    if (current?.name) out.cards.push({ name: current.name, quote: current.lines[0] ?? "", place: current.lines.slice(1).join(" ") });
  };
  for (const node of blocksOf(document)) {
    if (node.nodeType === "heading-3") {
      flush();
      current = { name: plainText(node).trim(), lines: [] };
    } else if (node.nodeType === "paragraph") {
      const value = plainText(node).trim();
      if (!value) continue;
      if (current) current.lines.push(value);
      else if (isItalic(node)) out.note = value;
      else out.lead ??= value;
    }
  }
  flush();
  return out;
}
