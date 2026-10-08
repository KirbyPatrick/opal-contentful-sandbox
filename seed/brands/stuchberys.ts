/**
 * Stuchbery Acres: apparel retailer with classic seasonal collections.
 * Funnel: home (1) -> fieldstone-collection (2) -> shop/{product} (3) -> cart (4).
 * Off-funnel: size-guide and journal (article index).
 */
import { defineBrand, md } from "../lib/builders";

const s = defineBrand("stuchberys", "sb");

// ---------------------------------------------------------------------------
// People (authors and customers have no photo; initials are shown)
// ---------------------------------------------------------------------------

const elena = s.person("elena-marsh", {
  name: "Elena Marsh", slug: "elena-marsh", role: "author", jobTitle: "Product care lead",
  bio: "Elena Marsh looks after fabric testing and care guidance at Stuchbery Acres. She has spent the better part of a decade learning how wool, flannel, and leather hold up to a Vermont winter.",
});
const thomas = s.person("thomas-avery", {
  name: "Thomas Avery", slug: "thomas-avery", role: "author", jobTitle: "Journal editor",
  bio: "Thomas Avery edits the Stuchbery Acres Journal from the shop in Ashcombe. He writes about dressing for the weather and the small habits that keep good clothes in service.",
});
const ruth = s.person("ruth-calloway", {
  name: "Ruth Calloway", slug: "ruth-calloway", role: "customer", jobTitle: "Verified buyer",
});

// ---------------------------------------------------------------------------
// Shared size guide (referenced by every product and the size guide page)
// ---------------------------------------------------------------------------

const sizeGuide = s.richText("size-guide", {
  internalName: "Stuchbery Acres - Size guide - Table",
  heading: "Size guide",
  body: md(`Measure over a light shirt with a soft tape, keeping it level and snug but not tight.

- **Chest:** around the fullest part, just under the arms.
- **Waist:** around your natural waistline, just above the hip bones.

### Tops, knitwear, and coats

| Size | Chest (in) | Waist (in) |
|---|---|---|
| XS | 32 to 34 | 26 to 28 |
| S | 35 to 37 | 29 to 31 |
| M | 38 to 40 | 32 to 34 |
| L | 41 to 43 | 35 to 37 |
| XL | 44 to 46 | 38 to 40 |
| XXL | 47 to 49 | 41 to 43 |

### Footwear

Our boots are sized S to XL and follow US men's sizing. For US women's sizing, subtract 1.5 from your usual size first. If you fall between two sizes, take the larger one.

| Size | US shoe size |
|---|---|
| S | 6 to 7.5 |
| M | 8 to 9.5 |
| L | 10 to 11.5 |
| XL | 12 to 13.5 |

### Fit notes

- **Slim:** cut close through the chest and waist. Take your usual size for a neat fit, or size up to layer a heavy sweater underneath.
- **Classic:** room for a light layer without looking boxy. Most of the collection is cut this way.
- **Relaxed:** generous through the body and sleeves, made for layering. Size down if you prefer a closer fit.
- **Coats and jackets** in a classic fit are cut to close over a sweater, so take your usual size.
- **Gloves and scarves** are one size and stretch to fit most adults.`),
});

// ---------------------------------------------------------------------------
// Offerings: the 12 pieces of the Fieldstone Collection
// ---------------------------------------------------------------------------

const camelCoat = s.offering("fieldstone-camel-coat", {
  name: "Fieldstone Camel Coat", slug: "fieldstone-camel-coat", offeringType: "apparel_product",
  summary: "A belted wool and cashmere coat in warm camel, cut with room for a heavy sweater underneath.",
  description: md(`## The coat for the whole season

This is the coat we reach for from the first hard frost to the last cold morning in April. The cloth is a dense blend of wool and cashmere with a softly brushed face, warm in the hand before you have even put it on.

We cut it with extra room through the shoulders and back, so it closes over a cable-knit without pulling at the buttons. A self belt draws it in at the waist when the wind picks up, and button tabs at the cuffs keep the cold from running up your sleeves.

## How it wears

The brushed finish settles over the first few weeks and takes on a gentle sheen at the cuffs and pocket edges. Brush it after wearing, hang it on a broad wooden hanger, and have it cleaned once at the end of the season.`),
  images: [s.img(6), s.img(13)],
  price: 398, priceLabel: "$398", badge: "New",
  features: [
    "Self belt with a covered buckle",
    "Button tabs at the cuffs to close out the wind",
    "Two deep welt pockets and an inside chest pocket",
    "Fully lined in breathable cupro",
    "Falls just above the knee",
  ],
  specs: ["Length: Just above the knee", "Weight: Heavyweight", "Care: Dry clean only"],
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: ["Camel|#A08670", "Charcoal|#3B3A3C", "Oatmeal|#D8CCB6"],
  materials: "80% wool, 20% cashmere; cupro lining; horn buttons",
  fit: "classic", sizeGuide,
  seoTitle: "Fieldstone Camel Coat in wool and cashmere | Stuchbery Acres",
  seoDescription: "A belted camel coat in a brushed wool and cashmere blend, cut to close over a heavy sweater. Sizes XS to XL.",
});

const redCoat = s.offering("orchard-wool-coat", {
  name: "Orchard Wool Coat", slug: "orchard-wool-coat", offeringType: "apparel_product",
  summary: "A tailored coat in bright red boiled wool, fitted through the waist with a softly flared hem.",
  description: md(`## Color for gray days

Boiled wool starts as a knit, then is washed hot and worked until the fibers lock together. The result is a cloth that is dense, smooth, and lighter than it looks, with edges clean enough to leave unhemmed. It blocks the wind well and shrugs off a light drizzle.

The Orchard is tailored close through the body and opens into a gently flared skirt that moves when you walk. The red is a deep, true apple red, the kind that holds its own against wet bark and a low November sky.

## Fit and care

This is our slimmest coat. Take your usual size to wear it over a fine knit, or size up if you plan to layer a chunky sweater underneath. Brush it after wear, and if it gets caught in the rain, let it dry on a hanger at room temperature.`),
  images: [s.img(4), s.img(14)],
  price: 348, priceLabel: "$348",
  features: [
    "Boiled wool that blocks wind and sheds light rain",
    "Fitted through the waist with a gently flared skirt",
    "Black corozo buttons at the front and cuffs",
    "Back vent for an easy stride",
    "Falls below the knee",
  ],
  specs: ["Length: Below the knee", "Weight: Midweight", "Care: Dry clean only"],
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: ["Apple Red|#B3202A", "Charcoal|#3B3A3C", "Loden|#4F5B3E"],
  materials: "100% boiled wool; viscose lining; corozo buttons",
  fit: "slim", sizeGuide,
  seoTitle: "Orchard Wool Coat in red boiled wool | Stuchbery Acres",
  seoDescription: "A tailored red coat in dense boiled wool, fitted at the waist with a softly flared hem. Blocks the wind and sheds light rain.",
});

