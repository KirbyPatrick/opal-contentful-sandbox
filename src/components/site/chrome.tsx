import Link from "next/link";
import type { BrandGraph } from "@/lib/site/graph";
import { text } from "@/lib/site/graph";
import { CartButton } from "./cart";
import { CtaButton, Img, type RenderContext } from "./primitives";

const STANDARD_DISCLAIMER = "Fictional company. Sample content for illustration only.";

export function SiteHeader({ g, ctx }: { g: BrandGraph; ctx: RenderContext }) {
  const nav = g.entries(g.brand.fields.navigation);
  const hasCart = typeof g.brand.fields.freeShippingThreshold === "number";
  return (
    <>
      {text(g.brand, "promoBarText") && <div className="promo-bar">{text(g.brand, "promoBarText")}</div>}
      <header className="site-header">
        <div className="container header-inner">
          <Link href={`/${g.slug}`} className="logo-link" aria-label={`${text(g.brand, "name")} home`}>
            {g.asset(g.brand.fields.logo)
              ? <Img asset={g.asset(g.brand.fields.logo)} className="logo" sizes="240px" priority />
              : <span className="logo-text">{text(g.brand, "name")}</span>}
          </Link>
          <nav className="main-nav" aria-label="Main">
            <ul>
              {nav.map((item) => {
                const href = g.urlFor(g.entry(item.fields.link));
                return href ? <li key={item.id}><Link href={href}>{text(item, "title")}</Link></li> : null;
              })}
            </ul>
          </nav>
          <div className="header-actions">
            {hasCart && <CartButton />}
            <CtaButton cta={g.entry(g.brand.fields.headerCta)} ctx={ctx} className="btn-small" />
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter({ g, ctx }: { g: BrandGraph; ctx: RenderContext }) {
  const links = g.entries(g.brand.fields.footerLinks);
  const disclaimer = text(g.brand, "legalDisclaimer") ?? "";
  const name = text(g.brand, "name") ?? "";
  const cta = g.entry(g.brand.fields.headerCta);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <p className="footer-name">{name}</p>
          {text(g.brand, "tagline") && <p className="footer-tagline">{text(g.brand, "tagline")}</p>}
          <address>
            {(text(g.brand, "address") ?? "").split("\n").map((line, i) => <span key={i}>{line}</span>)}
            {text(g.brand, "phone") && <span>{text(g.brand, "phone")}</span>}
          </address>
        </div>
        <nav aria-label="Footer" className="footer-nav">
          <p className="footer-heading">Explore</p>
          <ul>
            {links.map((item) => {
              const href = g.urlFor(g.entry(item.fields.link));
              return href ? <li key={item.id}><Link href={href}>{text(item, "title")}</Link></li> : null;
            })}
          </ul>
        </nav>
        {cta && (
          <div className="footer-cta">
            <p className="footer-heading">Get started</p>
            {text(g.brand, "shortDescription") && <p>{text(g.brand, "shortDescription")}</p>}
            <CtaButton cta={cta} ctx={ctx} />
          </div>
        )}
      </div>
      <div className="container footer-legal">
        {/* The standard line always shows, even if the brand's disclaimer is edited. */}
        {!disclaimer.startsWith(STANDARD_DISCLAIMER) && <p>{STANDARD_DISCLAIMER}</p>}
        {disclaimer && <p>{disclaimer}</p>}
        <p className="footer-meta"><span>{name}, a fictional demo brand</span><Link href="/">All demo brands</Link></p>
      </div>
      {/* An oversized wordmark closing the page. Decorative; sized in steps by name length so it fits. */}
      <div className="container">
        <p className={`footer-wordmark ${name.length <= 10 ? "is-short" : name.length <= 15 ? "is-medium" : "is-long"}`} aria-hidden="true">{name}</p>
      </div>
    </footer>
  );
}

export function DraftBanner() {
  return (
    <div className="draft-banner" role="status">
      <span>Draft preview: you are seeing unpublished content.</span>
      <form action="/api/draft/disable" method="post"><button type="submit">Exit preview</button></form>
    </div>
  );
}
