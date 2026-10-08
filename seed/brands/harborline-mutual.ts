/**
 * Harborline Mutual: auto, home, and life insurance for families.
 * Funnel: home (1) -> coverage/{coverage} (2) -> start-a-quote (3) -> get-a-quote (4).
 * Off-funnel: learn (article index).
 */
import { defineBrand, md } from "../lib/builders";

const s = defineBrand("harborline-mutual", "hm");

// ---------- People ----------
const theo = s.person("theo-lindqvist", {
  name: "Theo Lindqvist", slug: "theo-lindqvist", role: "author", jobTitle: "Auto and home underwriting lead",
  bio: "Theo has reviewed auto and home policies at Harborline Mutual for more than a decade. He writes about deductibles, coverage limits, and the questions he hears most often from families comparing their options.",
});
const clara = s.person("clara-benning", {
  name: "Clara Benning", slug: "clara-benning", role: "author", jobTitle: "Customer education editor",
  bio: "Clara edits Harborline's guides and checklists. Before joining the Learn team, she spent eight years answering policy questions in the Port Mercer office, which is still where most of her article ideas come from.",
});
const elena = s.person("elena-marsh", {
  name: "Elena Marsh", slug: "elena-marsh", role: "customer", jobTitle: "Auto and home customer, Port Mercer",
  photo: s.img(15),
});

// ---------- Offerings (rendered by the coverage template) ----------
const FINE_PRINT = "Coverage descriptions are illustrative and are not offers of insurance.";

const auto = s.offering("auto-insurance", {
  name: "Auto insurance", slug: "auto-insurance", offeringType: "insurance_coverage",
  summary: "Coverage for the cars your household drives, from liability and collision to roadside help, with every term explained.",
  description: md(`## What it covers

Auto insurance pays for damage and injuries tied to the cars your household drives. A Harborline auto policy is built from a few parts you choose:

- **Liability** pays for injuries and property damage you cause to others. Most states require a minimum amount.
- **Collision** pays to repair your car after it hits another vehicle or object, minus your deductible.
- **Comprehensive** covers theft, hail, fire, falling branches, and animal strikes.
- **Uninsured and underinsured motorist** coverage helps when the other driver has little or no insurance.

## Common add-ons

Families often add roadside assistance for flat tires and jump starts, and rental reimbursement while a car is in the shop. If your car is financed or leased, gap coverage pays the difference between what you still owe and what the car is worth if it is totaled.

## How to choose

Start with liability. It is the part that protects you if you cause a serious accident, so many families choose limits above the state minimum. Next, decide whether collision and comprehensive make sense for each car. For an older car with a low value, the premium may be close to what the policy would ever pay out.

Then pick deductibles you could pay on short notice. You can set collision and comprehensive separately, and comparing a quote at more than one deductible level shows how each choice changes the premium.`),
  images: [s.img(4), s.img(11)],
  features: [
    "Liability, collision, and comprehensive coverage",
    "Uninsured and underinsured motorist coverage",
    "Separate deductibles for collision and comprehensive",
    "Add teen drivers and extra vehicles to one policy",
    "Optional roadside assistance and rental reimbursement",
    "Claims line answered by people, day or night",
  ],
  specs: [
    "Policy terms: 6 or 12 months",
    "Deductible options: $250 to $2,000 (illustrative)",
    "Drivers per policy: Up to 6",
    "Vehicles per policy: Up to 5",
    "Payment options: Monthly or paid in full",
    "Claims line: 24 hours a day, 7 days a week",
  ],
  finePrint: `${FINE_PRINT} Coverage, limits, and deductibles would vary by policy and by state.`,
  seoTitle: "Auto insurance for families | Harborline Mutual",
  seoDescription: "Liability, collision, comprehensive, and common add-ons, explained in plain language. Coverage details are illustrative and not offers of insurance.",
});

