import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/lib/site/config";
import { CACHE_TAG_ALL, brandTag } from "@/lib/site/contentful";
import { NO_STORE, safeEqual } from "@/lib/site/secrets";

/**
 * Contentful webhook target. Called on publish, unpublish, and delete in the
 * sandbox environment. Requires the x-revalidate-secret header (constant-time
 * check), accepts at most 256 KB, validates the payload shape, and only acts
 * on the configured environment. Refreshes the affected brand's cached content.
 */
const MAX_BODY_BYTES = 256 * 1024;

const Payload = z.object({
  sys: z.object({
    id: z.string().regex(/^[A-Za-z0-9._-]{1,64}$/),
    type: z.enum(["Entry", "Asset", "DeletedEntry", "DeletedAsset"]),
    environment: z.object({ sys: z.object({ id: z.string().max(64) }) }),
    contentType: z.object({ sys: z.object({ id: z.string().max(64) }) }).optional(),
  }),
  fields: z.record(z.string(), z.unknown()).optional(),
});

function log(fields: Record<string, unknown>) {
  console.log(JSON.stringify({ source: "revalidate", at: new Date().toISOString(), ...fields }));
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: NO_STORE });

export async function POST(request: NextRequest) {
  const config = siteConfig();
  if (!safeEqual(request.headers.get("x-revalidate-secret"), config.REVALIDATE_SECRET)) {
    log({ result: "denied" });
    return json({ ok: false, error: "Not authorized." }, 401);
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return json({ ok: false, error: "Payload too large." }, 413);
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "Payload too large." }, 413);

  let parsed: z.infer<typeof Payload>;
  try {
    parsed = Payload.parse(JSON.parse(raw));
  } catch {
    log({ result: "invalid_payload" });
    return json({ ok: false, error: "Invalid payload." }, 400);
  }
  if (parsed.sys.environment.sys.id !== config.CONTENTFUL_ENVIRONMENT_ID) {
    log({ result: "ignored_environment", entityId: parsed.sys.id });
    return json({ ok: true, ignored: true });
  }

  // Seed and API entries reference their brand as brand-<slug>; anything else refreshes everything.
  const contentType = parsed.sys.contentType?.sys.id;
  const brandField = (parsed.fields?.brand as Record<string, { sys?: { id?: string } }> | undefined)?.["en-US"]?.sys?.id;
  const brandSlugField = (parsed.fields?.slug as Record<string, unknown> | undefined)?.["en-US"];
  let tags = [CACHE_TAG_ALL];
  if (contentType === "brand" && typeof brandSlugField === "string") tags = [brandTag(brandSlugField), "brands"];
  else if (brandField?.startsWith("brand-")) tags = [brandTag(brandField.slice("brand-".length))];

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  log({ result: "revalidated", entityId: parsed.sys.id, entityType: parsed.sys.type, tags });
  return json({ ok: true, tags });
}
