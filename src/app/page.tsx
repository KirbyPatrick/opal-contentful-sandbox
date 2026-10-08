import Link from "next/link";
import { Img } from "@/components/site/primitives";
import { getBrandList } from "@/lib/site/contentful";
import { isPreview } from "@/lib/site/load";

const VERTICALS: Record<string, string> = {
  b2b_saas: "B2B SaaS",
  apparel_retail: "Apparel",
  insurance: "Insurance",
  healthcare: "Healthcare",
  financial_services: "Financial services",
  travel: "Travel",
};

export default async function Directory() {
  const brands = await getBrandList(await isPreview());
  return (
    <main id="main" className="directory">
      <div className="container">
        <header className="directory-head">
          <p className="eyebrow">Opal Contentful Sandbox</p>
          <h1>Six fictional brands, one funnel each</h1>
          <p className="lede">Each site is built from one composable Contentful model. Pick a brand to walk its funnel from first visit to conversion.</p>
        </header>
        <ul className="directory-grid">
          {brands.map((brand) => (
            <li key={brand.slug}>
              <Link href={`/${brand.slug}`} className="directory-card">
                <span className="directory-logo">{brand.logo ? <Img asset={brand.logo} sizes="240px" /> : brand.name}</span>
                <span className="eyebrow">{VERTICALS[brand.vertical] ?? brand.vertical}</span>
                <span className="directory-name">{brand.name}</span>
                <span className="muted">{brand.shortDescription}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="footnote">Fictional companies. Sample content for illustration only.</p>
      </div>
    </main>
  );
}