const home = s.offering("home-insurance", {
  name: "Home insurance", slug: "home-insurance", offeringType: "insurance_coverage",
  summary: "Protection for the house, the things inside it, and your family if someone is hurt on your property.",
  description: md(`## What it covers

Home insurance protects the house itself, the belongings inside it, and you, if someone is injured on your property. A typical Harborline home policy includes:

- **Dwelling** coverage for the structure, including the roof, walls, and built-in systems.
- **Other structures** such as a detached garage, shed, or fence.
- **Personal property** for furniture, clothing, electronics, and other belongings.
- **Loss of use**, which helps with hotel and meal costs if a covered loss makes the home unlivable for a while.
- **Personal liability** if someone is hurt on your property or you accidentally damage someone else's.

## Common add-ons

Add-ons to a home policy are called endorsements. Families often ask about water backup coverage for a failed sump pump or sewer line, scheduled coverage for jewelry or instruments worth more than your standard limits, and extended replacement cost, which adds a cushion if rebuilding costs more than expected. Standard home policies usually exclude flood damage, so ask about separate flood coverage if you live near the water.

## How to choose

Set dwelling coverage to what it would cost to rebuild your home, which is often different from its market value. Choose replacement cost for personal property if you want belongings covered at the price of new items rather than their depreciated value. Then pick a deductible you could pay without strain, and check whether the policy has a separate wind or storm deductible.`),
  images: [s.img(3), s.img(2)],
  features: [
    "Dwelling, other structures, and personal property coverage",
    "Personal liability for injuries on your property",
    "Loss of use coverage if you need to stay elsewhere",
    "Replacement cost option for your belongings",
    "Water backup and scheduled valuables endorsements",
    "Guidance on separate flood coverage near the water",
  ],
  specs: [
    "Policy terms: 12 months",
    "Home types: Single-family, townhouse, or condo",
    "Deductible options: $500 to $5,000 (illustrative)",
    "Wind deductible: Flat amount or 1% to 5% of dwelling (illustrative)",
    "Personal property: Replacement cost or actual cash value",
    "Payment options: Monthly, annually, or through mortgage escrow",
  ],
  finePrint: `${FINE_PRINT} Coverage, limits, exclusions, and deductibles would vary by policy and by state.`,
  seoTitle: "Home insurance for families | Harborline Mutual",
  seoDescription: "What home insurance covers, the endorsements families ask about, and how to set dwelling coverage. Illustrative descriptions, not offers of insurance.",
});

const life = s.offering("life-insurance", {
  name: "Life insurance", slug: "life-insurance", offeringType: "insurance_coverage",
  summary: "Term and whole life coverage that can help the people who depend on you cover a mortgage and everyday costs.",
  description: md(`## What it covers

Life insurance pays a set amount, called the death benefit, to the people you name as beneficiaries if you die while the policy is in force. Families often use it to help cover a mortgage, childcare, everyday household costs, or future education.

Harborline offers two kinds of coverage:

- **Term life** covers you for a set period, such as 10, 20, or 30 years. It is often the simplest way to cover the years when others depend on your income.
- **Whole life** covers you for your lifetime as long as premiums are paid, and builds cash value, a savings component you may be able to borrow against.

## Common add-ons

Add-ons to a life policy are called riders. Families often ask about a child rider, which adds a small amount of coverage for each child, a waiver of premium rider, which pauses premiums if you become unable to work because of a covered disability, and a conversion option, which lets you switch term coverage to whole life later without starting over.

## How to choose

Start by listing what you would want the coverage to handle: the remaining mortgage, a number of years of household expenses, childcare, and any education goals. Many families choose a term length that runs until their youngest child is grown or the mortgage is paid off.

Name a primary beneficiary and a contingent beneficiary, the backup if the first is not living. Review both after a marriage, a birth, or a move.`),
  images: [s.img(9), s.img(14)],
  features: [
    "Term coverage for 10, 20, or 30 years",
    "Whole life coverage that builds cash value",
    "Name one or more beneficiaries and update them as life changes",
    "Child, waiver of premium, and conversion riders",
    "Premiums that stay level for the length of the term",
  ],
  specs: [
    "Policy types: Term and whole life",
    "Term lengths: 10, 20, or 30 years",
    "Coverage amounts: $100,000 to $2,000,000 (illustrative)",
    "Beneficiaries: One or more, with a primary and a contingent",
    "Payment options: Monthly or annually",
  ],
  finePrint: `${FINE_PRINT} Life coverage would be subject to an application and an underwriting review.`,
  seoTitle: "Term and whole life insurance | Harborline Mutual",
  seoDescription: "How term and whole life insurance work, which riders families ask about, and how to choose a term length. Illustrative, not an offer of insurance.",
});

