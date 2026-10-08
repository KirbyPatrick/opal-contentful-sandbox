/**
 * Phase 5, step 3: upload the reviewed images and generated logos to the sandbox.
 *
 *   npm run assets:upload
 *   npm run assets:upload -- --replace ledgerwood-bank-01   Swap one photo's file and text in place (same asset ID).
 *
 * - Photos come from assets/manifest.json. A fresh Pixabay download link is
 *   fetched for each (links expire after 24 hours), and Contentful pulls the
 *   file from it. The Pixabay API key is only used in that lookup and is
 *   never printed or logged.
 * - Logos and favicons come from assets/brand/<slug>/ and are uploaded as files.
 * - Asset IDs are deterministic, so re-running skips anything already uploaded.
 *   npm run assets:upload -- --retag            After a rebrand: give every asset its brand's current brand-<slug> tag.
 *   npm run assets:upload -- --replace-logos    After a rebrand: re-upload the logo and favicon of each rebranded brand (same asset IDs).
 *
 * - Alt text goes in the asset title, attribution in the description, and every
 *   asset is tagged seed and brand-<slug>. Assets are published.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { describeError } from "../../src/lib/contentful/errors";
import { getSandboxClient } from "../../src/lib/contentful/management";
import type { SandboxClient } from "../../src/lib/contentful/policy";
import { BRAND_INFO, brandInfo } from "../../seed/lib/brands";

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Assets carry the brand's image pool tag, brand-<slug>. The manifest and asset IDs use the brand key. */
function tags(brandKey: string) {
  return {
    tags: [
      { sys: { type: "Link" as const, linkType: "Tag" as const, id: "seed" } },
      { sys: { type: "Link" as const, linkType: "Tag" as const, id: `brand-${brandInfo(brandKey).slug}` } },
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


/**
 * Gives every asset the image pool tag of its brand's current slug (brand-<slug>), replacing any earlier brand tag.
 * The brand comes from the asset ID (img-<key>-NN, logo-<key>, favicon-<key>). Create the tags first: npm run tags:setup.
 */
async function retagAssets(client: SandboxClient): Promise<void> {
  const brandOf = (assetId: string) => BRAND_INFO.find(({ key }) => assetId.startsWith(`img-${key}-`) || assetId === `logo-${key}` || assetId === `favicon-${key}`);
  let moved = 0;
  for (let skip = 0; ; skip += 100) {
    const page = await client.asset.getMany({ query: { limit: 100, skip, order: "sys.id" } });
    for (const asset of page.items) {
      const brand = brandOf(asset.sys.id);
      if (!brand) continue;
      const wanted = `brand-${brand.slug}`;
      const tags = asset.metadata?.tags ?? [];
      const others = tags.filter((tag) => !tag.sys.id.startsWith("brand-"));
      if (tags.length === others.length + 1 && tags.some((tag) => tag.sys.id === wanted)) continue;
      const published = asset.sys.publishedVersion !== undefined && asset.sys.version <= asset.sys.publishedVersion + 1;
      const next = [...others, { sys: { type: "Link" as const, linkType: "Tag" as const, id: wanted } }];
      const updated = await client.asset.update({ assetId: asset.sys.id }, { ...asset, metadata: { ...asset.metadata, tags: next } });
      if (published) await client.asset.publish({ assetId: asset.sys.id }, updated);
      moved++;
    }
    if (skip + page.items.length >= page.total) break;
  }
  console.log(`retagged  ${moved} assets`);
}

/** Re-uploads the logo and favicon of every rebranded brand into the existing assets (IDs unchanged, titles updated). */
async function replaceLogos(client: SandboxClient): Promise<void> {
  for (const { key, slug, name } of BRAND_INFO) {
    if (slug === key) continue;
    for (const kind of ["logo", "favicon"] as const) {
      const assetId = `${kind}-${key}`;
      const current = await client.asset.get({ assetId });
      const file = readFileSync(join("assets", "brand", key, `${kind}.svg`));
      const upload = await client.upload.create({}, { file: file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer });
      await client.asset.update({ assetId }, {
        ...current,
        fields: {
          ...current.fields,
          title: { [LOCALE]: kind === "logo" ? `${name} logo` : `${name} icon` },
          file: { [LOCALE]: { contentType: "image/svg+xml", fileName: `${key}-${kind}.svg`, uploadFrom: { sys: { type: "Link", linkType: "Upload", id: upload.sys.id } } } },
        },
      });
      await processAndPublish(client, assetId);
      console.log(`replaced  ${assetId}`);
    }
  }
}

async function main(): Promise<void> {
  const pixabayKey = process.env.PIXABAY_API_KEY;
  if (!pixabayKey || !/^\d+-[0-9a-f]{20,}$/.test(pixabayKey)) throw new Error("PIXABAY_API_KEY is missing or invalid. See .env.example.");

  const manifest = Manifest.parse(JSON.parse(readFileSync(join("assets", "manifest.json"), "utf8")));
  const client = await getSandboxClient();
  if (process.argv.includes("--retag")) return retagAssets(client);
  if (process.argv.includes("--replace-logos")) return replaceLogos(client);
  const existing = await existingAssetIds(client);
  const replaceIndex = process.argv.indexOf("--replace");
  const replaceKey = replaceIndex >= 0 ? process.argv[replaceIndex + 1] : undefined;
  if (replaceKey) {
    const image = manifest.images.find((i) => i.key === replaceKey);
    if (!image) throw new Error(`No manifest image with key ${replaceKey}.`);
    const assetId = `img-${image.key}`;
    const current = await client.asset.get({ assetId });
    const upload = await pixabayDownloadUrl(pixabayKey, image.pixabayId);
    await client.asset.update({ assetId }, {
      ...current,
      fields: {
        title: { [LOCALE]: image.altText },
        description: { [LOCALE]: `Photo by ${image.photographer} on Pixabay (${image.sourcePage}). Pixabay Content License.` },
        file: { [LOCALE]: { contentType: "image/jpeg", fileName: `${image.key}.jpg`, upload } },
      },
    });
    await processAndPublish(client, assetId);
    console.log(`replaced  ${assetId}`);
    return;
  }
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

  for (const { key: brand, name } of BRAND_INFO) {
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
