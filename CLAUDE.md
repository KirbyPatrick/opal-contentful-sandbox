# Working rules for this repo

Contentful sandbox with six fictional brands, a Next.js front end, and an API that lets Optimizely Opal create, update, and publish content. Demo use only.

## Contentful safety
- Never modify, delete, publish, or uninstall anything in the `master` environment. It belongs to someone else's experimentation setup.
- Get Contentful Management API clients only from `src/lib/contentful/management.ts`:
  - `getSandboxClient()` for any write. It is pinned to `CONTENTFUL_ENVIRONMENT_ID` and runs the static and live master checks first.
  - `getReadOnlyClient()` for reads, including the read-only master inventory.
- Ask the user before anything that writes to or deletes from Contentful, and before any deploy.
- Free plan limits: 7 CMA requests per second, a monthly API call quota, 25 content types, 10,000 records. Keep traffic throttled and batched.
- Everything is code: migrations and idempotent seed scripts. Nothing is hand-built in the Contentful web UI.

## Secrets and logging
- Secrets come from environment variables only. Never print, log, commit, or echo secret values, and never put tokens in URLs.
- Never print a raw Contentful SDK error. Use `describeError()` from `src/lib/contentful/errors.ts`.

## Code and copy
- No em dashes anywhere in copy, docs, or comments. Use hyphens. `npm test` enforces this.
- Never use `dangerouslySetInnerHTML`. ESLint enforces this.
- Pin dependency versions exactly, adopt releases that have been public for at least 7 days, and keep `npm audit` clean.
- Next.js 16 ships version-matched docs in `node_modules/next/dist/docs/`. Read the relevant guide before writing Next.js code.
- Run `npm run check` (lint, typecheck, tests) before committing.
