import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/lib/site/config";
import { findEntryForPreview, getBrandGraph } from "@/lib/site/contentful";
import { BrandGraph } from "@/lib/site/graph";
import { NO_STORE, safeEqual } from "@/lib/site/secrets";

/**
 * Enters draft preview. Contentful's preview button opens
 *   /api/draft?secret=<PREVIEW_SECRET>&entry=<entry id>
 * The secret is checked in constant time, draft mode is enabled with a
 * cookie, and the browser is redirected to the entry's page on a clean URL
 * (the secret is not kept in the address bar or history entry).
 */
const SAFE_PATH = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/(?!\/))?)*$/;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (!safeEqual(params.get("secret"), siteConfig().PREVIEW_SECRET)) {
    return new Response("Not authorized.", { status: 401, headers: NO_STORE });
  }

  let path = "/";
  const entryId = params.get("entry");
  const requestedPath = params.get("path");
  if (entryId) {
    const found = await findEntryForPreview(entryId);
    if (found?.brandSlug) {
      const data = await getBrandGraph(found.brandSlug, true);
      if (data) {
        const g = new BrandGraph(data);
        path = g.urlFor(g.entry({ sys: { id: entryId } })) ?? `/${g.slug}`;
      }
    }
  } else if (requestedPath && SAFE_PATH.test(requestedPath) && requestedPath.length <= 200) {
    path = requestedPath;
  }

  (await draftMode()).enable();
  return new Response(null, { status: 307, headers: { ...NO_STORE, Location: path } });
}
