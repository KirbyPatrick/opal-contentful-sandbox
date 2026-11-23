/**
 * Uploads a prospect page's own logo and images (assets/prospects/<brand key>/) to the sandbox, for the
 * sandbox brands that recreate a prospect's page with its real images, such as Placeholder.
 *
 *   npm run assets:prospect -- placeholder                   Upload or replace every asset in the manifest.
 *   npm run assets:prospect -- placeholder img-placeholder-01  Just one.
 *
 * - The manifest lists each asset ID, its file (in the same folder) and its title, which is the alt text.
 * - Asset IDs are fixed, so re-running replaces the files in place. Every asset is tagged seed and
 *   brand-<slug> (create the tag first: npm run tags:setup), then published.
 * - Sandbox environment only: getSandboxClient refuses master. It never touches another brand's assets.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { describeError } from "../../src/lib/contentful/errors";
import { getSandboxClient } from "../../src/lib/contentful/management";
import type { SandboxClient } from "../../src/lib/contentful/policy";
import { SANDBOX_BRAND_INFO, brandInfo } from "../../seed/lib/brands";

const LOCALE = "en-US";
const PROCESS_POLL_MS = 2_000;
const PROCESS_TIMEOUT_MS = 60_000;
const TYPES: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", svg: "image/svg+xml" };

const Manifest = z.object({
  brand: z.string().regex(/^[a-z0-9-]+$/),
  source: z.string().url(),
  assets: z.array(z.object({
    id: z.string().regex(/^(img|logo)-[a-z0-9-]+$/).max(64),
    // A bare file name in the manifest's folder, never a path.
    file: z.string().regex(/^[a-z0-9-]+\.(webp|jpe?g|png|svg)$/),
    title: z.string().min(3).max(125),
  })).min(1),
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Checks the file's first bytes match its extension, so a renamed or broken download is caught here. */
function checkSignature(file: string, bytes: Buffer): void {
  const ext = file.split(".").pop()!;
  const ok =
    ext === "webp" ? bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP"
    : ext === "png" ? bytes[0] === 0x89 && bytes.subarray(1, 4).toString("latin1") === "PNG"
    : ext === "svg" ? /^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/.test(bytes.subarray(0, 200).toString("utf8")) && !/<script|\son[a-z]+=/i.test(bytes.toString("utf8"))
    : bytes[0] === 0xff && bytes[1] === 0xd8;
  if (!ok) throw new Error(`${file} does not look like a ${ext} file (or the SVG contains script).`);
}

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
  const [brandKey = "", only] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  if (!SANDBOX_BRAND_INFO.some((brand) => brand.key === brandKey)) {
    throw new Error(`Pass a sandbox brand key: ${SANDBOX_BRAND_INFO.map((brand) => brand.key).join(", ")}.`);
  }
  const folder = join("assets", "prospects", brandKey);
  const manifest = Manifest.parse(JSON.parse(readFileSync(join(folder, "manifest.json"), "utf8")));
  if (manifest.brand !== brandKey) throw new Error(`The manifest in ${folder} is for ${manifest.brand}, not ${brandKey}.`);
  const slug = brandInfo(brandKey).slug;
  const items = only ? manifest.assets.filter((asset) => asset.id === only) : manifest.assets;
  if (!items.length) throw new Error(`No asset ${only} in ${folder}/manifest.json.`);
  for (const item of items) {
    if (!item.id.includes(brandKey)) throw new Error(`Asset ID ${item.id} must contain the brand key ${brandKey}.`);
  }

  const client = await getSandboxClient();
  const metadata = {
    tags: [
      { sys: { type: "Link" as const, linkType: "Tag" as const, id: "seed" } },
      { sys: { type: "Link" as const, linkType: "Tag" as const, id: `brand-${slug}` } },
    ],
  };
  for (const item of items) {
    const bytes = readFileSync(join(folder, item.file));
    checkSignature(item.file, bytes);
    const upload = await client.upload.create({}, { file: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer });
    const fields = {
      title: { [LOCALE]: item.title },
      description: { [LOCALE]: `From ${manifest.source} (the prospect's own image), used in a demo mockup.` },
      file: {
        [LOCALE]: {
          contentType: TYPES[item.file.split(".").pop()!] ?? "application/octet-stream",
          fileName: item.file,
          uploadFrom: { sys: { type: "Link" as const, linkType: "Upload" as const, id: upload.sys.id } },
        },
      },
    };
    const exists = await client.asset.get({ assetId: item.id }).then(() => true, () => false);
    if (exists) {
      const current = await client.asset.get({ assetId: item.id });
      await client.asset.update({ assetId: item.id }, { ...current, fields, metadata });
    } else {
      await client.asset.createWithId({ assetId: item.id }, { fields, metadata });
    }
    await processAndPublish(client, item.id);
    console.log(`${exists ? "replaced" : "created "}  ${item.id} from ${item.file}`);
  }
}

main().catch((error: unknown) => {
  console.error(`Prospect asset upload stopped: ${describeError(error)}`);
  process.exitCode = 1;
});