// ---------- CTAs ----------
const getQuote = s.cta("get-quote", {
  internalName: "Harborline Mutual - Global - Get a quote", label: "Get a quote", goalType: "get_quote",
  destinationPage: s.ref("page", "get-a-quote"), style: "primary",
});
const exploreCoverage = s.cta("explore-coverage", {
  internalName: "Harborline Mutual - Home - Explore coverage", label: "Explore coverage", goalType: "link",
  destinationPage: s.ref("page", "coverage"), style: "secondary",
});
const readGuides = s.cta("read-guides", {
  internalName: "Harborline Mutual - Home - Read our guides", label: "Read our guides", goalType: "link",
  destinationPage: s.ref("page", "learn"), style: "secondary",
});
const homeBand = s.cta("home-quote-band", {
  internalName: "Harborline Mutual - Home - Quote band", label: "Get a quote", goalType: "get_quote",
  destinationPage: s.ref("page", "get-a-quote"), style: "primary",
  heading: "See what coverage could look like for your family",
  body: "Answer a few questions and get an illustrative quote in about five minutes. It is an estimate, not an offer, and there is no obligation.",
});
const startQuote = s.cta("start-quote", {
  internalName: "Harborline Mutual - Coverage - Start a quote", label: "Start a quote", goalType: "next_step", style: "primary",
});
const coverageBand = s.cta("coverage-quote-band", {
  internalName: "Harborline Mutual - Coverage - Quote band", label: "Start a quote", goalType: "next_step", style: "primary",
  heading: "Ready to see your options?",
  body: "Start with three quick questions. You will see an illustrative estimate at the end, and you can adjust coverage as you go.",
});
const continueQuote = s.cta("continue-quote", {
  internalName: "Harborline Mutual - Start a quote - Continue", label: "Continue my quote", goalType: "next_step", style: "primary",
});
const learnStartQuote = s.cta("learn-start-quote", {
  internalName: "Harborline Mutual - Learn - Start a quote", label: "Start a quote", goalType: "link",
  destinationPage: s.ref("page", "start-a-quote"), style: "primary",
});
const deductiblesCta = s.cta("deductibles-start-quote", {
  internalName: "Harborline Mutual - Article - Deductibles CTA", label: "Start a quote", goalType: "link",
  destinationPage: s.ref("page", "start-a-quote"), style: "primary",
});
const movingCta = s.cta("moving-quote-new-home", {
  internalName: "Harborline Mutual - Article - Moving day CTA", label: "Quote your new home", goalType: "link",
  destinationPage: s.ref("page", "start-a-quote"), style: "primary",
});

// ---------- FAQ items ----------
const homeFaq = s.faq("home-common-questions", {
  internalName: "Harborline Mutual - Home - Common questions", heading: "Common questions",
  items: [
    s.item("faq-illustrative-quote", {
      title: "What is an illustrative quote?",
      text: "It is an estimate based on the answers you give us, meant to show how your coverage choices affect cost. It is not an offer of insurance. A final price would depend on underwriting, which is the review of details such as driving records or the age of a roof.",
    }),
    s.item("faq-quote-time", {
      title: "How long does it take to get a quote?",
      text: "Most people finish in about five minutes. It helps to have your ZIP code, the drivers and vehicles in your household, and the year your home was built if you are quoting home coverage.",
    }),
    s.item("faq-auto-and-home", {
      title: "Can I have my auto and home coverage in one place?",
      text: "Yes. Auto and home are separate policies, but you can manage them together with one account and one agent. Ask your agent how bundling would work for your household.",
    }),
    s.item("faq-change-coverage", {
      title: "Can I change my coverage later?",
      text: "Yes. You can adjust limits, deductibles, drivers, and vehicles during your policy term. Some changes take effect right away and others at renewal, and your agent will tell you which before you decide.",
    }),
    s.item("faq-claims", {
      title: "What happens when I need to file a claim?",
      text: "Call the claims line any time, day or night. An adjuster, the person who reviews the damage against your policy, will explain what is covered, what your deductible is, and what happens next.",
    }),
    s.item("faq-talk-to-someone", {
      title: "Who can I talk to if I have questions?",
      text: "Call our Port Mercer office at (207) 555-0163, weekdays from 8 a.m. to 6 p.m. Eastern. An agent can walk you through any term on a quote or a policy.",
    }),
  ],
});

