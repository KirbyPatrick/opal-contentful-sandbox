/**
 * The only module allowed to load contentful-migration at runtime (enforced
 * by ESLint and tests/repo-rules.test.ts).
 *
 * Runs the master guard through getSandboxClient() before every run, then
 * applies each migration that is not already present in the sandbox.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { runMigration, type MigrationFunction } from "contentful-migration";
import { readManagementToken, readSandboxTarget } from "./config";
import { redactSecrets } from "./errors";
import { getSandboxClient } from "./management";

export interface MigrationModule {
  id: string;
  description: string;
  isApplied(existingContentTypes: ReadonlySet<string>): boolean;
  default: MigrationFunction;
}

// Stay below the Free plan's 7 requests per second.
const REQUESTS_PER_SECOND = 5;
const LOG_DIR = join(".local", "migration-logs");

export async function applyMigrations(
  migrations: readonly MigrationModule[],
  log: (line: string) => void = console.log,
): Promise<{ applied: string[]; skipped: string[] }> {
  const client = await getSandboxClient();
  const { spaceId, environmentId } = readSandboxTarget();
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const migration of migrations) {
    const contentTypes = await client.contentType.getMany({ query: { limit: 1000 } });
    const existing = new Set(contentTypes.items.map((ct) => ct.sys.id));
    if (migration.isApplied(existing)) {
      skipped.push(migration.id);
      log(`Skipping ${migration.id}: already applied.`);
      continue;
    }
    log(`Applying ${migration.id}: ${migration.description}`);
    await withLogsInLocalDir(() =>
      runMigration({
        migrationFunction: migration.default,
        spaceId,
        environmentId,
        accessToken: readManagementToken(),
        yes: true,
        requestLimit: REQUESTS_PER_SECOND,
        retryLimit: 6,
      }),
    );
    applied.push(migration.id);
  }
  return { applied, skipped };
}

/**
 * contentful-migration writes error logs (with request details) to the
 * working directory. Run it from a gitignored folder and redact what it writes.
 */
async function withLogsInLocalDir<T>(run: () => Promise<T>): Promise<T> {
  const original = process.cwd();
  const logDir = resolve(original, LOG_DIR);
  mkdirSync(logDir, { recursive: true });
  process.chdir(logDir);
  try {
    return await run();
  } finally {
    process.chdir(original);
    for (const file of existsSync(logDir) ? readdirSync(logDir) : []) {
      const path = join(logDir, file);
      writeFileSync(path, redactSecrets(readFileSync(path, "utf8")));
    }
  }
}
