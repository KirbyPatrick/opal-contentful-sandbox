/**
 * Tidewater Journeys: curated small-group and private trips.
 * Funnel: home (1) -> destinations/{destination} (2) -> trips/{trip} (3) -> request-a-booking (4).
 * Off-funnel: private-journeys, travel-notes.
 */
import { defineBrand, md } from "../lib/builders";

const s = defineBrand("tidewater-journeys", "tj");

const FINE_PRINT = "Prices and itineraries are illustrative.";

// ---------- People (no photos: initials are shown) ----------

const moira = s.person("moira-fennick", {
  name: "Moira Fennick", slug: "moira-fennick", role: "author", jobTitle: "Lead guide, Scotland",
  bio: "Moira grew up in Fort William and has led walking groups in the Highlands and Hebrides for more than fifteen years. She plans our Scotland routes and trains new guides each spring.",
});
const ines = s.person("ines-valadares", {
  name: "Inês Valadares", slug: "ines-valadares", role: "author", jobTitle: "Trip planner, Portugal and Norway",
  bio: "Inês grew up in Porto and has worked in small-group travel since 2012. She plans our Portugal and Norway trips and walks each route before the season begins, usually with a notebook full of questions for the guides.",
});
const ruth = s.person("ruth-ellingham", {
  name: "Ruth Ellingham", slug: "ruth-ellingham", role: "customer", jobTitle: "Fjord villages by boat, June 2026",
});
const graham = s.person("graham-pettigrew", {
  name: "Graham Pettigrew", slug: "graham-pettigrew", role: "customer", jobTitle: "Private journey, Scottish Highlands, 2026",
});

// ---------- CTAs ----------

const goalPage = s.ref("page", "request-a-booking");

const requestBooking = s.cta("request-booking", {
  internalName: "Tidewater Journeys - Global - Request a booking", label: "Request a booking",
  goalType: "request_booking", destinationPage: goalPage, style: "primary",
});
const exploreDestinations = s.cta("explore-destinations", {
  internalName: "Tidewater Journeys - Home - Explore destinations", label: "Explore destinations", goalType: "next_step", style: "primary",
});
const planPrivate = s.cta("plan-private-journey", {
  internalName: "Tidewater Journeys - Home - Plan a private journey", label: "Plan a private journey",
  goalType: "link", destinationPage: s.ref("page", "private-journeys"), style: "secondary",
});
const seeTrips = s.cta("see-trips", {
  internalName: "Tidewater Journeys - Destinations - See trips", label: "See trips",
  goalType: "link", destinationPage: s.ref("page", "trips"), style: "primary",
});
const requestThisTrip = s.cta("request-this-trip", {
  internalName: "Tidewater Journeys - Trips - Request this trip", label: "Request this trip",
  goalType: "request_booking", destinationPage: goalPage, style: "primary",
});

const homeBand = s.cta("home-band", {
  internalName: "Tidewater Journeys - Home - Booking band", label: "Request a booking",
  goalType: "request_booking", destinationPage: goalPage,
  heading: "Choose a departure for 2027",
  body: "Most trips run between May and September. Send a booking request and a trip planner will confirm availability and hold your places.",
});
const destinationsPrivateBand = s.cta("destinations-private-band", {
  internalName: "Tidewater Journeys - Destinations - Private journeys band", label: "Plan a private journey",
  goalType: "link", destinationPage: s.ref("page", "private-journeys"), style: "secondary",
  heading: "Traveling with your own group?",
  body: "Any of these routes can run as a private journey for 2 to 10 travelers, on dates that suit you.",
});
const destinationDetailBand = s.cta("destination-detail-band", {
  internalName: "Tidewater Journeys - Destination detail - Compare trips band", label: "Compare all trips",
  goalType: "next_step",
  heading: "Compare seasons and pace across all six trips",
  body: "Every trip page lists the season, the daily walking time, and what the price includes.",
});
const tripsIndexBand = s.cta("trips-index-band", {
  internalName: "Tidewater Journeys - Trips - Booking band", label: "Request a booking",
  goalType: "request_booking", destinationPage: goalPage,
  heading: "Have a departure in mind?",
  body: "Send a booking request with your preferred trip and month. There is no payment at this stage.",
});
const tripDetailBand = s.cta("trip-detail-band", {
  internalName: "Tidewater Journeys - Trip detail - Booking band", label: "Request this trip",
  goalType: "request_booking", destinationPage: goalPage,
  heading: "Hold places on this trip",
  body: "Send a request with your preferred month and the number of travelers. A trip planner confirms availability before any deposit is taken.",
});
const privateBand = s.cta("private-band", {
  internalName: "Tidewater Journeys - Private journeys - Request band", label: "Request a private trip",
  goalType: "request_booking", destinationPage: goalPage,
  heading: "Start with a short request",
  body: "Tell us who is traveling, roughly when, and which region interests you. A trip planner replies with a first outline.",
});
const articleTripsCta = s.cta("article-see-trips", {
  internalName: "Tidewater Journeys - Article - See all trips", label: "See all trips",
  goalType: "link", destinationPage: s.ref("page", "trips"),
  heading: "Ready to choose a trip?",
  body: "Every trip page lists the season, the pace, and what each day involves.",
});
const articleBookingCta = s.cta("article-request-booking", {
  internalName: "Tidewater Journeys - Article - Request a booking", label: "Request a booking",
  goalType: "request_booking", destinationPage: goalPage,
  heading: "Found the pace that suits you?",
  body: "Send a booking request with your preferred trip and month, and a trip planner will confirm the details.",
});

// ---------- Offerings: six trips ----------

