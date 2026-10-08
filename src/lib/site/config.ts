import "server-only";
import { z } from "zod";
import { CONTENTFUL_ID_PATTERN } from "@/lib/contentful/config";
import { assertSafeEnvironmentId } from "@/lib/contentful/guard";

/**
 * Front end settings from environment variables. Read on the server only;
 * none of these values are ever sent to the browser.
 */
const schema = z.object({
  CONTENTFUL_SPACE_ID: z.string().regex(CONTENTFUL_ID_PATTERN),
  CONTENTFUL_ENVIRONMENT_ID: z.string().regex(CONTENTFUL_ID_PATTERN),
  CONTENTFUL_DELIVERY_TOKEN: z.string().min(20).regex(/^\S+$/),
  CONTENTFUL_PREVIEW_TOKEN: z.string().min(20).regex(/^\S+$/),
  PREVIEW_SECRET: z.string().min(32).regex(/^\S+$/),
  REVALIDATE_SECRET: z.string().min(32).regex(/^\S+$/),
  SITE_URL: z.string().url(),
});

export type SiteConfig = z.infer<typeof schema>;

let cached: SiteConfig | undefined;

export function siteConfig(): SiteConfig {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new Error(`Missing or invalid environment variable(s): ${names.join(", ")}.`);
  }
  // The site may read the sandbox only; master is refused here too.
  assertSafeEnvironmentId(result.data.CONTENTFUL_ENVIRONMENT_ID);
  cached = result.data;
  return cached;
}