const navyCoat = s.offering("linden-collared-coat", {
  name: "Linden Collared Coat", slug: "linden-collared-coat", offeringType: "apparel_product",
  summary: "A navy wool coat with gold-tone buttons and a soft faux fur collar that buttons off for milder days.",
  description: md(`## Two coats in one

The Linden is a clean, tailored navy coat in wool melton, a tightly woven cloth with a smooth surface that brushes clean in seconds. It is warm without being heavy, and it keeps its shape through a long season of wear.

The faux fur collar is what makes it. It frames the face, keeps the wind off your neck, and turns a plain coat into one you look forward to putting on. On milder days it unbuttons in a minute, leaving a neat collar underneath.

Gold-tone shank buttons and slanted hand pockets keep the front uncluttered, and the coat ends at mid-thigh, which makes it easy to wear with trousers or a skirt and boots.

## Care

Remove the collar and shake it out after wear. Have the coat cleaned once a season, and store the collar flat in a breathable bag over the summer.`),
  images: [s.img(5), s.img(15)],
  price: 328, priceLabel: "$328",
  features: [
    "Removable faux fur collar that buttons in place",
    "Gold-tone shank buttons",
    "Two slanted hand pockets",
    "Fully lined for easy layering",
    "Ends at mid-thigh",
  ],
  specs: ["Length: Mid-thigh", "Weight: Midweight", "Care: Dry clean; remove the collar first"],
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: ["Navy|#1F2640", "Burgundy|#5C1F2B", "Camel|#A08670"],
  materials: "90% wool, 10% nylon melton; viscose lining; removable faux fur collar",
  fit: "classic", sizeGuide,
  seoTitle: "Linden Collared Coat in navy wool | Stuchbery Acres",
  seoDescription: "A navy wool melton coat with gold-tone buttons and a removable faux fur collar. Ends at mid-thigh. Sizes XS to XL.",
});

const fieldJacket = s.offering("towpath-field-jacket", {
  name: "Towpath Field Jacket", slug: "towpath-field-jacket", offeringType: "apparel_product",
  summary: "A waxed cotton field jacket in deep navy, with a corduroy-lined collar and snap pockets.",
  description: md(`## Built for wet mornings

Waxed cotton is one of the oldest answers to rain. The tightly woven canvas is treated with a wax finish that beads light rain and cuts the wind, and it is stiff when new. Give it a few weeks. It softens along the elbows and pockets and takes on creases that are entirely your own.

The collar is lined in soft cotton corduroy and turns up to meet your ears. A two-way zip sits under a snap storm flap, so you can open the hem when you sit down while keeping the chest closed.

## Care

Never put waxed cotton in the washing machine. Wipe off mud with a damp cloth, let it dry at room temperature, and re-wax worn areas once a year with a tin of fabric wax and a hair dryer on low.`),
  images: [s.img(7), s.img(15)],
  price: 248, priceLabel: "$248",
  features: [
    "Water-resistant waxed cotton that softens with wear",
    "Corduroy-lined collar that turns up against the wind",
    "Two-way brass zip under a snap storm flap",
    "Chest and hand pockets with snap closures",
    "Can be re-waxed at home",
  ],
  specs: ["Length: Hip length", "Weight: Midweight", "Care: Wipe clean; re-wax once a year"],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  colors: ["Navy|#1E2638", "Olive|#55573A", "Tobacco|#7A5534"],
  materials: "Waxed cotton canvas; cotton corduroy collar lining; brass zip and snaps",
  fit: "classic", sizeGuide,
  seoTitle: "Towpath Field Jacket in navy waxed cotton | Stuchbery Acres",
  seoDescription: "A navy waxed cotton field jacket with a corduroy-lined collar, two-way zip, and snap pockets. Water-resistant and re-waxable.",
});

const cableKnit = s.offering("millstone-cable-knit", {
  name: "Millstone Cable-Knit Sweater", slug: "millstone-cable-knit-sweater", offeringType: "apparel_product",
  summary: "A heavyweight cable-knit crewneck in soft cream wool, with honeycomb and rope cables on the front and back.",
  description: md(`## The sweater we wear most

There is a reason cable-knits have been around as long as they have. All that texture traps warmth, and the dense stitches stand up to hard wear. The Millstone is knit on a heavy 5-gauge in pure wool with a slightly dry, springy hand that softens noticeably after the first few washes.

Honeycomb and rope cables run down the front and back, and saddle shoulders give your arms room to move when you are splitting kindling or carrying groceries up the hill. The cut is relaxed, so it layers easily over a flannel shirt and still fits under the Fieldstone Camel Coat.

## Care

Air it out between wears and hand wash it cold, a few times a season at most. Dry it flat on a towel, easing the cables back into shape as it dries.`),
  images: [s.img(16), s.img(15)],
  price: 158, priceLabel: "$158", badge: "Bestseller",
  features: [
    "Honeycomb and rope cables on the front and back",
    "Saddle shoulders that move with you",
    "Deep ribbed cuffs that fold back",
    "Heavy enough to wear on its own on a still fall day",
  ],
  specs: ["Weight: Heavyweight", "Gauge: 5-gauge", "Care: Hand wash cold, dry flat"],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  colors: ["Cream|#ECE4D2", "Bark|#6B5747", "Oatmeal|#C8B89E"],
  materials: "100% wool, 5-gauge cable knit",
  fit: "relaxed", sizeGuide,
  seoTitle: "Millstone Cable-Knit Sweater in cream wool | Stuchbery Acres",
  seoDescription: "A heavyweight cable-knit crewneck in pure wool with honeycomb and rope cables. Relaxed fit for layering. Sizes XS to XXL.",
});

