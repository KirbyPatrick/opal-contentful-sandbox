/**
 * Lumenwork: workflow and operations software for operations teams.
 * Funnel: home (1) -> solutions/{solution} (2) -> customers (3) -> book-a-demo (4).
 * Off-funnel: pricing, resources (article index).
 */
import { defineBrand, md } from "../lib/builders";

const s = defineBrand("lumenwork", "lw");

// ---------- People ----------

const nora = s.person("nora-castellanos", {
  name: "Nora Castellanos", slug: "nora-castellanos", role: "author", jobTitle: "Head of operations practice",
  bio: "Nora leads the operations practice at Lumenwork, where she helps customers map and redesign their intake and approval workflows. She previously ran facilities operations for a network of regional distribution centers.",
});
const elliot = s.person("elliot-brandt", {
  name: "Elliot Brandt", slug: "elliot-brandt", role: "author", jobTitle: "Senior solutions consultant",
  bio: "Elliot works with freight, logistics, and facilities teams on field operations rollouts. Before joining Lumenwork, he managed dispatch and maintenance planning for a regional trucking fleet.",
});
const imani = s.person("imani-duarte", {
  name: "Imani Duarte", slug: "imani-duarte", role: "customer", jobTitle: "Director of terminal operations",
  organization: "Pell River Freight", photo: s.img(10),
  bio: "Imani oversees day-to-day operations across Pell River Freight's 11 terminals, including dock crews, dispatch, and maintenance.",
});
const julian = s.person("julian-marsh", {
  name: "Julian Marsh", slug: "julian-marsh", role: "customer", jobTitle: "VP of facilities operations",
  organization: "Linden & Pryce Facilities", photo: s.img(11),
  bio: "Julian runs facilities operations at Linden & Pryce Facilities, which manages maintenance and building services for commercial clients.",
});

// ---------- Offerings: solutions (detail pages through the solutions template) ----------

const intake = s.offering("intake-and-requests", {
  name: "Intake and requests", slug: "intake-and-requests", offeringType: "saas_solution",
  summary: "Give every request one front door, then route it to the right team with the details they need to act.",
  description: md(`## One front door for every request

Requests arrive by email, phone, chat, and the hallway. Lumenwork brings them into one queue, whether someone fills in a form, forwards an email, or logs a request from the field app. Each request gets an owner, a due date, and a status everyone can see.

## Ask for the right details up front

Most back-and-forth starts with a missing detail. Request forms change based on the answers people give, so a dock door repair asks for the door number and a photo, while a new vendor request asks for a tax form and a contact. Required fields mean the team that picks up the work has what it needs on day one.

## Route work without a triage meeting

Routing rules send each request to the right queue by type, location, cost, or priority. When a request is urgent, Lumenwork notifies the on-call owner and flags it on the board. When it is not, it waits its turn in a shared queue instead of in someone's inbox.

## See what is coming in

Queue views show volume by team and site, how long requests wait before someone picks them up, and which request types come back for more information most often. Operations leads use that view to plan staffing and fix the forms that cause the most rework.`),
  images: [s.img(5)],
  features: [
    "Request forms with conditional questions",
    "Email-to-request for shared inboxes",
    "Routing rules by type, location, cost, or priority",
    "Shared queues with owners, due dates, and status",
    "Requester updates without status-check emails",
    "Queue reports on volume and wait time",
  ],
  seoTitle: "Intake and request management | Lumenwork",
  seoDescription: "Bring every operations request into one queue, collect the right details up front, and route work to the right team automatically.",
});

const approvals = s.offering("approvals", {
  name: "Approvals", slug: "approvals", offeringType: "saas_solution",
  summary: "Set clear approval paths with thresholds and backups, so decisions keep moving instead of sitting in inboxes.",
  description: md(`## Approval paths everyone can read

Write the rule once: purchases over $2,500 need the site manager and then finance, and schedule changes need the shift lead. Lumenwork builds the path from the details on each request, so no one has to guess who signs next.

## Decide with the context in front of you

Approvers see the request, attachments, budget line, and earlier decisions on one screen. They can approve, decline, or ask a question from email, desktop, or the mobile app, and every answer is recorded with a timestamp.

## Keep things moving when people are away

Set a backup approver and a response window for each step. If a step waits too long, Lumenwork reminds the approver, then moves the request to the backup. Out-of-office dates reroute approvals on their own, so a vacation does not stop a purchase order.

## Start from a template

New templates for finance and HR cover purchase requests, vendor setup, time off, and new hire equipment. Each one comes with suggested steps and required fields that you can adjust to match your own policy.

## A clear record for audits

Every approval keeps its full history: who approved, when, what changed, and which rule applied. Finance and compliance teams can export the record for any period without asking operations to rebuild it from email threads.`),
  images: [s.img(3)],
  features: [
    "Rule-based paths by amount, category, or site",
    "Parallel and sequential approval steps",
    "Approve from email, desktop, or mobile",
    "Backup approvers, reminders, and escalation",
    "Templates for finance and HR approvals",
    "Exportable approval history for audits",
  ],
  seoTitle: "Approval workflows for operations teams | Lumenwork",
  seoDescription: "Build approval paths with thresholds, backups, and reminders, and keep a full audit record of every decision your operations team makes.",
});

