import Link from "next/link";
import { Img } from "@/components/site/primitives";
import { getBrandList } from "@/lib/site/contentful";
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

export default async function Directory() {
  const [brands, styleNonce] = await Promise.all([getBrandList(await isPreview()), nonce()]);
  // Each card shows its brand's colors. Inline styles are blocked by the CSP, so they go in a nonce'd
  // style element; slugs and colors are validated before they are written into it.
  const css = brands
    .filter((brand) => SLUG.test(brand.slug))
    .map((brand) => `.dir-${brand.slug}{--dir-brand:${safeHex(brand.colorBrand, "#1c1c1c")};--dir-bg:${safeHex(brand.colorBackground, "#ffffff")}}`)
    .join("");
  return (
    <main id="main" className="directory">
      <style nonce={styleNonce}>{css}</style>
      <section className="directory-hero">
        <div className="container">
          <p className="eyebrow">Opal Contentful Sandbox</p>
          <h1>Six fictional brands, one funnel each</h1>
          <p className="lede">Each site is built from one composable Contentful model and managed by Optimizely Opal. Pick a brand to walk its funnel from first visit to conversion.</p>
        </div>
      </section>
      <div className="container directory-body">
        <ul className="directory-grid">
          {brands.map((brand) => (
            <li key={brand.slug}>
              <Link href={`/${brand.slug}`} className={`directory-card ${SLUG.test(brand.slug) ? `dir-${brand.slug}` : ""}`}>
                <span className="directory-logo">{brand.logo ? <Img asset={brand.logo} sizes="240px" /> : brand.name}</span>
                <span className="directory-info">
                  <span className="eyebrow">{VERTICALS[brand.vertical] ?? brand.vertical}</span>
                  <span className="directory-name">{brand.name}</span>
                  <span className="directory-desc">{brand.shortDescription}</span>
                  <span className="directory-visit" aria-hidden="true">Visit site</span>
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
                <span className="directory-desc">A blank page for building example templates during demos.</span>
                <span className="directory-visit" aria-hidden="true">Open page</span>
              </span>
            </Link>
          </li>
        </ul>
        <p className="footnote">Fictional companies. Sample content for illustration only.</p>
      </div>
    </main>
  );
}