const termsFaq = s.faq("coverage-terms", {
  internalName: "Harborline Mutual - Coverage - Terms explained", heading: "Insurance terms, explained",
  items: [
    s.item("term-premium", {
      title: "What is a premium?",
      text: "Your premium is what you pay for the policy, either monthly or for the full term. It reflects the coverage you choose and details such as where you live and what you are insuring.",
    }),
    s.item("term-deductible", {
      title: "What is a deductible?",
      text: "The deductible is the part of a covered claim you pay before the policy pays the rest. If a covered repair costs $2,000 and your deductible is $500, you pay $500 and the policy covers $1,500. These figures are illustrative.",
    }),
    s.item("term-coverage-limit", {
      title: "What is a coverage limit?",
      text: "A coverage limit is the most a policy will pay for a covered loss. Auto liability limits are often written as three numbers, such as 100/300/100: $100,000 per person and $300,000 per accident for injuries, and $100,000 for property damage. These figures are illustrative.",
    }),
    s.item("term-policy-term", {
      title: "What is a policy term?",
      text: "The term is how long a policy runs before it renews. Auto policies often run 6 or 12 months, home policies usually run 12 months, and term life runs for a set number of years.",
    }),
    s.item("term-endorsement", {
      title: "What is an endorsement or a rider?",
      text: "Both are add-ons that change your coverage. Auto and home policies call them endorsements, such as roadside assistance or scheduled jewelry. Life policies call them riders, such as a child rider.",
    }),
    s.item("term-underwriting", {
      title: "What does underwriting mean?",
      text: "Underwriting is how an insurer reviews the details of what you want to cover before offering a policy and setting a final price. It is why an online quote is an estimate and not an offer.",
    }),
  ],
});

// ---------- Blocks: home ----------
const homeHero = s.hero("home", {
  internalName: "Harborline Mutual - Home - Hero", eyebrow: "Auto, home, and life insurance",
  headline: "Steady coverage for you and your family",
  subheadline: "Local agents explain every term in plain language, and an illustrative quote takes about five minutes.",
  image: s.img(1), layout: "split", cta: getQuote, secondaryCta: exploreCoverage,
});
const homeGrid = s.cardGrid("home-coverage", {
  internalName: "Harborline Mutual - Home - Coverage grid", heading: "Coverage for each part of family life",
  intro: "Start with the coverage you need today. You can add more later, and one agent can help with all of it.",
  source: "manual", items: [auto, home, life], layout: "cards", columns: 3,
});
const homeStory = s.mediaText("home-plain-answers", {
  internalName: "Harborline Mutual - Home - Plain answers", eyebrow: "How we work",
  heading: "Plain answers before you sign anything",
  body: "Insurance comes with its own vocabulary. We explain it as we go, so you know what a deductible, a coverage limit, or a rider means for your family before you choose one.\n\nOur agents work out of Port Mercer and answer the phone themselves. Ask as many questions as you like. There is no pressure to decide on the first call.",
  image: s.img(13), imagePosition: "left", cta: readGuides,
});
const homeStats = s.stats("home-at-a-glance", {
  internalName: "Harborline Mutual - Home - At a glance", heading: "Harborline at a glance",
  items: [
    s.item("stat-quote-time", { title: "average time to an illustrative quote", value: "5 min" }),
    s.item("stat-claims-line", { title: "claims line answered by people", value: "24/7" }),
    s.item("stat-service-rating", { title: "average customer service rating", value: "4.7/5" }),
    s.item("stat-local-agents", { title: "licensed agents in our Port Mercer office", value: "38" }),
  ],
  footnote: "Figures are illustrative and describe a fictional company.",
});
const homeQuote = s.testimonial("elena-marsh", {
  internalName: "Harborline Mutual - Home - Customer quote",
  quote: "When we bought our first house, our agent walked us through every line of the policy, from the deductible to what water damage would and would not cover. For the first time, I understood what I was paying for.",
  person: elena, rating: 5,
});