const fieldOps = s.offering("field-operations", {
  name: "Field operations", slug: "field-operations", offeringType: "saas_solution",
  summary: "Hand work to crews in the field with checklists, photos, and offline access, and see each job close out as it happens.",
  description: md(`## Handoffs that reach the field

When a request is approved, Lumenwork creates the job and assigns it to a crew, technician, or driver based on location, skills, and schedule. The job carries everything from the original request, so no one in the field has to call the office for details.

## Checklists that match the work

Build checklists for inspections, preventive maintenance, deliveries, and site visits. Any step can require a photo, a meter reading, or a signature, and a failed check can open a follow-up request on its own.

## Plan the day, then adjust it

Coordinators see every open job on a calendar and a map, grouped by crew. When an urgent request comes in, they can move a job, reassign it, or split it across two crews, and the field app updates right away.

## Works where the signal does not

The field app keeps jobs, checklists, and reference documents on the device. Crews can finish work in a basement plant room or a rural yard, and their updates sync when the connection comes back.

## Close the loop with the office

Every update appears on the operations board as it happens. Coordinators can see which jobs are on track, which are blocked, and which are waiting on parts. When a job is done, the person who asked for it gets a short note, with a photo when it helps.`),
  images: [s.img(4)],
  features: [
    "Jobs created automatically from approved requests",
    "Assignment by location, skills, or schedule",
    "Checklists with required photos, readings, and signatures",
    "Offline mode for jobs, checklists, and documents",
    "Follow-up requests from failed checks",
    "Live job status on the operations board",
  ],
  seoTitle: "Field operations software | Lumenwork",
  seoDescription: "Assign jobs to field crews with checklists, photos, and offline access, and follow every job from approval to close-out on one board.",
});

// ---------- Offerings: plans (pricing page only, no detail page) ----------

const starter = s.offering("starter", {
  name: "Starter", slug: "starter", offeringType: "saas_plan",
  summary: "For a single team putting its first workflows in one place.",
  price: 12, priceLabel: "$12 per user per month",
  features: [
    "Request forms and shared queues",
    "Approval paths with up to 3 steps",
    "Field app for viewing and updating jobs",
    "Email and in-app notifications",
    "Standard reports on volume and cycle time",
  ],
  specs: [
    "Users: Up to 25",
    "Workflows: 10",
    "Approval steps: Up to 3 per workflow",
    "Field app: View and update jobs",
    "Audit history: 90 days",
    "Single sign-on: Not included",
    "Support: Email",
  ],
  finePrint: "Prices are illustrative and shown in US dollars. Billed annually, or monthly at a higher rate.",
});

const team = s.offering("team", {
  name: "Team", slug: "team", offeringType: "saas_plan",
  summary: "For operations teams running requests, approvals, and field work across several sites.",
  price: 24, priceLabel: "$24 per user per month", badge: "Most popular",
  features: [
    "Everything in Starter",
    "Routing rules by type, location, cost, or priority",
    "Unlimited approval steps with backups and escalation",
    "Field app with offline mode and checklists",
    "Approval templates for finance and HR",
    "Single sign-on",
  ],
  specs: [
    "Users: Up to 250",
    "Workflows: 50",
    "Approval steps: Unlimited",
    "Field app: Offline mode and checklists",
    "Audit history: 2 years",
    "Single sign-on: Included",
    "Support: Email and chat",
  ],
  finePrint: "Prices are illustrative, shown in US dollars, and billed annually.",
});

const enterprise = s.offering("enterprise", {
  name: "Enterprise", slug: "enterprise", offeringType: "saas_plan",
  summary: "For multi-site organizations that need advanced controls, longer records, and a guided rollout.",
  priceLabel: "Custom pricing",
  features: [
    "Everything in Team",
    "Custom roles and permissions",
    "Sandbox workspace for testing changes",
    "API and webhook limits sized to your volume",
    "Guided rollout across sites",
    "Named customer success manager",
  ],
  specs: [
    "Users: Unlimited",
    "Workflows: Unlimited",
    "Approval steps: Unlimited",
    "Field app: Offline mode, checklists, and dispatch",
    "Audit history: 7 years",
    "Single sign-on: Included, with user provisioning",
    "Support: Named success manager",
  ],
  finePrint: "Pricing is illustrative. Enterprise plans are quoted based on users, sites, and rollout scope.",
});

