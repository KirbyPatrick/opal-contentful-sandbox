# Demo runbook

How to run the Opal and Contentful demo, and put everything back afterwards. Everything here is fictional sample content.

**Live site:** https://opal-contentful-sandbox.vercel.app  
**Agent in Opal:** `@contentful` (details in [docs/opal-agent.md](docs/opal-agent.md))

## Before the demo (2 minutes)

Run these in a Terminal in the repo folder:

```bash
npm run opal:smoke -- https://opal-contentful-sandbox.vercel.app   # all checks must pass
npm run baseline:check                                              # must say the sandbox matches the baseline
```

If the baseline check lists changes or added entries, run the reset (below) first. Then open the live site and Opal chat.

## The four prompts

Each one below was run through Opal against the live site. In chat, type them as written. The agent asks before publishing, so in the demo say "yes, publish it" after you see the preview.

| # | Say this to `@contentful` | What happens |
|---|---|---|
| 1 | `Which brands are on the site? Then show me StoutWare's pages with their status and live URLs.` | Read only. Lists the six brands and StoutWare's pages with live links. |
| 2 | `Write a short article for StoutWare about getting started with automated approvals. Pick a hero image from StoutWare's own pool, save it as a draft, and show me the preview link. Do not publish it yet.` | Reads the brand voice, picks an image, links an author and a related page, saves a **draft**, and returns a preview link. Nothing is live. |
| 3 | `Change the headline of the StoutWare home page hero to 'Approvals in hours, not weeks' and publish it now.` | Finds the hero, edits only the headline, publishes. The live StoutWare home shows it within about 35 seconds. |
| 4 | `Take the StoutWare article <entry id from prompt 2> off the live site.` (publish it first with `Publish the StoutWare article <entry id>`) | Publishes or unpublishes the article. Unpublishing returns it to draft; nothing is deleted. |

Talking points:

- The agent can only do what the nine tools allow. It cannot delete, and it cannot change slugs, brands, page types, prices, or links between pages.
- Every change is a draft with a preview link first. Publishing is a separate step that needs a version number, so two people cannot overwrite each other by accident.
- **Timing:** after a publish, the live site usually updates in 3 to 5 seconds, but measured times went up to 34 seconds. Tell the audience "up to about 35 seconds" or have another tab open.

## After the demo: reset

```bash
npm run reset
```

This is a dry run. It lists what it would delete (only articles created through the Opal API, tagged `opal`) and what it would restore (seed entries that were edited or unpublished). Read the list, then:

```bash
npm run reset -- --confirm
```

That deletes exactly the listed Opal-created entries, runs the seed to put edited entries back and republish them, and finishes with the baseline check. It refuses to run if the sandbox changed since the dry run.

- `npm run baseline:check` (read only) shows what differs from the baseline at any time.
- `npm run baseline:export` re-records the baseline. It refuses if seed content is currently edited, so reset first.

## Funnel URLs

All start at `https://opal-contentful-sandbox.vercel.app`.

| Brand | Step 1 | Step 2 | Step 3 | Step 4 (goal) |
|---|---|---|---|---|
| StoutWare | `/stoutware` | `/stoutware/solutions/intake-and-requests` | `/stoutware/customers` | `/stoutware/book-a-demo` |
| Stuchbery Acres | `/stuchbery-acres` | `/stuchbery-acres/fieldstone-collection` | `/stuchbery-acres/shop/hearthside-knit-gloves` | `/stuchbery-acres/cart` |
| DeFeo Mutual | `/defeo-mutual` | `/defeo-mutual/coverage/auto-insurance` | `/defeo-mutual/start-a-quote` | `/defeo-mutual/get-a-quote` |
| St. Isaac's Health | `/st-isaacs-health` | `/st-isaacs-health/specialties/primary-care` | `/st-isaacs-health/providers/marisol-vance` | `/st-isaacs-health/book-an-appointment` |
| Ledgerwood Bank | `/ledgerwood-bank` | `/ledgerwood-bank/products/everyday-checking` | `/ledgerwood-bank/rates` | `/ledgerwood-bank/apply` |
| Tidewater Journeys | `/tidewater-journeys` | `/tidewater-journeys/destinations/coastal-portugal` | `/tidewater-journeys/trips/alentejo-coast-on-foot` | `/tidewater-journeys/request-a-booking` |

## Key entry IDs

Handy when you want to point the agent at a specific entry (for example `Update entry lw-he-home ...`).

