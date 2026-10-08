/**
 * Phase 1 preflight. Read-only: uses getReadOnlyClient(), which has no write methods.
 *
 * Checks the token, finds the space, confirms the Admin role, lists environments,
 * and inventories master. Prints a summary and writes the full inventory to
 * .local/ (gitignored), because master belongs to someone else's setup.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describeError } from "../src/lib/contentful/errors";
import { getReadOnlyClient } from "../src/lib/contentful/management";
import { PROTECTED_ENVIRONMENT_ID } from "../src/lib/contentful/guard";

const SANDBOX_ID = process.env.CONTENTFUL_ENVIRONMENT_ID || "opal-sandbox";
const FREE_PLAN_ENVIRONMENT_LIMIT = 2;
const OUTPUT_DIR = ".local";

type Status = "PASS" | "FAIL" | "WARN" | "INFO";
const results: Array<{ status: Status; check: string; detail: string }> = [];
function report(status: Status, check: string, detail: string): void {
  results.push({ status, check, detail });
  console.log(`[${status}] ${check}: ${detail}`);
}

async function optional<T>(label: string, read: () => Promise<T>): Promise<T | undefined> {
  try {
    return await read();
  } catch (error) {
    report("WARN", label, `could not read (${describeError(error)})`);
    return undefined;
  }
}

async function main(): Promise<number> {
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  report(nodeMajor === 22 ? "PASS" : "WARN", "Node.js", process.versions.node);

  const client = getReadOnlyClient();

  // 1. Token and user.
  const user = await client.user.getCurrent({});
  report("PASS", "Token", `valid, belongs to ${user.firstName} ${user.lastName}`.trim());

  // 2. Space.
  const spaces = await client.space.getMany({ query: { limit: 100 } });
  const configured = process.env.CONTENTFUL_SPACE_ID;
  const candidates = configured ? spaces.items.filter((s) => s.sys.id === configured) : spaces.items;
  if (candidates.length !== 1) {
    report(
      "FAIL",
      "Space",
      candidates.length === 0
        ? "no matching space is visible to this token"
        : `token sees ${candidates.length} spaces; choose one: ${candidates.map((s) => `${s.name} (${s.sys.id})`).join(", ")}`,
    );
    return 1;
  }
  const space = candidates[0]!;
  const spaceId = space.sys.id;
  report("PASS", "Space", `${space.name} (${spaceId})`);

  // 3. Admin role.
  const members = await optional("Space members", () =>
    client.spaceMember.getMany({ spaceId, query: { limit: 1000 } }),
  );
  const me = members?.items.find((m) => m.sys.user.sys.id === user.sys.id);
  const isAdmin = me?.admin === true;
  report(isAdmin ? "PASS" : "FAIL", "Admin role", isAdmin ? "you are a space Admin" : "you are not a space Admin (or it could not be confirmed)");

  // 4. Environments and aliases.
  const environments = await client.environment.getMany({ spaceId, query: { limit: 100 } });
  const envSummary = environments.items.map((e) => ({
    id: e.sys.id,
    name: e.name,
    status: e.sys.status?.sys.id,
    aliases: (e.sys.aliases ?? []).map((a) => a.sys.id),
  }));
  report("INFO", "Environments", envSummary.map((e) => `${e.id} (${e.status})`).join(", "));
  const aliases = await optional("Environment aliases", () => client.environmentAlias.getMany({ spaceId }));
  if (aliases) {
    report("INFO", "Aliases", aliases.items.map((a) => `${a.sys.id} -> ${a.environment.sys.id}`).join(", ") || "none");
  }
  const sandboxExists = envSummary.some((e) => e.id.toLowerCase() === SANDBOX_ID.toLowerCase());
  if (sandboxExists) {
    // After Phase 2 the sandbox is expected to exist and use the second slot.
    report("PASS", `"${SANDBOX_ID}"`, `exists; ${environments.items.length} of ${FREE_PLAN_ENVIRONMENT_LIMIT} environment slots used`);
  } else {
    const slotFree = environments.items.length < FREE_PLAN_ENVIRONMENT_LIMIT;
    report("PASS", `"${SANDBOX_ID}"`, "does not exist yet");
    report(slotFree ? "PASS" : "FAIL", "Spare environment slot", `${environments.items.length} of ${FREE_PLAN_ENVIRONMENT_LIMIT} used`);
  }

  // 5. Read-only inventory of master.
  const environmentId = PROTECTED_ENVIRONMENT_ID;
  const contentTypes = await client.contentType.getMany({ spaceId, environmentId, query: { limit: 1000 } });
  const entries = await client.entry.getMany({ spaceId, environmentId, query: { limit: 1 } });
  const assets = await client.asset.getMany({ spaceId, environmentId, query: { limit: 1 } });
  const perType: Record<string, number> = {};
  for (const ct of contentTypes.items) {
    const count = await client.entry.getMany({ spaceId, environmentId, query: { content_type: ct.sys.id, limit: 1 } });
    perType[ct.sys.id] = count.total;
  }
  const tags = await optional("Tags", () => client.tag.getMany({ spaceId, environmentId, query: { limit: 1000 } }));
  const locales = await client.locale.getMany({ spaceId, environmentId, query: { limit: 100 } });
  const apps = await optional("App installations", () => client.appInstallation.getMany({ spaceId, environmentId }));
  const extensions = await optional("UI extensions", () => client.extension.getMany({ spaceId, environmentId }));
  const webhooks = await optional("Webhooks", () => client.webhook.getMany({ spaceId }));

  report(
    "INFO",
    "master inventory",
    [
      `${contentTypes.total} content types`,
      `${entries.total} entries`,
      `${assets.total} assets`,
      `${tags?.total ?? "?"} tags`,
      `locales: ${locales.items.map((l) => `${l.code}${l.default ? " (default)" : ""}`).join(", ")}`,
      `${apps?.items.length ?? "?"} apps`,
      `${extensions?.total ?? "?"} UI extensions`,
      `${webhooks?.total ?? "?"} webhooks (space-wide)`,
    ].join(", "),
  );
  for (const ct of contentTypes.items) {
    console.log(`        - ${ct.name} (${ct.sys.id}): ${ct.fields.length} fields, ${perType[ct.sys.id]} entries`);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const outFile = join(OUTPUT_DIR, "preflight-inventory.json");
  writeFileSync(
    outFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        space: { id: spaceId, name: space.name },
        environments: envSummary,
        aliases: aliases?.items.map((a) => ({ id: a.sys.id, target: a.environment.sys.id })),
        master: {
          contentTypes: contentTypes.items.map((ct) => ({
            id: ct.sys.id,
            name: ct.name,
            fields: ct.fields.map((f) => ({ id: f.id, type: f.type })),
            entries: perType[ct.sys.id],
          })),
          entryTotal: entries.total,
          assetTotal: assets.total,
          tags: tags?.items.map((t) => ({ id: t.sys.id, name: t.name, visibility: t.sys.visibility })),
          locales: locales.items.map((l) => ({ code: l.code, default: l.default })),
          apps: apps?.items.map((a) => a.sys.appDefinition.sys.id),
          extensions: extensions?.items.map((e) => ({ id: e.sys.id, name: e.extension.name })),
          webhooks: webhooks?.items.map((w) => ({ id: w.sys.id, name: w.name, topics: w.topics, active: w.active })),
        },
        results,
      },
      null,
      2,
    ),
  );
  console.log(`\nFull inventory written to ${outFile} (gitignored).`);

  const failed = results.filter((r) => r.status === "FAIL");
  console.log(failed.length === 0 ? "\nPreflight passed." : `\nPreflight failed: ${failed.map((f) => f.check).join(", ")}.`);
  return failed.length === 0 ? 0 : 1;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    console.error(`Preflight stopped: ${describeError(error)}`);
    process.exitCode = 1;
  },
);