const stripedSweater = s.offering("lakeshore-striped-sweater", {
  name: "Lakeshore Striped Sweater", slug: "lakeshore-striped-sweater", offeringType: "apparel_product",
  summary: "A waffle-stitch crewneck in wide navy and gray stripes, light enough to layer and warm enough on its own.",
  description: md(`## The in-between sweater

Some days in early fall are too warm for heavy wool and too cool for a shirt alone. This is the sweater for those days. The yarn is mostly cotton with a share of wool for warmth and spring, knit in a waffle stitch that holds a little air without adding bulk.

The stripes are knit into the fabric rather than printed on, so the edges stay crisp. We kept them wide and even, in navy and soft heather gray, a pairing that works with nearly everything else in the collection.

## How it wears

The cut is classic: straight through the body, with enough room for a T-shirt or a collared shirt underneath. It sits flat under the Towpath Field Jacket. Wash it by hand in cool water, then dry it flat so the ribbing keeps its shape.`),
  images: [s.img(2), s.img(14)],
  price: 128, priceLabel: "$128",
  features: [
    "Waffle stitch with a soft, open texture",
    "Wide stripes knit in, not printed",
    "Ribbed crew neck, cuffs, and hem",
    "Sits flat under a jacket or coat",
  ],
  specs: ["Weight: Midweight", "Care: Hand wash cold, dry flat"],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  colors: ["Navy and Gray|#2E3160", "Green and Oat|#4F5B44", "Rust and Cream|#A04A25"],
  materials: "70% cotton, 30% wool; waffle stitch",
  fit: "classic", sizeGuide,
  seoTitle: "Lakeshore Striped Sweater, cotton and wool | Stuchbery Acres",
  seoDescription: "A waffle-stitch crewneck in wide navy and gray stripes, knit from cotton and wool for early fall layering. Sizes XS to XXL.",
});

const flannelShirt = s.offering("ashcombe-flannel-shirt", {
  name: "Ashcombe Flannel Shirt", slug: "ashcombe-flannel-shirt", offeringType: "apparel_product",
  summary: "A heavy cotton flannel shirt in a red and navy check, brushed on both sides for a soft, warm hand.",
  description: md(`## A shirt that works like a layer

Good flannel should feel soft the first time you put it on, not after twenty washes. Ours is woven from cotton and brushed on both sides, so it has a warm, slightly fuzzy hand against the skin and a gentle nap on the outside.

The weight is heavier than an everyday shirt. On a cool September morning it is enough on its own, worn open over a T-shirt. By November it goes under a sweater or the Towpath Field Jacket. We match the check at the chest pockets and placket, a small detail that keeps it looking sharp.

## Care

Machine wash cold and tumble dry on low. Expect a little shrinkage in length after the first wash, which we have allowed for in the pattern.`),
  images: [s.img(3), s.img(13)],
  price: 98, priceLabel: "$98", badge: "Bestseller",
  features: [
    "Brushed inside and out for a soft, warm hand",
    "Two flap chest pockets with button closures",
    "Check matched at the pockets and placket",
    "Long tails that stay tucked in",
    "Heavy enough to wear open as a light jacket",
  ],
  specs: ["Weight: Heavyweight flannel", "Care: Machine wash cold, tumble dry low"],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  colors: ["Red and Navy|#B23A36", "Green and Navy|#2F4A3A", "Gray and Black|#5A5A5A"],
  materials: "100% cotton flannel, brushed on both sides; corozo buttons",
  fit: "classic", sizeGuide,
  seoTitle: "Ashcombe Flannel Shirt, red and navy check | Stuchbery Acres",
  seoDescription: "A heavyweight cotton flannel shirt brushed on both sides, with matched check and two flap pockets. Sizes XS to XXL.",
});

const laceUpBoots = s.offering("quarry-lace-up-boots", {
  name: "Quarry Lace-Up Boots", slug: "quarry-lace-up-boots", offeringType: "apparel_product",
  summary: "Mid-calf boots in burnished brown leather, with speed hooks for quick lacing and a sturdy rubber sole.",
  description: md(`## Boots for wet leaves and long walks

The Quarry is the boot we wear from October until the snow comes. The upper is full-grain leather with a burnished finish that darkens at the toe and creases at the flex point over the first month, which is exactly what good leather should do.

The shaft rises to mid-calf, with eyelets at the bottom and speed hooks at the top, so lacing up takes seconds. Wrap the extra length of lace around the shaft for a neat finish. A stitched welt joins the upper to the rubber sole, which means a cobbler can replace the sole when it wears down.

## Care

Brush off dirt after a muddy walk and let them dry away from direct heat. Condition the leather two or three times a season to keep it supple.`),
  images: [s.img(8), s.img(14)],
  price: 228, priceLabel: "$228",
  features: [
    "Full-grain leather that darkens and creases with wear",
    "Speed hooks above the eyelets for quick lacing",
    "Stitched welt, so the sole can be replaced",
    "Rubber sole with a shallow tread for wet paths",
  ],
  specs: ["Shaft height: Mid-calf", "Care: Brush clean, condition each season"],
  sizes: ["S", "M", "L", "XL"],
  colors: ["Chestnut|#6E3B2A", "Dark Brown|#45302A", "Black|#1E1B19"],
  materials: "Full-grain leather upper; leather lining; stitched welt; rubber sole",
  fit: "classic", sizeGuide,
  seoTitle: "Quarry Lace-Up Boots in brown leather | Stuchbery Acres",
  seoDescription: "Mid-calf lace-up boots in burnished full-grain leather with speed hooks, a stitched welt, and a replaceable rubber sole.",
});

const chukkas = s.offering("birchwood-suede-chukkas", {
  name: "Birchwood Suede Chukkas", slug: "birchwood-suede-chukkas", offeringType: "apparel_product",
  summary: "Ankle-height chukka boots in soft tan suede, with leather laces and a light cream rubber sole.",
  description: md(`## The easy boot

Chukkas sit somewhere between a shoe and a boot, which is exactly why they are so useful. The Birchwood is cut from soft tan suede that feels broken in from the first wear, with a leather lining and laces in matching tan leather.

The cream rubber sole is light and flexible, so these are boots for errands in town or a Saturday at the farm stand. They look right with the Ashcombe Flannel Shirt and just as right with a wool coat.

## Care

We pre-treat the suede to help it shed light rain, but it is still suede. Brush it with a suede brush after wear to lift the nap, and refresh the protector spray at the start of each season. Let a wet pair dry slowly at room temperature, stuffed with newspaper to hold the shape.`),
  images: [s.img(9), s.img(13)],
  price: 178, priceLabel: "$178",
  features: [
    "Soft suede pre-treated to shed light rain",
    "Lace-up front with matching leather laces",
    "Light, flexible cream rubber sole",
    "Leather lining and a cushioned footbed",
  ],
  specs: ["Height: Ankle", "Care: Suede brush and protector spray"],
  sizes: ["S", "M", "L", "XL"],
  colors: ["Tan|#B67D5C", "Chocolate|#4D3427", "Stone|#9A9384"],
  materials: "Suede upper; leather lining and laces; rubber sole",
  fit: "classic", sizeGuide,
  seoTitle: "Birchwood Suede Chukkas in tan | Stuchbery Acres",
  seoDescription: "Ankle-height chukka boots in soft tan suede with leather laces and a light cream rubber sole. Pre-treated to shed light rain.",
});

