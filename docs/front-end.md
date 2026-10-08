# Front end

Next.js 16 (App Router, TypeScript) on Vercel, reading published content from the `opal-sandbox` environment with the official `contentful` SDK.

## Routes

| URL | Renders |
|---|---|
| `/` | Brand directory |
| `/{brand}` | The brand's home page |
| `/{brand}/{page}` | A page (or a detail template's index view) |
| `/{brand}/{page}/{item}` | An offering, collection, provider, or article through its detail template |
| `/api/draft` | Enters draft preview (secret required) |
| `/api/draft/disable` | Leaves draft preview (POST) |
| `/api/revalidate` | Contentful webhook target (secret header required) |

## How updates reach the site

- Pages render per request, because the Content Security Policy uses a fresh nonce on every response.
- Contentful data is cached per brand (one cached read per brand) and tagged `brand:<slug>`.
- **Webhook:** publishing, unpublishing, or deleting in `opal-sandbox` calls `/api/revalidate`, which expires that brand's cache at once. The next page view fetches fresh content.
- **Fallback:** if a webhook is missed, cached content refreshes after 30 seconds anyway.
- Set up the webhook with `npm run webhook:setup`. It is filtered to the sandbox environment, so nothing in `master` ever triggers it.

## Draft preview

Draft preview reads the Preview API, is never cached (`Cache-Control: no-store`), and shows a yellow banner with an exit button.

### Configure Contentful's preview button (manual, one time)

The Content Management API does not expose content preview settings, so set these in the Contentful web app:

1. In the `opal-sandbox` environment, open **Settings > Content preview**, then **Add content preview platform**.
2. Name: `Opal sandbox site`.
3. Tick these content types: **Page, Article, Offering, Collection, Person**.
4. For each, use this preview URL, with the real value of `PREVIEW_SECRET` from `.env`:
   ```
   https://opal-contentful-sandbox.vercel.app/api/draft?secret=<PREVIEW_SECRET>&entry={entry.sys.id}
   ```
5. Save. The **Open preview** button on those entries now opens the draft on the site.

The site checks the secret in constant time, enables draft mode with a cookie, and immediately redirects to a clean URL, so the secret does not stay in the address bar. The secret is preview-only: it cannot read or change anything in Contentful.

## Security

- **Content Security Policy** set in `src/proxy.ts`:
  - scripts and styles need the per-request nonce, with no `unsafe-inline`
  - images only from this site and `images.ctfassets.net`
  - `frame-ancestors 'none'`
- HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, and `X-Robots-Tag: noindex` on every page.
- The site only holds Delivery and Preview tokens. The management token is never deployed with the front end and never reaches the browser.
- Brand theme values are validated again before they are written into the page (hex colors, known fonts, fixed radii only).
- Rich text links render only for http and https URLs. Embedded entries and assets are ignored.
- **Mock forms** never send or store anything:
  - there is no form action, and submission is cancelled in script
  - the submit button stays disabled until script loads
  - the quote handoff between steps uses browser session storage, never the URL
- **The cart** lives only in the visitor's browser (localStorage).
- Error pages are generic. Details stay in the server logs.

## Rotating secrets

1. Generate a new value: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` (run it locally and copy the output; do not paste it into chat or tickets).
2. **PREVIEW_SECRET:** update it in Vercel (Production and Preview) and in `.env`, redeploy, then update the preview URLs in Contentful's content preview settings.
3. **REVALIDATE_SECRET:** update it in Vercel and `.env`, redeploy, then run `npm run webhook:setup` so the webhook sends the new value.
4. **Delivery or Preview token:** create a new API key in Contentful (environment `opal-sandbox` only), update Vercel and `.env`, redeploy, then delete the old key.
