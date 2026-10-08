# Opal Contentful Sandbox

A demo sandbox that shows Optimizely Opal creating, updating, and publishing content in Contentful, a third-party headless CMS. Six fictional brands each demonstrate one four-step conversion funnel. This is not a production site.

> Fictional companies. Sample content for illustration only.

## Status

| Phase | Scope | Status |
|---|---|---|
| 0 | Setup: scaffold, master guard, config, README | Done |
| 1 | Preflight (read-only): tooling, space, role, environments, master inventory | Done |
| 2 | Sandbox environment `opal-sandbox` and cleanup of inherited content | Done |
| 3 | Brand kits and name conflict check ([docs/brand-kits.md](docs/brand-kits.md)) | Done |
| 4 | Content model and migrations ([docs/content-model.md](docs/content-model.md)) | Done |
| 5 | Images (Pexels manifest), logos, favicons | Next |
| 6 | Seed content and funnel verification | Planned |
| 7 | Front end, Vercel deploy, revalidation, preview | Planned |
| 8 | Opal API | Planned |
| 9 | Reset script, baseline export, runbook | Planned |

## Brands

| Brand | Vertical | Funnel (step 1 to 4) |
|---|---|---|
| Lumenwork | B2B SaaS | Home, solution page, case study, book a demo |
| Stuchbery's | B2C apparel | Home, collection, product detail, add to cart |
| Harborline Mutual | Insurance | Home, coverage detail, quote start, get a quote |
| Clearwater Health | Medical | Home, specialty page, provider profile, book an appointment |
| Ledgerwood Bank | Financial services | Home, product detail, rates or comparison, start an application |
| Tidewater Journeys | Travel | Home, destination, package detail, request a booking |

## How it fits together

- **Contentful:** an existing space on the Free plan. All work happens in the `opal-sandbox` environment. `master` is never touched.
- **Front end:** Next.js (App Router, TypeScript) on Vercel, reading published content from Contentful. Phase 7.
- **Opal API:** server-side endpoints on Vercel that Opal calls to manage articles and pages. Phase 8.

## Safety model

The space's `master` environment belongs to someone else's experimentation setup. The code makes it hard to touch by mistake:

1. **Static check (no network):** `CONTENTFUL_ENVIRONMENT_ID` must be set explicitly, with no default. `master` is refused in any capitalization or padding.
2. **Live check (before the first write):** the target environment is looked up in Contentful. It is refused if it is an alias, if `master` is one of its aliases, or if `master` resolves to it. If the lookup fails, the target is refused.
3. **One factory, two clients:** `src/lib/contentful/management.ts` is the only module that loads the Contentful Management SDK. Lint and tests enforce this.
   - `getSandboxClient()` is the only client that can write. Every call is pinned to the configured space and environment. A call that names another environment is refused before any request.
   - `getReadOnlyClient()` exposes read methods only, for preflight and the read-only inventory of `master`.
   - Anything not on a client's allowlist, including the SDK's raw request helper, does not exist on that client.
4. **Rate limits:** clients send at most 5 requests per second (the Free plan allows 7). Rate-limited and server-error responses are retried using the wait time Contentful returns.

## Setup

Requires Node.js 22 and npm.

```bash
npm ci
cp .env.example .env
```

Fill in `.env` (it is gitignored), then run the checks:

```bash
npm run check
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run the site locally |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests and repo rules (master guard, import boundary, no em dashes) |
| `npm run check` | All of the above except the build |

| `npm run preflight` | Read-only checks: token, space, Admin role, environments, master inventory |
| `npm run sandbox:create` | Create the sandbox as a copy of master (idempotent) |
| `npm run sandbox:cleanup` | Dry run listing inherited content; add `-- --confirm` to delete exactly the reviewed list |
| `npm run migrate` | Apply numbered migrations to the sandbox (skips ones already applied) |
| `npm run tags:setup` | Create the seed, opal, and brand image pool tags (idempotent) |

Seed and reset scripts are added in later phases.

**Rebuild the sandbox from scratch:** `npm run sandbox:create`, then `npm run migrate`, then `npm run tags:setup` (seed comes in Phase 6).

## Repository layout

| Path | Contents |
|---|---|
| `src/app/` | Next.js routes |
| `src/lib/contentful/` | Config, master guard, client allowlists, and the client factory |
| `scripts/` | Preflight, seed, and reset scripts |
| `migrations/` | Numbered contentful-migration scripts |
| `docs/` | Content model and other documentation |
| `assets/` | Image manifest, logos, favicons |
| `tests/` | Unit tests and repo rules |

## Security notes

- Secrets come from environment variables only: a local `.env` (gitignored) and Vercel environment variables when deployed. `.env.example` lists every variable with empty values.
- GitHub secret scanning and push protection are enabled on this repository.
- Dependencies are pinned to exact versions, the lockfile is committed, and third-party install scripts are disabled in `.npmrc`. New releases are adopted once they have been public for at least 7 days.
- `eslint-config-next` is not used because its plugin depends on a glob library with an unpatched advisory (GHSA-vfj7-8cjw-p6xm). The project lints with `typescript-eslint` and `eslint-plugin-react-hooks` instead.
- Token rotation steps for the Opal API are documented in Phase 8.