// ---------- CTAs ----------

const goalPage = s.ref("page", "book-a-demo");
const customersRef = s.ref("page", "customers");
const solutionsRef = s.ref("page", "solutions");

const bookDemo = s.cta("book-demo", {
  internalName: "Lumenwork - Global - Book a demo", label: "Book a demo", goalType: "book_demo",
  destinationPage: goalPage, style: "primary",
});
const seeResults = s.cta("see-results", {
  internalName: "Lumenwork - Solutions - See customer results", label: "See customer results", goalType: "next_step", style: "secondary",
});
const exploreSolutions = s.cta("explore-solutions", {
  internalName: "Lumenwork - Home - Explore solutions", label: "Explore solutions", goalType: "link",
  destinationPage: solutionsRef, style: "secondary",
});
const allSolutions = s.cta("all-solutions", {
  internalName: "Lumenwork - Home - See all solutions", label: "See all solutions", goalType: "link",
  destinationPage: solutionsRef, style: "secondary",
});
const homeStory = s.cta("home-story", {
  internalName: "Lumenwork - Home - Read a customer story", label: "Read a customer story", goalType: "link",
  destinationPage: customersRef, style: "secondary",
});
const homeBand = s.cta("home-band", {
  internalName: "Lumenwork - Home - Demo band", label: "Book a demo", goalType: "book_demo", destinationPage: goalPage,
  heading: "See your own workflow in Lumenwork",
  body: "Bring one process that slows your team down. We will show you how it runs, from the first request to the final handoff.",
});
const resultsBand = s.cta("solutions-results-band", {
  internalName: "Lumenwork - Solutions - Case study band", label: "Read the case study", goalType: "next_step",
  heading: "See how a freight carrier put this to work",
  body: "Pell River Freight moved repair requests, approvals, and shop handoffs for 11 terminals into one queue.",
});
const customersBand = s.cta("customers-band", {
  internalName: "Lumenwork - Customers - Demo band", label: "Book a demo", goalType: "book_demo", destinationPage: goalPage,
  heading: "Map your first workflow with us",
  body: "Tell us about the repair, purchase, or onboarding process you want to fix first. We will walk through how it would run in Lumenwork.",
});
const pricingBand = s.cta("pricing-band", {
  internalName: "Lumenwork - Pricing - Demo band", label: "Talk with our team", goalType: "book_demo", destinationPage: goalPage,
  heading: "Not sure which plan fits?",
  body: "Tell us how many sites, teams, and workflows you run. We will recommend a plan and show it working with your process.",
});
const articleStory = s.cta("article-story", {
  internalName: "Lumenwork - Article - Read the case study", label: "Read the case study", goalType: "link",
  destinationPage: customersRef,
});

// ---------- Home blocks ----------

const homeHero = s.hero("home", {
  internalName: "Lumenwork - Home - Hero", eyebrow: "Workflow software for operations",
  headline: "Keep operations work moving from request to done",
  subheadline: "One place to take in requests, get approvals, and hand work to the field, with every step visible to the people who need it.",
  image: s.img(1), layout: "split", cta: bookDemo, secondaryCta: exploreSolutions,
});
const homeSolutions = s.cardGrid("home-solutions", {
  internalName: "Lumenwork - Home - Solutions grid", heading: "Built for the work between teams",
  intro: "Three solutions on one workflow engine. Start with the one your team needs most, and add the others when you are ready.",
  source: "manual", items: [intake, approvals, fieldOps], layout: "cards", columns: 3, cta: allSolutions,
});
const homeRollout = s.mediaText("home-rollout", {
  internalName: "Lumenwork - Home - Rollout", eyebrow: "How rollout works",
  heading: "Start with one workflow and a rollout lead",
  body: "You do not have to rebuild every process at once. Most customers begin with the workflow that causes the most chasing, often purchase approvals or repair requests.\n\nA rollout lead who has run operations teams maps it with you, builds it alongside your team, and stays with you through the first month of live work.",
  image: s.img(6), imagePosition: "left", cta: homeStory,
});
const homeStats = s.stats("home-results", {
  internalName: "Lumenwork - Home - Results", heading: "Illustrative results from a first workflow",
  items: [
    s.item("home-stat-approvals", { title: "faster approval turnaround", value: "38%" }),
    s.item("home-stat-emails", { title: "fewer status-check emails", value: "52%" }),
    s.item("home-stat-launch", { title: "typical time to launch a first workflow", value: "3 weeks" }),
  ],
  footnote: "Figures are illustrative and based on sample workflows from fictional customers. Results vary by team.",
});
const homeQuote = s.testimonial("linden-pryce", {
  internalName: "Lumenwork - Home - Linden & Pryce quote",
  quote: "We look after buildings for dozens of clients, and each one used to send requests a different way. Now our coordinators take every request in one place, get sign-off quickly, and hand jobs straight to our technicians.",
  person: julian,
});