// ---------- Blocks: coverage template ----------
const coverageHero = s.hero("coverage", {
  internalName: "Harborline Mutual - Coverage - Hero", eyebrow: "Coverage",
  headline: "Auto, home, and life coverage, explained plainly",
  subheadline: "See what each policy covers, the add-ons families ask about most, and how to choose limits you are comfortable with.",
  image: s.img(4), layout: "split", cta: startQuote,
});
const coverageGrid = s.cardGrid("coverage-options", {
  internalName: "Harborline Mutual - Coverage - Options grid", heading: "Choose a coverage to see the details",
  intro: "Pick a coverage to read what it includes, then start a quote when you are ready.",
  source: "manual", items: [auto, home, life], layout: "cards", columns: 3,
});

// ---------- Blocks: start a quote ----------
const startHero = s.hero("start-a-quote", {
  internalName: "Harborline Mutual - Start a quote - Hero", eyebrow: "Start a quote",
  headline: "Start your quote with three quick questions",
  subheadline: "Tell us what you would like to cover, where you live, and who is in your household. It takes about a minute.",
  image: s.img(6), layout: "split",
});
const startForm = s.form("quote-start", {
  internalName: "Harborline Mutual - Start a quote - Form", formKind: "quote_start",
  heading: "Start with the basics",
  intro: "Choose the coverage you are interested in, enter your ZIP code, and tell us who lives in your household. Sample answers are filled in so you can try it.",
  submitLabel: "Continue to details",
  successHeading: "Thanks, you are ready for the next step",
  successMessage: "On a live site, we would carry these answers into your full quote so you do not have to enter them again. This is a demo, so nothing was saved. Continue to the next page to see how the full quote works.",
  privacyNote: "This is a demo. Nothing you enter is sent or stored.",
  prefillSample: true,
});
const whatHappensNext = s.richText("start-what-happens-next", {
  internalName: "Harborline Mutual - Start a quote - What happens next", heading: "What happens next",
  body: md(`1. **Tell us the basics.** Coverage type, ZIP code, and household take about a minute.
2. **Add a few details.** On the next page we ask about drivers, vehicles, or your home, depending on what you chose.
3. **See an illustrative estimate.** You will see a sample range and the coverage choices behind it. It is not an offer of insurance.
4. **Talk it through, if you like.** An agent can explain any term before you decide. Call (207) 555-0163, weekdays from 8 a.m. to 6 p.m. Eastern.`),
});

// ---------- Blocks: get a quote ----------
const goalHero = s.hero("get-a-quote", {
  internalName: "Harborline Mutual - Get a quote - Hero", eyebrow: "Quote details",
  headline: "Get your illustrative quote",
  subheadline: "A few more details about your household and what you want to cover. It takes about four minutes.",
  image: s.img(12), layout: "split",
});
const goalForm = s.form("get-quote", {
  internalName: "Harborline Mutual - Get a quote - Form", formKind: "get_quote",
  heading: "Tell us about your household",
  intro: "These answers shape your illustrative estimate. Sample details are already filled in so you can see how it works. Change anything you like.",
  submitLabel: "See my estimate",
  successHeading: "Thanks, that is everything we need",
  successMessage: "On a live site, you would now see an illustrative monthly range for the coverage you chose, with the deductibles and limits behind it. It would be an estimate, not an offer of insurance. This is a demo, so no estimate was calculated and no one will contact you.",
  privacyNote: "This is a demo. Nothing you enter is sent or stored, and no one will contact you.",
  prefillSample: true,
});