const alentejo = s.offering("alentejo-coast-on-foot", {
  name: "The Alentejo coast on foot", slug: "alentejo-coast-on-foot", offeringType: "travel_package",
  summary: "Eight days walking cliff paths and sandy tracks on Portugal's southwest coast, staying two or three nights in each of three seaside bases.",
  description: md(`## Cliff paths and fishing villages

Portugal's southwest coast is still lightly built on. Old fishermen's paths follow the cliff tops between small villages, on soft sand and red earth, with coves below that you reach by steep wooden steps. White storks nest on the sea stacks near Cabo Sardão, and in spring the cliff tops are covered in low flowering scrub.

We walk for three to five hours on most days and stay two or three nights in each of three bases, with short transfers to the start of each walk. Most walks finish in a village with time to swim when the sea allows, or to sit over grilled fish and a cold drink.

## Day by day

- **Day 1: Lisbon to Vila Nova de Milfontes.** Meet your guide in Lisbon and travel south, about two and a half hours by road. Welcome dinner by the Mira river.
- **Day 2: Porto Covo to Milfontes.** A short transfer north, then a full day on the cliffs back to the mouth of the Mira.
- **Day 3: Milfontes.** A slow morning, then an optional boat trip up the Mira or a shorter walk along the estuary.
- **Day 4: Almograve to Zambujeira do Mar.** Past Cabo Sardão and its nesting storks, on one of the most striking sections of the coast.
- **Day 5: Zambujeira to Odeceixe.** Through farmland and pine to a river beach on the edge of the Algarve, then back to Zambujeira for a second night.
- **Day 6: Aljezur and Arrifana.** Move south to Sagres, with a walk above the surf beaches and lunch at a small cafe on the cliffs.
- **Day 7: Cape St. Vincent.** A final walk to the lighthouse at the southwest corner of mainland Europe, then a farewell dinner in Sagres.
- **Day 8: Departure.** Transfer to Lisbon or Faro.

## Good to know

Spring brings wildflowers and cool walking weather. Late September and October bring warmer sea water and quieter villages. We do not run this trip in July or August, when the heat on the exposed cliffs makes long walking days hard work. Sand paths are tiring underfoot, so the distances feel longer than they look on a map.`),
  images: [s.img(2), s.img(14)],
  price: 3850, priceLabel: "From $3,850 per person (illustrative)",
  specs: [
    "Duration: 8 days", "Group size: Up to 12", "Pace: Moderate", "Season: April to June, September to October",
    "Daily walking: 3 to 5 hours", "Starts: Lisbon", "Ends: Lisbon or Faro",
  ],
  features: [
    "7 nights in small hotels and guesthouses", "Breakfast daily and 5 dinners", "Local lead guide throughout",
    "Luggage moved between stays", "All ground transport from Lisbon", "Optional boat trip on the Mira river",
  ],
  finePrint: FINE_PRINT,
  seoTitle: "The Alentejo coast on foot | Tidewater Journeys",
  seoDescription: "An 8-day small-group walking trip on Portugal's southwest coast, from Porto Covo to Cape St. Vincent. Groups of 12 or fewer. Prices are illustrative.",
});

const douro = s.offering("douro-valley-by-river-and-vineyard", {
  name: "Douro valley by river and vineyard", slug: "douro-valley-by-river-and-vineyard", offeringType: "travel_package",
  summary: "An easy-paced week in the terraced wine country east of Porto, traveling by train and river boat, with short walks between family estates.",
  description: md(`## The valley east of Porto

Upriver from Porto, the Douro winds between hillsides cut into narrow stone terraces. Grapes have been grown here for centuries, and many quintas, the wine estates along the river, are still run by the families who built them. This is our gentlest trip. We travel by train and boat, and walk for two to three hours on most days on vineyard tracks and old paths between villages.

We spend three nights in Peso da Régua and two in Pinhão, so you unpack only a few times. Lunches are long, often at a family table on an estate, and most afternoons are left open.

## Day by day

- **Day 1: Porto.** Meet your guide for an evening walk along the river and dinner in the old town.
- **Day 2: Up the valley by train.** The line follows the river for much of the way to Peso da Régua. Afternoon visit to a quinta above the town.
- **Day 3: Terraces above the river.** A morning walk on vineyard tracks, then lunch with a winemaking family.
- **Day 4: On the water.** A half-day on a traditional wooden river boat, followed by a free afternoon.
- **Day 5: To Pinhão.** A short transfer and a walk up to a viewpoint over the bends of the river.
- **Day 6: Almond groves and rock art.** A day trip to the Côa valley, where engravings in the rock are many thousands of years old.
- **Day 7: Back to Porto.** Return by train along the river, with a farewell dinner in the city.
- **Day 8: Departure.** Transfer to Porto airport or the train station.

## Good to know

September is harvest month, when the terraces fill with pickers and the cellars smell of fermenting grapes. May and June are greener and quieter. Tastings are part of most estate visits, and there is always an alternative for travelers who do not drink. The terraces are steep in places, and September afternoons can be hot, so walks use the cooler morning hours.`),
  images: [s.img(3), s.img(5)],
  price: 4450, priceLabel: "From $4,450 per person (illustrative)",
  specs: [
    "Duration: 8 days", "Group size: Up to 12", "Pace: Easy", "Season: May to June, September to October",
    "Daily walking: 2 to 3 hours", "Starts: Porto", "Ends: Porto",
  ],
  features: [
    "7 nights in small hotels and estate guesthouses", "Breakfast daily, 5 dinners, and 3 estate lunches",
    "Local lead guide throughout", "Train journey up the Douro valley", "Half-day on a traditional river boat",
    "Visits and tastings at three family quintas", "Luggage moved between stays",
  ],
  finePrint: FINE_PRINT,
  seoTitle: "Douro valley by river and vineyard | Tidewater Journeys",
  seoDescription: "An easy-paced 8-day trip through the Douro wine country by train and river boat, with short vineyard walks. Groups of 12 or fewer. Prices are illustrative.",
});

const fjords = s.offering("fjord-villages-by-boat", {
  name: "Fjord villages by boat", slug: "fjord-villages-by-boat", offeringType: "travel_package",
  summary: "Nine days moving between fjord villages on local ferries and express boats, with short walks ashore and long evenings by the water.",
  description: md(`## Traveling the fjords the way locals do

In western Norway, the boat is often the simplest way from one village to the next. This trip uses the scheduled express boats and car ferries that link the Sognefjord and the Hardangerfjord, so travel days are spent on deck rather than in a coach. Most walks last two to three hours, along shore paths and old farm roads, some of them steep, with one or two longer optional hikes for those who want them.

We stay in small family-run hotels, with three nights in Balestrand and two in Flåm, which leaves time to sit by the water after dinner while the light lingers.

## Day by day

- **Day 1: Bergen.** Meet your guide by the old harbor for an evening walk and dinner.
- **Day 2: Into the Sognefjord.** A morning express boat north along the coast and into the fjord, arriving in Balestrand around midday.
- **Day 3: Balestrand.** A short walk above the village and a free afternoon by the water.
- **Day 4: Fjærland.** A day trip by ferry up a narrow arm of the fjord to a village of a few hundred people, with a visit to the foot of a glacier.
- **Day 5: Nærøyfjord and Undredal.** By boat through one of the narrowest fjords in Norway to a small village known for its goat cheese.
- **Day 6: Aurland and Flåm.** A walk on an old farm road above the Aurlandsfjord, then a free afternoon.
- **Day 7: Hardanger.** Over the mountains to Ulvik, a village of fruit orchards on a quiet branch of the Hardangerfjord.
- **Day 8: Back to Bergen.** A morning walk among the orchards, then the return journey and a farewell dinner.
- **Day 9: Departure.** Transfer to Bergen airport.

## Good to know

In late May and early June, the orchards in Hardanger are in blossom. In midsummer the evenings stay light until well past ten. Boat timetables can change with the weather, and your guide will adjust the plan on the day if needed. Every crossing is cooler than the shore, so keep a warm layer close.`),
  images: [s.img(8), s.img(6)],
  price: 5950, priceLabel: "From $5,950 per person (illustrative)",
  specs: [
    "Duration: 9 days", "Group size: Up to 12", "Pace: Easy to moderate", "Season: May to September",
    "Daily walking: 2 to 3 hours, plus optional hikes", "Starts: Bergen", "Ends: Bergen",
  ],
  features: [
    "8 nights in small family-run hotels", "Breakfast daily and 6 dinners", "Local lead guide throughout",
    "All ferry and express boat travel on the route", "Luggage moved between stays",
    "Cheese tasting at a farm in Undredal",
  ],
  finePrint: FINE_PRINT,
  seoTitle: "Fjord villages by boat | Tidewater Journeys",
  seoDescription: "A 9-day small-group trip through Norway's Sognefjord and Hardangerfjord by local ferry and express boat. Groups of 12 or fewer. Prices are illustrative.",
});