const hikingBoots = s.offering("high-notch-hiking-boots", {
  name: "High Notch Hiking Boots", slug: "high-notch-hiking-boots", offeringType: "apparel_product",
  summary: "Leather hiking boots in a warm wheat color, with metal lacing hooks and a lugged rubber sole for rocky trails.",
  description: md(`## For the trail behind the house

These are hiking boots in the traditional sense: a leather upper, a padded collar, and a lugged sole that grips on granite, roots, and wet leaves. They are not built for alpine expeditions. They are built for the trail you walk every weekend, the one that is muddy in October and frozen by Thanksgiving.

The nubuck leather comes in a warm wheat color, and it darkens at the toe and flex points with every outing, which suits a boot like this. Metal hooks and eyelets let you lace them snug at the ankle and looser over the foot. Each pair ships with red laces and a spare set in tan.

## Care

Knock off dried mud with a stiff brush and dry them at room temperature with the insoles out. A coat of leather wax at the start of the season helps them keep water out.`),
  images: [s.img(10), s.img(15)],
  price: 218, priceLabel: "$218",
  features: [
    "Water-resistant nubuck leather upper",
    "Metal hooks and eyelets for a snug, even lace",
    "Padded collar that sits comfortably over a wool sock",
    "Lugged rubber sole for rock, roots, and mud",
    "Ships with two pairs of laces, red and tan",
  ],
  specs: ["Height: Above the ankle", "Care: Brush clean, wax each season"],
  sizes: ["S", "M", "L", "XL"],
  colors: ["Wheat|#C9A06A", "Brown|#6A4A33", "Charcoal|#3A3A3A"],
  materials: "Water-resistant nubuck leather upper; padded collar; rubber lug sole",
  fit: "classic", sizeGuide,
  seoTitle: "High Notch Hiking Boots in wheat leather | Stuchbery Acres",
  seoDescription: "Leather hiking boots with a padded collar, metal lacing hooks, and a lugged rubber sole for everyday trails. Sizes S to XL.",
});

const scarf = s.offering("first-frost-knit-scarf", {
  name: "First Frost Knit Scarf", slug: "first-frost-knit-scarf", offeringType: "apparel_product",
  summary: "A soft, brushed knit scarf in frosted oatmeal, long enough to wrap twice and light enough to forget you have it on.",
  description: md(`## Warmth without the weight

The First Frost is knit from a brushed blend of alpaca and wool, which gives it a soft, airy halo, a little like frost on a field before the sun reaches it. It is far lighter than it looks. Pull it up over your nose on a windy morning and it holds warmth without feeling heavy or scratchy against your face.

At 72 inches long, it wraps twice around the neck with ends to spare, or once with a simple loop on milder days. The frosted oatmeal color sits well against camel, navy, and red, which covers every coat in the collection.

## Care

Alpaca sheds a little in its first few wears, and this settles quickly. Hand wash in cool water with a wool wash and dry it flat. Never hang it while it is wet.`),
  images: [s.img(12), s.img(13)],
  price: 58, priceLabel: "$58",
  features: [
    "Brushed alpaca blend with a soft, airy halo",
    "Long enough to wrap twice",
    "Light enough to tuck into a coat pocket",
    "Pairs with the Hearthside Knit Gloves",
  ],
  specs: ["Size: 72 by 10 inches", "Care: Hand wash cold, dry flat"],
  sizes: ["One size"],
  colors: ["Frost|#CFC7B6", "Charcoal|#3E3D40", "Rust|#A04A25"],
  materials: "60% alpaca, 30% wool, 10% nylon; brushed knit",
  fit: "classic", sizeGuide,
  seoTitle: "First Frost Knit Scarf in brushed alpaca | Stuchbery Acres",
  seoDescription: "A light, brushed alpaca and wool scarf in frosted oatmeal, 72 inches long so it wraps twice. One size.",
});

const gloves = s.offering("hearthside-knit-gloves", {
  name: "Hearthside Knit Gloves", slug: "hearthside-knit-gloves", offeringType: "apparel_product",
  summary: "Fine-rib knit gloves in heathered gray lambswool, with long cuffs that tuck neatly under a coat sleeve.",
  description: md(`## The gloves by the door

These are the gloves that live in a coat pocket from October to March. They are knit in soft lambswool with a little nylon for strength, and the fingertips are knit more densely, because that is where gloves always wear through first.

The fine rib stretches to fit most adult hands and stays close without feeling tight, so you can still hold a mug, turn a key, or zip a jacket. Long ribbed cuffs tuck under a coat sleeve to keep out the draft at the wrist, and on the coldest days they slip easily under a pair of leather mittens.

## Care

Hand wash in cool water, press out the water in a towel, and dry them flat. A quick pass with a sweater comb takes care of any pilling on the palms.`),
  images: [s.img(11), s.img(14)],
  price: 38, priceLabel: "$38",
  features: [
    "Soft lambswool with nylon for strength at the fingertips",
    "Stretchy rib knit that fits most adult hands",
    "Long ribbed cuffs that stay under your sleeves",
    "Thin enough to wear under leather mittens",
  ],
  specs: ["Size: One size, fits most adults", "Care: Hand wash cold, dry flat"],
  sizes: ["One size"],
  colors: ["Heather Gray|#8E8780", "Charcoal|#3E3D40", "Oatmeal|#D6CAB2", "Rust|#A04A25"],
  materials: "80% lambswool, 20% nylon",
  fit: "classic", sizeGuide,
  seoTitle: "Hearthside Knit Gloves in gray lambswool | Stuchbery Acres",
  seoDescription: "Fine-rib lambswool gloves with long cuffs that tuck under a coat sleeve and reinforced fingertips. One size fits most adults.",
});

