# Content model

**Status: applied to `opal-sandbox` in Phase 4** by `migrations/0001-content-model.ts` (18 content types, 185 fields). Exact help text and validations live in that migration.

One composable page-builder model serves all six brands. There are no per-industry content types.

## Type count: 18

Target 16 to 18, hard maximum 22. The Free plan allows 25 per environment, so 7 slots stay free (for example, for experimentation containers later).

| # | Type | Purpose |
|---|---|---|
| 1 | `brand` | Company profile, theme tokens, voice, navigation, footer |
| 2 | `page` | Every routable page, including funnel steps and detail templates |
| 3 | `article` | Articles that act as side entrances into the funnel |
| 4 | `person` | Authors, providers, and testimonial attributions |
| 5 | `offering` | Anything a brand sells: products, solutions, plans, coverage, accounts, trips |
| 6 | `collection` | Curated groups: the Fieldstone Collection, destinations, specialties |
| 7 | `hero` | Top-of-page headline block (kept discrete for later testing) |
| 8 | `cta` | Call to action with a goal type (kept discrete for later testing) |
| 9 | `richTextSection` | Formatted text section |
| 10 | `mediaText` | Image beside text |
| 11 | `cardGrid` | Grid of cards from picked items, a collection, or the latest articles |
| 12 | `faq` | Questions and answers |
| 13 | `testimonial` | Quote with a person |
| 14 | `stats` | Two to four figures |
| 15 | `comparisonTable` | Offerings side by side |
| 16 | `form` | Mock goal forms and the mock checkout |
| 17 | `logoStrip` | Row of logos or trust badges |
| 18 | `item` | Small reusable piece: nav link, card, question and answer, or stat |

## Conventions

