import "server-only";
import { draftMode, headers } from "next/headers";
import { cache } from "react";
import { getBrandGraph } from "./contentful";
import { BrandGraph } from "./graph";

/** Per-request helpers shared by the brand layout and pages (deduplicated with React cache). */
export const isPreview = cache(async () => (await draftMode()).isEnabled);

export const nonce = cache(async () => (await headers()).get("x-nonce") ?? undefined);

export const loadBrand = cache(async (slug: string): Promise<BrandGraph | null> => {
  const data = await getBrandGraph(slug, await isPreview());
  return data ? new BrandGraph(data) : null;
});

/**
 * The two prospect demo pages (/example and /placeholder) also show drafts when opened with ?preview=true,
 * so Contentful's Live Preview iframe works without the draft-mode cookie (browsers often block cookies in
 * third-party iframes). Only those two routes read this flag; every other page needs the signed draft link.
 */
export async function previewRequested(searchParams: Promise<Record<string, string | string[] | undefined>>): Promise<boolean> {
  const value = (await searchParams).preview;
  return value === "true" || (await isPreview());
}

export const loadBrandIn = cache(async (slug: string, preview: boolean): Promise<BrandGraph | null> => {
  const data = await getBrandGraph(slug, preview);
  return data ? new BrandGraph(data) : null;
});
