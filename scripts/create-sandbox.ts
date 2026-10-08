/**
 * Phase 2, step 1: create the sandbox environment as a copy of master.
 * Idempotent: if the environment already exists, it only re-runs the guard checks.
 */
import { describeError } from "../src/lib/contentful/errors";
import { createSandboxEnvironment } from "../src/lib/contentful/management";

createSandboxEnvironment().then(
  (result) => {
    console.log(
      result === "created"
        ? `Created "${process.env.CONTENTFUL_ENVIRONMENT_ID}" from master. It is ready and passed the master guard.`
        : `"${process.env.CONTENTFUL_ENVIRONMENT_ID}" already exists. It passed the master guard; nothing was changed.`,
    );
  },
  (error: unknown) => {
    console.error(`Create sandbox stopped: ${describeError(error)}`);
    process.exitCode = 1;
  },
);