// ---------- Solutions blocks (template page and detail views) ----------

const solutionsHero = s.hero("solutions", {
  internalName: "Lumenwork - Solutions - Hero", eyebrow: "Solutions",
  headline: "Software for every step between a request and a finished job",
  subheadline: "Intake, approvals, and field operations share one workflow engine, so work never has to be copied from one system to the next.",
  image: s.img(7), layout: "split", cta: bookDemo, secondaryCta: seeResults,
});
const solutionsGrid = s.cardGrid("solutions-all", {
  internalName: "Lumenwork - Solutions - Solutions grid", heading: "Choose where to start",
  intro: "Each solution works on its own and connects to the others without extra setup.",
  source: "manual", items: [intake, approvals, fieldOps], layout: "cards", columns: 3,
});
const platformGrid = s.cardGrid("solutions-platform", {
  internalName: "Lumenwork - Solutions - Platform features", heading: "Included in every workflow",
  intro: "The same foundation sits under each solution, so your rules, records, and reports stay in one place.",
  source: "manual", layout: "icons", columns: 4,
  items: [
    s.item("platform-routing", { title: "Routing and rules", text: "Send work by type, site, cost, or priority. Change a rule once and it applies everywhere it is used." }),
    s.item("platform-permissions", { title: "Roles and permissions", text: "Decide who can submit, approve, edit, and report, down to the site or team." }),
    s.item("platform-audit", { title: "Audit history", text: "Every change and decision is recorded with who made it and when." }),
    s.item("platform-reports", { title: "Boards and reports", text: "See volume, wait time, and blocked work by team or site without building a spreadsheet." }),
  ],
});
const detailStats = s.stats("solutions-results", {
  internalName: "Lumenwork - Solutions detail - Results", heading: "Illustrative results in the first 90 days",
  items: [
    s.item("detail-stat-cycle", { title: "shorter request cycle time", value: "31%" }),
    s.item("detail-stat-routing", { title: "requests routed without manual triage", value: "4 in 5" }),
    s.item("detail-stat-hours", { title: "saved per coordinator each month", value: "12 hours" }),
  ],
  footnote: "Figures are illustrative, based on a composite of fictional customer workflows. They are not guaranteed results.",
});
const rolloutFaq = s.faq("solutions-rollout", {
  internalName: "Lumenwork - Solutions detail - Rollout FAQ", heading: "Questions about getting started",
  items: [
    s.item("rollout-faq-timeline", {
      title: "How long does it take to launch a first workflow?",
      text: "It depends on the workflow, but many teams launch their first one in two to four weeks. Your rollout lead helps map the current process, build the forms and rules, and train the first group of users.",
    }),
    s.item("rollout-faq-it", {
      title: "Do we need IT to build or change workflows?",
      text: "No. Operations leads build and edit workflows in a visual editor. IT usually joins to set up single sign-on and user provisioning, then steps back.",
    }),
    s.item("rollout-faq-tools", {
      title: "Can Lumenwork connect to the systems we already use?",
      text: "Yes. Lumenwork sends and receives updates through webhooks and a REST API, and it can turn messages to a shared inbox into requests. Your rollout lead will review which connections matter for your first workflow.",
    }),
    s.item("rollout-faq-one-team", {
      title: "Can we start with one team or site?",
      text: "Yes, and we recommend it. Most customers start with one team, prove the workflow for a month, then add sites using the same forms and rules.",
    }),
  ],
});

// ---------- Customers (case study) blocks ----------

