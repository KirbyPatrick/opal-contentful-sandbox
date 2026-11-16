/**
 * Removes Example brand entries (IDs starting ex-) that are no longer in seed/brands/example.ts. The seed
 * script leaves such entries in place, so run this after rebuilding the Example page.
 *
 *   npm run prune:example                                   Dry run: lists what would change.
 *   npm run prune:example -- --confirm --unpublish-only     Unpublishes them and keeps them as drafts (restorable).
 *   npm run prune:example -- --confirm                      Unpublishes and deletes them.
 *
 * Sandbox environment only (getSandboxClient refuses master). Never touches other brands.
 */
import { describeError } from "../src/lib/contentful/errors";
import { getSandboxClient } from "../src/lib/contentful/management";
import { loadSeedEntries } from "../seed/lib/sync";

async function main(): Promise<void> {
  const confirm = process.argv.includes("--confirm");
  const unpublishOnly = process.argv.includes("--unpublish-only");
  const keep = new Set((await loadSeedEntries(["example"])).map((entry) => entry.id));
  const client = await getSandboxClient();
  const stale: Array<{ id: string; type: string; published: boolean }> = [];
  for (let skip = 0; ; skip += 1000) {
    const page = await client.entry.getMany({ query: { limit: 1000, skip } });
    for (const item of page.items) {
      if (item.sys.id.startsWith("ex-") && !keep.has(item.sys.id)) {
        stale.push({ id: item.sys.id, type: item.sys.contentType.sys.id, published: Boolean(item.sys.publishedVersion) });
      }
    }
    if (page.items.length < 1000) break;
  }
  const targets = unpublishOnly ? stale.filter((s) => s.published) : stale;
  const action = unpublishOnly ? "to unpublish" : "to delete";
  console.log(`${targets.length} stale Example entries ${action}${confirm ? "" : " (dry run)"}:`);
  for (const { id, type, published } of targets) console.log(`  ${id} (${type}${published ? "" : ", draft"})`);
  if (!confirm) return;
  let done = 0;
  for (const { id, published } of targets) {
    if (published) await client.entry.unpublish({ entryId: id });
    if (!unpublishOnly) await client.entry.delete({ entryId: id });
    done++;
  }
  console.log(`${unpublishOnly ? "Unpublished" : "Deleted"} ${done}.`);
}

main().catch((error: unknown) => {
  console.error(`Prune stopped: ${describeError(error)}`);
  process.exitCode = 1;
});