const lofoten = s.offering("lofoten-arctic-islands", {
  name: "Lofoten Arctic islands", slug: "lofoten-arctic-islands", offeringType: "travel_package",
  summary: "Ten days in the fishing villages and mountains of Lofoten, walking under the long Arctic light, with four nights in converted fishermen's cabins.",
  description: md(`## Mountains straight out of the sea

The Lofoten islands lie well north of the Arctic Circle, a chain of granite peaks rising from the Norwegian Sea. Their fishing villages are built on the rocks at the water's edge, with red and ochre cabins on stilts and wooden racks where cod dries in the wind through late winter and spring.

This is our most active trip. Several days include four to six hours of walking on steep, rocky paths, and the weather can turn quickly even in summer. Your guide chooses routes on the day based on conditions. In return, you walk under light that barely fades from late May to mid-July, and the evenings in the villages are long and quiet.

## Day by day

- **Day 1: Bodø.** Meet your guide and stay overnight on the mainland.
- **Day 2: Across the Vestfjord.** A ferry crossing of a few hours to Moskenes, then on to rorbu cabins in Reine.
- **Day 3: Bunes beach.** A small ferry up the Reinefjord and a short walk over to a wide, sheltered beach.
- **Day 4: Ryten.** Our longest day, climbing to a viewpoint high above Kvalvika beach.
- **Day 5: Nusfjord.** A slower day in one of the oldest fishing villages in the islands.
- **Day 6: To Henningsvær.** Move east to a village spread across small islands joined by bridges.
- **Day 7: Above Henningsvær.** A ridge walk with views across the islands, or a free day in the village.
- **Day 8: The Trollfjord.** A boat trip into a narrow fjord where sea eagles are often seen.
- **Day 9: Free day.** Kayak, cycle, or rest before the farewell dinner.
- **Day 10: Departure.** Transfer to Svolvær for your flight home.

## Good to know

Pack for wind and rain as well as sun. Some walks include steep stone steps and short scrambles, so this trip suits travelers who already enjoy long hill days. Shorter options are offered where the ground allows.`),
  images: [s.img(7), s.img(8)],
  price: 6650, priceLabel: "From $6,650 per person (illustrative)",
  specs: [
    "Duration: 10 days", "Group size: Up to 12", "Pace: Moderate to active", "Season: June to August",
    "Daily walking: 4 to 6 hours", "Starts: Bodø", "Ends: Svolvær",
  ],
  features: [
    "9 nights, including 4 in rorbu cabins in Reine", "Breakfast daily and 6 dinners", "Local lead guide throughout",
    "Ferry from Bodø and all transfers in the islands", "Boat trips to Bunes and the Trollfjord",
    "Luggage moved between stays",
  ],
  finePrint: FINE_PRINT,
  seoTitle: "Lofoten Arctic islands | Tidewater Journeys",
  seoDescription: "A 10-day small-group walking trip in Norway's Lofoten islands, with four nights in fishermen's cabins in Reine. Groups of 12 or fewer. Illustrative prices.",
});

const highlands = s.offering("highlands-and-glens", {
  name: "Highlands and glens", slug: "highlands-and-glens", offeringType: "travel_package",
  summary: "Nine days walking through Glen Coe, Glen Nevis, Glen Affric, and the Cairngorms, staying in just three places along the way.",
  description: md(`## A line of glens, west to east

The Highlands are best taken slowly. Weather moves across the hills by the hour, and the views often come at the end of a long, gradual climb rather than from the roadside. This trip follows a line of glens from the west coast to the Cairngorms, from three bases: four nights in Glen Coe, then two near Glen Affric and two in the Spey valley.

Walking days are three to five hours on hill paths and old drove roads, some of them wet and rocky underfoot. Evenings are spent in small hotels and country inns, several with an open fire and a long shelf of local whisky.

## Day by day

- **Day 1: Glasgow to Glen Coe.** Meet your guide and drive north past Loch Lomond and across Rannoch Moor.
- **Day 2: The Lost Valley.** A morning walk up into a high corrie where, by tradition, cattle were once hidden.
- **Day 3: The Devil's Staircase.** Follow part of the West Highland Way over the hills to Kinlochleven, then return to Glen Coe.
- **Day 4: Glen Nevis.** A walk through a wooded gorge to the meadows and waterfall at Steall.
- **Day 5: Along the Great Glen.** Travel north past Loch Ness to the quiet road end at Glen Affric.
- **Day 6: Glen Affric.** A walk among old Scots pines on the shore of Loch Affric, then a free afternoon.
- **Day 7: Into the Cairngorms.** Move east to the Spey valley, with an afternoon loop around Loch an Eilein.
- **Day 8: The Ryvoan Pass.** A walk through pinewoods to a small green loch, then a farewell dinner.
- **Day 9: Departure.** Transfer to Inverness.

## Good to know

Late May and June bring the longest evenings. September brings autumn color on the hills and quieter paths. Midges are common in still, damp weather in summer, so a head net is worth packing. Your guide will adjust routes if the cloud is low or the rivers are high.`),
  images: [s.img(10), s.img(9)],
  price: 4950, priceLabel: "From $4,950 per person (illustrative)",
  specs: [
    "Duration: 9 days", "Group size: Up to 12", "Pace: Moderate", "Season: May to September",
    "Daily walking: 3 to 5 hours", "Starts: Glasgow", "Ends: Inverness",
  ],
  features: [
    "8 nights in small hotels and country inns", "Breakfast daily and 6 dinners", "Local lead guide throughout",
    "All ground transport from Glasgow to Inverness", "Luggage moved between stays",
    "Tasting at a small distillery in the Spey valley",
  ],
  finePrint: FINE_PRINT,
  seoTitle: "Highlands and glens | Tidewater Journeys",
  seoDescription: "A 9-day small-group walking trip through Glen Coe, Glen Nevis, Glen Affric, and the Cairngorms. Groups of 12 or fewer. Prices are illustrative.",
});