const customersHero = s.hero("customers", {
  internalName: "Lumenwork - Customers - Hero", eyebrow: "Customer story",
  headline: "How Pell River Freight keeps repairs moving across 11 terminals",
  subheadline: "A regional freight carrier replaced email chains and a shared spreadsheet with one queue for repair requests, approvals, and shop handoffs.",
  image: s.img(9), layout: "split", cta: bookDemo,
});
const customersStory = s.richText("customers-story", {
  internalName: "Lumenwork - Customers - Story", heading: "From five channels to one queue",
  body: md(`## About Pell River Freight

Pell River Freight is a regional less-than-truckload carrier with 11 terminals, about 300 tractors, and a maintenance shop at each of its three largest sites. Its operations team supports drivers, dock crews, and mechanics across two shifts.

## The challenge

Repair requests reached the shop in at least five ways: paper inspection forms, photos in group chats, phone calls to dispatch, emails to terminal managers, and a shared spreadsheet that nobody fully trusted. Any repair over $2,500 needed sign-off from the terminal manager and the regional maintenance lead, usually by email.

The result was a daily routine of chasing. Managers spent their first hour asking whether yesterday's repairs had been approved. Drivers reported the same fault twice because they could not see whether anyone had picked it up. Some tractors waited a full day for a decision that took five minutes once someone looked at it.

## Starting with one workflow

Pell River chose one workflow to fix first: repair requests from pre-trip and post-trip inspections. With a Lumenwork rollout lead, the team at two pilot terminals mapped every step from a failed inspection to a tractor back in service.

They rebuilt it in Lumenwork as a single flow:

- A failed check in the field app creates a repair request with the asset number, photos, and driver notes.
- Routing rules send the request to the right shop based on terminal and asset type.
- Repairs over the threshold go to the terminal manager, then the maintenance lead, with a backup approver for each step.
- Approved repairs become shop jobs automatically, and the driver and dispatcher see each status change.

## What changed

Repair requests now arrive one way, with the details the shop needs. Approvals that used to sit in inboxes move to a backup when the first approver is away. Managers start the day with a board that shows what is waiting, where, and why, instead of a stack of emails to sort.

Pell River has since added two more workflows on the same foundation: parts purchase approvals and new driver onboarding.`),
});
const customersRollout = s.mediaText("customers-rollout", {
  internalName: "Lumenwork - Customers - Rollout", eyebrow: "The rollout",
  heading: "Built with the terminal managers who use it",
  body: "Pell River started at two terminals with the managers who handled the most repair requests. Together with their Lumenwork rollout lead, they tested the new flow on live repairs for six weeks and adjusted the forms as they went.\n\nThe other nine terminals followed in three groups over the next three months, using the same forms and rules. Managers from the pilot sites trained their peers.",
  image: s.img(2), imagePosition: "right",
});
const customersStats = s.stats("customers-results", {
  internalName: "Lumenwork - Customers - Results", heading: "Results after six months",
  items: [
    s.item("case-stat-days", { title: "average from failed inspection to approved repair, down from 3.1 days", value: "1.4 days" }),
    s.item("case-stat-emails", { title: "fewer status-check emails to the shop", value: "60%" }),
    s.item("case-stat-terminals", { title: "terminals working from one queue", value: "11 of 11" }),
    s.item("case-stat-workflows", { title: "more workflows added on the same foundation", value: "2" }),
  ],
  footnote: "Illustrative figures for a fictional company, shown for demonstration only.",
});
const customersQuote = s.testimonial("pell-river", {
  internalName: "Lumenwork - Customers - Pell River quote",
  quote: "Our terminal managers used to start the day chasing approvals in email. Now they start with one queue that shows what is waiting and who owns it. Repairs stopped getting lost between the driver, the dispatcher, and the shop.",
  person: imani,
});

// ---------- Book a demo blocks ----------

const demoHero = s.hero("book-a-demo", {
  internalName: "Lumenwork - Book a demo - Hero", eyebrow: "Book a demo",
  headline: "See Lumenwork run one of your workflows",
  subheadline: "In 30 minutes, a solutions specialist walks through intake, approvals, and field handoffs using a process you choose.",
  image: s.img(6), layout: "split",
});
const demoForm = s.form("book-demo", {
  internalName: "Lumenwork - Book a demo - Form", formKind: "book_demo", heading: "Tell us about your team",
  intro: "Share a little about your operation and the workflow you would like to see. We use it to tailor the walkthrough to how your team works today.",
  submitLabel: "Request my demo", successHeading: "Thanks, your demo request is in",
  successMessage: "On a live site, a solutions specialist would email you within one business day to schedule a 30-minute walkthrough. This is a demo site, so nothing was sent and no one will contact you.",
  privacyNote: "This is a demo form. Nothing you enter is sent or stored.",
  prefillSample: true,
});

// ---------- Pricing blocks ----------

