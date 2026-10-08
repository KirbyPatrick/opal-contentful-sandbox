/**
 * Verifies the live sandbox content (read only):
 * - every entry and asset is published with no pending changes
 * - the same model and funnel rules the seed validator applies
 * - prints each brand's funnel URLs, step 1 to step 4
 *
 *   npm run verify:funnels
 */
import { describeError } from "../src/lib/contentful/errors";
import { getSandboxClient } from "../src/lib/contentful/management";
import { validateGraph, type GraphEntry } from "../seed/lib/validate";

const LOCALE = "en-US";

interface Link { sys: { id: string } }
const linkId = (value: unknown) => (value as Link | undefined)?.sys?.id;

async function main(): Promise<void> {
  const client = await getSandboxClient();

  const entries: GraphEntry[] = [];
  const pending: string[] = [];
  for (let skip = 0; ; skip += 1000) {
    const page = await client.entry.getMany({ query: { limit: 1000, skip } });
    for (const item of page.items) {
      const fields = Object.fromEntries(Object.entries(item.fields).map(([key, value]) => [key, (value as Record<string, unknown>)[LOCALE]]));
      entries.push({ id: item.sys.id, contentType: item.sys.contentType.sys.id, fields });
      const published = item.sys.publishedVersion;
      if (!published || item.sys.version > published + 1) pending.push(item.sys.id);
    }
    if (skip + page.items.length >= page.total) break;
  }

  const assets = new Set<string>();
  const pendingAssets: string[] = [];
  for (let skip = 0; ; skip += 1000) {
    const page = await client.asset.getMany({ query: { limit: 1000, skip } });
    for (const asset of page.items) {
      assets.add(asset.sys.id);
      const published = asset.sys.publishedVersion;
      if (!published || asset.sys.version > published + 1) pendingAssets.push(asset.sys.id);
    }
    if (skip + page.items.length >= page.total) break;
  }

  const { errors, warnings } = validateGraph(entries, { assets, mode: "live" });
  for (const warning of warnings) console.log(`warning  ${warning}`);
  for (const error of errors) console.log(`error    ${error}`);
  if (pending.length) console.log(`error    ${pending.length} entries are unpublished or have unpublished changes: ${pending.slice(0, 10).join(", ")}`);
  if (pendingAssets.length) console.log(`error    ${pendingAssets.length} assets are unpublished: ${pendingAssets.slice(0, 10).join(", ")}`);

  // Funnel URLs per brand.
  for (const brand of entries.filter((entry) => entry.contentType === "brand")) {
    const slug = String(brand.fields.slug);
    const pages = entries.filter((entry) => entry.contentType === "page" && linkId(entry.fields.brand) === brand.id);
    const templateKind: Record<string, string> = { offering_detail: "offering", collection_detail: "collection", person_detail: "person" };
    console.log(`\n${brand.fields.name}`);
    for (let step = 1; step <= 4; step++) {
      const page = pages.find((p) => Number(p.fields.funnelStep) === step);
      if (!page) continue;
      const kind = templateKind[String(page.fields.pageType)];
      const isHome = linkId(brand.fields.homePage) === page.id;
      let url = isHome ? `/${slug}` : `/${slug}/${page.fields.slug}`;
      if (kind) {
        const sample = entries.find((entry) => entry.contentType === kind && linkId(entry.fields.brand) === brand.id && entry.fields.offeringType !== "saas_plan");
        if (sample) url += `/${sample.fields.slug}`;
      }
      console.log(`  step ${step}  ${url}  (${page.id}${kind ? `, ${kind} template` : ""})`);
    }
  }

  const failed = errors.length + (pending.length ? 1 : 0) + (pendingAssets.length ? 1 : 0);
  console.log(`\n${entries.length} entries, ${assets.size} assets. ${failed ? `${errors.length} errors.` : "All funnels verified."}`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((error: unknown) => {
  console.error(`Verification stopped: ${describeError(error)}`);
  process.exitCode = 1;
});