// ---------------------------------------------------------------------------
// Collection
// ---------------------------------------------------------------------------

const fieldstone = s.collection("fieldstone", {
  name: "The Fieldstone Collection", slug: "fieldstone-collection", collectionType: "product_collection",
  eyebrow: "Fall 2026",
  summary: "Twelve pieces for fall 2026 in wool, brushed cotton, suede, and leather, cut to layer with one another and made to wear through the long season.",
  description: md(`## Twelve pieces, made to work together

The Fieldstone Collection is our fall 2026 range: a small, considered set of coats, knits, shirts, boots, and accessories. Every piece is cut to layer with the others, so a few of them go a long way.

The colors come from an October walk outside our shop in Ashcombe: dry grass camel, slate navy, oak brown, and the red of a sugar maple at its peak. A few favorites, like the Millstone cable-knit and the Ashcombe flannel, return from earlier seasons with small changes to the cut.

## What is in it

- Four coats and jackets, from a belted camel coat to a waxed cotton field jacket
- Two sweaters and a flannel shirt for layering underneath
- Three pairs of boots in leather and suede
- A brushed knit scarf and lambswool gloves for the coldest mornings`),
  image: s.img(4),
  items: [camelCoat, redCoat, navyCoat, fieldJacket, cableKnit, stripedSweater, flannelShirt, laceUpBoots, chukkas, hikingBoots, scarf, gloves],
  seoTitle: "The Fieldstone Collection, Fall 2026 | Stuchbery Acres",
  seoDescription: "Twelve pieces for fall 2026 in wool, brushed cotton, suede, and leather: coats, knits, a flannel shirt, boots, and accessories.",
});

// ---------------------------------------------------------------------------
// CTAs
// ---------------------------------------------------------------------------

const collectionPageRef = s.ref("page", "fieldstone-collection");

const shopCollection = s.cta("shop-collection", {
  internalName: "Stuchbery Acres - Global - Shop the collection",
  label: "Shop the collection", goalType: "link", destinationPage: collectionPageRef, style: "primary",
});
const findYourSize = s.cta("find-your-size", {
  internalName: "Stuchbery Acres - Global - Find your size",
  label: "Find your size", goalType: "link", destinationPage: s.ref("page", "size-guide"), style: "secondary",
});
const viewAllPieces = s.cta("view-all-pieces", {
  internalName: "Stuchbery Acres - Home - View all pieces",
  label: "View all 12 pieces", goalType: "link", destinationPage: collectionPageRef, style: "secondary",
});
const collectionBand = s.cta("collection-band", {
  internalName: "Stuchbery Acres - Global - Collection band",
  label: "Shop the collection", goalType: "link", destinationPage: collectionPageRef, style: "primary",
  heading: "Ready for the first cold morning",
  body: "The Fieldstone Collection is twelve pieces for fall 2026, with free shipping on orders over $75 and free returns within 30 days.",
});
const shopAll = s.cta("shop-all", {
  internalName: "Stuchbery Acres - Collection - Shop all pieces",
  label: "Shop all pieces", goalType: "next_step", style: "primary",
});
const addToBag = s.cta("add-to-bag", {
  internalName: "Stuchbery Acres - Product - Add to bag",
  label: "Add to bag", goalType: "add_to_cart", style: "primary",
});

// ---------------------------------------------------------------------------
// Heroes
// ---------------------------------------------------------------------------

const homeHero = s.hero("home", {
  internalName: "Stuchbery Acres - Home - Hero",
  eyebrow: "The Fieldstone Collection, Fall 2026",
  headline: "Good coats for cold mornings",
  subheadline: "Twelve pieces in wool, flannel, and leather, cut to layer with one another and made to wear for many seasons.",
  image: s.img(6), layout: "full_bleed", cta: shopCollection, secondaryCta: findYourSize,
});
const collectionHero = s.hero("collection", {
  internalName: "Stuchbery Acres - Collection - Hero",
  eyebrow: "Fall 2026",
  headline: "The Fieldstone Collection",
  subheadline: "Coats, knits, boots, and a few small things for the colder months, made for frosty mornings and long walks home.",
  image: s.img(4), layout: "split", cta: findYourSize,
});
const shopHero = s.hero("shop", {
  internalName: "Stuchbery Acres - Shop - Hero",
  eyebrow: "Shop all",
  headline: "Every piece in the Fieldstone Collection",
  subheadline: "Coats, sweaters, shirts, boots, and accessories for fall 2026. Free shipping on orders over $75.",
  image: s.img(17), layout: "split",
});
const sizeGuideHero = s.hero("size-guide", {
  internalName: "Stuchbery Acres - Size guide - Hero",
  eyebrow: "Fit and sizing",
  headline: "Find your size",
  subheadline: "Measure over a light shirt, then use the charts below. If you are between sizes, the fit notes will help you choose.",
  layout: "text_only",
});
const journalHero = s.hero("journal", {
  internalName: "Stuchbery Acres - Journal - Hero",
  eyebrow: "The Journal",
  headline: "Notes on caring for good clothes",
  subheadline: "Practical advice from our Ashcombe shop on looking after wool and leather, and on dressing for the weather you actually get.",
  image: s.img(10), layout: "split",
});

// ---------------------------------------------------------------------------
// Section blocks
// ---------------------------------------------------------------------------

const homeFeatured = s.cardGrid("home-featured", {
  internalName: "Stuchbery Acres - Home - Featured products",
  heading: "Four pieces to start the season",
  intro: "The coat, sweater, shirt, and boots we reach for first when the mornings turn cold.",
  source: "manual", items: [camelCoat, cableKnit, flannelShirt, laceUpBoots], layout: "products", columns: 4,
  cta: viewAllPieces,
});

const homeCraft = s.mediaText("home-craft", {
  internalName: "Stuchbery Acres - Home - Craft story",
  eyebrow: "How we make it",
  heading: "Chosen for how it wears, not how it hangs",
  body: "Every piece starts with the cloth. We wear-test our fabrics through a full Ashcombe winter before we cut a single pattern, looking for wool that softens rather than thins, flannel brushed on both sides, and leather that creases without cracking.\n\nThen we cut for layering. Sleeves leave room for a sweater, coats close over a scarf, and shirts sit flat under a jacket. It is slower work, and it is why we make only twelve pieces a season.",
  image: s.img(13), imagePosition: "right",
});

