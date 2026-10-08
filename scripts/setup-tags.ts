/**
 * Creates the tags the sandbox uses. Idempotent: existing tags are left alone.
 *
 * - seed: everything the seed script creates
 * - opal: everything created through the Opal API
 * - brand-<slug>: each brand's image pool
 *
 * Tags are public so the delivery API can filter by them. Visibility cannot be changed later.
 */
import { describeError } from "../src/lib/contentful/errors";
import { getSandboxClient } from "../src/lib/contentful/management";
import { BRAND_INFO } from "../seed/lib/brands";

const TAGS: Array<{ id: string; name: string }> = [
  { id: "seed", name: "seed" },
  { id: "opal", name: "opal" },
  ...BRAND_INFO.map(({ slug }) => ({ id: `brand-${slug}`, name: `brand: ${slug}` })),
];

async function main(): Promise<void> {
  const client = await getSandboxClient();
  const existing = new Set((await client.tag.getMany({ query: { limit: 1000 } })).items.map((tag) => tag.sys.id));
  for (const tag of TAGS) {
    if (existing.has(tag.id)) {
      console.log(`exists   ${tag.id}`);
      continue;
    }
    await client.tag.createWithId({ tagId: tag.id }, { name: tag.name, sys: { visibility: "public" } });
    console.log(`created  ${tag.id}`);
  }
}

main().catch((error: unknown) => {
  console.error(`Tag setup stopped: ${describeError(error)}`);
  process.exitCode = 1;
});
