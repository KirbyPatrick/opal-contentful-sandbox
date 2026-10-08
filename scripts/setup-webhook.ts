/**
 * Creates or updates the revalidation webhook for the sandbox environment.
 *
 *   npm run webhook:setup
 *
 * Points at https://opal-contentful-sandbox.vercel.app (or the base URL passed with --url) plus /api/revalidate,
 * and sends REVALIDATE_SECRET in the x-revalidate-secret header.
 */
import { describeError } from "../src/lib/contentful/errors";
import { upsertRevalidationWebhook } from "../src/lib/contentful/management";

const urlArg = process.argv.includes("--url") ? process.argv[process.argv.indexOf("--url") + 1] : undefined;
const base = urlArg ?? "https://opal-contentful-sandbox.vercel.app";
const secret = process.env.REVALIDATE_SECRET;

if (!secret || secret.length < 32) {
  console.error("REVALIDATE_SECRET is missing or too short. See .env.example.");
  process.exitCode = 1;
} else {
  upsertRevalidationWebhook(`${base.replace(/\/$/, "")}/api/revalidate`, secret).then(
    (result) => console.log(`Webhook ${result}: ${base}/api/revalidate (sandbox environment only).`),
    (error: unknown) => {
      console.error(`Webhook setup stopped: ${describeError(error)}`);
      process.exitCode = 1;
    },
  );
}
