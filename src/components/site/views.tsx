import Link from "next/link";
import { list, text } from "@/lib/site/graph";
import { swatchCss } from "@/lib/site/theme";
import type { SiteEntry } from "@/lib/site/types";
import { CardGrid, DetailHero, Hero, Sections, formatDate, type BlockContext } from "./blocks";
import { ProductPurchase } from "./cart";
import { Avatar, CtaButton, Img, Paragraphs, RichText, Section } from "./primitives";

/** A regular page, or a template page's index view. */
export function PageView({ page, ctx }: { page: SiteEntry; ctx: BlockContext }) {
  const sections = ctx.g.entries(page.fields.sections);
  const forms = sections.filter((s) => s.type === "form");
  if (forms.length > 0) {
    // Goal and quote pages put the form above the fold: a short title instead of a full hero.
    const hero = ctx.g.entry(page.fields.hero);
    return (
      <>
        <div className="container narrow form-page-intro" data-block="form-intro" data-entry-id={hero?.id}>
          {text(hero, "eyebrow") && <p className="eyebrow">{text(hero, "eyebrow")}</p>}
          <h1>{text(hero, "headline") ?? text(page, "title")}</h1>
          {text(hero, "subheadline") && <p className="lede">{text(hero, "subheadline")}</p>}
        </div>
        <Sections entries={[...forms, ...sections.filter((s) => s.type !== "form")]} ctx={ctx} />
      </>
    );
  }
  return (
    <>
      <Hero hero={ctx.g.entry(page.fields.hero)} ctx={ctx} />
      {!page.fields.hero && <TitleOnly title={text(page, "title") ?? ""} ctx={ctx} page={page} />}
      <Sections entries={ctx.g.entries(page.fields.sections)} ctx={ctx} />
    </>
  );
}

function TitleOnly({ title, ctx, page }: { title: string; ctx: BlockContext; page: SiteEntry }) {
  return (
    <section className="hero hero-text_only">
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1>{title}</h1>
          <div className="actions"><CtaButton cta={ctx.g.entry(page.fields.primaryCta)} ctx={ctx} /></div>
        </div>
      </div>
    </section>
  );
}

function DetailFooter({ template, ctx }: { template: SiteEntry; ctx: BlockContext }) {
  return <Sections entries={ctx.g.entries(template.fields.detailSections)} ctx={ctx} />;
}

function Specs({ entry }: { entry: SiteEntry }) {
  const specs = list(entry, "specs");
  if (specs.length === 0) return null;
  return (
    <dl className="specs">
      {specs.map((spec) => {
        const at = spec.indexOf(":");
        return (
          <div key={spec}>
            <dt>{at > 0 ? spec.slice(0, at) : spec}</dt>
            <dd>{at > 0 ? spec.slice(at + 1).trim() : ""}</dd>
          </div>
        );
      })}
    </dl>
  );
}

