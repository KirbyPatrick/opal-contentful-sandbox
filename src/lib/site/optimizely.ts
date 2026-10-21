import "server-only";
import { unstable_cache } from "next/cache";
import { OPTIMIZELY_SITE, parseOptimizelyBrands, type OptimizelyBrand } from "./optimizely-parse";

/**
 * The brands of the Optimizely CMS environment, read from that demo site's public brand list. If it cannot
 * be reached, the page shows a note instead of failing, so the Contentful brands always load.
 */
export const getOptimizelyBrands = unstable_cache(
  async (): Promise<OptimizelyBrand[]> => {
    const response = await fetch(`${OPTIMIZELY_SITE}/api/brands`, { signal: AbortSignal.timeout(8_000), headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`Optimizely CMS brand list returned HTTP ${response.status}.`);
    return parseOptimizelyBrands(await response.json());
  },
  ["optimizely-brands"],
  { revalidate: 30, tags: ["optimizely-brands"] },
);
