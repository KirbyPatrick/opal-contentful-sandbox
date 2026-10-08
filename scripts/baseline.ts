/**
 * Baseline of the sandbox's seed content, so a demo can be checked and reset.
 *
 *   npm run baseline:export   Writes baseline/baseline.json (read only). Refuses if seed content has
 *                             been edited, unpublished, or removed (run the reset first), unless --force.
 *   npm run baseline:check    Compares the live sandbox with the baseline and lists what changed
 *                             (read only). Exit code 1 if anything differs.
 *
 * Content created through the Opal API (tagged opal) is never part of the baseline. It shows up under
 * "added" in the check, and the reset script removes it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { describeError } from "../src/lib/contentful/errors";
import { readSandboxTarget } from "../src/lib/contentful/config";
import { getReadOnlyClient } from "../src/lib/contentful/management";
import { buildBaseline, diffBaseline, isClean, planReset, type Baseline } from "../seed/lib/baseline";
import { BRANDS, loadSeedEntries, toContentfulFields } from "../seed/lib/sync";
import { readLiveEntries } from "./lib/live-entries";

const FILE = "baseline/baseline.json";

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (mode !== "export" && mode !== "check") throw new Error("Usage: baseline.ts export|check");
  const { environmentId } = readSandboxTarget();
  const live = await readLiveEntries(getReadOnlyClient(), environmentId);

  if (mode === "export") {
    if (!process.argv.includes("--force")) {
      const seed = (await loadSeedEntries(BRANDS)).map((entry) => ({ id: entry.id, contentType: entry.contentType, fields: toContentfulFields(entry) }));
      const { restore } = planReset(live, seed);
      if (restore.length > 0) {
        console.log(`Refusing to export: ${restore.length} seed entries differ from seed/ (${restore.slice(0, 5).map((r) => `${r.id}: ${r.reason}`).join("; ")}${restore.length > 5 ? "; ..." : ""}).`);
        console.log("Run npm run reset (dry run, then --confirm) to restore them, then export. Use --force to export anyway.");
        process.exitCode = 1;
        return;
      }
    }
    const baseline = buildBaseline(environmentId, new Date().toISOString(), live);
    mkdirSync("baseline", { recursive: true });
    writeFileSync(FILE, `${JSON.stringify(baseline, null, 1)}\n`);
    console.log(`Wrote ${FILE}: ${baseline.entries.length} entries from "${environmentId}" (opal-tagged entries excluded).`);
    return;
  }

  if (!existsSync(FILE)) throw new Error(`No ${FILE}. Run npm run baseline:export first.`);
  const baseline = JSON.parse(readFileSync(FILE, "utf8")) as Baseline;
  if (baseline.environmentId !== environmentId) throw new Error(`Baseline is for "${baseline.environmentId}", not "${environmentId}".`);
  const diff = diffBaseline(baseline, live);
  const list = (title: string, ids: string[]) => ids.length && console.log(`${title} (${ids.length}): ${ids.slice(0, 15).join(", ")}${ids.length > 15 ? ", ..." : ""}`);
  list("Content changed", diff.changed);
  list("Unpublished or has unpublished changes", diff.unpublished);
  list("Missing", diff.missing);
  if (diff.added.length) {
    console.log(`Added (${diff.added.length}):`);
    for (const entry of diff.added.slice(0, 25)) console.log(`  ${entry.id.padEnd(26)} ${entry.type.padEnd(10)} ${entry.tags.join(",") || "no tags"}  ${entry.title}`);
  }
  console.log(isClean(diff) ? `Sandbox matches the baseline (${baseline.entries.length} entries, exported ${baseline.exportedAt}).` : "\nThe sandbox differs from the baseline. npm run reset restores it.");
  process.exitCode = isClean(diff) ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(`Baseline stopped: ${describeError(error)}`);
  process.exitCode = 1;
});