const hebrides = s.offering("hebridean-lighthouse-walks", {
  name: "Hebridean lighthouse walks", slug: "hebridean-lighthouse-walks", offeringType: "travel_package",
  summary: "Ten days walking the headlands of Skye, Harris, and Lewis to the lighthouses at their edges, with two island ferry crossings.",
  description: md(`## To the edge of the islands

Hebridean lighthouses stand at the far edges of the islands, and reaching them usually means a good walk across open headland. This trip links three of them, from the western tip of Skye to the northern point of Lewis, with island ferries in between.

The walking moves between cliff paths, moorland tracks, and long stretches of pale sand. Some days are exposed to wind and rain, and your guide will adjust routes for the conditions. Between walks there is time for a weaver's shed or the standing stones at Callanish.

## Day by day

- **Day 1: Inverness to Skye.** Meet your guide and drive west, about three hours, to Portree.
- **Day 2: Neist Point.** A cliff-top walk to the lighthouse on Skye's western tip.
- **Day 3: The Quiraing.** A loop through the rock towers and old landslips of the Trotternish ridge.
- **Day 4: Ferry to Harris.** Cross from Uig to Tarbert, with an afternoon on the sands at Luskentyre.
- **Day 5: Eilean Glas.** Cross the bridge to Scalpay and walk over the island to its lighthouse.
- **Day 6: Harris at your own pace.** Visit a weaver, walk a beach, or rest.
- **Day 7: North to Lewis.** The standing stones at Callanish and a restored village of thatched blackhouses.
- **Day 8: Butt of Lewis.** A cliff walk to the lighthouse at the island's northern tip.
- **Day 9: Back to the mainland.** The ferry from Stornoway to Ullapool, and a farewell dinner by the harbor.
- **Day 10: Departure.** Transfer to Inverness.

## Good to know

Ferry crossings depend on the weather, and the order of days may change. Pack full waterproofs and expect at least one day of strong wind. The machair, the low coastal grassland behind the beaches, is in flower from June.`),
  images: [s.img(11), s.img(10)],
  price: 5450, priceLabel: "From $5,450 per person (illustrative)", badge: "New for 2027",
  specs: [
    "Duration: 10 days", "Group size: Up to 12", "Pace: Moderate", "Season: May to September",
    "Daily walking: 3 to 5 hours", "Starts: Inverness", "Ends: Inverness",
  ],
  features: [
    "9 nights in small hotels and guesthouses", "Breakfast daily and 7 dinners", "Local lead guide throughout",
    "Ferry crossings to Harris and back from Lewis", "Luggage moved between stays",
    "Visit to a working weaver on Harris",
  ],
  finePrint: FINE_PRINT,
  seoTitle: "Hebridean lighthouse walks | Tidewater Journeys",
  seoDescription: "A 10-day small-group walking trip on Skye, Harris, and Lewis, from Neist Point to the Butt of Lewis. Groups of 12 or fewer. Prices are illustrative.",
});

// ---------- Collections: three destinations ----------

const portugal = s.collection("coastal-portugal", {
  name: "Coastal Portugal", slug: "coastal-portugal", collectionType: "destination", eyebrow: "Portugal",
  summary: "Cliff paths and fishing villages on the Alentejo coast, and the terraced vineyards of the Douro valley, with long lunches built into most days.",
  description: md(`## Two sides of Portugal

Our Portugal trips cover two very different landscapes. On the southwest coast, cliff paths run between fishing villages above coves where the Atlantic swell rolls in. About two hours inland from Porto, the Douro valley is all stone terraces and slow river bends, and the September harvest sets the rhythm of every village.

Both trips start and end in a city with good flight connections, and both are built around food: grilled fish and clams on the coast, slow-cooked dishes and estate wines in the valley. Lunch is often the main meal of the day, and it is rarely hurried.

## When to go

Spring and early autumn suit the coast best, when the walking is cool and the villages are quiet. The Douro is green from May and busiest at harvest. We do not run either trip in July or August.

## Who these trips suit

Choose the Alentejo coast if you enjoy a full day on foot with the sea beside you. Choose the Douro if you would rather walk for a morning and spend the afternoon at the table.`),
  image: s.img(1),
  items: [alentejo, douro],
  seoTitle: "Coastal Portugal trips | Tidewater Journeys",
  seoDescription: "Small-group trips on Portugal's Alentejo coast and in the Douro valley, with local guides and groups of 12 or fewer. Prices are illustrative.",
});

const norway = s.collection("norwegian-fjords", {
  name: "Norwegian Fjords", slug: "norwegian-fjords", collectionType: "destination", eyebrow: "Norway",
  summary: "Local ferries between the villages of the western fjords, and the fishing islands of Lofoten under the long light of June and July.",
  description: md(`## Two Norways, both shaped by water

Our Norway trips follow the water. In the west, the Sognefjord and Hardangerfjord cut deep into the mountains, and villages sit on narrow strips of flat land between steep slopes and the shore. Local ferries and express boats connect them, and they are often the easiest way to travel.

Far to the north, above the Arctic Circle, the Lofoten islands rise straight out of the sea. Fishing villages cling to the rocks, the light barely fades in early summer, and the walking is steeper and more exposed.

Both trips stay in small family hotels and traditional fishermen's cabins, with several nights in each main base. Expect fresh fish, brown goat cheese, cinnamon buns, and very good coffee.

## When to go

We run the fjords trip from May to September, and Lofoten from June to August, when the high paths are usually clear of snow. Midsummer brings the longest days. Late August is quieter, with cooler air and the first hints of autumn.

## Who these trips suit

Choose the fjord villages if you like to travel by boat with short walks ashore. Choose Lofoten if you want bigger walking days in a dramatic setting.`),
  image: s.img(6),
  items: [fjords, lofoten],
  seoTitle: "Norwegian fjords trips | Tidewater Journeys",
  seoDescription: "Small-group trips through Norway's western fjords by local boat, and walking in the Lofoten islands. Groups of 12 or fewer. Prices are illustrative.",
});