export function OfferingView({ offering, template, ctx, nonce }: { offering: SiteEntry; template: SiteEntry; ctx: BlockContext; nonce?: string }) {
  const g = ctx.g;
  const images = g.assetList(offering.fields.images);
  const isApparel = offering.fields.offeringType === "apparel_product";
  const parents = g.parentsOf(offering);
  const crumbs = [
    { label: text(template, "title") ?? "All", href: g.urlFor(template) },
    ...parents.slice(0, 1).map((p) => ({ label: text(p, "name") ?? "", href: g.urlFor(p) })),
  ];
  const primary = g.entry(template.fields.primaryCta);

  if (isApparel) {
    const colors = list(offering, "colors").map((value, i) => {
      const [name = "", hex = ""] = value.split("|");
      return { name, hex, className: `sw-${offering.id.replace(/[^a-z0-9-]/gi, "").toLowerCase()}-${i}` };
    });
    return (
      <>
        <style nonce={nonce}>{swatchCss(colors)}</style>
        <section className="section product">
          <div className="container product-grid">
            <div className="product-gallery">
              {images.length ? images.map((image, i) => <Img key={image.id} asset={image} sizes="(min-width: 900px) 50vw, 100vw" priority={i === 0} />) : <Img asset={undefined} />}
            </div>
            <div className="product-info">
              <nav className="crumbs" aria-label="Breadcrumb">{crumbs.map((c, i) => <span key={i}>{c.href ? <Link href={c.href}>{c.label}</Link> : c.label}</span>)}</nav>
              {text(offering, "badge") && <span className="badge">{text(offering, "badge")}</span>}
              <h1>{text(offering, "name")}</h1>
              <p className="price">{text(offering, "priceLabel")}</p>
              <p className="lede">{text(offering, "summary")}</p>
              <ProductPurchase productId={offering.id} label={text(primary, "label") ?? "Add to bag"}
                sizes={list(offering, "sizes")} colors={colors.map(({ name, className }) => ({ name, className }))} />
              <div className="product-details">
                <RichText document={offering.fields.description} />
                {list(offering, "features").length > 0 && <ul className="checks">{list(offering, "features").map((f) => <li key={f}>{f}</li>)}</ul>}
                <dl className="specs">
                  {text(offering, "materials") && <div><dt>Materials</dt><dd>{text(offering, "materials")}</dd></div>}
                  {text(offering, "fit") && <div><dt>Fit</dt><dd className="capitalize">{text(offering, "fit")}</dd></div>}
                </dl>
                {g.entry(offering.fields.sizeGuide) && (
                  <details className="size-guide">
                    <summary>Size guide</summary>
                    <RichText document={g.entry(offering.fields.sizeGuide)?.fields.body} />
                  </details>
                )}
              </div>
            </div>
          </div>
        </section>
        <DetailFooter template={template} ctx={ctx} />
      </>
    );
  }

  return (
    <>
      <DetailHero eyebrow={parents[0] ? text(parents[0], "name") : text(offering, "badge")} title={text(offering, "name") ?? ""}
        summary={text(offering, "summary")} image={images[0]} crumbs={crumbs}>
        {text(offering, "priceLabel") && <p className="price">{text(offering, "priceLabel")}</p>}
        <div className="actions"><CtaButton cta={primary} ctx={ctx} /></div>
      </DetailHero>
      <Section className="detail-body">
        <div className="detail-grid">
          <div><RichText document={offering.fields.description} /></div>
          <aside className="detail-aside">
            <Specs entry={offering} />
            {list(offering, "features").length > 0 && (
              <>
                <h2 className="h4">What is included</h2>
                <ul className="checks">{list(offering, "features").map((f) => <li key={f}>{f}</li>)}</ul>
              </>
            )}
            {images[1] && <Img asset={images[1]} sizes="(min-width: 900px) 33vw, 100vw" className="aside-image" />}
            {text(offering, "finePrint") && <p className="footnote">{text(offering, "finePrint")}</p>}
          </aside>
        </div>
      </Section>
      <DetailFooter template={template} ctx={ctx} />
    </>
  );
}

export function CollectionView({ collection, template, ctx }: { collection: SiteEntry; template: SiteEntry; ctx: BlockContext }) {
  const g = ctx.g;
  const items = g.entries(collection.fields.items);
  const grid: SiteEntry = {
    id: `${collection.id}-items`, type: "cardGrid", updatedAt: collection.updatedAt,
    fields: {
      heading: items[0]?.type === "person" ? "Providers" : "Trips and options",
      source: "manual", items: collection.fields.items,
      layout: items[0]?.type === "person" ? "profiles" : "cards", columns: items.length === 2 ? 2 : 3,
    },
  };
  return (
    <>
      <DetailHero eyebrow={text(collection, "eyebrow")} title={text(collection, "name") ?? ""} summary={text(collection, "summary")}
        image={g.asset(collection.fields.image)} crumbs={[{ label: text(template, "title") ?? "All", href: g.urlFor(template) }]}>
        <div className="actions"><CtaButton cta={g.entry(template.fields.primaryCta)} ctx={ctx} /></div>
      </DetailHero>
      <Section className="detail-body"><div className="narrow"><RichText document={collection.fields.description} /></div></Section>
      <CardGrid entry={grid} ctx={ctx} />
      <DetailFooter template={template} ctx={ctx} />
    </>
  );
}