const homeTestimonial = s.testimonial("home-ruth", {
  internalName: "Stuchbery Acres - Home - Customer quote",
  quote: "My cable-knit has been through two winters of dog walks and stacking wood. It has softened without losing its shape, the cuffs still spring back, and it came out of a careful hand wash the same size it went in. It is the first thing I pack for a weekend away.",
  person: ruth, rating: 5,
});

const collectionStory = s.mediaText("collection-story", {
  internalName: "Stuchbery Acres - Collection - Story",
  eyebrow: "About the collection",
  heading: "Named for the stone walls around Ashcombe",
  body: "The fields around our shop are lined with old fieldstone walls, stacked from rocks cleared by hand and still standing after a long run of hard winters. We named this collection for them because they are what we want our clothes to be: plain and sturdy, and better with age.\n\nThe colors come from the same walk, and every piece is cut to layer with the others. Start with a coat and a sweater, add boots, and you are ready for most of what October and November bring.",
  image: s.img(15), imagePosition: "left",
});

const collectionProducts = s.cardGrid("collection-products", {
  internalName: "Stuchbery Acres - Collection - All products",
  heading: "All 12 pieces",
  intro: "Coats and jackets first, then knits and shirts, boots, and the small things that keep the cold out.",
  source: "collection", collection: fieldstone, layout: "products", columns: 4,
});

// Trust items (icons layout) and FAQ items
const trustShipping = s.item("trust-shipping", {
  title: "Free shipping over $75",
  text: "Orders over $75 ship free. Under that, standard shipping is a flat $8.",
});
const trustReturns = s.item("trust-returns", {
  title: "Free returns for 30 days",
  text: "Send back unworn pieces within 30 days. A prepaid return label comes in every box.",
});
const trustFitHelp = s.item("trust-fit-help", {
  title: "Help with fit",
  text: "Not sure between two sizes? Call our Ashcombe shop at (802) 555-0118 and we will talk it through with you.",
});
const trustMadeToLast = s.item("trust-made-to-last", {
  title: "Made to last",
  text: "We choose dense wool, full-grain leather, and stitched seams for how they hold up after years of wear.",
});
const trustSecureCheckout = s.item("trust-secure-checkout", {
  title: "Secure mock checkout",
  text: "This is a demo store. No payment is taken, and nothing you enter is sent or stored.",
});

const shopTrust = s.cardGrid("shop-trust", {
  internalName: "Stuchbery Acres - Product - Trust items",
  heading: "With every order",
  source: "manual", items: [trustShipping, trustReturns, trustFitHelp], layout: "icons", columns: 3,
});

const faqShipping = s.item("faq-shipping-time", {
  title: "How long does shipping take?",
  text: "Orders placed by 1 p.m. Eastern on a weekday leave our Ashcombe warehouse the same day. Standard delivery usually takes 3 to 5 business days, and shipping is free on orders over $75. Delivery times on this demo store are illustrative.",
});
const faqReturns = s.item("faq-returns", {
  title: "What is your return policy?",
  text: "Return unworn pieces with the tags attached within 30 days for a full refund to your original payment method. Returns are free, and a prepaid label is included in every order. Exchanges for a different size or color ship free once your return arrives.",
});
const faqWoolCare = s.item("faq-wool-care", {
  title: "How should I care for wool sweaters and coats?",
  text: "Air wool out between wears and brush it with a soft clothes brush. Hand wash sweaters in cool water with a wool wash and dry them flat. Coats should go to a dry cleaner about once a season, usually before you store them for summer.",
});
const faqBootCare = s.item("faq-boot-care", {
  title: "How do I look after leather and suede boots?",
  text: "Let wet boots dry at room temperature, away from radiators and stoves. Condition smooth leather two or three times a season. For suede, use a suede brush after wear and refresh the protector spray at the start of each season.",
});

const shopFaq = s.faq("shop-shipping-care", {
  internalName: "Stuchbery Acres - Product - Shipping FAQ",
  heading: "Shipping, returns, and care",
  items: [faqShipping, faqReturns, faqWoolCare, faqBootCare],
});

const checkoutForm = s.form("cart-checkout", {
  internalName: "Stuchbery Acres - Cart - Checkout form",
  formKind: "checkout",
  heading: "Your bag",
  intro: "Use code FIELDSTONE15 for 15% off your first order. Demo only.",
  submitLabel: "Place order",
  successHeading: "Thank you, your demo order is complete",
  successMessage: "On a real store you would receive a confirmation email now, then a tracking link once your order leaves Ashcombe. This is a demo, so no order was placed, no payment was taken, and nothing will ship.",
  privacyNote: "This is a demo checkout. Nothing you enter is sent or stored, and no payment is taken.",
  prefillSample: true,
});

const cartShipping = s.richText("cart-shipping-returns", {
  internalName: "Stuchbery Acres - Cart - Shipping and returns",
  heading: "Shipping and returns",
  body: md(`### Shipping

- Free standard shipping on orders over $75.
- Orders under $75 ship for a flat $8.
- Orders placed by 1 p.m. Eastern on a weekday leave our Ashcombe warehouse the same day.
- Standard delivery usually takes 3 to 5 business days.

### Returns and exchanges

- Return unworn pieces with the tags attached within 30 days. Returns are free.
- A prepaid return label is included in every order.
- Exchanges for a different size or color ship free once we receive your return.
- Refunds go back to your original payment method within 5 business days of your return arriving.

*Shipping times, fees, and policies on this demo store are illustrative.*`),
});

const cartTrust = s.cardGrid("cart-trust", {
  internalName: "Stuchbery Acres - Cart - Trust badges",
  heading: "Every order includes",
  source: "manual", items: [trustReturns, trustMadeToLast, trustSecureCheckout], layout: "icons", columns: 3,
});

const journalLatest = s.cardGrid("journal-latest", {
  internalName: "Stuchbery Acres - Journal - Latest articles",
  heading: "Latest from the journal",
  source: "latest_articles", layout: "cards", columns: 2, limit: 6,
});

// ---------------------------------------------------------------------------
// Pages: funnel steps 1 to 4, then off-funnel pages
// ---------------------------------------------------------------------------

