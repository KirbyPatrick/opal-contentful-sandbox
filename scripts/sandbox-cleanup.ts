/**
 * Phase 2, step 2: remove everything the sandbox inherited from master.
 *
 *   npm run sandbox:cleanup              Dry run. Lists what would be deleted and saves the plan.
 *   npm run sandbox:cleanup -- --confirm Deletes exactly the saved plan, and refuses if the
 *                                        sandbox no longer matches it.
 *
 * Runs only through getSandboxClient(), which is pinned to the sandbox and guarded against master.
 * Keeps the default locale (must be en-US) and deletes every other locale.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describeError } from "../src/lib/contentful/errors";
import { getSandboxClient } from "../src/lib/contentful/management";

const PLAN_FILE = join(".local", "cleanup-plan.json");
const KEEP_LOCALE = "en-US";

interface Item {
  id: string;
  label: string;
  published: boolean;
}

interface Plan {
  environmentId: string;
  entries: Item[];
  assets: Item[];
  contentTypes: Item[];
  locales: Item[];
  tags: Item[];
}

const ids = (plan: Plan) =>
  JSON.stringify([plan.entries, plan.assets, plan.contentTypes, plan.locales, plan.tags].map((group) => group.map((item) => item.id).sort()));

function short(value: unknown): string {
  const text = typeof value === "string" ? value : value === undefined ? "(untitled)" : JSON.stringify(value);
  return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}

async function buildPlan(): Promise<Plan> {
  const client = await getSandboxClient();
  const [contentTypes, entries, assets, locales, tags] = await Promise.all([
    client.contentType.getMany({ query: { limit: 1000 } }),
    client.entry.getMany({ query: { limit: 1000 } }),
    client.asset.getMany({ query: { limit: 1000 } }),
    client.locale.getMany({ query: { limit: 100 } }),
    client.tag.getMany({ query: { limit: 1000 } }),
  ]);
  if (entries.total > entries.items.length || assets.total > assets.items.length) {
    throw new Error("More than 1000 entries or assets; extend this script with paging before continuing.");
  }

  const defaultLocale = locales.items.find((locale) => locale.default);
  if (defaultLocale?.code !== KEEP_LOCALE) {
    throw new Error(`Default locale is "${defaultLocale?.code}", expected "${KEEP_LOCALE}". Stopping.`);
  }

  const displayField = new Map(contentTypes.items.map((ct) => [ct.sys.id, ct.displayField]));
  const typeName = new Map(contentTypes.items.map((ct) => [ct.sys.id, ct.name]));

  return {
    environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID ?? "",
    entries: entries.items.map((entry) => {
      const typeId = entry.sys.contentType.sys.id;
      const field = displayField.get(typeId);
      const title = field ? entry.fields[field]?.[KEEP_LOCALE] : undefined;
      return {
        id: entry.sys.id,
        label: `${typeName.get(typeId) ?? typeId}: ${short(title)}`,
        published: Boolean(entry.sys.publishedVersion),
      };
    }),
    assets: assets.items.map((asset) => ({
      id: asset.sys.id,
      label: short(asset.fields.title?.[KEEP_LOCALE] ?? asset.fields.file?.[KEEP_LOCALE]?.fileName),
      published: Boolean(asset.sys.publishedVersion),
    })),
    contentTypes: contentTypes.items.map((ct) => ({
      id: ct.sys.id,
      label: ct.name,
      published: Boolean(ct.sys.publishedVersion),
    })),
    locales: locales.items
      .filter((locale) => !locale.default)
      .map((locale) => ({ id: locale.sys.id, label: `${locale.name} (${locale.code})`, published: false })),
    tags: tags.items.map((tag) => ({ id: tag.sys.id, label: tag.name, published: false })),
  };
}

function printPlan(plan: Plan): void {
  const groups: Array<[string, Item[]]> = [
    ["Entries", plan.entries],
    ["Assets", plan.assets],
    ["Content types", plan.contentTypes],
    ["Locales", plan.locales],
    ["Tags", plan.tags],
  ];
  console.log(`Sandbox "${plan.environmentId}": everything below would be deleted.\n`);
  for (const [name, items] of groups) {
    console.log(`${name} (${items.length})`);
    for (const item of items) {
      console.log(`  ${item.id.padEnd(24)} ${item.published ? "published " : "draft     "} ${item.label}`);
    }
    console.log("");
  }
}

async function deletePlan(plan: Plan): Promise<void> {
  const client = await getSandboxClient();
  let done = 0;
  const step = (what: string) => console.log(`  deleted ${what} (${++done})`);

  for (const item of plan.entries) {
    const entry = await client.entry.get({ entryId: item.id });
    if (entry.sys.publishedVersion) await client.entry.unpublish({ entryId: item.id });
    await client.entry.delete({ entryId: item.id });
    step(`entry ${item.id}`);
  }
  for (const item of plan.assets) {
    const asset = await client.asset.get({ assetId: item.id });
    if (asset.sys.publishedVersion) await client.asset.unpublish({ assetId: item.id });
    await client.asset.delete({ assetId: item.id });
    step(`asset ${item.id}`);
  }
  for (const item of plan.contentTypes) {
    const contentType = await client.contentType.get({ contentTypeId: item.id });
    if (contentType.sys.publishedVersion) await client.contentType.unpublish({ contentTypeId: item.id });
    await client.contentType.delete({ contentTypeId: item.id });
    step(`content type ${item.id}`);
  }
  for (const item of plan.locales) {
    await client.locale.delete({ localeId: item.id });
    step(`locale ${item.label}`);
  }
  for (const item of plan.tags) {
    const tag = await client.tag.get({ tagId: item.id });
    await client.tag.delete({ tagId: item.id, version: tag.sys.version });
    step(`tag ${item.id}`);
  }
}

async function main(): Promise<void> {
  const confirm = process.argv.includes("--confirm");
  const plan = await buildPlan();

  if (!confirm) {
    printPlan(plan);
    mkdirSync(".local", { recursive: true });
    writeFileSync(PLAN_FILE, JSON.stringify(plan, null, 2));
    console.log(`Dry run only. Nothing was deleted. Plan saved to ${PLAN_FILE}.`);
    console.log("To delete exactly this list: npm run sandbox:cleanup -- --confirm");
    return;
  }

  if (!existsSync(PLAN_FILE)) {
    throw new Error("No saved plan. Run the dry run first and review it.");
  }
  const approved = JSON.parse(readFileSync(PLAN_FILE, "utf8")) as Plan;
  if (approved.environmentId !== plan.environmentId || ids(approved) !== ids(plan)) {
    throw new Error("The sandbox no longer matches the reviewed plan. Run the dry run again and re-review.");
  }
  console.log(`Deleting the reviewed plan from "${plan.environmentId}"...`);
  await deletePlan(approved);
  console.log("Cleanup complete.");
}

main().catch((error: unknown) => {
  console.error(`Sandbox cleanup stopped: ${describeError(error)}`);
  process.exitCode = 1;
});
