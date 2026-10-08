import { documentToReactComponents, type Options } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, type Document } from "@contentful/rich-text-types";
import Link from "next/link";
import type { ReactNode } from "react";
import type { BrandGraph } from "@/lib/site/graph";
import { text } from "@/lib/site/graph";
import type { SiteAsset, SiteEntry } from "@/lib/site/types";
import { AddToBagButton } from "./cart";

export interface RenderContext {
  g: BrandGraph;
  page?: SiteEntry;
  /** The offering, collection, person, or article a detail view is showing. */
  subject?: SiteEntry;
}

// ---------- Images ----------

const WIDTHS = [480, 800, 1200, 1600];

export function Img({ asset, sizes = "100vw", className, priority = false }: {
  asset: SiteAsset | undefined; sizes?: string; className?: string; priority?: boolean;
}) {
  if (!asset) return <Placeholder className={className} />;
  const isSvg = asset.contentType === "image/svg+xml";
  const src = isSvg ? asset.url : `${asset.url}?w=1200&fm=webp&q=72`;
  const srcSet = isSvg ? undefined : WIDTHS.map((w) => `${asset.url}?w=${w}&fm=webp&q=72 ${w}w`).join(", ");
  return (
    // Contentful's image API resizes these, so next/image is not needed.
    <img
      className={className}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

/** Branded stand-in when an image is missing, so no block is ever empty. */
export function Placeholder({ className }: { className?: string }) {
  return (
    <svg className={`placeholder ${className ?? ""}`} viewBox="0 0 400 260" role="img" aria-label="Image coming soon" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="260" className="placeholder-bg" />
      <circle cx="300" cy="80" r="34" className="placeholder-sun" />
      <path d="M0 210 L120 120 L200 180 L270 130 L400 220 L400 260 L0 260 Z" className="placeholder-hill" />
    </svg>
  );
}

export function Avatar({ name, asset, className }: { name: string; asset?: SiteAsset; className?: string }) {
  if (asset) return <Img asset={asset} className={`avatar ${className ?? ""}`} sizes="96px" />;
  const initials = name.replace(/^(Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return <span className={`avatar avatar-initials ${className ?? ""}`} aria-hidden="true">{initials}</span>;
}

// ---------- Rich text ----------

const isSafeUrl = (uri: unknown) => typeof uri === "string" && /^https?:\/\//i.test(uri);

const richTextOptions: Options = {
  renderNode: {
    [INLINES.HYPERLINK]: (node, children) => {
      const uri = (node.data as { uri?: unknown }).uri;
      return isSafeUrl(uri)
        ? <a href={uri as string} rel="noopener noreferrer" target="_blank">{children}</a>
        : <>{children}</>;
    },
    // Embedded entries and assets are not allowed by the model; render nothing if they appear.
    [BLOCKS.EMBEDDED_ENTRY]: () => null,
    [BLOCKS.EMBEDDED_ASSET]: () => null,
    [INLINES.EMBEDDED_ENTRY]: () => null,
    [INLINES.ENTRY_HYPERLINK]: (_node, children) => <>{children}</>,
    [INLINES.ASSET_HYPERLINK]: (_node, children) => <>{children}</>,
  },
};

export function RichText({ document, className }: { document: unknown; className?: string }) {
  if (!document || typeof document !== "object" || (document as Document).nodeType !== "document") return null;
  return <div className={`rich-text ${className ?? ""}`}>{documentToReactComponents(document as Document, richTextOptions)}</div>;
}

/** Plain multi-paragraph text (blank line between paragraphs). */
export function Paragraphs({ value, className }: { value: string | undefined; className?: string }) {
  if (!value) return null;
  return <div className={className}>{value.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>;
}

// ---------- CTAs ----------

const GOAL_TYPES = new Set(["book_demo", "get_quote", "book_appointment", "start_application", "request_booking"]);

/** Query string that prefills the goal form from the item being viewed. */
function prefillQuery(ctx: RenderContext, target: SiteEntry | undefined): string {
  if (!ctx.subject || !target || target.fields.pageType !== "goal") return "";
  const slug = text(ctx.subject, "slug");
  if (!slug) return "";
  if (ctx.subject.type === "offering") return `?offering=${encodeURIComponent(slug)}`;
  if (ctx.subject.type === "person") return `?provider=${encodeURIComponent(slug)}`;
  if (ctx.subject.type === "collection") return `?collection=${encodeURIComponent(slug)}`;
  return "";
}

export function ctaHref(cta: SiteEntry, ctx: RenderContext): { href: string; external: boolean } | undefined {
  const goalType = text(cta, "goalType");
  const destination = ctx.g.entry(cta.fields.destinationPage);
  if (goalType === "next_step") {
    const next = destination ?? ctx.g.entry(ctx.page?.fields.nextStep);
    const url = ctx.g.urlFor(next);
    return url ? { href: url + prefillQuery(ctx, next), external: false } : undefined;
  }
  if (goalType && GOAL_TYPES.has(goalType)) {
    const goal = destination ?? ctx.g.goalPage;
    const url = ctx.g.urlFor(goal);
    return url ? { href: url + prefillQuery(ctx, goal), external: false } : undefined;
  }
  if (destination) {
    const url = ctx.g.urlFor(destination);
    if (url) return { href: url, external: false };
  }
  const external = text(cta, "destinationUrl");
  if (external && isSafeUrl(external)) return { href: external, external: true };
  return undefined;
}

export function CtaButton({ cta, ctx, className, fallbackStyle }: {
  cta: SiteEntry | undefined; ctx: RenderContext; className?: string; fallbackStyle?: "primary" | "secondary";
}) {
  if (!cta) return null;
  const label = text(cta, "label") ?? "Learn more";
  const style = text(cta, "style") ?? fallbackStyle ?? "primary";
  const classes = `btn btn-${style} ${className ?? ""}`;
  if (cta.fields.goalType === "add_to_cart") {
    if (ctx.subject?.type === "offering") return <AddToBagButton label={label} className={classes} productId={ctx.subject.id} />;
    const shop = ctx.g.urlFor(ctx.g.template("offering"));
    return shop ? <Link className={classes} href={shop}>{label}</Link> : null;
  }
  const target = ctaHref(cta, ctx);
  if (!target) return null;
  if (target.external) return <a className={classes} href={target.href} rel="noopener noreferrer" target="_blank">{label}</a>;
  return <Link className={classes} href={target.href} data-goal={text(cta, "goalType")}>{label}</Link>;
}

export function Section({ children, className, id, tone }: { children: ReactNode; className?: string; id?: string; tone?: "surface" | "brand" }) {
  return (
    <section id={id} className={`section ${tone ? `section-${tone}` : ""} ${className ?? ""}`}>
      <div className="container">{children}</div>
    </section>
  );
}