// ---------- Blocks: learn ----------
const learnHero = s.hero("learn", {
  internalName: "Harborline Mutual - Learn - Hero", eyebrow: "Learn",
  headline: "Plain-language guides to insurance for families",
  subheadline: "Short explainers and checklists that help you understand your coverage before you need it.",
  image: s.img(7), layout: "full_bleed",
});
const learnLatest = s.cardGrid("learn-latest", {
  internalName: "Harborline Mutual - Learn - Latest guides", heading: "Latest guides",
  source: "latest_articles", layout: "cards", limit: 6, columns: 3,
});
const learnPromo = s.mediaText("learn-start-quote", {
  internalName: "Harborline Mutual - Learn - Start a quote promo", eyebrow: "Ready when you are",
  heading: "Know what you need? Start a quote in a few minutes",
  body: "Tell us what you would like to cover, your ZIP code, and who lives with you. You will see an illustrative estimate at the end, and an agent is a phone call away if you want to talk anything through.",
  image: s.img(8), imagePosition: "right", cta: learnStartQuote,
});

// ---------- Pages: steps 1 to 4, plus the article index ----------
const homePage = s.page("home", {
  title: "Harborline Mutual", slug: "home", pageType: "home", funnelStep: 1, nextStep: s.ref("page", "coverage"),
  hero: homeHero, primaryCta: getQuote,
  sections: [homeGrid, homeStory, homeStats, homeQuote, homeFaq, homeBand],
  seoTitle: "Harborline Mutual | Auto, home, and life insurance",
  seoDescription: "Auto, home, and life insurance for families, with plain explanations of every term and an illustrative quote in about five minutes.",
});
s.page("coverage", {
  title: "Coverage", slug: "coverage", pageType: "offering_detail", funnelStep: 2, nextStep: s.ref("page", "start-a-quote"),
  hero: coverageHero, primaryCta: startQuote,
  sections: [coverageGrid, termsFaq, coverageBand],
  detailSections: [termsFaq, coverageBand],
  seoTitle: "Auto, home, and life coverage | Harborline Mutual",
  seoDescription: "Compare auto, home, and life coverage from Harborline Mutual, with plain explanations of premiums, deductibles, and limits. Descriptions are illustrative.",
});
const startPage = s.page("start-a-quote", {
  title: "Start a quote", slug: "start-a-quote", pageType: "standard", funnelStep: 3, nextStep: s.ref("page", "get-a-quote"),
  hero: startHero, primaryCta: continueQuote,
  sections: [startForm, whatHappensNext],
  seoTitle: "Start a quote | Harborline Mutual",
  seoDescription: "Start an illustrative quote for auto, home, or life insurance with three quick questions: coverage type, ZIP code, and household.",
});
s.page("get-a-quote", {
  title: "Get a quote", slug: "get-a-quote", pageType: "goal", funnelStep: 4,
  hero: goalHero,
  sections: [goalForm],
  seoTitle: "Get an illustrative quote | Harborline Mutual",
  seoDescription: "Add a few details about your household, vehicles, and home to see an illustrative estimate. Quotes are illustrative and are not offers of insurance.",
});
const learnPage = s.page("learn", {
  title: "Learn", slug: "learn", pageType: "article_index", funnelStep: 0,
  hero: learnHero,
  sections: [learnLatest, learnPromo],
  seoTitle: "Insurance guides and checklists | Harborline Mutual",
  seoDescription: "Plain-language guides from Harborline Mutual on deductibles, coverage limits, moving day, and other insurance questions families ask.",
});

