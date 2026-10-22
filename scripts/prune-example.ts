/**
 * Removes Example brand entries (IDs starting ex-) that are no longer in seed/brands/example.ts. The seed
 * script leaves such entries in place, so run this after rebuilding the Example page.
 *
 *   npm run prune:example              Dry run: lists what would be deleted.
 *   npm run prune:example -- --confirm Unpublishes and deletes them.
 *
 * Sandbox environment only (getSandboxClient refuses master). Never touches other brands.
 */
import { describeError } from "../src/lib/contentful/errors";
import { getSandboxClient } from "../src/lib/contentful/management";
import { loadSeedEntries } from "../seed/lib/sync";

async function main(): Promise<void> {
  const confirm = process.argv.includes("--confirm");
  const keep = new Set((await loadSeedEntries(["example"])).map((entry) => entry.id));
  const client = await getSandboxClient();
  const stale: Array<{ id: string; type: string }> = [];
  for (let skip = 0; ; skip += 1000) {
    const page = await client.entry.getMany({ query: { limit: 1000, skip } });
    for (const item of page.items) {
      if (item.sys.id.startsWith("ex-") && !keep.has(item.sys.id)) stale.push({ id: item.sys.id, type: item.sys.contentType.sys.id });
    }
    if (page.items.length < 1000) break;
  }
  console.log(`${stale.length} stale Example entries${confirm ? "" : " (dry run)"}: ${stale.map((s) => s.id).join(", ")}`);
  if (!confirm) return;
  let deleted = 0;
  for (const { id } of stale) {
    const entry = await client.entry.get({ entryId: id });
    if (entry.sys.publishedVersion) await client.entry.unpublish({ entryId: id });
    await client.entry.delete({ entryId: id });
    deleted++;
  }
  console.log(`Deleted ${deleted}.`);
}

main().catch((error: unknown) => {
  console.error(`Prune stopped: ${describeError(error)}`);
  process.exitCode = 1;
});
