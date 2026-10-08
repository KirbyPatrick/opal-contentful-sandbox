import { NextResponse, type NextRequest } from "next/server";

/**
 * Sets a fresh nonce and a strict Content Security Policy on every page.
 * Next.js reads the nonce from the request header and applies it to its own
 * scripts and styles. No 'unsafe-inline' for scripts or styles; images only
 * from this site and Contentful's image CDN; framing only by Contentful's
 * Live preview pane.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  // Contentful's Live preview pane may embed the site; no other site can. The browser may not
  // send the draft cookie inside the frame, so framing cannot depend on it. The site has no
  // logins or sensitive actions, so allowing Contentful's app to frame it is low risk.
  const frameAncestors = "'self' https://app.contentful.com";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: https://images.ctfassets.net",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  return response;
}

export const config = {
  matcher: [
    {
      // Anchored so only /api/... and exact file names are skipped (a brand slug like "apiary" still gets the CSP).
      source: "/((?!api/|api$|_next/static/|_next/image|favicon\\.ico$|icon\\.svg$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
