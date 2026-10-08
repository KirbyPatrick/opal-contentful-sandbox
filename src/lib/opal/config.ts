/**
 * Opal API settings, read from environment variables only. Error messages
 * name the variable but never include its value.
 */
import { z } from "zod";

export class OpalConfigError extends Error {
  override name = "OpalConfigError";
}

const schema = z.object({
  // Opal sends this as "Authorization: Bearer <token>" on every tool call.
  OPAL_API_TOKEN: z.string().min(32).max(512).regex(/^\S+$/),
  SITE_URL: z.string().url(),
  PREVIEW_SECRET: z.string().min(32).regex(/^\S+$/),
});

export interface OpalConfig {
  apiToken: string;
  /** Site origin without a trailing slash. */
  siteUrl: string;
  previewSecret: string;
}

export function readOpalConfig(env: Readonly<Record<string, string | undefined>> = process.env): OpalConfig {
  const input = Object.fromEntries(
    Object.keys(schema.shape).map((name) => [name, env[name] === "" ? undefined : env[name]]),
  );
  const result = schema.safeParse(input);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new OpalConfigError(`Missing or invalid environment variable(s): ${names.join(", ")}.`);
  }
  return {
    apiToken: result.data.OPAL_API_TOKEN,
    siteUrl: new URL(result.data.SITE_URL).origin,
    previewSecret: result.data.PREVIEW_SECRET,
  };
}