const pricingHero = s.hero("pricing", {
  internalName: "Lumenwork - Pricing - Hero", eyebrow: "Pricing",
  headline: "Plans that grow from one team to every site",
  subheadline: "Start with one team and a few workflows. Add users, sites, and controls as your operation grows.",
  image: s.img(7), layout: "split", cta: bookDemo,
});
const pricingGrid = s.cardGrid("pricing-plans", {
  internalName: "Lumenwork - Pricing - Plans", heading: "Choose a plan",
  intro: "Per-user prices, billed annually. All prices shown are illustrative.",
  source: "manual", items: [starter, team, enterprise], layout: "pricing", columns: 3,
});
const pricingTable = s.comparisonTable("pricing-compare", {
  internalName: "Lumenwork - Pricing - Plan comparison", heading: "Compare plans",
  intro: "Every plan includes intake, approvals, and the field app. Here is how the limits and controls differ.",
  offerings: [starter, team, enterprise],
  rows: ["Users", "Workflows", "Approval steps", "Field app", "Audit history", "Single sign-on", "Support"],
  footnote: "Prices and plan limits are illustrative and shown for demonstration only.",
});
const pricingFaq = s.faq("pricing", {
  internalName: "Lumenwork - Pricing - FAQ", heading: "Pricing questions",
  items: [
    s.item("pricing-faq-users", {
      title: "How do you count users?",
      text: "A user is anyone who works on requests: approvers, coordinators, and field crews. People who only submit requests through a form or email do not need a seat, so you can open intake to the whole company.",
    }),
    s.item("pricing-faq-pilot", {
      title: "Can we try Lumenwork before we commit?",
      text: "Yes. After a demo, most teams run a 30-day pilot on one workflow with a small group of users. Your rollout lead sets the scope and success measures with you before the pilot starts.",
    }),
    s.item("pricing-faq-change", {
      title: "Can we change plans later?",
      text: "Yes. You can move up a plan at any time, and the difference is prorated for the rest of your billing term. Moving down takes effect at your next renewal.",
    }),
    s.item("pricing-faq-billing", {
      title: "Do you offer monthly billing?",
      text: "Starter and Team are billed annually by default. Monthly billing is available on Starter at a higher per-user rate. Enterprise terms are set in your agreement.",
    }),
    s.item("pricing-faq-onboarding", {
      title: "What is included in onboarding?",
      text: "Every plan includes setup guides, live training sessions, and a rollout lead for your first workflow. Enterprise adds a guided rollout across all of your sites with a named success manager.",
    }),
  ],
});

// ---------- Resources blocks ----------

const resourcesHero = s.hero("resources", {
  internalName: "Lumenwork - Resources - Hero", eyebrow: "Resources",
  headline: "Practical guides for operations teams",
  subheadline: "Field-tested advice on intake, approvals, and handoffs from the people who help our customers roll out new workflows.",
  layout: "text_only",
});
const resourcesLatest = s.cardGrid("resources-latest", {
  internalName: "Lumenwork - Resources - Latest articles", heading: "Latest articles",
  source: "latest_articles", layout: "cards", columns: 3, limit: 6,
});

// ---------- Pages ----------

const home = s.page("home", {
  title: "Lumenwork", slug: "home", pageType: "home", funnelStep: 1, nextStep: solutionsRef,
  hero: homeHero, primaryCta: bookDemo,
  sections: [homeSolutions, homeRollout, homeStats, homeQuote, homeBand],
  seoTitle: "Lumenwork | Workflow software for operations teams",
  seoDescription: "Take in requests, route approvals, and hand work to field crews in one place. Lumenwork is workflow software built for operations teams.",
});
const solutions = s.page("solutions", {
  title: "Solutions", slug: "solutions", pageType: "offering_detail", funnelStep: 2, nextStep: customersRef,
  hero: solutionsHero, primaryCta: seeResults,
  sections: [solutionsGrid, platformGrid, resultsBand],
  detailSections: [detailStats, rolloutFaq, resultsBand],
  seoTitle: "Solutions for intake, approvals, and field work | Lumenwork",
  seoDescription: "Explore Lumenwork solutions for intake and requests, approvals, and field operations, all built on one workflow engine for operations teams.",
});
const customers = s.page("customers", {
  title: "Customer story: Pell River Freight", slug: "customers", pageType: "standard", funnelStep: 3, nextStep: goalPage,
  hero: customersHero, primaryCta: bookDemo,
  sections: [customersStory, customersRollout, customersStats, customersQuote, customersBand],
  seoTitle: "Pell River Freight customer story | Lumenwork",
  seoDescription: "How a regional freight carrier moved repair requests, approvals, and shop handoffs for 11 terminals into one Lumenwork queue.",
});
s.page("book-a-demo", {
  title: "Book a demo", slug: "book-a-demo", pageType: "goal", funnelStep: 4,
  hero: demoHero, sections: [demoForm],
  seoTitle: "Book a demo | Lumenwork",
  seoDescription: "See Lumenwork run one of your own workflows in a 30-minute walkthrough of intake, approvals, and field handoffs.",
});
const pricing = s.page("pricing", {
  title: "Pricing", slug: "pricing", pageType: "standard", funnelStep: 0,
  hero: pricingHero, primaryCta: bookDemo,
  sections: [pricingGrid, pricingTable, pricingFaq, pricingBand],
  seoTitle: "Pricing and plans | Lumenwork",
  seoDescription: "Compare Lumenwork Starter, Team, and Enterprise plans for operations teams. Per-user pricing, billed annually. Prices shown are illustrative.",
});
const resources = s.page("resources", {
  title: "Resources", slug: "resources", pageType: "article_index", funnelStep: 0,
  hero: resourcesHero, sections: [resourcesLatest],
  seoTitle: "Resources for operations teams | Lumenwork",
  seoDescription: "Practical articles on intake, approvals, and handoffs for operations leads who want work to move with less chasing.",
});