const scotland = s.collection("scottish-highlands", {
  name: "Scottish Highlands", slug: "scottish-highlands", collectionType: "destination", eyebrow: "Scotland",
  summary: "Glens and old drove roads on the mainland, then island ferries out to the lighthouses and long beaches of Skye, Harris, and Lewis.",
  description: md(`## Glens and islands

Our Scotland trips begin in the glens of the western Highlands and end on the far edge of the Hebrides. On the mainland, paths follow rivers and old drove roads through Glen Coe, Glen Nevis, Glen Affric, and the pinewoods of the Cairngorms. Out on the islands, the walking opens up across headland and machair to lighthouses facing the Atlantic.

The weather here is part of the experience. A single day can start under low cloud and turn bright by lunch. Our guides plan around it, and the light on the hills after rain is worth the wait.

Evenings are spent in small hotels, country inns, and island guesthouses, many with a fire in the bar and local seafood on the menu.

## When to go

Both trips run from May to September. Late May and June have the longest days. September is quieter, with autumn color on the hills.

## Who these trips suit

Choose Highlands and glens for steady hill walking with a new glen every few days. Choose the Hebridean lighthouse walks for open coast, island ferries, and long days by the sea.`),
  image: s.img(10),
  items: [highlands, hebrides],
  seoTitle: "Scottish Highlands trips | Tidewater Journeys",
  seoDescription: "Small-group walking trips in the Scottish Highlands and the Hebrides, with local guides and groups of 12 or fewer. Prices are illustrative.",
});

// ---------- Blocks: home ----------

const homeHero = s.hero("home", {
  internalName: "Tidewater Journeys - Home - Hero", eyebrow: "2027 departures now open",
  headline: "Slow journeys along Europe's Atlantic edge",
  subheadline: "Small-group and private trips in Portugal, Norway, and Scotland, led by local guides, with never more than 12 travelers.",
  image: s.img(12), layout: "full_bleed", cta: exploreDestinations, secondaryCta: planPrivate,
});
const homeDestinations = s.cardGrid("home-destinations", {
  internalName: "Tidewater Journeys - Home - Destinations grid", heading: "Where we travel",
  intro: "Three regions, two trips in each, and lead guides who live there year-round.",
  source: "manual", items: [portugal, norway, scotland], layout: "cards", columns: 3,
});
const homeDay = s.mediaText("home-typical-day", {
  internalName: "Tidewater Journeys - Home - A typical day", eyebrow: "A typical day",
  heading: "Mornings on the trail, afternoons left open",
  body: "Most days begin with a guided walk of two to five hours, or a boat crossing to the next village, timed around the tides and the ferry timetable. Lunch is often the long meal of the day, perhaps grilled fish on a harbor wall in the Alentejo or soup and fresh bread in a Hebridean cafe.\n\nAfternoons are usually yours. Some travelers head for the market or the village museum. Others find a bench with a view and stay there until dinner.",
  image: s.img(15), imagePosition: "left",
});
const homeHowWeTravel = s.cardGrid("home-how-we-travel", {
  internalName: "Tidewater Journeys - Home - How we travel", heading: "How we travel",
  intro: "The same approach shapes every departure, whether you join a small group or travel privately.",
  source: "manual", layout: "icons", columns: 3,
  items: [
    s.item("how-group-size", {
      title: "Groups of 12 or fewer",
      text: "Every small-group departure is capped at 12 travelers. That size fits a family-run guesthouse, a local ferry, and a single long table at dinner.",
    }),
    s.item("how-local-guides", {
      title: "Guides who live locally",
      text: "Each trip is led by a guide from the region who works with us season after season. They know the ferry timetables, the paths that flood after rain, and the people worth meeting.",
    }),
    s.item("how-pace", {
      title: "An unhurried pace",
      text: "We stay two or three nights in most places, so you are not packing a bag every morning. Most days include free time, and walks rarely start before 9 a.m.",
    }),
  ],
});
const homeQuote = s.testimonial("home-ruth-ellingham", {
  internalName: "Tidewater Journeys - Home - Testimonial",
  quote: "We had one afternoon in Balestrand with nothing planned, and it became the part of the trip we still talk about. Our guide seemed to know everyone on the ferry. By the third night the twelve of us were sharing tables at dinner without anyone arranging it.",
  person: ruth, rating: 5,
});

// ---------- Blocks: destinations template ----------

const destinationsHero = s.hero("destinations", {
  internalName: "Tidewater Journeys - Destinations - Hero", eyebrow: "Destinations",
  headline: "Three regions we know season by season",
  subheadline: "The Portuguese coast and Douro valley, the fjords and Arctic islands of Norway, and the Scottish Highlands and isles.",
  image: s.img(8), layout: "split", cta: seeTrips,
});
const destinationsGrid = s.cardGrid("destinations-all", {
  internalName: "Tidewater Journeys - Destinations - Region grid", heading: "Choose a region",
  intro: "Each region offers two trips at different paces. Open a destination to see both, with seasons, illustrative prices, and what each day involves.",
  source: "manual", items: [portugal, norway, scotland], layout: "cards", columns: 3,
});
const travelingWithUs = s.richText("destination-traveling-with-us", {
  internalName: "Tidewater Journeys - Destination detail - Traveling with Tidewater", heading: "Traveling with Tidewater",
  body: md(`Every destination follows the same approach, whichever trip you choose.

- **Small groups.** Departures are capped at 12 travelers, plus a lead guide.
- **Local guides.** Each region has a small team of guides who live there and lead the same routes each season.
- **Two or three nights per stay.** Fewer hotel changes means more time in each village.
- **Luggage moved for you.** Your main bag goes ahead by road while you walk or sail.
- **Meals with a sense of place.** Most dinners are included, at family restaurants and with producers we have known for years.

Prices and itineraries shown are illustrative. Each trip page lists the season, the pace, and what is included.`),
});

// ---------- Blocks: trips template ----------

