import Link from "next/link";
import { Img } from "@/components/site/primitives";
import { EXAMPLE_BRAND_SLUG, getBrandList } from "@/lib/site/contentful";
import { getOptimizelyBrands } from "@/lib/site/optimizely";
import type { OptimizelyBrand } from "@/lib/site/optimizely-parse";
import { isPreview, nonce } from "@/lib/site/load";
import { safeHex } from "@/lib/site/theme";

const VERTICALS: Record<string, string> = {
  b2b_saas: "B2B software",
  apparel_retail: "B2C retail",
  insurance: "Insurance",
  healthcare: "Healthcare",
  financial_services: "Finance",
  travel: "Travel and hospitality",
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function optimizelyBrandsOrNothing(): Promise<OptimizelyBrand[] | null> {
  try {
    return await getOptimizelyBrands();
  } catch {
    return null;
  }
}

export default async function Directory() {
  const [allBrands, optimizely, styleNonce] = await Promise.all([getBrandList(await isPreview()), optimizelyBrandsOrNothing(), nonce()]);
  const brands = allBrands.filter((brand) => brand.slug !== EXAMPLE_BRAND_SLUG);
  // Each card shows its brand's colors. Inline styles are blocked by the CSP, so they go in a nonce'd
  // style element; slugs and colors are validated before they are written into it.
  const css = [
    ...brands.filter((brand) => SLUG.test(brand.slug)).map((brand) => `.dir-${brand.slug}{--dir-brand:${safeHex(brand.colorBrand, "#1c1c1c")};--dir-bg:${safeHex(brand.colorBackground, "#ffffff")}}`),
    ...(optimizely ?? []).filter((brand) => SLUG.test(brand.slug)).map((brand) => `.dir-ocms-${brand.slug}{--dir-brand:${safeHex(brand.colorBrand, "#1c1c1c")};--dir-bg:${safeHex(brand.colorBackground, "#ffffff")}}`),
  ].join("");
  return (
    <main id="main" className="directory">
      <style nonce={styleNonce}>{css}</style>
      <section className="directory-hero">
        <div className="container">
          <p className="eyebrow">Optimizely Opal demo environments</p>
          <h1>Two CMSs, six brands each</h1>
          <p className="lede">The same six fictional brands run on two content management systems: Contentful and Optimizely CMS. Optimizely Opal edits both. Pick a CMS, then a brand, and walk its funnel from first visit to conversion.</p>
          <nav className="directory-jump" aria-label="Jump to an environment">
            <a href="#contentful">Contentful</a>
            <a href="#optimizely-cms">Optimizely CMS</a>
          </nav>
        </div>
      </section>
      <div className="container directory-body">
        <section id="contentful" className="directory-section" aria-labelledby="contentful-title">
          <header className="directory-section-head">
            <span className="env-badge env-contentful">Contentful</span>
            <h2 id="contentful-title">Contentful environment</h2>
            <p>One composable content model in a Contentful sandbox. Opal reads and writes it through a custom tool registry.</p>
          </header>
          <ul className="directory-grid">
            {brands.map((brand) => (
              <li key={brand.slug}>
                <Link href={`/${brand.slug}`} className={`directory-card ${SLUG.test(brand.slug) ? `dir-${brand.slug}` : ""}`}>
                  <span className="directory-logo">{brand.logo ? <Img asset={brand.logo} sizes="240px" /> : brand.name}</span>
                  <span className="directory-info">
                    <span className="eyebrow">{VERTICALS[brand.vertical] ?? brand.vertical}</span>
                    <span className="directory-name">{brand.name}</span>
                    <span className="directory-desc">{brand.shortDescription}</span>
                    <span className="directory-visit" aria-hidden="true">Visit Contentful site</span>
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/example" className="directory-card directory-card-example">
                <span className="directory-logo"><span className="directory-example-mark">Example</span></span>
                <span className="directory-info">
                  <span className="eyebrow">Sandbox</span>
                  <span className="directory-name">Example</span>
                  <span className="directory-desc">A sandbox page for recreating a prospect's page during a demo.</span>
                  <span className="directory-visit" aria-hidden="true">Open page</span>
                </span>
              </Link>
            </li>
          </ul>
        </section>
        <section id="optimizely-cms" className="directory-section" aria-labelledby="optimizely-title">
          <header className="directory-section-head">
            <span className="env-badge env-optimizely">Optimizely CMS</span>
            <h2 id="optimizely-title">Optimizely CMS environment</h2>
            <p>The same brands in Optimizely CMS (SaaS), served through Optimizely Graph. These sites open on their own address.</p>
          </header>
          {optimizely === null || optimizely.length === 0 ? (
            <p className="directory-unavailable">The Optimizely CMS environment could not be reached just now. <a href="https://optimizely-cms-demo-two.vercel.app">Open it directly</a>.</p>
          ) : (
            <ul className="directory-grid">
              {[...optimizely].sort((a, b) => a.name.localeCompare(b.name)).map((brand) => (
                <li key={brand.slug}>
                  <a href={brand.url} rel="noopener" className={`directory-card ${SLUG.test(brand.slug) ? `dir-ocms-${brand.slug}` : ""}`}>
                    <span className="directory-logo">
                      {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.logoAlt} decoding="async" /> : brand.name}
                    </span>
                    <span className="directory-info">
                      <span className="eyebrow">{brand.verticalLabel}</span>
                      <span className="directory-name">{brand.name}</span>
                      <span className="directory-desc">{brand.summary}</span>
                      <span className="directory-visit" aria-hidden="true">Visit Optimizely CMS site</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="footnote">Fictional companies. Sample content for illustration only.</p>
      </div>
    </main>
  );
}