export function PersonView({ person, template, ctx }: { person: SiteEntry; template: SiteEntry; ctx: BlockContext }) {
  const g = ctx.g;
  const specialties = g.parentsOf(person);
  const accepting = person.fields.acceptingNewPatients !== false;
  const primary = g.entry(template.fields.primaryCta);
  return (
    <>
      <section className="section profile">
        <div className="container profile-grid">
          <Avatar name={text(person, "name") ?? ""} asset={g.asset(person.fields.photo)} className="avatar-large" />
          <div>
            <nav className="crumbs" aria-label="Breadcrumb"><span><Link href={g.urlFor(template) ?? "#"}>{text(template, "title")}</Link></span></nav>
            <h1>{text(person, "name")}{text(person, "credentials") && <span className="muted">, {text(person, "credentials")}</span>}</h1>
            {text(person, "jobTitle") && <p className="lede">{text(person, "jobTitle")}</p>}
            <dl className="specs">
              {specialties.length > 0 && <div><dt>Specialties</dt><dd>{specialties.map((s, i) => <span key={s.id}>{i > 0 && ", "}<Link href={g.urlFor(s) ?? "#"}>{text(s, "name")}</Link></span>)}</dd></div>}
              {list(person, "locations").length > 0 && <div><dt>Locations</dt><dd>{list(person, "locations").join(", ")}</dd></div>}
              {list(person, "languages").length > 0 && <div><dt>Languages</dt><dd>{list(person, "languages").join(", ")}</dd></div>}
              <div><dt>New patients</dt><dd>{accepting ? "Accepting new patients" : "Not accepting new patients right now"}</dd></div>
            </dl>
            <div className="actions">
              {accepting
                ? <CtaButton cta={primary} ctx={ctx} />
                : <Link className="btn btn-secondary" href={g.urlFor(template) ?? "#"}>See other providers</Link>}
            </div>
          </div>
        </div>
      </section>
      {text(person, "bio") && <Section className="detail-body"><div className="narrow"><h2 className="h3">About</h2><Paragraphs value={text(person, "bio")} /></div></Section>}
      <DetailFooter template={template} ctx={ctx} />
    </>
  );
}

export function ArticleView({ article, template, ctx }: { article: SiteEntry; template: SiteEntry; ctx: BlockContext }) {
  const g = ctx.g;
  const author = g.entry(article.fields.author);
  const related = g.entry(article.fields.relatedPage);
  const relatedHref = g.urlFor(related);
  const cta = g.entry(article.fields.cta);
  const faq = g.entry(article.fields.faq);
  const relatedTitle = text(related, "name") ?? text(related, "title");
  return (
    <>
      <article className="article">
        <header className="article-head container">
          <nav className="crumbs" aria-label="Breadcrumb"><span><Link href={g.urlFor(template) ?? "#"}>{text(template, "title")}</Link></span></nav>
          <h1>{text(article, "title")}</h1>
          <p className="lede">{text(article, "summary")}</p>
          <p className="byline">
            {author && <><Avatar name={text(author, "name") ?? ""} asset={g.asset(author.fields.photo)} /><span>{text(author, "name")}</span></>}
            {formatDate(text(article, "publishDate")) && <span className="muted">{formatDate(text(article, "publishDate"))}</span>}
          </p>
          {list(article, "topics").length > 0 && <ul className="tags">{list(article, "topics").map((t) => <li key={t}>{t}</li>)}</ul>}
        </header>
        <div className="container article-image"><Img asset={g.asset(article.fields.heroImage)} sizes="(min-width: 1100px) 1100px, 100vw" priority /></div>
        <div className="container narrow article-body"><RichText document={article.fields.body} /></div>
      </article>
      {faq && <Sections entries={[faq]} ctx={ctx} />}
      {(cta || relatedHref) && (
        <Section className="cta-band" tone="brand">
          <div className="cta-band-inner">
            <div>
              <h2>{text(cta, "heading") ?? (relatedTitle ? `Next: ${relatedTitle}` : "Keep exploring")}</h2>
              {text(cta, "body") && <p>{text(cta, "body")}</p>}
            </div>
            {cta ? <CtaButton cta={cta} ctx={ctx} /> : relatedHref && <Link className="btn btn-primary" href={relatedHref}>Learn more</Link>}
          </div>
        </Section>
      )}
    </>
  );
}