const tripsHero = s.hero("trips", {
  internalName: "Tidewater Journeys - Trips - Hero", eyebrow: "Trips for 2027",
  headline: "Six trips, each capped at 12 travelers",
  subheadline: "Trips of eight to ten days, led by local guides, with two or three nights in most places and time to yourself most afternoons.",
  image: s.img(14), layout: "split", cta: requestBooking,
});
const tripsGrid = s.cardGrid("trips-all", {
  internalName: "Tidewater Journeys - Trips - All trips grid", heading: "All trips",
  intro: "Prices are per person, based on two sharing, and are illustrative.",
  source: "manual", items: [alentejo, douro, fjords, lofoten, highlands, hebrides], layout: "products", columns: 3,
});
const paceGuide = s.richText("trips-pace-guide", {
  internalName: "Tidewater Journeys - Trips - Pace guide", heading: "How we grade pace",
  body: md(`Each trip lists a pace for a typical day, not the hardest one.

| Pace | Typical walking | Ground underfoot |
|---|---|---|
| Easy | 2 to 3 hours on most days | Good paths and village lanes, short climbs |
| Easy to moderate | 2 to 3 hours, with longer optional hikes | Shore paths and farm roads, some short steep climbs |
| Moderate | 3 to 5 hours on most days | Uneven coastal and hill paths, some steady climbs |
| Moderate to active | 4 to 6 hours on most days | Steep, rocky, or exposed ground, with a few long climbs |

If you are unsure which suits you, tell us about the walking you do now when you send a booking request.`),
});
const tripFaq = s.faq("trip-before-you-book", {
  internalName: "Tidewater Journeys - Trip detail - Before you book FAQ", heading: "Before you book",
  items: [
    s.item("faq-group-size", {
      title: "How many people travel on each departure?",
      text: "Every small-group departure is capped at 12 travelers, plus a local lead guide. Most departures run with 8 to 12. If a departure has not reached 6 travelers 60 days before it starts, we will contact you to talk through other dates or options.",
    }),
    s.item("faq-fitness", {
      title: "How fit do I need to be?",
      text: "Each trip lists its pace and typical daily walking time. Easy trips involve two to three hours on good paths. The fjord villages trip is mostly by boat, with some steep shorter walks and optional longer hikes. Moderate trips involve three to five hours on uneven ground with some climbs. Lofoten, graded moderate to active, has longer days on steep, rocky paths. If you are unsure, tell us about the walking you do now and we will help you choose.",
    }),
    s.item("faq-included", {
      title: "What is included in the price?",
      text: "Accommodation, breakfast every day, most dinners, your local lead guide, planned transport and boat crossings during the trip, luggage moves, and the visits listed on the trip page. International flights, travel insurance, most lunches, drinks with meals, and personal spending are not included.",
    }),
    s.item("faq-changes", {
      title: "Can I change or cancel a booking?",
      text: "You can move to another departure of the same trip up to 60 days before travel, subject to space. Cancellation terms depend on how close to departure you cancel, and are set out in full before you pay a deposit. We recommend travel insurance that covers cancellation.",
    }),
    s.item("faq-solo", {
      title: "Can I travel on my own?",
      text: "Yes. Many of our travelers come alone. Each departure has a few single rooms, and if you would like to share a room instead, we will try to pair you with another solo traveler who has asked to share.",
    }),
  ],
});

// ---------- Blocks: request a booking ----------

const bookingHero = s.hero("request-a-booking", {
  internalName: "Tidewater Journeys - Request a booking - Hero", eyebrow: "Request a booking",
  headline: "Tell us which trip and when you would like to go",
  subheadline: "There is no payment at this stage. A trip planner checks availability and replies with a provisional hold on your places.",
  image: s.img(16), layout: "split",
});
const bookingForm = s.form("request-a-booking", {
  internalName: "Tidewater Journeys - Request a booking - Form", formKind: "request_booking",
  heading: "Your booking request",
  intro: "Choose a trip and your preferred month, and tell us how many are traveling. If you came from a trip page, that trip is already selected.",
  submitLabel: "Send booking request",
  successHeading: "Thank you, your request is in",
  successMessage: "On a live site, a trip planner would check availability for your dates and reply within two working days with a provisional hold. This is a demo, so nothing was sent and no one will contact you.",
  privacyNote: "This is a demo form. Nothing you enter is sent or stored.",
  prefillSample: true,
});

// ---------- Blocks: private journeys ----------

const privateHero = s.hero("private-journeys", {
  internalName: "Tidewater Journeys - Private journeys - Hero", eyebrow: "Private journeys",
  headline: "Our routes, on your dates, with your own group",
  subheadline: "Private trips for 2 to 10 travelers, with the same guides, boats, and guesthouses we use on small-group departures.",
  image: s.img(13), layout: "split", cta: requestBooking,
});
const privateHow = s.richText("private-how-it-works", {
  internalName: "Tidewater Journeys - Private journeys - How it works", heading: "How a private journey comes together",
  body: md(`Most private journeys start from one of our six routes and change from there. Some travelers want an extra night in a village they loved on an earlier trip. Others want shorter walking days for a parent, or a full day with a winemaker instead of a boat trip.

1. **Tell us the basics.** Who is traveling, roughly when, and which region interests you.
2. **Get a first outline.** A trip planner who knows the region sends a day-by-day draft with an illustrative price.
3. **Shape it together.** Adjust the pace, the stays, and the free days until the plan fits.
4. **Confirm and travel.** Your guide meets you on the first morning and stays with you throughout.

Private journeys run from April to October, depending on the region. Prices and itineraries are illustrative.`),
});
const privateExample = s.mediaText("private-douro-example", {
  internalName: "Tidewater Journeys - Private journeys - Douro example", eyebrow: "From last season",
  heading: "Four generations in the Douro valley",
  body: "Last September, a family of seven aged 9 to 81 spent eight days in the Douro valley during the harvest. We swapped the longer vineyard walks for a morning picking grapes at a family quinta, added a rest day in Pinhão, and moved dinner earlier so the youngest could stay up for it.\n\nTheir guide had led our Douro trips for six seasons and knew which terraces fell into shade by mid-afternoon.",
  image: s.img(5), imagePosition: "right",
});
const privateQuote = s.testimonial("private-graham-pettigrew", {
  internalName: "Tidewater Journeys - Private journeys - Testimonial",
  quote: "We asked for a gentler version of the Highlands trip so my parents could come, and that is what we got. Shorter walks, an extra night in Glen Affric, and a guide who never once made anyone feel they were holding things up.",
  person: graham, rating: 5,
});

// ---------- Blocks: travel notes ----------

const notesHero = s.hero("travel-notes", {
  internalName: "Tidewater Journeys - Travel notes - Hero", eyebrow: "Travel notes",
  headline: "Practical notes from our guides and planners",
  subheadline: "Advice on what to pack and how to choose a trip that suits the way you like to travel.",
  layout: "text_only",
});
const notesLatest = s.cardGrid("travel-notes-latest", {
  internalName: "Tidewater Journeys - Travel notes - Latest notes", heading: "Latest notes",
  source: "latest_articles", layout: "cards", limit: 6, columns: 3,
});

