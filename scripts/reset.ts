/**
 * Puts the sandbox back to its demo state after Opal has been used.
 *
 *   npm run reset              Dry run (read only). Lists what would be deleted and what would be restored,
 *                              and saves the plan.
 *   npm run reset -- --confirm Does exactly the saved plan, and refuses if the sandbox changed since the
 *                              dry run:
 *                                1. unpublishes and deletes entries created through the Opal API (tagged opal)
 *                                2. runs the seed, which puts edited, unpublished, or missing seed entries back
 *                                   and republishes them
 *                                3. compares the sandbox with the baseline, if one exists
 *
 * Deleting is limited to entries tagged opal that are not seed entries; each one is re-checked just before it
 * is deleted. Runs only through getSandboxClient(), which is pinned to the sandbox and guarded against master.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { describeError } from "../src/lib/contentful/errors";
import { readSandboxTarget } from "../src/lib/contentful/config";
import { getSandboxClient } from "../src/lib/contentful/management";
import { planFingerprint, planReset, type ResetPlan } from "../seed/lib/baseline";
import { BRANDS, loadSeedEntries, toContentfulFields } from "../seed/lib/sync";
import { readLiveEntries } from "./lib/live-entries";

const PLAN_FILE = ".local/reset-plan.json";

async function buildPlan(): Promise<{ environmentId: string; plan: ResetPlan }> {
  const { environmentId } = readSandboxTarget();
  const client = await getSandboxClient();
  const live = await readLiveEntries(client, environmentId);
  const seed = (await loadSeedEntries(BRANDS)).map((entry) => ({ id: entry.id, contentType: entry.contentType, fields: toContentfulFields(entry) }));
  return { environmentId, plan: planReset(live, seed) };
}

function print(environmentId: string, plan: ResetPlan): void {
  console.log(`Sandbox "${environmentId}"\n`);
  console.log(`Created through the Opal API, would be deleted (${plan.remove.length})`);
  for (const item of plan.remove) console.log(`  ${item.id.padEnd(26)} ${item.type.padEnd(8)} ${item.published ? "published " : "draft     "} ${item.title}`);
  console.log(`\nSeed entries that would be restored by the seed (${plan.restore.length})`);
  for (const item of plan.restore.slice(0, 40)) console.log(`  ${item.id.padEnd(30)} ${item.reason}`);
  if (plan.restore.length > 40) console.log(`  ... and ${plan.restore.length - 40} more`);
  for (const item of plan.refused) console.log(`\nNot deleted: ${item.id} (${item.why})`);
}

function run(script: string): number {
  return spawnSync("npm", ["run", script], { stdio: "inherit" }).status ?? 1;
}

async function main(): Promise<void> {
  const confirm = process.argv.includes("--confirm");
  const { environmentId, plan } = await buildPlan();

  if (!confirm) {
    print(environmentId, plan);
    mkdirSync(".local", { recursive: true });
    writeFileSync(PLAN_FILE, JSON.stringify({ environmentId, plan }, null, 2));
    if (plan.remove.length + plan.restore.length === 0) {
      console.log("\nNothing to do: the sandbox is already in its demo state.");
      return;
    }
    console.log(`\nDry run only. Nothing was changed. Plan saved to ${PLAN_FILE}.`);
    console.log("To do exactly this: npm run reset -- --confirm");
    return;
  }

  if (!existsSync(PLAN_FILE)) throw new Error("No saved plan. Run the dry run first and review it.");
  const approved = JSON.parse(readFileSync(PLAN_FILE, "utf8")) as { environmentId: string; plan: ResetPlan };
  if (approved.environmentId !== environmentId || planFingerprint(approved.plan) !== planFingerprint(plan)) {
    throw new Error("The sandbox no longer matches the reviewed plan. Run the dry run again and re-review.");
  }

  const client = await getSandboxClient();
  let deleted = 0;
  for (const item of approved.plan.remove) {
    const entry = await client.entry.get({ entryId: item.id });
    const tags = (entry.metadata?.tags ?? []).map((tag) => tag.sys.id);
    if (!tags.includes("opal") || tags.includes("seed")) throw new Error(`Refusing to delete ${item.id}: it is not an Opal-created entry.`);
    if (entry.sys.publishedVersion) await client.entry.unpublish({ entryId: item.id });
    await client.entry.delete({ entryId: item.id });
    console.log(`  deleted ${item.id} (${++deleted} of ${approved.plan.remove.length})`);
  }

  if (approved.plan.restore.length > 0) {
    console.log("\nRestoring seed content...");
    if (run("seed") !== 0) throw new Error("The seed stopped before finishing. Fix the error above and run npm run seed.");
  }
  if (existsSync("baseline/baseline.json")) {
    console.log("\nChecking against the baseline...");
    if (run("baseline:check") !== 0) throw new Error("The sandbox still differs from the baseline. See the list above.");
  }
  console.log("\nReset complete.");
}

main().catch((error: unknown) => {
  console.error(`Reset stopped: ${describeError(error)}`);
  process.exitCode = 1;
});