| Brand (slug) | Home page | Home hero (headline) | Offering | Article | Author |
|---|---|---|---|---|---|
| StoutWare (`stoutware`) | `lw-pg-home` | `lw-he-home` ("Keep operations work moving from request to done") | `lw-of-approvals` | `lw-ar-handoffs-worth-automating` | `lw-pe-elliot-brandt` |
| Stuchbery Acres (`stuchbery-acres`) | `sb-pg-home` | `sb-he-home` ("Good coats for cold mornings") | `sb-of-ashcombe-flannel-shirt` | `sb-ar-caring-for-wool` | `sb-pe-elena-marsh` |
| DeFeo Mutual (`defeo-mutual`) | `hm-pg-home` | `hm-he-home` ("Steady coverage for you and your family") | `hm-of-auto-insurance` | `hm-ar-how-deductibles-work` | `hm-pe-clara-benning` |
| St. Isaac's Health (`st-isaacs-health`) | `ch-pg-home` | `ch-he-home` ("Care that keeps up with you") | provider pages use people | `ch-ar-preparing-questions-for-your-care-team` | `ch-pe-hannah-lindqvist` |
| Ledgerwood Bank (`ledgerwood-bank`) | `lb-pg-home` | `lb-he-home` ("Everyday banking, with the math shown up front") | `lb-of-cash-back-card` | `lb-ar-apr-and-apy-explained` | `lb-pe-elena-marsh` |
| Tidewater Journeys (`tidewater-journeys`) | `tj-pg-home` | `tj-he-home` ("Slow journeys along Europe's Atlantic edge") | `tj-of-alentejo-coast-on-foot` | `tj-ar-choosing-the-right-trip-pace` | `tj-pe-ines-valadares` |

## If something goes wrong

| Symptom | What to do |
|---|---|
| The agent says a tool failed or is unavailable | Run `npm run opal:smoke -- https://opal-contentful-sandbox.vercel.app`. If it fails with `server_misconfigured`, a Vercel variable is missing (see [docs/opal-api.md](docs/opal-api.md), Deployment). |
| Smoke test passes but Opal calls fail | In Opal, **Connectors**, **Registries**: check the bearer token matches `OPAL_API_TOKEN`, then use `⋯` and **Sync**. |
| The agent cannot see its tools | The registry must be **Active**; **Enabled in Chat** stays off. Sync the registry. |
| A publish does not appear on the site | Wait up to 35 seconds. If still missing, check the entry status with `@contentful get entry <id>`. |
| Preview link says not authorized | Preview links last 24 hours. Ask the agent for a fresh one. |
| `version_conflict` | The entry changed since it was read. The agent re-reads and retries; just ask again. |
| The sandbox is messy | `npm run reset`, review, then `npm run reset -- --confirm`. |

Token rotation and the full tool reference are in [docs/opal-api.md](docs/opal-api.md).

## The Example page (recreating a prospect's page for a demo)

`/example` is a sandbox page that looks like a prospect's own page. Its copy lives in Contentful (the `example` brand, entry IDs `ex-...`, defined in `seed/brands/example.ts`) so Opal can read and edit it, and `src/app/example/page.tsx` plus the `.gs1-*` block in `src/app/globals.css` draw the layout. The page header, nav and footer are fixed labels in the layout, not content.

It currently recreates a standards organization's "UPC, Barcodes & Prefixes" page (comparison table, overview, why, how-to photo cards, pricing table, help band). The copy is paraphrased and the footer says it is a demo mockup.

To rebuild it for another prospect:

1. Look at their page (read its text and styles in the browser, take a screenshot) and write the new layout in `src/app/example/page.tsx` and the CSS block (replace the `.gs1-*` rules; use a new prefix). For a close match, copy the pixel sizes, colors and spacing from the live page's computed styles at 1440px wide, then compare element positions on both pages. If their font is not available, pick the nearest Google font and tune `letter-spacing` until text widths match (the GS1 page uses Montserrat at `0.032em` for Gotham SSm).
2. Rewrite `seed/brands/example.ts` with the new copy. Use the standard content types (rich text, card grid, FAQ, offerings, CTAs). A sandbox brand may have exactly one page.
3. Photos: search Pixabay, add the picks to `assets/manifest.json` with `"brand": "example"` (keys `example-01` and so on), then `npm run assets:upload`. For a new brand tag, `npm run tags:setup` first.
4. `npm run seed -- --dry-run`, then `npm run seed`.
5. Remove entries the new seed no longer uses: `npm run prune:example` (dry run), then `npm run prune:example -- --confirm`. Do this after deploying the new layout, so the live page never points at missing content.
6. `npm run baseline:export`, run `npm run check`, commit, and deploy (`vercel deploy --prod`, or push if auto-deploys work).

`npm run reset` restores the Example page to its seeded copy after a demo (it also deletes articles Opal created, so check `npm run baseline:check` first if you want to keep any).