// ---------- Pages: funnel steps 1 to 4 ----------

const home = s.page("home", {
  title: "Tidewater Journeys", slug: "home", pageType: "home", funnelStep: 1, nextStep: s.ref("page", "destinations"),
  hero: homeHero, primaryCta: exploreDestinations,
  sections: [homeDestinations, homeDay, homeHowWeTravel, homeQuote, homeBand],
  seoTitle: "Tidewater Journeys | Small-group and private trips",
  seoDescription: "Small-group and private trips to coastal Portugal, the Norwegian fjords, and the Scottish Highlands, with local guides and 12 travelers or fewer.",
});
const destinations = s.page("destinations", {
  title: "Destinations", slug: "destinations", pageType: "collection_detail", funnelStep: 2, nextStep: s.ref("page", "trips"),
  hero: destinationsHero, primaryCta: seeTrips,
  sections: [destinationsGrid, destinationsPrivateBand],
  detailSections: [travelingWithUs, destinationDetailBand],
  seoTitle: "Destinations | Tidewater Journeys",
  seoDescription: "Small-group trips to coastal Portugal, the Norwegian fjords, and the Scottish Highlands. Two trips per region, with local guides and groups of 12 or fewer.",
});
const trips = s.page("trips", {
  title: "Trips", slug: "trips", pageType: "offering_detail", funnelStep: 3, nextStep: goalPage,
  hero: tripsHero, primaryCta: requestThisTrip,
  sections: [tripsGrid, paceGuide, tripsIndexBand],
  detailSections: [tripFaq, tripDetailBand],
  seoTitle: "Small-group trips for 2027 | Tidewater Journeys",
  seoDescription: "Six small-group trips in Portugal, Norway, and Scotland, from 8 to 10 days, with local guides and groups of 12 or fewer. Prices are illustrative.",
});
s.page("request-a-booking", {
  title: "Request a booking", slug: "request-a-booking", pageType: "goal", funnelStep: 4,
  hero: bookingHero, sections: [bookingForm],
  seoTitle: "Request a booking | Tidewater Journeys",
  seoDescription: "Choose a trip and a preferred departure month. A trip planner confirms availability before any deposit is taken.",
});

// ---------- Pages: off-funnel ----------

const privateJourneys = s.page("private-journeys", {
  title: "Private journeys", slug: "private-journeys", pageType: "standard", funnelStep: 0,
  hero: privateHero, primaryCta: requestBooking,
  sections: [privateHow, privateExample, privateQuote, privateBand],
  seoTitle: "Private journeys | Tidewater Journeys",
  seoDescription: "Private trips for 2 to 10 travelers in Portugal, Norway, and Scotland, built on our small-group routes and planned around your dates and pace.",
});
const travelNotes = s.page("travel-notes", {
  title: "Travel notes", slug: "travel-notes", pageType: "article_index", funnelStep: 0,
  hero: notesHero, sections: [notesLatest],
  seoTitle: "Travel notes | Tidewater Journeys",
  seoDescription: "Packing advice and pace guides from Tidewater Journeys guides and trip planners in Portugal, Norway, and Scotland.",
});

// ---------- Articles ----------

s.article("packing-for-changeable-coastal-weather", {
  title: "Packing for changeable coastal weather", slug: "packing-for-changeable-coastal-weather",
  summary: "On the Atlantic edge, one walking day can bring warm sun and a cold squall an hour apart. Here is what our guides pack, and what they leave at home.",
  body: md(`## Why the forecast is only a starting point

On the coasts we travel, weather arrives from the sea and changes quickly. In the Hebrides, a morning that starts in bright sun can turn to driving rain before lunch and clear again by mid-afternoon. On the Alentejo coast, a cool sea fog often sits over the cliffs until late morning, then burns off into real heat. In Lofoten, June light lasts all night, but the wind off the Vestfjord can make a summer day feel like early spring.

Our guides check the forecast every evening and adjust the walk when they need to. What they cannot change is what is in your daypack, so this is the list we send every traveler.

## Layers, not one heavy coat

The aim is to add or remove warmth in small steps while you keep walking. A single heavy jacket is either too warm on the climb or not warm enough at the top.

- **A base layer** in merino wool or a synthetic fabric. Avoid cotton, which stays damp and cold.
- **A light fleece or wool midlayer** that you can take off on climbs.
- **A packable insulated jacket** for lunch stops and boat crossings, when you sit still in the wind.
- **A waterproof shell with a hood.** This matters more than anything else on the list. Look for taped seams and a hood that turns with your head.
- **Waterproof overtrousers** for Scotland and Norway. In Portugal, quick-drying walking trousers are usually enough.

## Feet first

Most discomfort on a walking trip starts at the feet. Bring footwear you have already worn on at least three or four long walks before the trip.

For the Highlands, the Hebrides, and Lofoten, waterproof walking boots with ankle support suit the boggy ground and wet rock. On the Alentejo coast, where much of the path is soft sand and packed earth, many travelers prefer trail shoes, which drain and dry faster. Pack a fresh pair of walking socks for every day or two, and light shoes for the evenings.

## The small things that make a long day easier

- A daypack of 20 to 25 liters with a rain cover, or a dry bag inside it
- A sun hat and sunscreen for bright days on open headlands
- A neck tube or thin scarf for the wind on ferry decks
- Light gloves, which take up almost no room and help on exposed ground
- A refillable water bottle
- A small towel for planned beach days, and for the ones that were not planned

## What to leave at home

Leave the full-size umbrella, since coastal wind turns it inside out within minutes. Leave the second heavy sweater too: a fleece under your shell does the same job and packs smaller. Most of our stays have laundry facilities or a service nearby, so a week of clothes will cover a ten-day trip.

## Packing by region

**Scotland.** Midges are common in still, damp weather from June to August, especially in the glens. A head net weighs almost nothing and fits in a pocket. Temperatures can swing widely in a single day, so keep every layer with you.

**Norway.** Fjord villages can feel warm and sheltered while the open water stays cold. Keep your insulated jacket within reach for every boat crossing, even on a bright day.

**Portugal.** Mornings on the coast can be cool and grey, and afternoons hot and bright. Pack sun protection and carry more water than you expect to need.

## A final check

Before you close your bag, put on everything you plan to walk in and go out for an hour. If something rubs, pinches, or leaks, you still have time to replace it. Your guide will talk through the conditions each morning, but a well-packed bag means you can enjoy the change in the weather instead of waiting for it to pass.`),
  heroImage: s.img(9), author: moira, publishDate: "2026-08-18",
  topics: ["packing", "weather", "walking"], relatedPage: scotland, cta: articleTripsCta,
  seoTitle: "Packing for changeable coastal weather | Tidewater Journeys",
  seoDescription: "What our guides pack for walking days on the Atlantic coasts of Scotland, Norway, and Portugal, and what they leave at home.",
});