// ---------- Articles ----------

s.article("why-approvals-stall", {
  title: "Why approvals stall, and how to keep them moving", slug: "why-approvals-stall",
  summary: "Most approvals do not stall at the decision. They stall in the gaps around it. Here is how to find those gaps and close them.",
  body: md(`Ask any operations lead where their week goes, and approvals come up quickly. A purchase request waits four days for a signature. A schedule change sits with someone who is on leave. A vendor setup bounces between finance and procurement because nobody is sure who goes first.

It is tempting to blame slow approvers. In most teams we work with, the decision itself takes minutes. The time goes into the gaps around it.

## Where the time actually goes

When we map approval workflows with operations teams, the same four gaps show up again and again.

- **Unclear ownership.** The request lands in a shared inbox or a group, and everyone assumes someone else has it.
- **Missing information.** The approver opens the request, sees no quote or cost center, and sends it back. The clock starts over.
- **No backup.** The one person who can approve is traveling, out sick, or in back-to-back meetings for a week.
- **Invisible status.** The requester cannot see where things stand, so they email, call, and walk over. Each check-in interrupts someone who is not the bottleneck.

None of these are about the approver's judgment. They are design problems, and design problems can be fixed.

## Write the rule down

Most approval paths live in people's heads. "Anything over a certain amount goes to finance" is a rule, but if the amount and the person are not written down, every new coordinator learns it by getting it wrong.

Write each approval rule as a single sentence: what triggers it, who approves, and in what order. For example, purchases over $2,500 need the site manager, then finance. If you cannot write the rule in one sentence, the path is probably doing two jobs and should be split.

## Ask for everything up front

The fastest approval is the one that never comes back for more information. Look at the last 20 requests that were sent back and list what was missing. Usually it is the same few things: a quote, a cost center, a photo, a reason.

Make those fields required on the request form. It adds a minute for the person asking and saves days for everyone else.

## Plan for people being away

Every approval step needs a backup and a time limit. Decide how long a step can wait before a reminder goes out, and how long before it moves to the backup. Two business days is a common starting point for routine spend. Same day is common for anything that holds up field work.

Out-of-office dates should reroute approvals automatically. If your process depends on someone remembering to delegate before a vacation, it will break the week they forget.

## Make status visible to the requester

Most status-check emails stop when requesters can see three things: which step their request is on, who owns that step, and when it is due. A shared view also gives operations leads a running picture of where requests pile up.

## Measure the wait, not just the total

Track how long each request waits at each step, not only how long it takes end to end. A single total hides the pattern. Step-level timing might show that finance approvals are quick but site manager approvals wait three days, which points to a capacity or backup problem at one step rather than a slow process overall.

## A simple place to start

Pick one approval path your team complains about. Write the rule, add the missing fields, assign a backup, and measure step-level wait times for a month. Then compare the before and after.

You will usually find that the fix had less to do with speeding people up and more to do with removing the reasons they were waiting.`),
  heroImage: s.img(8), author: nora, publishDate: "2026-08-18",
  topics: ["approvals", "process design", "operations"], relatedPage: approvals, cta: bookDemo,
  seoTitle: "Why approvals stall and how to keep them moving | Lumenwork",
  seoDescription: "Most approval delays happen in the gaps around the decision. Learn how operations teams find those gaps and keep approvals moving.",
});