- **One brand per entry.** Every type except `brand` has a required `brand` reference. Code checks that references never cross brands.
- **Slugs.** Pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`, at most 80 characters, unique within a brand for each type. Contentful can only enforce global uniqueness, so the seed script and the Opal API enforce per-brand uniqueness.
- **Single locale.** en-US only. No field is localized.
- **Character limits.** Headlines and headings 70, CTA labels 24, eyebrows 40, SEO titles 60, SEO descriptions 155, image alt text 125.
- **No em dashes.** Every text field gets a Contentful validation that rejects the em dash character.
- **Enums** wherever values are fixed (page types, goal types, offering types, layouts, fonts, sizes).
- **Help text** on every field, written as instructions an AI agent can follow, at most 255 characters each.
- **Images and alt text.** Alt text is stored once per image, on the asset title (at most 125 characters). Photo attribution is stored in the asset description. Contentful cannot validate asset fields from a content type, so the upload script and the Opal API enforce this. Images are only ever referenced by asset ID, never by URL.
- **Tags.** `seed` on everything the seed script creates, `opal` on everything created through the Opal API, and `brand-<slug>` on each brand's images (this is the brand image pool).
- **Rich text.** Headings (levels 2 to 4), paragraphs, bold, italic, lists, quotes, tables, and http or https links. No embedded entries, assets, or raw HTML.
- **Missing images** render as a branded SVG placeholder, so no page is ever empty.

## Routing and funnels

URLs live under the brand slug:

| URL | What renders |
|---|---|
| `/` | Brand directory |
| `/{brand}` | The brand's home page (`brand.homePage`) |
| `/{brand}/{page}` | A page by slug |
| `/{brand}/{page}/{item}` | A detail view, when `{page}` is a detail template |

**Detail templates.** A page whose type is `offering_detail`, `collection_detail`, `person_detail`, or `article_index` is a template:

- Its own URL shows its hero and sections (for example, a list of all destinations).
- `/{page}/{slug}` shows one offering, collection, person, or article, followed by the template's `detailSections`.
- Its `funnelStep`, `nextStep`, and `primaryCta` apply to every detail view.

There is one page per step, not one per product. The 12 Stuchbery's products need no page entries. When Opal edits a product, it edits one entry. Pricing plans (`saas_plan`) never get detail pages; they appear on the pricing page.

### Funnel map

| Brand | Step 1 | Step 2 | Step 3 | Step 4 (goal) |
|---|---|---|---|---|
| Lumenwork | `/lumenwork` | `/lumenwork/solutions/{solution}` (offering template) | `/lumenwork/customers` (case study page) | `/lumenwork/book-a-demo` |
| Stuchbery's | `/stuchberys` | `/stuchberys/fieldstone-collection` (page with the collection grid) | `/stuchberys/shop/{product}` (offering template) | `/stuchberys/cart` (cart drawer, then cart page) |
| Harborline Mutual | `/harborline-mutual` | `/harborline-mutual/coverage/{coverage}` (offering template) | `/harborline-mutual/start-a-quote` | `/harborline-mutual/get-a-quote` |
| Clearwater Health | `/clearwater-health` | `/clearwater-health/specialties/{specialty}` (collection template) | `/clearwater-health/providers/{provider}` (person template) | `/clearwater-health/book-an-appointment` |
| Ledgerwood Bank | `/ledgerwood-bank` | `/ledgerwood-bank/products/{product}` (offering template) | `/ledgerwood-bank/rates` (comparison page) | `/ledgerwood-bank/apply` |
| Tidewater Journeys | `/tidewater-journeys` | `/tidewater-journeys/destinations/{destination}` (collection template) | `/tidewater-journeys/trips/{trip}` (offering template) | `/tidewater-journeys/request-a-booking` |

Off-funnel pages (step 0): article indexes (`resources`, `journal`, `learn`, `health-library`, `insights`, `travel-notes`), Lumenwork pricing, the Stuchbery's size guide, Clearwater locations, and Tidewater private journeys. About 34 pages in total.

Goal pages can be prefilled from the previous step, for example `?trip=` or `?provider=`. The value is only checked against known slugs and used for display. Nothing submitted is sent or stored.

---

## Fields

Notation: **req** = required. Short text is at most 255 characters unless a lower limit is shown. Every text field also rejects em dashes.

### brand (display field: name)

| Field | Type | Rules |
|---|---|---|
| name | Short text | req, unique, max 40 |
| slug | Short text | req, unique, slug pattern, max 40, not a reserved word (api, preview, and similar) |
| vertical | Short text | req, one of: b2b_saas, apparel_retail, insurance, healthcare, financial_services, travel |
| shortDescription | Short text | req, max 160. Agents use it to choose a brand. |
| tagline | Short text | max 70 |
| logo | Media | req, image (SVG wordmark) |
| favicon | Media | image (SVG) |
| colorBrand, colorButton, colorButtonText, colorAccent, colorBackground, colorSurface, colorText, colorMuted | Short text (8 fields) | req, hex color `#RRGGBB` |
| fontHeading, fontBody | Short text | req, one of the 12 bundled fonts in `docs/brand-kits.md` |
| buttonRadius | Integer | req, one of 0, 4, 6, 8, 12, 999 (999 = pill) |
| buttonTextCase | Short text | req, one of: normal, uppercase |
| voiceDescription | Long text | req, max 500 |
| voiceDos, voiceDonts | List of short text | 2 to 8 items, each max 120 |
| photoDirection | Long text | max 500 |
| navigation | References: item | max 6 |
| headerCta | Reference: cta | |
| footerLinks | References: item | max 8 |
| promoBarText | Short text | max 90 |
| address | Long text | req, max 200 |
| phone | Short text | format `(NNN) 555-01NN` |
| legalDisclaimer | Long text | req, max 300 |
| homePage | Reference: page | req |
| freeShippingThreshold | Integer | 0 or more. Only for brands that sell products. |

### page (display field: title)