const home = s.page("home", {
  title: "Stuchbery Acres", slug: "home", pageType: "home", funnelStep: 1, nextStep: collectionPageRef,
  hero: homeHero, primaryCta: shopCollection,
  sections: [homeFeatured, homeCraft, homeTestimonial, collectionBand],
  seoTitle: "Stuchbery Acres | Wool coats, knitwear, and boots for fall",
  seoDescription: "Shop the Fieldstone Collection: wool coats, cable-knits, flannel shirts, and leather boots for fall 2026. Free shipping on orders over $75.",
});

const collectionPage = s.page("fieldstone-collection", {
  title: "The Fieldstone Collection", slug: "fieldstone-collection", pageType: "standard", funnelStep: 2,
  nextStep: s.ref("page", "shop"),
  hero: collectionHero, primaryCta: shopAll,
  sections: [collectionStory, collectionProducts],
  seoTitle: "The Fieldstone Collection, Fall 2026 | Stuchbery Acres",
  seoDescription: "Twelve pieces for fall 2026 in wool, brushed cotton, suede, and leather. Free shipping on orders over $75 and free returns within 30 days.",
});

const shopPage = s.page("shop", {
  title: "Shop", slug: "shop", pageType: "offering_detail", funnelStep: 3, nextStep: s.ref("page", "cart"),
  hero: shopHero, primaryCta: addToBag,
  sections: [collectionProducts],
  detailSections: [shopFaq, shopTrust],
  seoTitle: "Shop the Fieldstone Collection | Stuchbery Acres",
  seoDescription: "Coats, sweaters, flannel shirts, boots, and knit accessories from the Fieldstone Collection, with free returns within 30 days.",
});

const cartPage = s.page("cart", {
  title: "Your bag", slug: "cart", pageType: "goal", funnelStep: 4,
  sections: [checkoutForm, cartShipping, cartTrust],
  seoTitle: "Your bag | Stuchbery Acres",
  seoDescription: "Review your bag and check out. Free shipping on orders over $75 and free returns within 30 days.",
});

const sizeGuidePage = s.page("size-guide", {
  title: "Size guide", slug: "size-guide", pageType: "standard", funnelStep: 0,
  hero: sizeGuideHero, primaryCta: shopCollection,
  sections: [sizeGuide, collectionBand],
  seoTitle: "Size guide | Stuchbery Acres",
  seoDescription: "Chest and waist measurements in inches for sizes XS to XXL, boot sizes, and fit notes for every piece in the Fieldstone Collection.",
});

const journalPage = s.page("journal", {
  title: "The Journal", slug: "journal", pageType: "article_index", funnelStep: 0,
  hero: journalHero, primaryCta: shopCollection,
  sections: [journalLatest, collectionBand],
  seoTitle: "The Journal | Stuchbery Acres",
  seoDescription: "Care guides and seasonal advice from Stuchbery Acres: how to look after wool, leather, and suede, and how to dress for a long fall.",
});

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

const woolArticle = s.article("caring-for-wool", {
  title: "How to care for wool sweaters and coats", slug: "how-to-care-for-wool",
  summary: "Most wool needs far less washing than you think. Here is how to air, brush, wash, and store sweaters and coats so they keep their shape.",
  body: md(`## Wear it, then let it rest

Wool recovers between wears. Each fiber has a natural crimp that springs back once it has had a chance to relax, so the simplest care habit is also the most effective: give a sweater or coat a day off after you wear it.

Hang coats on a broad wooden hanger that supports the shoulders. Fold sweaters and lay them flat on a shelf. A hook or a thin wire hanger will stretch a knit out of shape in a matter of weeks.

Wool also holds on to odors less than most synthetic fabrics. A few hours by an open window or on a covered porch is often all a sweater needs after a long day.

## Brush before you wash

A soft clothes brush does more for wool than most people expect. Brushing lifts dust and lint from the surface before they work their way into the fibers, and it keeps the nap of a coat lying in one direction.

- Hang the piece at eye level or lay it flat on a clean surface.
- Brush downward in short, light strokes, following the grain of the cloth.
- Spend a little extra time on the collar, cuffs, and pocket edges, where dirt collects.
- For a small spot, blot it with a damp cloth rather than rubbing, then let it dry at room temperature.

## Washing sweaters by hand

Most knitwear needs a proper wash only a few times a season. When it does, washing by hand is the gentlest option.

1. Fill a basin with cool water and a small amount of wool wash. Ordinary detergent is often too harsh.
2. Turn the sweater inside out and press it under the water. Let it soak for about ten minutes.
3. Lift it out, drain the basin, and rinse in fresh cool water. Do not wring or twist it.
4. Roll it in a dry towel and press gently to take out most of the water.
5. Lay it flat on a fresh towel, ease it back into shape, and let it dry away from direct heat.

Sudden changes in temperature and rough handling are what make wool felt and shrink, so keep the water at the same cool temperature from start to finish. If a care label says dry clean only, follow it.

## Coats and tailored pieces

Tailored coats, like the Fieldstone Camel Coat and the Orchard Wool Coat, should go to a dry cleaner about once a season, usually at the end of winter before you put them away. Between cleanings, brush them after wear and let them dry naturally if they get wet. A coat that dries on a hanger at room temperature keeps its shape far better than one draped over a radiator.

## Dealing with pilling

Small balls of fiber, called pills, form wherever wool rubs against itself or a bag strap: under the arms, along the sides, and at the cuffs. They are a sign of friction rather than poor quality, and they usually slow down after the first season.

Remove them with a sweater comb or a fabric shaver, working gently over a flat surface. Pulling them off by hand tends to draw out more fiber and makes the problem worse.

## Storing wool for summer

Before the weather turns warm, wash or clean everything you plan to put away. Moth larvae seek out wool that carries traces of food and skin oils, so clean pieces are far less tempting.

- Fold sweaters and store them in breathable cotton bags or a lidded box.
- Tuck in a few cedar blocks or lavender sachets, and refresh them each spring.
- Keep coats in breathable garment bags rather than plastic, which traps moisture.
- Check on stored pieces once or twice over the summer.

## The short version

Wear it, rest it, brush it, and wash it only when it needs it. Wool that is treated this way softens and settles over the years instead of wearing out, which is the whole reason to buy it in the first place.`),
  heroImage: s.img(1), author: elena, publishDate: "2026-09-10",
  topics: ["wool care", "knitwear", "coats"], relatedPage: cableKnit, cta: shopCollection,
  seoTitle: "How to care for wool sweaters and coats | Stuchbery Acres",
  seoDescription: "How to air, brush, hand wash, de-pill, and store wool sweaters and coats so they keep their shape for many seasons.",
});