s.article("handoffs-worth-automating", {
  title: "Five handoffs worth automating first", slug: "handoffs-worth-automating",
  summary: "The handoffs that fail quietly cost the most. Start with these five, where work changes hands every day and a dropped step is easy to spot.",
  body: md(`A handoff is the moment work moves from one person or team to another. It is also where most operational work goes missing. The request was clear and the work was done well, but the note between the two never arrived.

Trying to automate every handoff at once usually turns into a long project and a confused team. A better approach is to start with the handoffs that happen every day, involve more than one team, and fail quietly. Here are five that meet that test in most operations teams.

## 1. Inspection to repair

A driver, technician, or building engineer finds a problem during a routine check. The finding goes on a paper form, into a photo in a group chat, or into a quick word with a supervisor. Whether it becomes a repair depends on someone remembering to pass it on.

Automate it so that a failed check creates a repair request with the photo, location, and asset attached, routed to the right shop or vendor. This is often the first handoff teams move, because a missed repair is expensive and easy to trace.

## 2. Approved request to the person doing the work

Many teams have a decent approval process and then lose time after the approval. Finance signs off, and a coordinator has to notice, open a new ticket, and copy the details across.

When an approval completes, the job should be created and assigned automatically, with everything from the original request carried over. No retyping, and no second system to check.

## 3. Shift to shift

Night crews and day crews often share work through a whiteboard or a logbook. If the incoming lead misses a line, a half-finished task waits another full shift.

A structured shift handoff lists open jobs, blocked jobs, and anything waiting on parts, and asks the incoming lead to acknowledge it. The exact format matters less than the acknowledgment.

## 4. New hire to equipped and ready

Onboarding touches HR, IT, facilities, and the hiring manager. Each team knows its own step but not where the others are, so new hires arrive without a badge, a laptop, or a vehicle assignment.

A single onboarding workflow, started by the hire date, gives every team its task, a due date, and a view of the whole checklist. Everyone can see what is left before day one.

## 5. Job complete to requester informed

The last handoff is the one most teams skip: telling the person who asked that the work is done. Without it, requesters keep following up on finished work, and the team spends time answering questions about jobs that are already closed.

Closing a job should notify the requester automatically, with a short note and a photo when it helps.

## How to choose your first one

Score each candidate handoff with three questions:

- How often does it happen each week?
- How many teams does it cross?
- How would you know if it failed?

The best first candidate happens often, crosses at least two teams, and currently fails without anyone noticing until later. Pick one, map how it works today with the people who do it, and automate only that.

Once it has run well for a month, the second handoff is much easier to make the case for, because the team has already seen what changes.`),
  heroImage: s.img(5), author: elliot, publishDate: "2026-09-22",
  topics: ["handoffs", "automation", "field operations"], relatedPage: customers, cta: articleStory,
  seoTitle: "Five handoffs worth automating first | Lumenwork",
  seoDescription: "Start automating the handoffs that happen daily, cross teams, and fail quietly. Five common candidates and a simple way to choose.",
});

// ---------- Brand ----------

const navigation = [
  s.item("nav-solutions", { title: "Solutions", link: solutions }),
  s.item("nav-pricing", { title: "Pricing", link: pricing }),
  s.item("nav-customers", { title: "Customers", link: customers }),
  s.item("nav-resources", { title: "Resources", link: resources }),
];
const footerLinks = [
  s.item("footer-intake", { title: "Intake and requests", link: intake }),
  s.item("footer-approvals", { title: "Approvals", link: approvals }),
  s.item("footer-field-operations", { title: "Field operations", link: fieldOps }),
  s.item("footer-pricing", { title: "Pricing", link: pricing }),
  s.item("footer-customer-story", { title: "Customer story", link: customers }),
  s.item("footer-resources", { title: "Resources", link: resources }),
];

s.brand({
  name: "Lumenwork", slug: "lumenwork", vertical: "b2b_saas",
  shortDescription: "Workflow and operations software for operations teams.",
  tagline: "Operations, in clear view.", logo: s.logo, favicon: s.favicon,
  colorBrand: "#1F2A44", colorButton: "#F2A33A", colorButtonText: "#1F2A44", colorAccent: "#2F7F7A",
  colorBackground: "#F7F6F2", colorSurface: "#FFFFFF", colorText: "#1C1F26", colorMuted: "#5B6170",
  fontHeading: "Space Grotesk", fontBody: "Inter", buttonRadius: 8, buttonTextCase: "normal",
  voiceDescription: "Clear, practical, confident. Speaks to operations leads in plain language and leads with outcomes.",
  voiceDos: [
    "Name real workflow moments, such as intake, approvals, and handoffs.",
    "Use short sentences.",
    "Label any figures as illustrative.",
  ],
  voiceDonts: [
    "Avoid hype and buzzwords.",
    "Never name real customers.",
    "Do not mention experimentation, CMS, or marketing technology.",
  ],
  photoDirection: "Operations teams in daylight offices, warehouses, and field sites, working together. Screens show nothing readable. No logos.",
  navigation, headerCta: bookDemo, footerLinks,
  promoBarText: "New: approval templates for finance and HR teams.",
  address: "410 Foundry Lane, Suite 300\nHalverton, CO 80999",
  phone: "(970) 555-0142",
  legalDisclaimer: "Fictional company. Sample content for illustration only.",
  homePage: home,
});

export default s.entries;
