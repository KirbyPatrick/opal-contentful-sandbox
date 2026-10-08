import type { BrandGraphData, Link, SiteAsset, SiteEntry } from "./types";

/** Field readers that never throw on missing or odd values. */
export const text = (entry: SiteEntry | undefined, field: string): string | undefined => {
  const value = entry?.fields[field];
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
};
export const num = (entry: SiteEntry | undefined, field: string): number | undefined => {
  const value = entry?.fields[field];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};
export const list = (entry: SiteEntry | undefined, field: string): string[] => {
  const value = entry?.fields[field];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
};
const linkId = (value: unknown): string | undefined =>
  typeof value === "object" && value !== null ? (value as Link).sys?.id : undefined;

export const TEMPLATE_KIND: Record<string, "offering" | "collection" | "person" | "article"> = {
  offering_detail: "offering",
  collection_detail: "collection",
  person_detail: "person",
  article_index: "article",
};

/** One brand's content with link resolution and URL building. */
export class BrandGraph {
  readonly brand: SiteEntry;
  readonly slug: string;
  private readonly byId: Map<string, SiteEntry>;
  private readonly assetsById: Map<string, SiteAsset>;
  private readonly templates = new Map<string, SiteEntry>();

  constructor(data: BrandGraphData) {
    this.brand = data.brand;
    this.slug = String(data.brand.fields.slug);
    this.byId = new Map([data.brand, ...data.entries].map((entry) => [entry.id, entry]));
    this.assetsById = new Map(data.assets.map((asset) => [asset.id, asset]));
    for (const page of this.ofType("page")) {
      const kind = TEMPLATE_KIND[String(page.fields.pageType)];
      if (kind && !this.templates.has(kind)) this.templates.set(kind, page);
    }
  }

  entry(value: unknown): SiteEntry | undefined {
    const id = linkId(value);
    return id ? this.byId.get(id) : undefined;
  }

  entries(value: unknown): SiteEntry[] {
    return Array.isArray(value) ? value.map((v) => this.entry(v)).filter((e): e is SiteEntry => Boolean(e)) : [];
  }

  asset(value: unknown): SiteAsset | undefined {
    const id = linkId(value);
    return id ? this.assetsById.get(id) : undefined;
  }

  assetList(value: unknown): SiteAsset[] {
    return Array.isArray(value) ? value.map((v) => this.asset(v)).filter((a): a is SiteAsset => Boolean(a)) : [];
  }

  ofType(type: string): SiteEntry[] {
    return [...this.byId.values()].filter((entry) => entry.type === type);
  }

  get homePage(): SiteEntry | undefined {
    return this.entry(this.brand.fields.homePage);
  }

  template(kind: "offering" | "collection" | "person" | "article"): SiteEntry | undefined {
    return this.templates.get(kind);
  }

  pageBySlug(slug: string): SiteEntry | undefined {
    return this.ofType("page").find((page) => page.fields.slug === slug && page.id !== this.homePage?.id);
  }

  subject(kind: "offering" | "collection" | "person" | "article", slug: string): SiteEntry | undefined {
    const match = this.ofType(kind).find((entry) => entry.fields.slug === slug);
    if (!match) return undefined;
    if (kind === "offering" && match.fields.offeringType === "saas_plan") return undefined;
    if (kind === "person" && match.fields.role !== "provider") return undefined;
    return match;
  }

  /** The goal page (funnel step 4). */
  get goalPage(): SiteEntry | undefined {
    return this.ofType("page").find((page) => page.fields.pageType === "goal" && Number(page.fields.funnelStep) === 4)
      ?? this.ofType("page").find((page) => page.fields.pageType === "goal");
  }

  /** Site path for any routable entry, or undefined if it has no page of its own. */
  urlFor(entry: SiteEntry | undefined): string | undefined {
    if (!entry) return undefined;
    const base = `/${this.slug}`;
    if (entry.type === "brand") return base;
    if (entry.type === "page") return entry.id === this.homePage?.id ? base : `${base}/${entry.fields.slug}`;
    const kind = entry.type as "offering" | "collection" | "person" | "article";
    if (!["offering", "collection", "person", "article"].includes(kind)) return undefined;
    if (kind === "offering" && entry.fields.offeringType === "saas_plan") return undefined;
    if (kind === "person" && entry.fields.role !== "provider") return undefined;
    const template = this.templates.get(kind);
    return template ? `${base}/${template.fields.slug}/${entry.fields.slug}` : undefined;
  }

  /** The kind of subject a page renders at /{page}/{slug}, if it is a template. */
  templateKind(page: SiteEntry): "offering" | "collection" | "person" | "article" | undefined {
    return TEMPLATE_KIND[String(page.fields.pageType)];
  }

  /** Collections that list this entry (for breadcrumbs such as destination for a trip). */
  parentsOf(entry: SiteEntry): SiteEntry[] {
    return this.ofType("collection").filter((collection) =>
      this.entries(collection.fields.items).some((item) => item.id === entry.id));
  }

  /** Articles, newest first. */
  articles(): SiteEntry[] {
    return this.ofType("article").sort((a, b) => String(b.fields.publishDate).localeCompare(String(a.fields.publishDate)));
  }
}