| Field | Type | Rules |
|---|---|---|
| title | Short text | req, max 70 |
| slug | Short text | req, slug pattern, max 80 |
| brand | Reference: brand | req |
| pageType | Short text | req, one of: home, standard, goal, article_index, offering_detail, collection_detail, person_detail |
| funnelStep | Integer | req, one of 0 to 4 (0 = off-funnel) |
| nextStep | Reference: page | Required by the funnel check for steps 1 to 3 |
| hero | Reference: hero | |
| primaryCta | Reference: cta | |
| sections | References: any section block | max 12, ordered |
| detailSections | References: any section block | max 8. Only for detail templates. |
| seoTitle | Short text | max 60 |
| seoDescription | Short text | max 155 |

Section blocks: richTextSection, mediaText, cardGrid, cta, faq, testimonial, stats, comparisonTable, form, logoStrip.

### article (display field: title)

| Field | Type | Rules |
|---|---|---|
| title | Short text | req, max 90 |
| slug | Short text | req, slug pattern, max 80 |
| brand | Reference: brand | req |
| summary | Short text | req, max 200 |
| body | Rich text | req, rules above |
| heroImage | Media | req, image |
| author | Reference: person | role should be author |
| publishDate | Date | req |
| topics | List of short text | max 5, each max 32, lowercase |
| relatedPage | Reference: page, offering, collection, or person | The funnel entry this article leads into (step 2 or 3) |
| cta | Reference: cta | |
| faq | Reference: faq | optional |
| seoTitle | Short text | max 60 |
| seoDescription | Short text | max 155 |

### person (display field: name)

| Field | Type | Rules |
|---|---|---|
| name | Short text | req, max 70 |
| slug | Short text | req, slug pattern |
| brand | Reference: brand | req |
| role | Short text | req, one of: author, provider, customer |
| jobTitle | Short text | max 70 |
| organization | Short text | max 70 (fictional companies only) |
| bio | Long text | max 800 |
| photo | Media | image |
| credentials | Short text | max 40 (providers) |
| locations | List of short text | max 4 (providers) |
| languages | List of short text | max 5 (providers) |
| acceptingNewPatients | Boolean | providers |
| seoTitle, seoDescription | Short text | max 60, max 155 |

### offering (display field: name)

| Field | Type | Rules |
|---|---|---|
| name | Short text | req, max 70 |
| slug | Short text | req, slug pattern |
| brand | Reference: brand | req |
| offeringType | Short text | req, one of: apparel_product, saas_solution, saas_plan, insurance_coverage, bank_product, travel_package |
| summary | Short text | req, max 160 |
| description | Rich text | rules above |
| images | Media list | 1 to 4 images |
| price | Number | 0 or more, in USD. Used for cart totals. |
| priceLabel | Short text | max 40, for example "From $3,850 per person (illustrative)" |
| badge | Short text | max 24, for example "Most popular" |
| features | List of short text | max 8, each max 80 |
| specs | List of short text | max 10, each "Label: Value", max 120. Comparison tables read these. |
| finePrint | Long text | max 300, for example "Illustrative rate, not an offer." |
| sizes | List of short text | apparel only, from: XS, S, M, L, XL, XXL, One size |
| colors | List of short text | apparel only, max 6, each "Name\|#RRGGBB" (drives swatches) |
| materials | Short text | apparel only, max 160 |
| fit | Short text | apparel only, one of: slim, classic, relaxed |
| sizeGuide | Reference: richTextSection | apparel only, the shared size guide |
| seoTitle, seoDescription | Short text | max 60, max 155 |

### collection (display field: name)

| Field | Type | Rules |
|---|---|---|
| name | Short text | req, max 70 |
| slug | Short text | req, slug pattern |
| brand | Reference: brand | req |
| collectionType | Short text | req, one of: product_collection, destination, specialty |
| eyebrow | Short text | max 40, for example "Fall 2026" |
| summary | Short text | req, max 200 |
| description | Rich text | rules above |
| image | Media | image |
| items | References: offering or person | max 24 |
| seoTitle, seoDescription | Short text | max 60, max 155 |

### Blocks

Every block has `internalName` (req, max 80, for example "Lumenwork - Home - Hero") and `brand` (req).

