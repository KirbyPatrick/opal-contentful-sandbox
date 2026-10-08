# Renaming a brand

Each brand has three identities (see `seed/lib/brands.ts`):

| | Example (StoutWare) | Changes on a rebrand? |
|---|---|---|
| **key** | `lumenwork` | **Never.** It is inside entry IDs (`brand-lumenwork`, `lw-pg-home`), asset IDs (`img-lumenwork-01`, `logo-lumenwork`), the seed file name (`seed/brands/lumenwork.ts`), and the logo folder (`assets/brand/lumenwork/`). IDs cannot be renamed in Contentful. |
| **slug** | `stoutware` | Yes. It is the URL (`/stoutware`) and the image pool tag (`brand-stoutware`). |
| **name** | `StoutWare` | Yes. Shown on the site, in logos, and in tool responses. |

Current names: StoutWare (key `lumenwork`), Stuchbery Acres (`stuchberys`), DeFeo Mutual (`harborline-mutual`), St. Isaac's Health (`clearwater-health`), Ledgerwood Bank, Tidewater Journeys.

## Steps

1. **Code.** In `seed/lib/brands.ts` change `slug` and `name`. In `seed/brands/<key>.ts` change the brand entry's `name` and `slug` and replace the old name in copy. In `scripts/brand-assets/generate-logos.mjs` change the brand's `name`. Keep every SEO title within 60 characters (`npm run seed:check` reports any that are too long).
2. **Logos.** `npm run logos:generate` rewrites `assets/brand/<key>/logo.svg` and `favicon.svg`.
3. **Contentful, in this order** (each is safe to repeat):
   ```bash
   npm run tags:setup                          # creates the new brand-<slug> tag
   npm run assets:upload -- --retag            # gives every asset its brand's current tag
   npm run assets:upload -- --replace-logos    # re-uploads logos and favicons of renamed brands
   npm run seed                                # updates names and copy, sets the new slug, republishes
   ```
4. **Check.** `npm run verify:funnels`, then `npm run baseline:export` to record the new baseline, then `npm run opal:smoke -- https://opal-contentful-sandbox.vercel.app`.
5. **Docs and runbook.** Update the names and URLs in `README.md`, `RUNBOOK.md`, and `docs/`.
6. **Opal.** If a tool description changed, click **Sync** on the Contentful Sandbox registry (Connectors, Registries, `⋯`).

The old URL stops working as soon as the seed runs, and the old image pool tag stays in Contentful unused.

## Replacing one photo

Edit the entry in `assets/manifest.json` (Pixabay ID, alt text, photographer), then:

```bash
npm run assets:upload -- --replace <key-NN>     # for example stuchberys-04
```

It swaps the file and text in place, so every page that uses the photo updates.