s.article("choosing-the-right-trip-pace", {
  title: "How to choose the right pace for your trip", slug: "choosing-the-right-trip-pace",
  summary: "Every trip carries one of four pace grades. Here is what each grade means on the ground, and a few questions to help you choose the right one.",
  body: md(`## What a pace grade tells you

Every trip page lists a pace. It describes a typical day, not the hardest one, and it covers more than distance. The ground underfoot, the hours on your feet, the climbing, and how often you change hotels all shape how a trip feels by the fifth day.

We use four grades across our six trips.

| Pace | Typical walking | Ground underfoot |
|---|---|---|
| Easy | 2 to 3 hours on most days | Good paths and village lanes, short climbs |
| Easy to moderate | 2 to 3 hours, with longer optional hikes | Shore paths and farm roads, some short steep climbs |
| Moderate | 3 to 5 hours on most days | Uneven coastal and hill paths, some steady climbs |
| Moderate to active | 4 to 6 hours on most days | Steep, rocky, or exposed ground, with a few long climbs |

## Easy: more time looking than walking

The Douro valley trip is our gentlest. Walks follow vineyard tracks and old stone paths between quintas, usually for two or three hours, with a long lunch at the end. River days and a train journey up the valley break up the week. Easy does not mean no effort: the terraces are steep in places, and September afternoons can be hot. But you will rarely be on your feet for more than half a day.

The Norwegian fjord villages trip sits between easy and moderate. Most travel is by boat, with short walks in each village and one or two longer optional hikes.

## Moderate: a proper walk most days

The Alentejo coast, Highlands and glens, and Hebridean lighthouse trips are moderate. Expect three to five hours of walking on most days, often on uneven ground. On the Portuguese coast, soft sand makes an easy-looking stretch harder than it seems. In Scotland, paths can be wet and rocky, with steady climbs out of the glens and long exposed stretches on the island headlands.

If you walk regularly at home and enjoy a full day outdoors, a moderate trip usually feels comfortable. If most of your walking is on sidewalks, a few longer weekend walks on hilly ground before you travel will make the first days easier.

## Moderate to active: longer days and steeper ground

Lofoten has our longest walking days. Some climbs are short but steep, and a few paths cross rough, exposed ground where the weather can change quickly. Your guide may shorten or swap a route on the day, depending on the conditions, and there is a free day before the end of the trip.

## Questions to ask yourself

Before you choose, think about the last few times you walked for more than two hours.

- How did you feel the next morning?
- Did hills or uneven ground slow you down more than distance did?
- Do you prefer to finish walking by lunch, or to spend the whole day outside?
- Would you rather have a rest day midweek, or keep moving?

There are no wrong answers. A trip that suits your pace is one where you arrive at lunch with the energy to look around, rather than counting the steps back to the van.

## Pace is about more than walking

Two travelers on the same trip can have very different days. Some join every optional walk, while others spend the free afternoon in a cafe by the harbor. Our guides plan shorter options where the ground allows, and most of our stays last two or three nights, so you are not repacking every morning.

## Still unsure?

Send us a short note about the walking you do now and the kind of days you enjoy. A trip planner who has walked the route can tell you plainly whether a trip is likely to feel right, and suggest another if it is not.`),
  heroImage: s.img(4), author: ines, publishDate: "2026-09-22",
  topics: ["pace", "trip planning", "walking"], relatedPage: douro, cta: articleBookingCta,
  seoTitle: "How to choose the right trip pace | Tidewater Journeys",
  seoDescription: "What our four pace grades mean on the ground, with questions to help you choose a trip that suits the way you walk.",
});

// ---------- Brand ----------

const navDestinations = s.item("nav-destinations", { title: "Destinations", link: destinations });
const navPrivate = s.item("nav-private-journeys", { title: "Private Journeys", link: privateJourneys });
const navNotes = s.item("nav-travel-notes", { title: "Travel Notes", link: travelNotes });

s.brand({
  name: "Tidewater Journeys", slug: "tidewater-journeys", vertical: "travel",
  shortDescription: "Curated small-group and private trips.",
  tagline: "Small groups. Long memories.",
  logo: s.logo, favicon: s.favicon,
  colorBrand: "#0B3B4F", colorButton: "#B85A33", colorButtonText: "#FFFFFF", colorAccent: "#C9B79C",
  colorBackground: "#F6F3EE", colorSurface: "#FFFFFF", colorText: "#1E2A30", colorMuted: "#5F6B70",
  fontHeading: "Playfair Display", fontBody: "Lato", buttonRadius: 4, buttonTextCase: "normal",
  voiceDescription: "Sensory but grounded, knowledgeable, unhurried. We describe places through specific detail, like the morning ferry or the climb before lunch, and always give the practical facts: group size, pace, and what each day involves.",
  voiceDos: [
    "Give group sizes, pace, and specific detail.",
    "Describe places through concrete sights, sounds, and food.",
    "Label prices and itineraries as illustrative.",
    "Use sentence case and plain American English.",
  ],
  voiceDonts: [
    "Use cliches like \"hidden gem\" or \"bucket list\".",
    "Make safety guarantees or promise good weather.",
    "Quote real prices.",
    "Push urgency, countdowns, or scarcity.",
  ],
  photoDirection: "Coastlines, small boats, villages, hiking groups seen from behind, food markets. No commercial branding.",
  navigation: [navDestinations, navPrivate, navNotes],
  headerCta: requestBooking,
  footerLinks: [
    navDestinations,
    s.item("footer-coastal-portugal", { title: "Coastal Portugal", link: portugal }),
    s.item("footer-norwegian-fjords", { title: "Norwegian Fjords", link: norway }),
    s.item("footer-scottish-highlands", { title: "Scottish Highlands", link: scotland }),
    s.item("footer-all-trips", { title: "All trips", link: trips }),
    navPrivate,
    navNotes,
    s.item("footer-request-a-booking", { title: "Request a booking", link: s.ref("page", "request-a-booking") }),
  ],
  promoBarText: "Small groups of 12 or fewer on every departure.",
  address: "9 Quayside Walk\nSaltmarsh Harbor, SC 29999",
  phone: "(843) 555-0175",
  legalDisclaimer: "Fictional company. Sample content for illustration only. Prices and itineraries are illustrative.",
  homePage: home,
});

export default s.entries;
