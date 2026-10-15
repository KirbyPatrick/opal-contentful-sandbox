# Logos

Each brand has two files in `assets/brand/<key>/`:

- `logo.svg`: the mark next to the brand name, set in the brand's heading font. Used in the header and on the directory page.
- `favicon.svg`: the mark alone on a rounded tile in the brand's background color, so it reads on light and dark browser tabs.

Both are built from `mark.png`, a 512 px transparent square. The marks were designed on 2026-10-15 with an Opal agent called `logo-studio`, which turns a short brief into four concepts. One concept per brand was chosen by eye.

| Brand | Mark |
|---|---|
| StoutWare | Ink and indigo hexagon with a forward chevron |
| Stuchbery Acres | Round farm emblem: an oak over clay furrowed fields under a small sun |
| DeFeo Mutual | Navy arch sheltering a persimmon rising sun |
| St. Isaac's Health | Soft teal cross with an apricot leaf at its center |
| Ledgerwood Bank | Brass seal with a tree drawn in fine ledger lines |
| Tidewater Journeys | Round emblem: a rust sun rising over layered Atlantic waves |

## Make a new mark

1. **Generate concepts.** Run the `logo-studio` agent in Opal with the brand's brief (below) as its input. It makes four images and puts them on a canvas. To recreate the agent elsewhere, use the instructions at the end of this page with the `generate_or_edit_image` and `create_image_canvas` tools.
2. **Download** the chosen image from the canvas.
3. **Prepare it:** `npm run logos:prepare -- <downloaded.png> <key>`. White becomes transparent, edges are cleaned, and the mark is trimmed and centered into `assets/brand/<key>/mark.png`.
4. **Build the logo and favicon:** `npm run logos:generate`. Brand names, fonts, and tile colors are in `scripts/brand-assets/generate-logos.mjs`.
5. **Upload** (writes to Contentful, so ask first): `npm run assets:upload -- --replace-logos`. Asset IDs stay the same, so every reference keeps working.

## Briefs

- **StoutWare:** B2B workflow software for operations teams: requests, approvals, and field work moving from start to done. Sturdy, precise, and modern, like well-made equipment, with a sense of work moving forward. Ideas: a bold rounded hexagon or rounded square with a forward-pointing chevron or a stepped path cut out of it, or three stacked rounded bars stepping forward. Colors: deep ink indigo #171A3A and electric indigo #5446E0 only, plus white.
- **Stuchbery Acres:** a heritage clothing outfitter from a small Vermont farm town: wool coats, knitwear, flannel, boots. Crafted, warm, and timeless, like an old farm brand or a woven label. Ideas: an arch or circle framing rolling field furrows and a low stone wall under a small sun, or a single sturdy tree over striped fields. Colors: loden green #2C3A2A and clay #AD512D only, plus white.
- **DeFeo Mutual:** a family insurance company for auto, home, and life coverage. Steady, protective, and warm, never corporate or cold. Ideas: a protective arch or simple roofline sheltering a small rising sun, or two nested arches forming a shelter or a soft shield. Colors: deep marine blue #152A4E and persimmon #C2472A only, plus white.
- **St. Isaac's Health:** a network of four primary and specialty care clinics. Calm, humane, and modern, never clinical or alarming. Ideas: a soft plus sign formed by four rounded petal shapes around a small center, or a gentle cross inside a circle. No red. Colors: deep teal #0E4651, teal #0D6B77, and a small warm apricot accent #D9805A, plus white.
- **Ledgerwood Bank:** a retail bank known for precise, transparent banking. Established, precise, and premium, like a private bank seal. Ideas: a stylized oak leaf or tree built from fine horizontal ledger lines inside a shield or circle, or an emblem with engraved-style parallel lines. Colors: racing green #0E3B2E and brass #A8853F only, plus white.
- **Tidewater Journeys:** small-group and private trips along Europe's Atlantic coast: Portugal, Norway, Scotland. Unhurried, timeless, and coastal. Ideas: a circular emblem with layered waves and a half sun or simple compass star rising above them, or a single sail over waves in a circle. Colors: deep Atlantic blue #0F3443 and rust #B1502C only, plus white.

## logo-studio instructions

```text
You are a senior brand identity designer. You design logo marks for fictional demo companies.

You receive a Brief describing one company and its palette. Do this:
1. Write one strong image-generation prompt for the company's logo MARK (a symbol only), following the Brief and these rules:
   - Flat vector logo mark, bold and simple geometry, crisp edges, even line weights.
   - Use only the colors named in the Brief. Solid fills. No gradients, no shadows, no textures, no 3D, no outlines around the whole image.
   - Absolutely no text, words, or letters unless the Brief explicitly asks for a single letterform.
   - Centered on a plain pure white background (#FFFFFF), with generous empty margin on all sides. The mark fills about 60 percent of the image.
   - Must read clearly at 32 pixels, like an app icon or favicon.
   - Original. It must not resemble any real company's logo.
2. Call generate_or_edit_image exactly once with action "generate", your prompt, number_of_images 4, aspect_ratio "1:1", and image_size "2K".
3. For each of the four generated images, call create_image_canvas once to put that image file on the canvas, named "<company> mark <n>" (n = 1 to 4).
4. Reply with only the prompt you used. Do not describe the images.
```
