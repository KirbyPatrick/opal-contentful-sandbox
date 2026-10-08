import { cookies, draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { verifyPreviewLink } from "@/lib/opal/preview";
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
 *
 * The Opal API hands out a different link instead, one that never contains
 * the secret:
 *   /api/draft?entry=<entry id>&exp=<unix seconds>&sig=<HMAC>
 * The signature covers that one entry and the expiry time (see lib/opal/preview.ts).
 */
const SAFE_PATH = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/(?!\/))?)*$/;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const { PREVIEW_SECRET } = siteConfig();
  const hasSecret = safeEqual(params.get("secret"), PREVIEW_SECRET);
  const hasSignedLink = verifyPreviewLink(PREVIEW_SECRET, params.get("entry"), params.get("exp"), params.get("sig"), Date.now());
  if (!hasSecret && !hasSignedLink) {
    return new Response("Not authorized.", { status: 401, headers: NO_STORE });
  }

  let path = "/";
  const entryId = params.get("entry");
  // A signed link only opens its own entry; arbitrary paths need the secret.
  const requestedPath = hasSecret ? params.get("path") : null;
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
  const headers = new Headers({ ...NO_STORE, Location: path });
  // Inside Contentful's Live preview frame, Chrome may block normal third-party cookies.
  // A partitioned copy of the draft cookie (CHIPS) is kept for this frame only.
  const bypass = (await cookies()).get("__prerender_bypass")?.value;
  if (bypass && /^[A-Za-z0-9]+$/.test(bypass)) {
    headers.append("Set-Cookie", `__prerender_bypass=${bypass}; Path=/; HttpOnly; Secure; SameSite=None; Partitioned`);
  }
  return new Response(null, { status: 307, headers });
}
