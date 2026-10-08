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
