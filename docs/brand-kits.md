# Brand kits

Approved in Phase 3. The seed script (Phase 6) writes these values into each Brand entry. All companies are fictional.

Every brand footer carries: "Fictional company. Sample content for illustration only." The front end adds this line even if the Brand entry's disclaimer is edited.

## Shared rules

- Fonts are bundled at build time from Google Fonts. The front end only supports the fonts listed here.
- Every button pair and body text pair meets WCAG AA contrast (4.5 or higher).
- Phone numbers use the reserved fictional 555-01xx range. Addresses are in made-up towns.
- No em dashes in any copy. Use hyphens.

## Name check (October 2026)

The brands were renamed on 2026-10-08. The names below were searched on the web; none matched a real company exactly.

| Brand (original name) | Finding | Decision |
|---|---|---|
| StoutWare (Lumenwork) | No exact match. Similar: Stout Systems, a software firm in Ann Arbor, Michigan; Stoneware, a software company. | Keep (mild flag) |
| Stuchbery Acres (Stuchbery's) | No apparel company by this name. | Keep |
| DeFeo Mutual (Harborline Mutual) | No insurer by this name. Similar: Edward R. DeFeo Agency, an independent insurance agency in New Jersey. | Keep (mild flag) |
| St. Isaac's Health (Clearwater Health) | No exact match. Similar: Isaac Health, a New York memory clinic, and Chief Andrew Isaac Health Center in Alaska. | Keep (mild flag) |
| Ledgerwood Bank | No bank by this name. | Keep |
| Tidewater Journeys | No exact match. A small agency, Tidewater Cruise and Travel, operates in Maryland. | Keep |

Internal IDs, seed file names, and logo folders still use the original names (see [rebrand.md](rebrand.md)).

## Logos

Each brand's logo mark was designed with an Opal agent on 2026-10-15. The marks, the briefs behind them, and how to replace one are in [logos.md](logos.md). Colors were refreshed the same day; the values below are current.

## Theme token reference

Each Brand entry has eight color tokens:

| Token | Used for |
|---|---|
| colorBrand | Header, links, headings accents |
| colorButton | Primary button background |
| colorButtonText | Primary button label |
| colorAccent | Badges, highlights, dividers |
| colorBackground | Page background |
| colorSurface | Cards and alternating sections |
| colorText | Body text |
| colorMuted | Secondary text |

---

## 1. StoutWare

- **Vertical:** B2B SaaS
- **Short description:** Workflow and operations software for operations teams.
- **Tagline:** Operations, in clear view.
- **Voice:** Clear, practical, confident. Speaks to operations leads in plain language and leads with outcomes.
- **Do:** Name real workflow moments (intake, approvals, handoffs). Use short sentences. Label any figures as illustrative.
- **Don't:** Use hype or buzzwords. Name real customers. Mention experimentation, CMS, or marketing technology.
- **Colors:** brand `#171A3A`, button `#5446E0`, button text `#FFFFFF`, accent `#C6F16D`, background `#F6F6FA`, surface `#FFFFFF`, text `#171A2E`, muted `#5B6078`
- **Fonts:** Space Grotesk (headings), Inter (body)
- **Buttons:** 8px corners, normal case
- **Photo direction:** Operations teams in daylight offices, warehouses, and field sites, working together. Screens show nothing readable. No logos.
- **Navigation:** Solutions, Pricing, Customers, Resources. Header button: Book a demo.
- **Promo bar:** New: approval templates for finance and HR teams.
- **Address:** 410 Foundry Lane, Suite 300, Halverton, CO 80999
- **Phone:** (970) 555-0142
- **Legal disclaimer:** Fictional company. Sample content for illustration only.

## 2. Stuchbery Acres

- **Vertical:** B2C apparel
- **Short description:** Apparel retailer with classic seasonal collections.
- **Tagline:** Made for the long season.
- **Voice:** Warm, understated outfitter. Focuses on fabric, fit, and care.
- **Do:** Describe how things feel and wear. Use seasonal moments.
- **Don't:** Use trend slang. Shout about discounts. Make real heritage claims.
- **Colors:** brand `#2C3A2A`, button `#2C3A2A`, button text `#F3EDE1`, accent `#AD512D`, background `#F3EDE1`, surface `#E7DDC9`, text `#24231F`, muted `#665F52`
- **Fonts:** Libre Caslon Text (headings), Source Sans 3 (body)
- **Buttons:** square corners, uppercase with letter spacing
- **Photo direction:** Autumn outdoors. Wool knits, flannel, waxed jackets, boots, cabins, stone walls, flat lays on wood. Plain garments with no visible logos.
- **Collection:** The Fieldstone Collection, Fall 2026 (12 products)
- **Navigation:** The Fieldstone Collection, Size Guide, Journal, Cart.
- **Promo bar:** Free shipping on orders over $75. Free returns within 30 days.
- **Free shipping threshold:** $75
- **Address:** 18 Mill Pond Road, Ashcombe, VT 05999
- **Phone:** (802) 555-0118
- **Legal disclaimer:** Fictional company. Sample content for illustration only.

## 3. DeFeo Mutual

- **Vertical:** Insurance
- **Short description:** Auto, home, and life insurance for families.
- **Tagline:** Steady coverage for every stage.
- **Voice:** Reassuring, honest, plain-spoken. Explains insurance terms as it goes.
- **Do:** Speak to "you and your family". Include clear disclaimers.
- **Don't:** Use fear tactics. Promise savings or prices. Compare against real insurers.
- **Colors:** brand `#152A4E`, button `#C2472A`, button text `#FFFFFF`, accent `#F0B9A4`, background `#FBF7F1`, surface `#FFFFFF`, text `#1D2638`, muted `#5B6474`
- **Fonts:** DM Serif Display (headings), DM Sans (body)
- **Buttons:** pill, normal case
- **Photo direction:** Families at home, cars in driveways, coastal towns, moving day, warm natural light.
- **Navigation:** Auto, Home, Life, Learn. Header button: Get a quote.
- **Promo bar:** Get an illustrative quote in about five minutes.
- **Address:** 77 Lighthouse Row, Port Mercer, ME 04999
- **Phone:** (207) 555-0163
- **Legal disclaimer:** Fictional company. Sample content for illustration only. Coverage descriptions and quotes are illustrative and are not offers of insurance.

## 4. St. Isaac's Health

- **Vertical:** Healthcare
- **Short description:** Multi-location clinic network offering primary and specialty care.
- **Tagline:** Care that keeps up with you.
- **Voice:** Calm, compassionate, inclusive. Never gives medical advice.
- **Do:** Say "talk with your care team". Include an emergency notice telling people to call 911.
- **Don't:** Diagnose. Promise outcomes. Quote health statistics. Use fear.
- **Colors:** brand `#0E4651`, button `#0D6B77`, button text `#FFFFFF`, accent `#F5D3BC`, background `#F8FAF8`, surface `#FFFFFF`, text `#152E37`, muted `#526A72`
- **Fonts:** Merriweather Sans (headings), Nunito Sans (body)
- **Buttons:** 12px corners, normal case
- **Photo direction:** Clinicians with patients of all ages in bright rooms. Nothing graphic. No hospital logos.
- **Navigation:** Specialties, Providers, Locations, Health Library. Header button: Book an appointment.
- **Promo bar:** New patients welcome at all four locations.
- **Address:** 1200 Willow Creek Parkway, Larkfield, OR 97999
- **Phone:** (541) 555-0127
- **Legal disclaimer:** Fictional company. Sample content for illustration only. Nothing on this site is medical advice. In an emergency, call 911.

## 5. Ledgerwood Bank

- **Vertical:** Financial services
- **Short description:** Retail bank offering checking, savings, credit cards, and personal loans.
- **Tagline:** Banking that adds up.
- **Voice:** Precise, modern, approachable.
- **Do:** Label every rate "Illustrative rate, not an offer". Explain fees in plain language.
- **Don't:** Claim FDIC insurance or guaranteed approval. Use real rates.
- **Colors:** brand `#0E3B2E`, button `#0E3B2E`, button text `#FFFFFF`, accent `#C3A15A`, background `#FBFAF5`, surface `#EEF2EA`, text `#14201B`, muted `#55615B`
- **Fonts:** Manrope (headings), IBM Plex Sans (body)
- **Buttons:** 6px corners, normal case
- **Photo direction:** People handling money at home and in cafes, small business owners, new home keys. Phone screens left blank.
- **Navigation:** Checking, Savings, Credit Cards, Personal Loans, Rates. Header button: Open an account.
- **Promo bar:** Open a savings account online in about 10 minutes.
- **Address:** 300 Exchange Street, Westbury Falls, OH 43999
- **Phone:** (614) 555-0181
- **Legal disclaimer:** Fictional company. Sample content for illustration only. Not a real bank. Not FDIC insured. Rates and figures are illustrative.

## 6. Tidewater Journeys

- **Vertical:** Travel
- **Short description:** Curated small-group and private trips.
- **Tagline:** Small groups. Long memories.
- **Voice:** Sensory but grounded, knowledgeable, unhurried.
- **Do:** Give group sizes, pace, and specific detail.
- **Don't:** Use cliches like "hidden gem" or "bucket list". Make safety guarantees. Quote real prices.
- **Colors:** brand `#0F3443`, button `#B1502C`, button text `#FFFFFF`, accent `#D6C2A0`, background `#F6F1E9`, surface `#FFFFFF`, text `#1B2A31`, muted `#5B676C`
- **Fonts:** Playfair Display (headings), Lato (body)
- **Buttons:** 4px corners, normal case
- **Photo direction:** Coastlines, small boats, villages, hiking groups seen from behind, food markets. No commercial branding.
- **Navigation:** Destinations, Private Journeys, Travel Notes. Header button: Request a booking.
- **Promo bar:** Small groups of 12 or fewer on every departure.
- **Address:** 9 Quayside Walk, Saltmarsh Harbor, SC 29999
- **Phone:** (843) 555-0175
- **Legal disclaimer:** Fictional company. Sample content for illustration only. Prices and itineraries are illustrative.