const layeringArticle = s.article("layering-for-fall", {
  title: "How to layer for a long fall", slug: "how-to-layer-for-a-long-fall",
  summary: "From the first cool morning in September to the gray days of November, a few well-chosen layers do most of the work. Here is how we put them together.",
  body: md(`## Why layers beat one heavy coat

Fall in Vermont rarely settles on one temperature. A morning that starts at 35 degrees can reach 60 by lunch and drop back again before dinner. One heavy coat leaves you too warm by noon and too cold the moment you take it off. Two or three lighter layers let you adjust as the day changes.

The idea is simple. Thin layers sit closest to you, heavier ones go on top, and each one should be easy to remove and carry.

## Start with a shirt you can wear open

A heavyweight flannel shirt is the most useful piece in a fall wardrobe. On a mild afternoon it works on its own, unbuttoned over a T-shirt like a light jacket. On a colder day it goes under a sweater, where the brushed cotton adds warmth without bulk.

Look for flannel that is brushed on both sides and cut with long tails, so it stays tucked when you reach or bend.

## Add a sweater in the right weight

Sweaters do most of the work from mid-October on, and their weight matters more than their style.

- **Midweight knits**, like a cotton and wool waffle stitch, are best for early fall and for wearing under a fitted coat.
- **Heavyweight knits**, like a 5-gauge cable-knit, can stand in for a jacket on a still, dry day.
- **Fine knits** go under heavier ones, never the other way around.

If you only own one sweater, choose a heavyweight crewneck in a neutral color. It goes over a flannel shirt, under a field jacket, and under a wool coat.

## Choose an outer layer for the weather

The outer layer protects everything underneath, so pick it for the conditions you see most.

- **For rain and wind**, a waxed cotton field jacket sheds light showers and cuts the wind, and it softens the more you wear it.
- **For cold, dry days**, a wool coat is the warmest option. Boiled wool and wool melton both block wind well.
- **For the coldest mornings**, choose a heavy wool and cashmere coat cut with room for a cable-knit underneath.

Try any coat on over the thickest sweater you plan to wear with it. It should button without pulling, and the sleeves should cover your sweater cuffs with a little room to spare.

## Do not forget your hands, neck, and feet

Small layers make a big difference because they are the easiest to adjust. A scarf can be loosened, looped once, or wrapped twice. Knit gloves fit in a pocket when the sun comes out. For your feet, match the boot to the ground: suede chukkas for town, leather lace-ups for wet leaves, and hiking boots for anything rockier.

## A simple fall checklist

If you are building a fall wardrobe from scratch, this short list covers almost every day between September and the first snow:

1. One heavyweight flannel shirt
2. One midweight sweater and one heavyweight cable-knit
3. One water-resistant jacket
4. One wool coat
5. One pair of leather boots
6. A scarf and a pair of gloves

Buy fewer pieces, choose them to work together, and look after them well. That is most of what dressing for a long fall comes down to.`),
  heroImage: s.img(14), author: thomas, publishDate: "2026-09-24",
  topics: ["layering", "fall", "style advice"], relatedPage: collectionPage, cta: shopCollection,
  seoTitle: "How to layer for a long fall | Stuchbery Acres",
  seoDescription: "A practical guide to layering shirts, sweaters, jackets, and coats for changeable fall weather, plus a simple wardrobe checklist.",
});

// ---------------------------------------------------------------------------
// Navigation, footer, and brand
// ---------------------------------------------------------------------------

const navCollection = s.item("nav-collection", { title: "Fieldstone Collection", link: collectionPage });
const navSizeGuide = s.item("nav-size-guide", { title: "Size Guide", link: sizeGuidePage });
const navJournal = s.item("nav-journal", { title: "Journal", link: journalPage });
const navCart = s.item("nav-cart", { title: "Cart", link: cartPage });
const footerShopAll = s.item("footer-shop-all", { title: "Shop All", link: shopPage });
const footerWoolCare = s.item("footer-wool-care", { title: "Caring for Wool", link: woolArticle });
const footerLayering = s.item("footer-layering", { title: "Layering for Fall", link: layeringArticle });

s.brand({
  name: "Stuchbery Acres", slug: "stuchbery-acres", vertical: "apparel_retail",
  shortDescription: "Apparel retailer with classic seasonal collections.",
  tagline: "Made for the long season.",
  logo: s.logo, favicon: s.favicon,
  colorBrand: "#2F4A3A", colorButton: "#2F4A3A", colorButtonText: "#F5EFE3", colorAccent: "#A04A25",
  colorBackground: "#F5EFE3", colorSurface: "#E4D9C4", colorText: "#2B2B2B", colorMuted: "#6B645A",
  fontHeading: "Libre Caslon Text", fontBody: "Source Sans 3", buttonRadius: 0, buttonTextCase: "uppercase",
  voiceDescription: "A warm, understated outfitter from a small town in Vermont. Stuchbery Acres writes about fabric, fit, and care the way a knowledgeable shop assistant would: plainly, with specific detail about how things feel and how they wear over time.",
  voiceDos: [
    "Describe how things feel and wear.",
    "Use seasonal moments, like the first frost or a wet October walk.",
    "Name the fabric, weight, and fit.",
    "Give practical care advice.",
  ],
  voiceDonts: [
    "No trend slang.",
    "Do not shout about discounts or create urgency.",
    "No real heritage claims, founding dates, or awards.",
    "No exclamation marks.",
  ],
  photoDirection: "Autumn outdoors. Wool knits, flannel, waxed jackets, boots, cabins, stone walls, flat lays on wood. Plain garments with no visible logos.",
  navigation: [navCollection, navSizeGuide, navJournal, navCart],
  headerCta: shopCollection,
  footerLinks: [footerShopAll, navCollection, navSizeGuide, navJournal, footerWoolCare, footerLayering, navCart],
  promoBarText: "Free shipping on orders over $75. Free returns within 30 days.",
  address: "18 Mill Pond Road\nAshcombe, VT 05999",
  phone: "(802) 555-0118",
  legalDisclaimer: "Fictional company. Sample content for illustration only.",
  homePage: home,
  freeShippingThreshold: 75,
});

export default s.entries;
