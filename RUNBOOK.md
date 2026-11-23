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

- The agent can only do what the thirteen tools allow. It can delete only content it created, and it cannot change slugs, brands, page types, prices, or links between pages.
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

`/example` is a sandbox page that looks like a prospect's own page. Its copy lives in Contentful (the `example` brand, entry IDs `ex-...`, defined in `seed/brands/example.ts`) so Opal can read and edit it, and `src/app/example/page.tsx` plus the `.pe-*` block in `src/app/globals.css` draw the layout. The page header, nav and footer are fixed labels in the layout, not content.

It currently recreates a sunroom company's home page (header with phone, offers button and zip finder, product nav, hero photo with an anniversary seal and title band, intro line, eight product cards, "How to get started" link columns, product links, footer, and a sticky orange estimate bar with a chat button). Headings and labels match the prospect's page; longer copy is reworded, and the footer says it is a demo mockup. The zip finder submits back to the page, because the site's CSP only allows forms to post to itself.

Stable IDs for building tests in Optimizely's visual editor: `#hero-banner`, `#hero-headline`, `#hero-subhead` (the intro line), `#hero-cta` (the sticky bar's Schedule Now button), `#sticky-cta-bar`, `#offers-cta`, `#phone-cta`, `#zip-locator`, `#product-grid`, `#product-<name>` for each card (for example `#product-sunrooms`), `#get-started`, `#our-products` and `#chat-button`. The page loads the Optimizely Web Experimentation snippet for project 6231585842790400 (`OPTIMIZELY_SNIPPET` in `src/app/example/page.tsx`), and the site allows `https://app.optimizely.com` to embed it, so the visual editor works without a browser extension (see `src/proxy.ts`).

To rebuild it for another prospect:

1. Look at their page (read its text and styles in the browser, take a screenshot) and write the new layout in `src/app/example/page.tsx` and the CSS block (replace the `.pe-*` rules; use a new prefix). For a close match, copy the pixel sizes, colors and spacing from the live page's computed styles at 1440px wide, then compare element positions on both pages. If their font is not available, pick the nearest Google font and tune `letter-spacing` until text widths match (an earlier page used Montserrat at `0.032em` for Gotham SSm; the sunroom page uses Arial, like the prospect).
2. Rewrite `seed/brands/example.ts` with the new copy. Use the standard content types (rich text, card grid, FAQ, offerings, CTAs). A sandbox brand may have exactly one page.
3. Photos: search Pixabay, add the picks to `assets/manifest.json` with `"brand": "example"` (keys `example-01` and so on), then `npm run assets:upload`. For a new brand tag, `npm run tags:setup` first. Without a Pixabay key, save the JPEG as `assets/photos/<key>.jpg` and run `npm run assets:upload -- --replace-file <key>`.
4. `npm run seed -- --dry-run`, then `npm run seed`.
5. Remove entries the new seed no longer uses: `npm run prune:example` (dry run), then `npm run prune:example -- --confirm` (deletes) or `npm run prune:example -- --confirm --unpublish-only` (keeps them as restorable drafts). Do this after deploying the new layout, so the live page never points at missing content.
6. `npm run baseline:export`, run `npm run check`, commit, and deploy (`vercel deploy --prod`, or push if auto-deploys work).

`npm run reset` restores the Example page to its seeded copy after a demo (it also deletes articles Opal created, so check `npm run baseline:check` first if you want to keep any).

## The Placeholder page (a second prospect page)

`/placeholder` is a second sandbox page, kept apart from `/example` so two prospect pages can be live at once. It works the same way: the `placeholder` brand (entry IDs `ph-...`, defined in `seed/brands/placeholder.ts`) holds the copy, and `src/app/placeholder/page.tsx` plus the `.lgd-*` block in `src/app/globals.css` draw the layout. It currently recreates a gutter company's home page (leafguard.homes). Headings, labels, button text, FAQ questions and short card lines match the prospect; longer paragraphs, FAQ answers and the offer terms are reworded, and the reviews are samples.

Unlike Example, it uses the prospect's own images: `assets/prospects/placeholder/` holds the files and a manifest (asset IDs `logo-placeholder`, `img-placeholder-logo-white`, `img-placeholder-01` to `13`), uploaded with `npm run assets:prospect -- placeholder` (one asset: add its ID). The hero is its own entry (`ph-he-home`), so an agent can edit it as a draft; its CTA (`ph-ct-get-prices`) holds the estimate box's title lines and button. Phones get `img-placeholder-13` as the hero photo, like the source page.

Stable IDs: `#call-banner`, `#call-cta`, `#hero-banner`, `#hero-headline`, `#hero-subhead`, `#hero-form`, `#hero-cta`, `#promise`, `#warranty`, `#worries`, `#testimonials`, `#why-choose`, `#estimate-band`, `#estimate-cta`, `#comparison`, `#faq`, `#closing-offer` and `#offer-cta`. It loads the same Optimizely Web snippet as `/example`.

To rebuild it for another prospect, follow the Example steps above with `--brand placeholder` and the `ph-` prefix. There is no prune script for `ph-` entries yet; unpublish stale ones by hand or extend `scripts/prune-example.ts`.

