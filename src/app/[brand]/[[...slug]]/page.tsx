import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { BlockContext } from "@/components/site/blocks";
import { ArticleView, CollectionView, OfferingView, PageView, PersonView } from "@/components/site/views";
import type { BrandGraph } from "@/lib/site/graph";
import { text } from "@/lib/site/graph";
import { loadBrand, nonce } from "@/lib/site/load";
import type { SiteEntry } from "@/lib/site/types";

type Params = Promise<{ brand: string; slug?: string[] }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PREFILL_KEYS = ["offering", "provider", "collection"] as const;

interface Resolved { page: SiteEntry; subject?: SiteEntry; kind?: "offering" | "collection" | "person" | "article" }

function resolve(g: BrandGraph, segments: string[]): Resolved | undefined {
  if (segments.length > 2 || segments.some((s) => !SLUG.test(s))) return undefined;
  if (segments.length === 0) {
    const home = g.homePage;
    return home ? { page: home } : undefined;
  }
  const page = g.pageBySlug(segments[0]!);
  if (!page) return undefined;
  if (segments.length === 1) return { page };
  const kind = g.templateKind(page);
  if (!kind) return undefined;
  const subject = g.subject(kind, segments[1]!);
  return subject ? { page, subject, kind } : undefined;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { brand, slug = [] } = await params;
  const g = await loadBrand(brand);
  const found = g && resolve(g, slug);
  if (!g || !found) return { title: "Not found", robots: { index: false, follow: false } };
  const subject = found.subject;
  const brandName = text(g.brand, "name") ?? "";
  const titleOf = (entry: SiteEntry) => text(entry, "seoTitle") ?? `${text(entry, "name") ?? text(entry, "title") ?? brandName} | ${brandName}`;
  const descriptionOf = (entry: SiteEntry) => text(entry, "seoDescription") ?? text(entry, "summary") ?? text(entry, "bio")?.slice(0, 155) ?? text(g.brand, "shortDescription");
  const target = subject ?? found.page;
  const favicon = g.asset(g.brand.fields.favicon);
  return {
    title: titleOf(target),
    description: descriptionOf(target),
    robots: { index: false, follow: false },
    icons: favicon ? { icon: favicon.url } : undefined,
  };
}

export default async function BrandPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const [{ brand, slug = [] }, query] = await Promise.all([params, searchParams]);
  const g = await loadBrand(brand);
  if (!g) notFound();
  const found = resolve(g, slug);
  if (!found) notFound();

  // Only known keys with slug-shaped values can prefill a form.
  const prefill: Record<string, string> = {};
  for (const key of PREFILL_KEYS) {
    const value = query[key];
    if (typeof value === "string" && SLUG.test(value) && value.length <= 80) prefill[key] = value;
  }
  const ctx: BlockContext = { g, page: found.page, subject: found.subject, prefill };

  if (!found.subject) return <PageView page={found.page} ctx={ctx} />;
  switch (found.kind) {
    case "offering": return <OfferingView offering={found.subject} template={found.page} ctx={ctx} nonce={await nonce()} />;
    case "collection": return <CollectionView collection={found.subject} template={found.page} ctx={ctx} />;
    case "person": return <PersonView person={found.subject} template={found.page} ctx={ctx} />;
    case "article": return <ArticleView article={found.subject} template={found.page} ctx={ctx} />;
    default: notFound();
  }
}
