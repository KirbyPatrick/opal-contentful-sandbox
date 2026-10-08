import Link from "next/link";
import { list, num, text } from "@/lib/site/graph";
import type { SiteEntry } from "@/lib/site/types";
import { CartSummary } from "./cart";
import { MockForm, type FormKind, type FormOptions, type Option } from "./mock-form";
import { Avatar, CtaButton, Img, Paragraphs, RichText, Section, type RenderContext } from "./primitives";

export interface BlockContext extends RenderContext {
  /** Query values that may prefill goal forms (already limited to known keys). */
  prefill: Record<string, string>;
}

// ---------- Hero ----------

export function Hero({ hero, ctx }: { hero: SiteEntry | undefined; ctx: BlockContext }) {
  if (!hero) return null;
  const layout = text(hero, "layout") ?? "split";
  const image = ctx.g.asset(hero.fields.image);
  return (
    <section className={`hero hero-${layout}`} data-block="hero" data-entry-id={hero.id}>
      {layout === "full_bleed" && <Img asset={image} className="hero-bg" priority />}
      <div className="container hero-inner">
        <div className="hero-copy">
          {text(hero, "eyebrow") && <p className="eyebrow">{text(hero, "eyebrow")}</p>}
          <h1>{text(hero, "headline")}</h1>
          {text(hero, "subheadline") && <p className="lede">{text(hero, "subheadline")}</p>}
          <div className="actions">
            <CtaButton cta={ctx.g.entry(hero.fields.cta)} ctx={ctx} />
            <CtaButton cta={ctx.g.entry(hero.fields.secondaryCta)} ctx={ctx} fallbackStyle="secondary" />
          </div>
        </div>
        {layout === "split" && <div className="hero-media"><Img asset={image} sizes="(min-width: 900px) 50vw, 100vw" priority /></div>}
      </div>
    </section>
  );
}

/** Hero for detail views, built from the item's own fields. */
export function DetailHero({ eyebrow, title, summary, image, children, crumbs }: {
  eyebrow?: string; title: string; summary?: string; image?: Parameters<typeof Img>[0]["asset"];
  children?: React.ReactNode; crumbs?: Array<{ label: string; href?: string }>;
}) {
  return (
    <section className="hero hero-split hero-detail" data-block="detail-hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          {crumbs && crumbs.length > 0 && (
            <nav className="crumbs" aria-label="Breadcrumb">
              {crumbs.map((crumb, i) => (
                <span key={i}>{crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}</span>
              ))}
            </nav>
          )}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {summary && <p className="lede">{summary}</p>}
          {children}
        </div>
        {image !== null && <div className="hero-media"><Img asset={image} sizes="(min-width: 900px) 50vw, 100vw" priority /></div>}
      </div>
    </section>
  );
}

// ---------- Sections ----------

export function Sections({ entries, ctx }: { entries: SiteEntry[]; ctx: BlockContext }) {
  return <>{entries.map((entry) => <Block key={entry.id} entry={entry} ctx={ctx} />)}</>;
}