// ---------- Articles ----------
s.article("how-deductibles-work", {
  title: "How deductibles work, and how to choose yours", slug: "how-deductibles-work",
  summary: "A deductible is the share of a covered claim you pay first. Here is how it works on auto and home policies, and what to weigh when you pick one.",
  body: md(`## What a deductible is

A deductible is the amount you agree to pay toward a covered claim before your insurance pays the rest. On auto and home policies it applies each time you file a claim, not once a year, which is easy to miss the first time you read a policy.

Here is a simple, illustrative example. A storm drops a branch on your car, and the covered repair costs $2,400. If your comprehensive deductible is $500, you pay the first $500 and the policy pays the remaining $1,900. If the repair costs less than your deductible, say $350, the policy would not pay anything toward that claim.

## Where deductibles show up on your policies

Not every part of a policy has a deductible, and some parts have their own.

- **Auto collision** covers damage to your car from hitting another vehicle or object. It usually has its own deductible.
- **Auto comprehensive** covers theft, hail, falling branches, and hitting a deer. It often has a deductible separate from collision.
- **Auto liability** pays for injuries and damage you cause to others. It typically has no deductible.
- **Home dwelling and personal property** usually share one deductible per claim.
- **Wind or named storm deductibles** on some home policies are a percentage of the home's insured value rather than a flat dollar amount.

Life insurance does not use deductibles. A life policy pays its death benefit to your beneficiaries as written.

## How the deductible affects your premium

In general, a higher deductible lowers your premium, because you are agreeing to carry more of each claim yourself. A lower deductible raises the premium, because the insurer pays more of each claim. How much the premium moves depends on the policy, where you live, and what you are insuring, so it is worth asking to see a few options side by side.

## Questions to ask before you choose

The right deductible is one you could pay during a hard week without putting other bills at risk. These questions help you find it:

1. **Could you cover the deductible from savings today?** If a $1,000 bill would be hard to manage, a lower deductible may be the steadier choice.
2. **How likely is a claim in the next year or two?** A new driver in the household or an older roof can make smaller claims more likely.
3. **Would you file a small claim at all?** Many families pay for minor repairs themselves. If you would too, a very low deductible may mean paying for coverage you are unlikely to use.
4. **Do your auto and home deductibles need to match?** They do not. Some families keep a lower collision deductible on the car a teenager drives and a higher deductible on the house.

## A note on percentage deductibles

If your home policy lists a wind or named storm deductible as a percentage, multiply that percentage by the dwelling coverage on your declarations page. A 2 percent deductible on a home insured for $350,000 works out to $7,000, which is very different from a flat $1,000. These amounts are illustrative, but the math works the same way on any policy. If you live near the coast, this is the line worth reading twice.

## Where to find yours

Your deductibles are listed on your declarations page, usually the first page or two of your policy documents. If you are comparing coverage, ask your agent to show the same quote at two or three deductible levels so you can see the tradeoff in plain numbers. Every example in this article is illustrative, and the terms of your own policy are what count.`),
  heroImage: s.img(10), author: theo, publishDate: "2026-08-18",
  topics: ["deductibles", "auto insurance", "home insurance"],
  relatedPage: auto, cta: deductiblesCta,
  seoTitle: "How deductibles work | Harborline Mutual",
  seoDescription: "What a deductible is, where it applies on auto and home policies, how it affects your premium, and questions to ask before you choose one.",
});

s.article("moving-day-checklist", {
  title: "A moving-day insurance checklist for families", slug: "moving-day-insurance-checklist",
  summary: "Moving touches your home, auto, and life coverage. Use this checklist in the weeks before the truck arrives and the month after you unpack.",
  body: md(`Moving day has enough to keep track of without wondering whether the sofa is covered while it sits in a truck. Insurance is easiest to handle in three stages: a few weeks before the move, the week of the move, and the first month in your new place.

## Three to four weeks before

- **Set a start date for coverage on the new home.** If you are buying, your lender will usually ask for proof of home insurance before closing. Pick a start date that matches the day you get the keys, not the day you plan to move in.
- **Decide when the old policy ends.** If you are selling, keep the old home insured until the sale closes. An empty house can still have a burst pipe.
- **Ask how your belongings are covered in transit.** The personal property coverage on a home or renters policy may cover some belongings while they are being moved, but limits and conditions vary. If you hire movers, ask what their valuation coverage includes and what it leaves out.
- **Make a home inventory.** Walk through each room with your phone and record what you own, especially electronics, furniture, and anything you would need to replace quickly. Save the video somewhere other than the phone itself.

## The week of the move

- **Keep valuables with you.** Jewelry, passports, important papers, and laptops travel better in your car than in the back of a truck.
- **Photograph the new place before you unload.** A quick record of the walls, floors, and appliances helps if you later need to show what condition things were in.
- **Check your auto policy before you drive a rental truck.** Personal auto policies do not always extend to large moving trucks. Ask your agent first, and look at the rental company's coverage if yours does not apply.

## The first month in your new home

- **Update your address on every policy.** Auto premiums are partly based on where a car is kept overnight, so a new ZIP code can change yours.
- **Review your dwelling coverage.** Dwelling coverage should reflect what it would cost to rebuild the house, which is not the same as the sale price or the market value.
- **Look at your liability limit.** A bigger yard, a pool, or a new dog can be good reasons to talk about higher liability coverage or an umbrella policy, which adds liability coverage on top of your home and auto policies.
- **Ask about flood coverage.** Standard home policies usually exclude flood damage. If your new home is near the water, ask whether separate flood coverage makes sense.
- **Revisit life insurance and beneficiaries.** A new mortgage is a larger obligation for the people who depend on you. It is a natural moment to check that your coverage amount and named beneficiaries still fit your household.

## Keep these in one folder

Moving scatters paperwork. Keep a single folder, paper or digital, with:

1. Declarations pages for your home, auto, and life policies
2. Your home inventory video and receipts for major purchases
3. The movers' contract and their valuation terms
4. Photos of the new home taken before you unpacked
5. Your agent's name and phone number

## One call can cover most of this

If your home and auto policies are with the same insurer, one conversation with your agent can usually handle the address change, the new dwelling coverage, and the start and end dates. Ask for each change in writing so you have a record. Everything in this checklist is general information and illustrative, and the terms of your own policies are what count.`),
  heroImage: s.img(5), author: clara, publishDate: "2026-09-15",
  topics: ["moving", "home insurance", "checklists"],
  relatedPage: home, cta: movingCta,
  seoTitle: "Moving-day insurance checklist | Harborline Mutual",
  seoDescription: "A three-stage checklist for moving day: new home coverage, belongings in transit, address updates, flood questions, and the paperwork to keep.",
});

