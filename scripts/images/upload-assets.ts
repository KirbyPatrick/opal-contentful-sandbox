/**
 * Phase 5, step 3: upload the reviewed images and generated logos to the sandbox.
 *
 *   npm run assets:upload
 *
 * - Photos come from assets/manifest.json. A fresh Pixabay download link is
 *   fetched for each (links expire after 24 hours), and Contentful pulls the
 *   file from it. The Pixabay API key is only used in that lookup and is
 *   never printed or logged.
 * - Logos and favicons come from assets/brand/<slug>/ and are uploaded as files.
 * - Asset IDs are deterministic, so re-running skips anything already uploaded.
 * - Alt text goes in the asset title, attribution in the description, and every
 *   asset is tagged seed and brand-<slug>. Assets are published.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { describeError } from "../../src/lib/contentful/errors";
import { getSandboxClient } from "../../src/lib/contentful/management";
import type { SandboxClient } from "../../src/lib/contentful/policy";

const LOCALE = "en-US";
const ALT_TEXT_LIMIT = 125;
const PROCESS_POLL_MS = 2_000;
const PROCESS_TIMEOUT_MS = 60_000;

const Manifest = z.object({
  images: z.array(
    z.object({
      key: z.string().regex(/^[a-z0-9-]+$/),
      brand: z.string().regex(/^[a-z0-9-]+$/),
      altText: z.string().min(5).max(ALT_TEXT_LIMIT),
      pixabayId: z.number().int().positive(),
      sourcePage: z.string().url(),
      photographer: z.string().min(1).max(100),
    }),
  ),
});

const BRAND_NAMES: Record<string, string> = {
  lumenwork: "Lumenwork",
  stuchberys: "Stuchbery's",
  "harborline-mutual": "Harborline Mutual",
  "clearwater-health": "Clearwater Health",
  "ledgerwood-bank": "Ledgerwood Bank",
  "tidewater-journeys": "Tidewater Journeys",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function tags(brand: string) {
  return {
    tags: [
      { sys: { type: "Link" as const, linkType: "Tag" as const, id: "seed" } },
      { sys: { type: "Link" as const, linkType: "Tag" as const, id: `brand-${brand}` } },
    ],
  };
}

/** Looks up a fresh, time-limited download link for one Pixabay image. */
async function pixabayDownloadUrl(key: string, id: number): Promise<string> {
  const params = new URLSearchParams({ key, id: String(id) });
  const response = await fetch(`https://pixabay.com/api/?${params}`, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Pixabay lookup failed (HTTP ${response.status}) for image ${id}.`);
  const body = z.object({ hits: z.array(z.object({ largeImageURL: z.string().url() })).min(1) }).parse(await response.json());
  const url = new URL(body.hits[0]!.largeImageURL);
  if (url.protocol !== "https:" || url.hostname !== "pixabay.com") throw new Error(`Unexpected download host for image ${id}.`);
  return url.toString();
}

async function existingAssetIds(client: SandboxClient): Promise<Set<string>> {
  const ids = new Set<string>();
  for (let skip = 0; ; skip += 1000) {
    const page = await client.asset.getMany({ query: { limit: 1000, skip, select: "sys.id" } });
    page.items.forEach((asset) => ids.add(asset.sys.id));
    if (skip + page.items.length >= page.total) return ids;
  }
}

/** Processes the file, waits until Contentful has it, then publishes. */
async function processAndPublish(client: SandboxClient, assetId: string): Promise<void> {
  const draft = await client.asset.get({ assetId });
  await client.asset.processForAllLocales({}, draft);
  const deadline = Date.now() + PROCESS_TIMEOUT_MS;
  for (;;) {
    const asset = await client.asset.get({ assetId });
    if (asset.fields.file?.[LOCALE]?.url) {
      await client.asset.publish({ assetId }, asset);
      return;
    }
    if (Date.now() > deadline) throw new Error(`Asset ${assetId} did not finish processing.`);
    await sleep(PROCESS_POLL_MS);
  }
}

async function main(): Promise<void> {
  const pixabayKey = process.env.PIXABAY_API_KEY;
  if (!pixabayKey || !/^\d+-[0-9a-f]{20,}$/.test(pixabayKey)) throw new Error("PIXABAY_API_KEY is missing or invalid. See .env.example.");

  const manifest = Manifest.parse(JSON.parse(readFileSync(join("assets", "manifest.json"), "utf8")));
  const client = await getSandboxClient();
  const existing = await existingAssetIds(client);
  let created = 0;
  let skipped = 0;
  const unavailable: string[] = [];

  for (const image of manifest.images) {
    const assetId = `img-${image.key}`;
    if (existing.has(assetId)) {
      skipped++;
      continue;
    }
    let upload: string;
    try {
      upload = await pixabayDownloadUrl(pixabayKey, image.pixabayId);
    } catch {
      // The image may have been removed from Pixabay. Report it and continue.
      unavailable.push(image.key);
      console.log(`missing   ${image.key} (no longer available on Pixabay)`);
      continue;
    }
    await client.asset.createWithId({ assetId }, {
      fields: {
        title: { [LOCALE]: image.altText },
        description: { [LOCALE]: `Photo by ${image.photographer} on Pixabay (${image.sourcePage}). Pixabay Content License.` },
        file: { [LOCALE]: { contentType: "image/jpeg", fileName: `${image.key}.jpg`, upload } },
      },
      metadata: tags(image.brand),
    });
    await processAndPublish(client, assetId);
    created++;
    console.log(`uploaded  ${assetId}`);
  }

  for (const [brand, name] of Object.entries(BRAND_NAMES)) {
    for (const kind of ["logo", "favicon"] as const) {
      const assetId = `${kind}-${brand}`;
      if (existing.has(assetId)) {
        skipped++;
        continue;
      }
      const file = readFileSync(join("assets", "brand", brand, `${kind}.svg`));
      const upload = await client.upload.create({}, { file: file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer });
      await client.asset.createWithId({ assetId }, {
        fields: {
          title: { [LOCALE]: kind === "logo" ? `${name} logo` : `${name} icon` },
          description: { [LOCALE]: "Original artwork generated for this demo. Fictional company." },
          file: {
            [LOCALE]: {
              contentType: "image/svg+xml",
              fileName: `${brand}-${kind}.svg`,
              uploadFrom: { sys: { type: "Link", linkType: "Upload", id: upload.sys.id } },
            },
          },
        },
        metadata: tags(brand),
      });
      await processAndPublish(client, assetId);
      created++;
      console.log(`uploaded  ${assetId}`);
    }
  }
  console.log(`\nDone. Uploaded ${created}, skipped ${skipped} already present.`);
  if (unavailable.length > 0) {
    console.log(`Not available on Pixabay (replace in the manifest): ${unavailable.join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  // describeError drops request headers and payloads; also strip any key=... that could appear.
  console.error(`Asset upload stopped: ${describeError(error).replace(/key=[^&\s]+/g, "key=[redacted]")}`);
  process.exitCode = 1;
});