function Block({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  switch (entry.type) {
    case "richTextSection": return <RichTextBlock entry={entry} />;
    case "mediaText": return <MediaText entry={entry} ctx={ctx} />;
    case "cardGrid": return <CardGrid entry={entry} ctx={ctx} />;
    case "cta": return <CtaBand entry={entry} ctx={ctx} />;
    case "faq": return <Faq entry={entry} ctx={ctx} />;
    case "testimonial": return <Testimonial entry={entry} ctx={ctx} />;
    case "stats": return <Stats entry={entry} ctx={ctx} />;
    case "comparisonTable": return <ComparisonTable entry={entry} ctx={ctx} />;
    case "form": return <FormBlock entry={entry} ctx={ctx} />;
    case "logoStrip": return <LogoStrip entry={entry} ctx={ctx} />;
    default: return null;
  }
}

function RichTextBlock({ entry }: { entry: SiteEntry }) {
  return (
    <Section className="block-rich-text">
      <div className="narrow">
        {text(entry, "heading") && <h2>{text(entry, "heading")}</h2>}
        <RichText document={entry.fields.body} />
      </div>
    </Section>
  );
}

function MediaText({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  const left = entry.fields.imagePosition === "left";
  return (
    <Section className={`media-text ${left ? "media-left" : ""}`}>
      <div className="media-text-grid">
        <div className="media-text-image"><Img asset={ctx.g.asset(entry.fields.image)} sizes="(min-width: 900px) 50vw, 100vw" /></div>
        <div className="media-text-copy">
          {text(entry, "eyebrow") && <p className="eyebrow">{text(entry, "eyebrow")}</p>}
          <h2>{text(entry, "heading")}</h2>
          <Paragraphs value={text(entry, "body")} />
          <div className="actions"><CtaButton cta={ctx.g.entry(entry.fields.cta)} ctx={ctx} fallbackStyle="secondary" /></div>
        </div>
      </div>
    </Section>
  );
}

function CtaBand({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  return (
    <Section className="cta-band" tone="brand">
      <div className="cta-band-inner">
        <div>
          {text(entry, "heading") && <h2>{text(entry, "heading")}</h2>}
          {text(entry, "body") && <p>{text(entry, "body")}</p>}
        </div>
        <CtaButton cta={entry} ctx={ctx} />
      </div>
    </Section>
  );
}

function Faq({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  const items = ctx.g.entries(entry.fields.items);
  return (
    <Section className="faq">
      <div className="narrow">
        {text(entry, "heading") && <h2>{text(entry, "heading")}</h2>}
        <div className="faq-list">
          {items.map((item) => (
            <details key={item.id} className="faq-item">
              <summary>{text(item, "title")}</summary>
              <Paragraphs value={text(item, "text")} />
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Testimonial({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  const person = ctx.g.entry(entry.fields.person);
  const rating = num(entry, "rating");
  const role = [text(person, "jobTitle"), text(person, "organization")].filter(Boolean).join(", ");
  return (
    <Section className="testimonial" tone="surface">
      <figure className="testimonial-inner">
        {rating && <p className="stars" aria-label={`${rating} out of 5`}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</p>}
        <blockquote><p>{`“${text(entry, "quote") ?? ""}”`}</p></blockquote>
        {person && (
          <figcaption>
            <Avatar name={text(person, "name") ?? ""} asset={ctx.g.asset(person.fields.photo)} />
            <span><strong>{text(person, "name")}</strong>{role && <span className="muted">{role}</span>}</span>
          </figcaption>
        )}
      </figure>
    </Section>
  );
}

function Stats({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  const items = ctx.g.entries(entry.fields.items);
  return (
    <Section className="stats">
      {text(entry, "heading") && <h2 className="center">{text(entry, "heading")}</h2>}
      <dl className={`stats-grid cols-${Math.min(items.length, 4)}`}>
        {items.map((item) => (
          <div key={item.id} className="stat">
            <dt>{text(item, "title")}</dt>
            <dd>{text(item, "value")}</dd>
          </div>
        ))}
      </dl>
      {text(entry, "footnote") && <p className="footnote center">{text(entry, "footnote")}</p>}
    </Section>
  );
}

function specValue(offering: SiteEntry, label: string): string {
  const spec = list(offering, "specs").find((s) => s.split(":")[0]?.trim().toLowerCase() === label.toLowerCase());
  return spec ? spec.slice(spec.indexOf(":") + 1).trim() : "Not applicable";
}

function ComparisonTable({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  const offerings = ctx.g.entries(entry.fields.offerings);
  const rows = list(entry, "rows");
  return (
    <Section className="comparison">
      {text(entry, "heading") && <h2>{text(entry, "heading")}</h2>}
      {text(entry, "intro") && <p className="lede">{text(entry, "intro")}</p>}
      <div className="table-scroll" role="region" aria-label={text(entry, "heading") ?? "Comparison"} tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Feature</span></th>
              {offerings.map((o) => {
                const href = ctx.g.urlFor(o);
                return <th key={o.id} scope="col">{href ? <Link href={href}>{text(o, "name")}</Link> : text(o, "name")}{text(o, "badge") && <span className="badge">{text(o, "badge")}</span>}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <th scope="row">{row}</th>
                {offerings.map((o) => <td key={o.id}>{specValue(o, row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {text(entry, "footnote") && <p className="footnote">{text(entry, "footnote")}</p>}
    </Section>
  );
}

function LogoStrip({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  const logos = ctx.g.assetList(entry.fields.logos);
  return (
    <Section className="logo-strip">
      {text(entry, "heading") && <p className="eyebrow center">{text(entry, "heading")}</p>}
      <div className="logos">{logos.map((logo) => <Img key={logo.id} asset={logo} sizes="160px" />)}</div>
    </Section>
  );
}

// ---------- Card grids ----------

interface Card { id: string; title: string; text?: string; href?: string; image?: ReturnType<BlockContext["g"]["asset"]>; meta?: string; badge?: string; person?: SiteEntry; entry: SiteEntry }

function toCard(entry: SiteEntry, ctx: BlockContext): Card {
  const g = ctx.g;
  switch (entry.type) {
    case "item": {
      const target = g.entry(entry.fields.link);
      return { id: entry.id, entry, title: text(entry, "title") ?? "", text: text(entry, "text"), href: g.urlFor(target), image: g.asset(entry.fields.image) };
    }
    case "offering":
      return { id: entry.id, entry, title: text(entry, "name") ?? "", text: text(entry, "summary"), href: g.urlFor(entry), image: g.assetList(entry.fields.images)[0], meta: text(entry, "priceLabel"), badge: text(entry, "badge") };
    case "collection":
      return { id: entry.id, entry, title: text(entry, "name") ?? "", text: text(entry, "summary"), href: g.urlFor(entry), image: g.asset(entry.fields.image), meta: text(entry, "eyebrow") };
    case "article":
      return { id: entry.id, entry, title: text(entry, "title") ?? "", text: text(entry, "summary"), href: g.urlFor(entry), image: g.asset(entry.fields.heroImage), meta: formatDate(text(entry, "publishDate")) };
    case "person":
      return { id: entry.id, entry, title: text(entry, "name") ?? "", text: text(entry, "jobTitle"), href: g.urlFor(entry), person: entry, meta: text(entry, "credentials") };
    default:
      return { id: entry.id, entry, title: "" };
  }
}

export function formatDate(value: string | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  return new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function gridEntries(entry: SiteEntry, ctx: BlockContext): SiteEntry[] {
  const source = text(entry, "source");
  const limit = num(entry, "limit");
  let items: SiteEntry[];
  if (source === "collection") items = ctx.g.entries(ctx.g.entry(entry.fields.collection)?.fields.items);
  else if (source === "latest_articles") items = ctx.g.articles().slice(0, limit ?? 3);
  else items = ctx.g.entries(entry.fields.items);
  return limit ? items.slice(0, limit) : items;
}

export function CardGrid({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  const layout = text(entry, "layout") ?? "cards";
  const columns = num(entry, "columns") ?? 3;
  const cards = gridEntries(entry, ctx).map((e) => toCard(e, ctx)).filter((card) => card.title);
  return (
    <Section className={`card-grid layout-${layout}`}>
      {(text(entry, "heading") || text(entry, "intro")) && (
        <div className="section-head">
          {text(entry, "heading") && <h2>{text(entry, "heading")}</h2>}
          {text(entry, "intro") && <p className="lede">{text(entry, "intro")}</p>}
        </div>
      )}
      {cards.length === 0 ? <p className="muted">Nothing here yet.</p> : (
        <ul className={`grid cols-${columns}`}>
          {cards.map((card) => <li key={card.id}><CardView card={card} layout={layout} ctx={ctx} /></li>)}
        </ul>
      )}
      <div className="actions center"><CtaButton cta={ctx.g.entry(entry.fields.cta)} ctx={ctx} fallbackStyle="secondary" /></div>
    </Section>
  );
}

function CardView({ card, layout, ctx }: { card: Card; layout: string; ctx: BlockContext }) {
  const title = card.href ? <Link href={card.href} className="card-link">{card.title}</Link> : card.title;
  if (layout === "icons") {
    return (
      <div className="card card-icon">
        {card.image ? <Img asset={card.image} className="icon" sizes="64px" /> : <span className="icon-dot" aria-hidden="true" />}
        <h3>{title}</h3>
        {card.text && <p>{card.text}</p>}
      </div>
    );
  }
  if (layout === "profiles" || card.person) {
    const person = card.person;
    return (
      <div className="card card-profile">
        <Avatar name={card.title} asset={person ? ctx.g.asset(person.fields.photo) : undefined} />
        <h3>{title}</h3>
        {card.meta && <p className="muted">{card.meta}</p>}
        {card.text && <p>{card.text}</p>}
      </div>
    );
  }
  if (layout === "pricing") {
    const features = list(card.entry, "features");
    return (
      <div className={`card card-pricing ${card.badge ? "is-featured" : ""}`}>
        {card.badge && <span className="badge">{card.badge}</span>}
        <h3>{card.title}</h3>
        {card.meta && <p className="price">{card.meta}</p>}
        {card.text && <p>{card.text}</p>}
        {features.length > 0 && <ul className="checks">{features.map((f) => <li key={f}>{f}</li>)}</ul>}
        {text(card.entry, "finePrint") && <p className="footnote">{text(card.entry, "finePrint")}</p>}
      </div>
    );
  }
  return (
    <div className={`card ${layout === "products" ? "card-product" : ""}`}>
      <div className="card-media">
        <Img asset={card.image} sizes="(min-width: 900px) 33vw, 100vw" />
        {card.badge && <span className="badge">{card.badge}</span>}
      </div>
      <div className="card-body">
        {card.meta && layout !== "products" && <p className="eyebrow">{card.meta}</p>}
        <h3>{title}</h3>
        {layout === "products" && card.meta && <p className="price">{card.meta}</p>}
        {card.text && layout !== "products" && <p>{card.text}</p>}
      </div>
    </div>
  );
}

// ---------- Forms ----------

function optionsFrom(entries: SiteEntry[], labelField = "name"): Option[] {
  return entries.map((e) => ({ value: text(e, "slug") ?? e.id, label: text(e, labelField) ?? e.id }));
}

function formOptions(kind: FormKind, ctx: BlockContext): FormOptions {
  const g = ctx.g;
  const offerings = (type: string) => g.ofType("offering").filter((o) => o.fields.offeringType === type);
  switch (kind) {
    case "book_demo": return { offerings: optionsFrom(offerings("saas_solution")) };
    case "quote_start":
    case "get_quote": return { offerings: optionsFrom(offerings("insurance_coverage")) };
    case "start_application": return { offerings: optionsFrom(offerings("bank_product")) };
    case "request_booking": return { offerings: optionsFrom(offerings("travel_package")) };
    case "book_appointment": {
      const providers = g.ofType("person").filter((p) => p.fields.role === "provider");
      const locations = [...new Set(providers.flatMap((p) => list(p, "locations")))].sort();
      return {
        providers: optionsFrom(providers),
        specialties: optionsFrom(g.ofType("collection").filter((c) => c.fields.collectionType === "specialty")),
        locations: locations.map((l) => ({ value: l.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: l })),
      };
    }
    default: return {};
  }
}

function FormBlock({ entry, ctx }: { entry: SiteEntry; ctx: BlockContext }) {
  const kind = text(entry, "formKind") as FormKind | undefined;
  if (!kind) return null;
  const options = formOptions(kind, ctx);
  // A provider prefill also selects their first specialty and clinic.
  const prefill = { ...ctx.prefill };
  if (kind === "book_appointment" && prefill.provider) {
    const provider = ctx.g.ofType("person").find((p) => p.fields.slug === prefill.provider);
    const specialty = provider && ctx.g.parentsOf(provider)[0];
    if (specialty) prefill.specialty = text(specialty, "slug") ?? "";
    const location = provider && list(provider, "locations")[0];
    if (location) prefill.location = location.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  if (kind === "book_appointment" && prefill.collection) prefill.specialty = prefill.collection;
  const nextHref = kind === "quote_start" ? ctx.g.urlFor(ctx.g.entry(ctx.page?.fields.nextStep)) : undefined;
  return (
    <Section className="form-section">
      <div className="narrow">
        {kind === "checkout" && <CartSummary />}
        <MockForm
          kind={kind}
          options={options}
          prefill={prefill}
          prefillSample={entry.fields.prefillSample === true}
          nextHref={nextHref}
          copy={{
            heading: text(entry, "heading") ?? "",
            intro: text(entry, "intro"),
            submitLabel: text(entry, "submitLabel") ?? "Submit",
            successHeading: text(entry, "successHeading") ?? "Thank you",
            successMessage: text(entry, "successMessage") ?? "This is a demo. Nothing was sent.",
            privacyNote: text(entry, "privacyNote") ?? "Demo only. Nothing you enter is sent or stored.",
          }}
        />
      </div>
    </Section>
  );
}
