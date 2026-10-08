/**
 * Phase 5, step 1: search Pixabay for candidate photos per brand and download
 * small previews to .local/images/ for review. Nothing is uploaded anywhere.
 *
 * Pixabay only accepts the API key as a URL parameter, so request URLs are
 * never printed or logged. Error messages show the HTTP status and query only.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const OUT_DIR = join(".local", "images");
const PREVIEW_DIR = join(OUT_DIR, "previews");
const PER_QUERY = 5;
// Pixabay allows 100 requests per 60 seconds.
const REQUEST_GAP_MS = 700;

const QUERIES: Record<string, string[]> = {
  lumenwork: [
    "team meeting office", "warehouse worker tablet", "logistics warehouse team", "office whiteboard collaboration",
    "woman laptop office", "field technician", "coworkers discussion", "businesswoman portrait", "businessman portrait",
  ],
  stuchberys: [
    "wool sweater autumn", "knitted sweater flat lay", "flannel shirt man", "woman autumn coat forest",
    "man autumn jacket outdoors", "leather boots autumn", "wool scarf", "knit hat", "autumn cabin", "folded sweaters",
    "stone wall autumn", "corduroy",
  ],
  "harborline-mutual": [
    "family living room", "car driveway house", "moving boxes couple", "coastal town houses", "family beach walk",
    "suburban house", "grandparents grandchildren", "young family car", "woman portrait smiling",
  ],
  "clearwater-health": [
    "doctor patient consultation", "nurse patient", "pediatrician child", "clinic waiting room", "doctor elderly patient",
    "medical clinic", "stethoscope desk", "physical therapy",
  ],
  "ledgerwood-bank": [
    "couple budget laptop home", "woman coffee shop laptop", "small business owner shop", "house keys hand",
    "credit card payment", "savings piggy bank", "man phone cafe", "family new home", "man portrait smiling",
  ],
  "tidewater-journeys": [
    "portugal coast", "douro valley", "norway fjord", "lofoten village", "scotland highlands", "isle of skye",
    "hiking group mountains", "fishing boat harbor", "food market", "small boat sea",
  ],
};

// Extra searches for brands that came up short after review. Run with --supplement.
const SUPPLEMENT: Record<string, string[]> = {
  lumenwork: ["warehouse workers talking", "operations manager clipboard", "factory team meeting", "delivery driver van"],
  "clearwater-health": ["doctor talking patient", "blood pressure check", "senior patient doctor", "medical receptionist", "pediatric checkup"],
  "ledgerwood-bank": ["bakery owner", "couple paying bills", "woman phone kitchen", "cafe owner", "father daughter saving"],
};

const BLOCKED_TAGS = /\b(ai generated|ai-generated|generative|midjourney|ai art|logo|brand|trademark|illustration|3d|render)\b/i;

const Hit = z.object({
  id: z.number(),
  pageURL: z.string().url(),
  tags: z.string(),
  webformatURL: z.string().url(),
  imageWidth: z.number(),
  imageHeight: z.number(),
  user: z.string(),
  user_id: z.number(),
  downloads: z.number().optional(),
  likes: z.number().optional(),
});
const Response = z.object({ hits: z.array(Hit) });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function search(key: string, query: string, attempt = 1): Promise<z.infer<typeof Hit>[]> {
  const params = new URLSearchParams({
    key, q: query, image_type: "photo", orientation: "horizontal", safesearch: "true",
    min_width: "1280", order: "popular", per_page: "30", lang: "en",
  });
  const response = await fetch(`https://pixabay.com/api/?${params}`, { signal: AbortSignal.timeout(20_000) });
  if (response.status === 429 && attempt <= 3) {
    await sleep(15_000 * attempt);
    return search(key, query, attempt + 1);
  }
  if (!response.ok) throw new Error(`Pixabay search failed (HTTP ${response.status}) for "${query}".`);
  return Response.parse(await response.json()).hits;
}

async function main(): Promise<void> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key || !/^\d+-[0-9a-f]{20,}$/.test(key)) throw new Error("PIXABAY_API_KEY is missing or invalid. See .env.example.");
  mkdirSync(PREVIEW_DIR, { recursive: true });

  const supplement = process.argv.includes("--supplement");
  const candidatesFile = join(OUT_DIR, "candidates.json");
  const candidates: Array<Record<string, unknown>> = supplement ? JSON.parse(readFileSync(candidatesFile, "utf8")) : [];
  const seen = new Set<number>(candidates.map((c) => c.pixabayId as number));
  for (const [brand, queries] of Object.entries(supplement ? SUPPLEMENT : QUERIES)) {
    for (const query of queries) {
      const hits = (await search(key, query))
        .filter((hit) => !BLOCKED_TAGS.test(hit.tags) && !seen.has(hit.id))
        .slice(0, PER_QUERY);
      for (const hit of hits) {
        seen.add(hit.id);
        const preview = await fetch(hit.webformatURL, { signal: AbortSignal.timeout(20_000) });
        if (!preview.ok) continue;
        writeFileSync(join(PREVIEW_DIR, `${hit.id}.jpg`), Buffer.from(await preview.arrayBuffer()));
        candidates.push({
          pixabayId: hit.id, brand, query, tags: hit.tags, sourcePage: hit.pageURL,
          photographer: hit.user, photographerPage: `https://pixabay.com/users/${encodeURIComponent(hit.user)}-${hit.user_id}/`,
          width: hit.imageWidth, height: hit.imageHeight,
        });
      }
      console.log(`${brand.padEnd(20)} ${query.padEnd(30)} ${hits.length} candidates`);
      await sleep(REQUEST_GAP_MS);
    }
  }
  writeFileSync(candidatesFile, JSON.stringify(candidates, null, 2));
  console.log(`\n${candidates.length} candidates saved to ${OUT_DIR}/candidates.json (previews in ${PREVIEW_DIR}).`);
}

main().catch((error: unknown) => {
  // Never print the request URL: it contains the key.
  console.error(`Image search stopped: ${error instanceof Error ? error.message.replace(/key=[^&\s]+/g, "key=[redacted]") : "unknown error"}`);
  process.exitCode = 1;
});