| Type | Fields |
|---|---|
| hero | eyebrow (40), **headline** (req, 70), subheadline (160), image, **layout** (req: split, full_bleed, text_only), cta, secondaryCta |
| cta | **label** (req, 24), **goalType** (req: book_demo, add_to_cart, get_quote, book_appointment, start_application, request_booking, next_step, link), destinationPage (page), destinationUrl (http or https only), style (primary, secondary), heading (70) and body (200) when used as a section |
| richTextSection | heading (70), **body** (req, rich text) |
| mediaText | eyebrow (40), **heading** (req, 70), **body** (req, 600), **image** (req), imagePosition (left, right), cta |
| cardGrid | heading (70), intro (255), **source** (req: manual, collection, latest_articles), items (manual picks: item, offering, article, person, or collection, max 12), collection, limit (1 to 12), **layout** (req: cards, icons, products, profiles, pricing), columns (2 to 4), cta |
| faq | heading (70), **items** (req, 1 to 10 items: title = question, text = answer) |
| testimonial | **quote** (req, 280), **person** (req), rating (1 to 5) |
| stats | heading (70), **items** (req, 2 to 4 items: value = figure, title = label), footnote (160, for example "Figures are illustrative.") |
| comparisonTable | heading (70), intro (255), **offerings** (req, 2 to 4), **rows** (req, 2 to 10 spec labels), footnote (200) |
| form | **formKind** (req: book_demo, quote_start, get_quote, book_appointment, start_application, request_booking, checkout), **heading** (req, 70), intro (300), **submitLabel** (req, 24), **successHeading** (req, 70), **successMessage** (req, 300), **privacyNote** (req, 200), prefillSample (boolean) |
| logoStrip | heading (70), **logos** (req, 3 to 8 images) |

Form fields themselves are defined in code for each `formKind`, so validation lives in one place and nothing can be added that collects or sends data.

**CTA destination rules (checked in code):**
- Goal types point at the brand's goal page.
- `add_to_cart` opens the cart drawer and needs no destination.
- `next_step` follows the current page's `nextStep`.
- `link` needs a page or an http or https URL.

### item (display field: title)

| Field | Type | Rules |
|---|---|---|
| title | Short text | req, max 90. Nav label, card title, FAQ question, or stat label. |
| brand | Reference: brand | req |
| text | Long text | max 600. Card text or FAQ answer. |
| value | Short text | max 16. Stat figure, for example "4.8/5". |
| image | Media | image or icon |
| link | Reference: page, article, offering, collection, or person | internal links only |

### Stuchbery's cart

The cart uses the same blocks as everything else:
- **Cart page sections:** a `form` block (checkout copy, mock confirmation), a `richTextSection` for shipping and returns, and a `logoStrip` for trust badges.
- **Shipping threshold:** `brand.freeShippingThreshold`.
- **Promo code text:** the checkout form's intro.
- **Cart state:** kept in the browser only.

---

## Rules enforced in code (Contentful cannot express them)

- Slugs are unique per brand and type.
- References stay within one brand.
- Each brand has at most one detail template per kind (offering, collection, person, article).
- The funnel chain runs from step 1 to step 4 through `nextStep`, and the home page links into step 2.
- CTA destinations follow the rules above.
- Alt text is present on every image and is at most 125 characters.

## Opal access (preview, finalized in Phase 8)

- **Create:** articles only.
- **Update** (with version locking):
  - article content fields
  - hero copy and image
  - CTA copy
  - page title and SEO fields
  - offering and collection descriptive copy
- **Never:** brands, themes, slugs of published entries, page types, funnel links, content types, or deletes.

## Migrations

- Numbered files in `migrations/`, written with `contentful-migration` 5.1.1.
- They run through a guarded runner that performs the master checks first.
- Each migration is skipped if its change is already present, so the full set can rebuild an empty sandbox.
- Tags are created by a small setup script, because the migration tool does not manage tags.
