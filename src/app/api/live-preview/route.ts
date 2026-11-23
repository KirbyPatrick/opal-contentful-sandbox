import type { NextRequest } from "next/server";
import { findEntryForPreview } from "@/lib/site/contentful";
import { isEntryId, livePreviewPath, sandboxSlugFromId } from "@/lib/site/live-preview";
import { NO_STORE } from "@/lib/site/secrets";

/**
 * Contentful Live Preview entry point for the two sandbox pages:
 *   /api/live-preview?entry=<entry id>
 * Redirects to /example?preview=true or /placeholder?preview=true, whichever page the entry belongs to.
 * It reveals nothing those URLs do not already show, so it needs no secret. Seeded entries are matched by
 * ID prefix; any other entry is looked up once in the Preview API to find its brand.
 */
export async function GET(request: NextRequest) {
  const entryId = request.nextUrl.searchParams.get("entry");
  if (!isEntryId(entryId)) return new Response("Unknown entry.", { status: 404, headers: NO_STORE });

  let path = livePreviewPath(sandboxSlugFromId(entryId));
  if (!path) path = livePreviewPath((await findEntryForPreview(entryId))?.brandSlug);
  if (!path) return new Response("This entry is not on a sandbox page.", { status: 404, headers: NO_STORE });

  return new Response(null, { status: 307, headers: { ...NO_STORE, Location: path } });
}