// ---------- Brand ----------
const navAuto = s.item("nav-auto", { title: "Auto", link: auto });
const navHome = s.item("nav-home", { title: "Home", link: home });
const navLife = s.item("nav-life", { title: "Life", link: life });
const navLearn = s.item("nav-learn", { title: "Learn", link: learnPage });

s.brand({
  name: "Harborline Mutual", slug: "harborline-mutual", vertical: "insurance",
  shortDescription: "Auto, home, and life insurance for families.",
  tagline: "Steady coverage for every stage.", logo: s.logo, favicon: s.favicon,
  colorBrand: "#12355B", colorButton: "#C9472F", colorButtonText: "#FFFFFF", colorAccent: "#7FB7BE",
  colorBackground: "#F4F1EA", colorSurface: "#FFFFFF", colorText: "#253041", colorMuted: "#5E6878",
  fontHeading: "DM Serif Display", fontBody: "DM Sans", buttonRadius: 999, buttonTextCase: "normal",
  voiceDescription: "Reassuring, honest, and plain-spoken. Harborline speaks to you and your family, explains insurance terms as it goes, and is clear about what is illustrative.",
  voiceDos: [
    "Speak to you and your family.",
    "Explain each insurance term the first time you use it.",
    "Include clear disclaimers on coverage and quotes.",
    "Use short, calm sentences.",
  ],
  voiceDonts: [
    "No fear tactics or worst-case scenarios.",
    "Never promise savings or prices.",
    "Never compare against real insurers.",
    "No jargon left unexplained.",
  ],
  photoDirection: "Families at home, cars in driveways, coastal towns, moving day, warm natural light.",
  navigation: [navAuto, navHome, navLife, navLearn],
  headerCta: getQuote,
  footerLinks: [
    s.item("footer-auto", { title: "Auto insurance", link: auto }),
    s.item("footer-home", { title: "Home insurance", link: home }),
    s.item("footer-life", { title: "Life insurance", link: life }),
    s.item("footer-coverage", { title: "All coverage", link: s.ref("page", "coverage") }),
    s.item("footer-start-quote", { title: "Start a quote", link: startPage }),
    s.item("footer-learn", { title: "Learn", link: learnPage }),
  ],
  promoBarText: "Get an illustrative quote in about five minutes.",
  address: "77 Lighthouse Row\nPort Mercer, ME 04999",
  phone: "(207) 555-0163",
  legalDisclaimer: "Fictional company. Sample content for illustration only. Coverage descriptions and quotes are illustrative and are not offers of insurance.",
  homePage: homePage,
});

export default s.entries;
