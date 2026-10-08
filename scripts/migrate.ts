/**
 * Applies the numbered migrations in migrations/ to the sandbox environment.
 * Already-applied migrations are skipped, so this is safe to re-run.
 */
import { MIGRATIONS } from "../migrations";
import { describeError } from "../src/lib/contentful/errors";
import { applyMigrations } from "../src/lib/contentful/migration-runner";

applyMigrations(MIGRATIONS).then(
  ({ applied, skipped }) => {
    console.log(`\nMigrations done. Applied: ${applied.join(", ") || "none"}. Skipped: ${skipped.join(", ") || "none"}.`);
  },
  (error: unknown) => {
    console.error(`Migration stopped: ${describeError(error)}`);
    console.error("Any migration error log is in .local/migration-logs/ (redacted).");
    process.exitCode = 1;
  },
);
