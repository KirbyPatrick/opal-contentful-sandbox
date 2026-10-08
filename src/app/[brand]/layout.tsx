import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CartProvider, type CatalogItem } from "@/components/site/cart";
import { DraftBanner, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { num, text } from "@/lib/site/graph";
import { isPreview, loadBrand, nonce } from "@/lib/site/load";
import { themeCss } from "@/lib/site/theme";

export default async function BrandLayout({ children, params }: { children: ReactNode; params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const g = await loadBrand(slug);
  if (!g) notFound();
  const [preview, styleNonce] = await Promise.all([isPreview(), nonce()]);

  const threshold = num(g.brand, "freeShippingThreshold");
  let shell = (
    <>
      {preview && <DraftBanner />}
      <SiteHeader g={g} ctx={{ g }} />
      <main id="main">{children}</main>
      <SiteFooter g={g} />
    </>
  );

  if (threshold !== undefined) {
    // Commerce brands get the client-only cart, with copy from the checkout form.
    const catalog: CatalogItem[] = g.ofType("offering")
      .filter((o) => o.fields.offeringType === "apparel_product" && typeof o.fields.price === "number")
      .map((o) => {
        const image = g.assetList(o.fields.images)[0];
        return { id: o.id, name: text(o, "name") ?? "", price: o.fields.price as number, href: g.urlFor(o) ?? `/${slug}`, imageUrl: image?.url, imageAlt: image?.alt };
      });
    const cartPage = g.goalPage;
    const checkout = g.entries(cartPage?.fields.sections).find((s) => s.type === "form" && s.fields.formKind === "checkout");
    shell = (
      <CartProvider brand={slug} catalog={catalog} threshold={threshold} promoText={text(checkout, "intro")} cartHref={g.urlFor(cartPage)}>
        {shell}
      </CartProvider>
    );
  }
  // The theme wraps everything, including the cart drawer.
  return (
    <div className="brand-theme">
      <style nonce={styleNonce}>{themeCss(g.brand)}</style>
      {shell}
    </div>
  );
}
