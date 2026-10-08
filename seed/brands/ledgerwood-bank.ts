import { defineBrand, md } from "../lib/builders";

const s = defineBrand("ledgerwood-bank", "lb");

/**
 * Ledgerwood Bank seed content. Funnel:
 * home (1) -> products/{product} (2) -> rates (3) -> apply (4, goal).
 * Insights is the off-funnel article index. Every rate and fee is illustrative.
 */

// ---------- People ----------
const elena = s.person("elena-marsh", {
  name: "Elena Marsh", slug: "elena-marsh", role: "author", jobTitle: "Savings and budgeting editor",
  bio: "Elena Marsh writes Ledgerwood's guides on saving and everyday budgeting. She spent several years helping customers open their first accounts before joining the bank's education team.",
});
const theo = s.person("theo-okafor", {
  name: "Theo Okafor", slug: "theo-okafor", role: "author", jobTitle: "Lending education lead",
  bio: "Theo Okafor explains how credit cards and loans are priced, with a focus on reading the terms before you sign. He previously worked on Ledgerwood's personal loan team.",
});
const robin = s.person("robin-ashdown", {
  name: "Robin Ashdown", slug: "robin-ashdown", role: "customer", jobTitle: "Owner and potter",
  organization: "Fernhill Pottery", photo: s.img(9),
  bio: "Robin Ashdown runs Fernhill Pottery, a small studio that sells handmade tableware at weekend markets and through a few local shops.",
});

// ---------- Offerings ----------
const checking = s.offering("everyday-checking", {
  name: "Everyday Checking", slug: "everyday-checking", offeringType: "bank_product",
  summary: "A checking account with no monthly fee, no overdraft fees on debit purchases, and $25 to open. Illustrative terms, not an offer.",
  description: md(`## A checking account without the guesswork

Everyday Checking is built for the money that comes in and goes out each month: paychecks, rent, groceries, and the bills in between. There is no monthly maintenance fee and no minimum balance to keep, so holding the account costs nothing.

## How overdrafts work

If a debit card purchase would take your balance below zero, we decline it instead of charging an overdraft fee. You can also link a Ledgerwood savings account. When a check or scheduled payment would overdraw checking, we move the amount over from savings at no cost and send you a notice. Without a linked account, the payment is returned unpaid. We do not charge a returned item fee, though the company you were paying may charge its own.

## Everyday tools

- A debit card you can lock from the app if it goes missing
- Mobile check deposit by photo
- Alerts for low balances, large purchases, and incoming deposits
- Bill pay and transfers to accounts at other banks

## What it costs

The fee schedule is short. There is no fee for the account itself, for debit card purchases, or for transfers between Ledgerwood accounts. A few optional services carry a fee, such as an expedited replacement card for $15, and the app shows the amount before you confirm.

## Opening an account

You can open Everyday Checking online with $25 and a valid photo ID. Most applications take about 10 minutes, and your account number is ready as soon as your identity is confirmed.

The fees and minimums on this page are illustrative and describe a sample account, not a real offer.`),
  images: [s.img(10), s.img(1)],
  priceLabel: "$0 monthly fee (illustrative)",
  features: [
    "No monthly maintenance fee or minimum balance",
    "No overdraft fees on debit card purchases",
    "Free overdraft transfers from linked savings",
    "Debit card lock in the app",
    "Mobile check deposit and bill pay",
    "Open online with $25",
  ],
  specs: [
    "APY (illustrative): Not applicable",
    "APR (illustrative): Not applicable",
    "Monthly fee: $0",
    "Minimum to open: $25",
    "Rewards: Not applicable",
    "Minimum balance: None",
    "Overdraft fee: $0",
    "Returned item fee: $0",
    "Expedited card replacement: $15",
  ],
  finePrint: "Illustrative rate, not an offer. The fees and minimums shown are examples for this sample site and do not describe a real account.",
  seoTitle: "Everyday Checking with no monthly fee | Ledgerwood Bank",
  seoDescription: "A checking account with no monthly fee, no overdraft fees on debit purchases, and $25 to open. Illustrative terms, not an offer.",
});

const savings = s.offering("high-yield-savings", {
  name: "High-Yield Savings", slug: "high-yield-savings", offeringType: "bank_product",
  summary: "Earn a variable 4.10% APY on any balance, with no monthly fee and no minimum to open. Illustrative rate, not an offer.",
  description: md(`## One rate on every dollar

High-Yield Savings pays a variable 4.10% APY on your whole balance, starting with the first dollar. There are no balance tiers to track and no monthly fee, so the rate you see is the rate your money earns.

## How interest is paid

Interest compounds daily and is paid into the account at the end of each monthly statement cycle. As an example, $5,000 held for a full year at 4.10% APY would earn about $205, assuming the rate and balance stay the same.

Because the rate is variable, it can change after you open the account. We post any change on the rates page and notify you before it takes effect.

## Built for setting money aside

- Name up to 10 savings goals inside one account
- Schedule automatic transfers weekly, every other week, or monthly
- Round up Everyday Checking debit purchases and move the change to savings
- Move money to Ledgerwood checking right away, or to another bank in 1 to 2 business days

## What it costs

Nothing to open and nothing to hold. There is no monthly fee, no minimum balance, and no charge for transfers to Ledgerwood accounts or to accounts at other banks.

## Opening an account

Most people open High-Yield Savings online in about 10 minutes. You can fund it with a transfer from another bank, and there is no minimum opening deposit.

The APY and figures on this page are illustrative for this sample site and are not an offer.`),
  images: [s.img(5)],
  priceLabel: "4.10% APY (illustrative)",
  badge: "Most popular",
  features: [
    "Variable 4.10% APY on any balance (illustrative)",
    "No monthly fee and no minimum to open",
    "Interest compounded daily, paid monthly",
    "Up to 10 named savings goals in one account",
    "Automatic transfers and debit card round-ups",
    "Open online in about 10 minutes",
  ],
  specs: [
    "APY (illustrative): 4.10% variable",
    "APR (illustrative): Not applicable",
    "Monthly fee: $0",
    "Minimum to open: $0",
    "Rewards: Not applicable",
    "Balance to earn the APY: Any balance",
    "Interest: Compounded daily, paid monthly",
    "Transfers to other banks: Free, 1 to 2 business days",
  ],
  finePrint: "Illustrative rate, not an offer. The APY shown is a sample variable rate for this demo site and does not describe a real account.",
  seoTitle: "High-Yield Savings account | Ledgerwood Bank",
  seoDescription: "Earn an illustrative 4.10% APY on any balance, with no monthly fee and no minimum to open. Illustrative rate, not an offer.",
});

const card = s.offering("cash-back-card", {
  name: "Cash Back Card", slug: "cash-back-card", offeringType: "bank_product",
  summary: "Earn 1.5% cash back on every purchase, with no annual fee and no foreign transaction fees. Illustrative terms, not an offer of credit.",
  description: md(`## Cash back without categories

The Cash Back Card earns 1.5% back on every purchase. There are no categories to activate and no cap on what you can earn. Cash back is added each statement cycle, and you can redeem it in any amount as a statement credit or a deposit into Ledgerwood checking or savings.

## What it costs

There is no annual fee and no foreign transaction fee. The purchase APR is variable, from 19.99% to 28.99%, and the rate you receive depends on your credit history.

If you pay your full statement balance by the due date each month, you are not charged interest on purchases. If you carry a balance past the due date, interest is charged on that balance at your APR.

A few fees can apply, and each one is listed here so you know what triggers it:

- **Late payment:** up to $30 if the minimum payment arrives after the due date
- **Cash advance:** 5% of the amount or $10, whichever is greater
- **Balance transfer:** 3% of each transfer

## Controls in the app

Lock the card if it goes missing, set alerts for purchases over an amount you choose, and see pending charges as they happen. You can add authorized users at no cost and set a spending limit for each one.

## Applying

Applying takes about 10 minutes. We review your credit history and income to make a decision and set your credit limit, so approval is not guaranteed.

The rates, rewards, and fees on this page are illustrative and are not an offer of credit.`),
  images: [s.img(6)],
  priceLabel: "1.5% cash back (illustrative)",
  features: [
    "1.5% cash back on every purchase, no categories",
    "No annual fee",
    "No foreign transaction fees",
    "Redeem cash back in any amount",
    "Card lock and real-time purchase alerts",
    "Free cards for authorized users",
  ],
  specs: [
    "APY (illustrative): Not applicable",
    "APR (illustrative): 19.99% to 28.99% variable",
    "Monthly fee: $0, no annual fee",
    "Minimum to open: Not applicable",
    "Rewards: 1.5% cash back on every purchase",
    "Annual fee: $0",
    "Foreign transaction fee: None",
    "Late payment fee: Up to $30",
    "Cash advance fee: 5% or $10, whichever is greater",
    "Balance transfer fee: 3% of each transfer",
  ],
  finePrint: "Illustrative rate, not an offer. The APR range, rewards, and fees shown are samples, and any real card decision would depend on a review of credit history and income.",
  seoTitle: "Cash Back Card with no annual fee | Ledgerwood Bank",
  seoDescription: "Earn 1.5% cash back on every purchase, with no annual fee and no foreign transaction fees. Illustrative terms, not an offer of credit.",
});

const loan = s.offering("personal-loan", {
  name: "Personal Loan", slug: "personal-loan", offeringType: "bank_product",
  summary: "Borrow $2,000 to $40,000 at a fixed APR from 7.49%, with no origination fee and no prepayment penalty. Illustrative rate, not an offer.",
  description: md(`## A fixed rate and a fixed end date

A Ledgerwood Personal Loan gives you one lump sum and the same monthly payment for the life of the loan. People use it to consolidate higher-rate card balances, pay for a home repair, or cover the costs of a move. Loan amounts run from $2,000 to $40,000, with terms of 24 to 60 months.

## What it costs

The APR is fixed, from 7.49% to 21.99%, and depends on your credit history, income, the amount, and the term. There is no origination fee, so your APR equals your interest rate. There is no penalty for paying the loan off early.

As an example, a $10,000 loan over 36 months at 9.99% APR would have a monthly payment of about $323. Over the full term, you would pay about $1,614 in interest.

A late fee of up to $25 applies if a payment arrives more than 10 days after its due date.

## How applying works

1. Apply online with your income and the amount you need.
2. We review your credit history and show a decision, with the rate and term options available to you.
3. Choose a term, read the full loan agreement, and sign electronically.
4. Funds are typically deposited within 2 business days after you sign.

Approval is not guaranteed, and the rate you are offered may be higher than the lowest rate shown. All rates and figures on this page are illustrative.`),
  images: [s.img(4), s.img(3)],
  priceLabel: "From 7.49% APR (illustrative)",
  features: [
    "Borrow $2,000 to $40,000",
    "Fixed APR and a fixed monthly payment",
    "Terms from 24 to 60 months",
    "No origination fee",
    "No prepayment penalty",
    "Funds typically deposited within 2 business days of signing",
  ],
  specs: [
    "APY (illustrative): Not applicable",
    "APR (illustrative): 7.49% to 21.99% fixed",
    "Monthly fee: $0, no origination fee",
    "Minimum to open: Not applicable",
    "Rewards: Not applicable",
    "Loan amounts: $2,000 to $40,000",
    "Terms: 24 to 60 months",
    "Origination fee: $0",
    "Prepayment penalty: None",
    "Late payment fee: Up to $25",
  ],
  finePrint: "Illustrative rate, not an offer. The APR range and terms are samples, and a real rate would depend on credit history, income, loan amount, and term.",
  seoTitle: "Personal Loan with a fixed APR | Ledgerwood Bank",
  seoDescription: "Borrow $2,000 to $40,000 with a fixed APR, terms of 24 to 60 months, and no origination fee. Illustrative rate, not an offer.",
});

const products = [checking, savings, card, loan];

// ---------- CTAs ----------
const openAccount = s.cta("open-account", {
  internalName: "Ledgerwood Bank - Global - Open an account", label: "Open an account",
  goalType: "start_application", destinationPage: s.ref("page", "apply"), style: "primary",
});
const exploreAccounts = s.cta("explore-accounts", {
  internalName: "Ledgerwood Bank - Home - Explore accounts", label: "Explore accounts",
  goalType: "link", destinationPage: s.ref("page", "products"), style: "secondary",
});
const seeRates = s.cta("see-rates", {
  internalName: "Ledgerwood Bank - Home - See rates and fees", label: "See rates and fees",
  goalType: "link", destinationPage: s.ref("page", "rates"), style: "secondary",
});
const openAccountBand = s.cta("open-account-band", {
  internalName: "Ledgerwood Bank - Global - Open an account band", label: "Open an account",
  goalType: "start_application", destinationPage: s.ref("page", "apply"), style: "primary",
  heading: "Open an account when you are ready",
  body: "One online application covers checking, savings, the Cash Back Card, and personal loans. You review every term before you submit.",
});
const compareRates = s.cta("compare-rates", {
  internalName: "Ledgerwood Bank - Products - Compare rates", label: "Compare rates",
  goalType: "next_step", style: "primary",
});
const compareRatesBand = s.cta("compare-rates-band", {
  internalName: "Ledgerwood Bank - Products - Compare rates band", label: "Compare rates",
  goalType: "next_step", style: "primary",
  heading: "Compare all four accounts in one table",
  body: "The rates page puts every illustrative APY, APR, fee, and minimum to open in a single table.",
});
const ratesLinkBand = s.cta("rates-link-band", {
  internalName: "Ledgerwood Bank - Insights - Compare rates band", label: "Compare rates",
  goalType: "link", destinationPage: s.ref("page", "rates"), style: "primary",
  heading: "Put the numbers next to each other",
  body: "See every illustrative rate, fee, and minimum to open across our four accounts in one table.",
});
const openSavings = s.cta("open-savings", {
  internalName: "Ledgerwood Bank - Article - Open a savings account", label: "Open a savings account",
  goalType: "start_application", destinationPage: s.ref("page", "apply"), style: "primary",
  heading: "Start your fund with automatic transfers",
  body: "High-Yield Savings has no minimum to open and lets you schedule transfers from the first day. Illustrative rate, not an offer.",
});

// ---------- Home blocks ----------
const homeHero = s.hero("home", {
  internalName: "Ledgerwood Bank - Home - Hero",
  eyebrow: "Personal banking",
  headline: "Everyday banking, with the math shown up front",
  subheadline: "Checking, savings, a cash back card, and personal loans, with every rate and fee listed before you apply.",
  image: s.img(1), layout: "split", cta: openAccount, secondaryCta: exploreAccounts,
});
const homeProducts = s.cardGrid("home-products", {
  internalName: "Ledgerwood Bank - Home - Products grid",
  heading: "Accounts for spending, saving, and borrowing",
  intro: "Each account lists its rate, fees, and minimum to open on its own page. All rates are illustrative.",
  source: "manual", items: products, layout: "cards", columns: 4, cta: exploreAccounts,
});
const homeFees = s.mediaText("home-fees", {
  internalName: "Ledgerwood Bank - Home - Fees in plain language",
  eyebrow: "How we handle fees",
  heading: "See every fee before you sign",
  body: "Every fee we charge is listed on our rates and fees page, with the amount, when it applies, and how to avoid it. The list is short: Everyday Checking and High-Yield Savings have no monthly fee, the Cash Back Card has no annual fee, and the Personal Loan has no origination fee.\n\nBefore you submit an application, we show the full terms again, so what you agree to matches what you read here.",
  image: s.img(2), imagePosition: "left", cta: seeRates,
});
const homeStats = s.stats("home-numbers", {
  internalName: "Ledgerwood Bank - Home - Numbers",
  heading: "Our accounts, by the numbers",
  items: [
    s.item("stat-checking-fee", { title: "Monthly fee on Everyday Checking", value: "$0" }),
    s.item("stat-savings-apy", { title: "APY on High-Yield Savings, variable", value: "4.10%" }),
    s.item("stat-cash-back", { title: "Cash back on every card purchase", value: "1.5%" }),
    s.item("stat-open-time", { title: "Typical time to open savings online", value: "10 min" }),
  ],
  footnote: "Figures are illustrative and are not offers. Ledgerwood Bank is a fictional company.",
});
const homeQuote = s.testimonial("fernhill-pottery", {
  internalName: "Ledgerwood Bank - Home - Customer quote",
  quote: "Studio sales are seasonal, so every Friday in summer a set amount moves into savings on its own. By January I know exactly what I have to work with, and I have never had to guess what a fee would be.",
  person: robin,
});

// ---------- Products template blocks ----------
const productsHero = s.hero("products", {
  internalName: "Ledgerwood Bank - Products - Hero",
  eyebrow: "Accounts and loans",
  headline: "Four accounts, each with its terms on one page",
  subheadline: "See what each account costs and what it takes to open, then apply for any of them in one online application.",
  image: s.img(7), layout: "split", cta: compareRates,
});
const productsGrid = s.cardGrid("products-all", {
  internalName: "Ledgerwood Bank - Products - All products grid",
  heading: "Choose an account",
  intro: "Select an account to see how it works, what it costs, and how to open it.",
  source: "manual", items: products, layout: "cards", columns: 2,
});
const productsFaq = s.faq("products-fees-and-applying", {
  internalName: "Ledgerwood Bank - Products - Fees and applying FAQ",
  heading: "Fees and applying, answered",
  items: [
    s.item("faq-monthly-fees", {
      title: "Do your accounts have monthly fees?",
      text: "Everyday Checking and High-Yield Savings have no monthly maintenance fee and no minimum balance. The Cash Back Card has no annual fee, and the Personal Loan has no origination fee. A few event-based fees can apply, such as a late payment fee on the card or loan. Each product page lists those fees with the amount and what triggers them.",
    }),
    s.item("faq-overdraft", {
      title: "What happens if I try to spend more than my checking balance?",
      text: "A debit card purchase that would overdraw your account is declined, and there is no fee. If you link a Ledgerwood savings account, we cover checks and scheduled payments by moving money over from savings, also at no cost, and send you a notice when it happens.",
    }),
    s.item("faq-how-to-apply", {
      title: "How does applying work?",
      text: "Choose an account and complete one online application. Most people finish in about 10 minutes. We ask for your contact details and home address, plus your income if you are applying for the card or a loan. Before you submit, you see every rate and fee for the account you chose.",
    }),
    s.item("faq-what-you-need", {
      title: "What do I need to have ready?",
      text: "A valid photo ID, your home address, and a way to fund a new checking or savings account, such as a transfer from another bank. For the Cash Back Card or a Personal Loan, have your annual income and your monthly housing cost on hand.",
    }),
    s.item("faq-credit-review", {
      title: "Will applying involve a credit review?",
      text: "Checking and savings applications use an identity check. Applications for the Cash Back Card and the Personal Loan include a review of your credit history and income, which shapes the decision and the rate or credit limit you are offered. Approval is not guaranteed.",
    }),
    s.item("faq-timing", {
      title: "How soon can I use a new account?",
      text: "Checking and savings accounts are usually ready the same day your identity is confirmed, and a debit card arrives by mail in 7 to 10 business days. Personal Loan funds are typically deposited within 2 business days after you sign the loan agreement.",
    }),
    s.item("faq-real-rates", {
      title: "Are these real rates?",
      text: "No. Ledgerwood Bank is a fictional company, and every rate, fee, and figure on this site is illustrative. Nothing here is an offer of a deposit account or of credit.",
    }),
  ],
});

// ---------- Rates blocks ----------
const ratesHero = s.hero("rates", {
  internalName: "Ledgerwood Bank - Rates - Hero",
  eyebrow: "Rates and fees",
  headline: "Every rate and fee, side by side",
  subheadline: "Compare APY, APR, monthly fees, and minimums across all four accounts. Every figure is illustrative, not an offer.",
  image: s.img(8), layout: "split", cta: openAccount,
});
const ratesTable = s.comparisonTable("rates-comparison", {
  internalName: "Ledgerwood Bank - Rates - Account comparison",
  heading: "Compare our accounts and loans",
  intro: "One row per term, using the same labels you see on each product page.",
  offerings: products,
  rows: ["APY (illustrative)", "APR (illustrative)", "Monthly fee", "Minimum to open", "Rewards"],
  footnote: "Rates are illustrative and are not offers. Ledgerwood Bank is a fictional company, and no real deposit account or credit is available through this site.",
});
const ratesExplainer = s.richText("rates-apy-apr", {
  internalName: "Ledgerwood Bank - Rates - APY and APR explained",
  heading: "APY and APR, in plain words",
  body: md(`**APY, or annual percentage yield,** is what a savings account earns in a year, including compounding. Compounding means the interest you earn starts earning interest too. At an illustrative 4.10% APY, $5,000 left in High-Yield Savings for a full year would earn about $205, if the rate and balance stayed the same. When you compare savings accounts, a higher APY means more earned.

**APR, or annual percentage rate,** is the yearly cost of borrowing. For a loan, it includes interest and certain fees. Because our Personal Loan has no origination fee, its APR equals its interest rate. On the Cash Back Card, the APR applies only to balances you carry past the due date. When you compare loans or cards, a lower APR means less paid.

A few things to keep in mind:

- A **fixed** rate, like the Personal Loan APR, stays the same for the life of the loan.
- A **variable** rate, like the savings APY and the card APR, can change after you open the account.
- Compare APY with APY and APR with APR. The two are not measured the same way.

Every figure on this page is illustrative and is not an offer.`),
});

// ---------- Apply blocks ----------
const applyHero = s.hero("apply", {
  internalName: "Ledgerwood Bank - Apply - Hero",
  eyebrow: "Apply online",
  headline: "Apply online in about 10 minutes",
  subheadline: "One application for checking, savings, the Cash Back Card, or a personal loan. You see every rate and fee before you submit.",
  image: s.img(3), layout: "split",
});
const applyForm = s.form("start-application", {
  internalName: "Ledgerwood Bank - Apply - Application form",
  formKind: "start_application",
  heading: "Start your application",
  intro: "Choose the account you want, then add your contact details. Most people finish in about 10 minutes, and you can review everything before you submit.",
  submitLabel: "Submit application",
  successHeading: "Your sample application is complete",
  successMessage: "In a real application, we would confirm your identity and email a decision or next steps, usually within one business day. This is a demo site, so nothing was submitted and no one will contact you.",
  privacyNote: "This is a demo. Nothing you enter is sent or stored, and the sample values are fictional.",
  prefillSample: true,
});

// ---------- Insights blocks ----------
const insightsHero = s.hero("insights", {
  internalName: "Ledgerwood Bank - Insights - Hero",
  eyebrow: "Insights",
  headline: "Guides to everyday money questions",
  subheadline: "Short, practical guides on saving, borrowing, and reading the rates on an account.",
  image: s.img(2), layout: "split",
});
const insightsLatest = s.cardGrid("insights-latest", {
  internalName: "Ledgerwood Bank - Insights - Latest articles",
  heading: "Latest guides",
  source: "latest_articles", layout: "cards", columns: 2, limit: 6,
});

// ---------- Pages: steps 1 to 4, plus the article index ----------
const home = s.page("home", {
  title: "Ledgerwood Bank", slug: "home", pageType: "home", funnelStep: 1, nextStep: s.ref("page", "products"),
  hero: homeHero, primaryCta: openAccount,
  sections: [homeProducts, homeFees, homeStats, homeQuote, openAccountBand],
  seoTitle: "Personal banking with clear rates | Ledgerwood Bank",
  seoDescription: "Checking, high-yield savings, a cash back card, and personal loans, with every rate and fee listed before you apply. All rates are illustrative.",
});
const productsPage = s.page("products", {
  title: "Accounts and loans", slug: "products", pageType: "offering_detail", funnelStep: 2, nextStep: s.ref("page", "rates"),
  hero: productsHero, primaryCta: compareRates,
  sections: [productsGrid, productsFaq, compareRatesBand],
  detailSections: [productsFaq, compareRatesBand],
  seoTitle: "Checking, savings, cards, and loans | Ledgerwood Bank",
  seoDescription: "Compare Everyday Checking, High-Yield Savings, the Cash Back Card, and the Personal Loan, with what each one costs and what you need to apply.",
});
const rates = s.page("rates", {
  title: "Rates and fees", slug: "rates", pageType: "standard", funnelStep: 3, nextStep: s.ref("page", "apply"),
  hero: ratesHero, primaryCta: openAccount,
  sections: [ratesTable, ratesExplainer, openAccountBand],
  seoTitle: "Rates and fees compared | Ledgerwood Bank",
  seoDescription: "See illustrative APY, APR, monthly fees, and minimums for all four Ledgerwood accounts in one table, plus a plain guide to APY and APR.",
});
const apply = s.page("apply", {
  title: "Open an account", slug: "apply", pageType: "goal", funnelStep: 4,
  hero: applyHero, sections: [applyForm],
  seoTitle: "Open an account online | Ledgerwood Bank",
  seoDescription: "Apply for checking, savings, the Cash Back Card, or a personal loan in about 10 minutes. This demo form does not send or store anything.",
});
const insights = s.page("insights", {
  title: "Insights", slug: "insights", pageType: "article_index", funnelStep: 0,
  hero: insightsHero, sections: [insightsLatest, ratesLinkBand],
  seoTitle: "Money guides and insights | Ledgerwood Bank",
  seoDescription: "Practical guides on building savings, reading APR and APY, and understanding what everyday banking products cost.",
});

// ---------- Articles ----------
s.article("emergency-fund-in-steps", {
  title: "How to build an emergency fund, one step at a time",
  slug: "build-an-emergency-fund-in-steps",
  summary: "A full emergency fund can feel out of reach. Breaking it into smaller targets makes it easier to start and easier to keep going.",
  body: md(`The usual advice is to keep three to six months of expenses set aside for emergencies. It is reasonable advice, and for many households it is also a number large enough to stop them from starting. If your essential costs are $3,000 a month, six months is $18,000. That can look less like a goal and more like a wall.

A more workable approach is to treat the fund as a series of smaller targets. Each one is useful on its own, and each one makes the next easier to reach.

## Step 1: Cover a small surprise

Start with $500 to $1,000. That is enough to handle a common surprise, such as a car repair, a vet bill, or a replacement phone, without reaching for a credit card.

To get there, pick a fixed amount you can move every week or every payday, even if it is small. Setting aside $40 a week reaches about $1,000 in six months. Automating the transfer matters more than the amount, because a transfer that happens on its own does not depend on remembering.

## Step 2: Reach one month of essential costs

Next, add up what you must pay each month no matter what:

- Rent or mortgage payment
- Utilities and phone
- Groceries
- Insurance premiums
- Minimum payments on any debt
- Getting to and from work

Leave out the things you could pause in a hard month, like subscriptions or dining out. The total is your essential monthly cost, and one month of it is your second target.

For many people this step takes the longest. It helps to raise your automatic transfer whenever your pay goes up or a debt is paid off, so the fund grows without a new decision each time.

## Step 3: Build to three months

With one month in place, you have time to think when something goes wrong. Three months covers many job changes, larger repairs, or an unplanned move.

At this stage, consider sending part of any irregular money to the fund: a tax refund, a work bonus, or the proceeds from selling something you no longer use. Splitting it, for example half to savings and half to spend, keeps the habit from feeling like a penalty.

## Step 4: Decide whether you need more

Not everyone needs six months. A household with two steady incomes may be comfortable at three. Someone who is self-employed, has seasonal income, or supports a family on one paycheck may want six or more. The right number depends on how long it would realistically take you to replace lost income.

## Where to keep the money

An emergency fund has two jobs: be there quickly when you need it, and earn some interest while it waits. That usually points to a savings account kept separate from your everyday checking, so the money is not spent by accident but can still be moved within a day or two.

When you compare savings accounts, look at:

1. The APY, and whether it applies to your whole balance
2. Monthly fees or minimum balance requirements
3. How quickly you can transfer money out
4. Whether you can schedule automatic transfers

## When you use it

Using the fund is the point, not a setback. When you draw it down, go back to the step you are on and restart the automatic transfer. Many people find the second build goes faster, because the habit is already in place.

*This article is general information, not financial advice. Figures are illustrative examples.*`),
  heroImage: s.img(7), author: elena, publishDate: "2026-08-12",
  topics: ["saving", "emergency fund", "budgeting"], relatedPage: savings, cta: openSavings,
  seoTitle: "Building an emergency fund in steps | Ledgerwood Bank",
  seoDescription: "Break an emergency fund into four smaller targets, from your first $500 to three months of costs, and learn where to keep the money.",
});

s.article("apr-and-apy-explained", {
  title: "APR and APY: what each number tells you",
  slug: "apr-and-apy-explained",
  summary: "APY describes what your savings earn. APR describes what borrowing costs. Here is how to read each one, with worked examples.",
  body: md(`Rates appear on almost every banking product, but they do not all measure the same thing. Two of the most common are APY, which you see on savings accounts, and APR, which you see on loans and credit cards. They sound alike and are calculated differently, and mixing them up can make a product look better or worse than it is.

## APY: what your savings earn

APY stands for annual percentage yield. It tells you how much a deposit account would earn in one year, including the effect of compounding. Compounding means the interest you earn starts earning interest too.

Here is a simple example. Say an account pays 4.10% APY and you deposit $5,000. If the rate and your balance stay the same for a full year, you would end the year with about $5,205. The APY already accounts for how often interest is compounded, so there is no extra math to do.

That is what makes APY useful: it lets you compare savings accounts that compound on different schedules. An account that compounds daily and one that compounds monthly can be compared directly by their APYs.

## APR: what borrowing costs

APR stands for annual percentage rate. It describes the yearly cost of borrowing, and for many loans it includes certain fees as well as interest. That makes it a better comparison tool than the interest rate alone.

For example, two personal loans might both have a 10% interest rate. If one also charges an origination fee taken out of the loan amount, its APR will be higher, because you are paying more to borrow the same money. When a loan has no origination fee, the APR and the interest rate are usually the same.

Credit cards work a little differently. A card's APR applies to balances you carry from one month to the next. If you pay your full statement balance by the due date, most cards do not charge interest on new purchases at all, so the APR matters most when you carry a balance.

## Fixed and variable rates

Both APY and APR can be fixed or variable.

- A **fixed** rate stays the same for a set period. Personal loans often have fixed APRs, so the monthly payment does not change.
- A **variable** rate can move up or down. Savings APYs and credit card APRs are usually variable and can change after you open the account.

When a rate is variable, the number you see today describes today. It is worth checking how and when the bank tells you about changes.

## Questions to ask when you compare

A few questions make side-by-side comparisons clearer:

1. Am I looking at APY or APR? Compare APY with APY and APR with APR, never one with the other.
2. Does the rate apply to the whole balance, or only above a certain amount?
3. Is the rate fixed or variable?
4. For a loan, which fees are included in the APR, and are there any that are not?
5. For a card, will I pay the full balance each month? If so, rewards and fees may matter more to me than the APR.

## An easy way to remember

APY is what the bank pays you. APR is what you pay to borrow. For APY, higher means more earned. For APR, lower means less paid.

*The rates in this article are illustrative examples. This is general information, not financial advice.*`),
  heroImage: s.img(5), author: theo, publishDate: "2026-09-16",
  topics: ["rates", "borrowing", "saving"], relatedPage: rates, cta: ratesLinkBand,
  seoTitle: "APR and APY explained | Ledgerwood Bank",
  seoDescription: "What APY and APR each measure, how fees and compounding affect them, and what to ask when you compare savings accounts, cards, and loans.",
});

// ---------- Brand (references pages defined above) ----------
const link = (key: string, title: string, target: ReturnType<typeof s.ref>) => s.item(key, { title, link: target });

s.brand({
  name: "Ledgerwood Bank", slug: "ledgerwood-bank", vertical: "financial_services",
  shortDescription: "Retail bank offering checking, savings, credit cards, and personal loans.",
  tagline: "Banking that adds up.", logo: s.logo, favicon: s.favicon,
  colorBrand: "#114B3F", colorButton: "#114B3F", colorButtonText: "#FFFFFF", colorAccent: "#C8A24B",
  colorBackground: "#FFFFFF", colorSurface: "#EEF5F1", colorText: "#18221F", colorMuted: "#56625E",
  fontHeading: "Manrope", fontBody: "IBM Plex Sans", buttonRadius: 6, buttonTextCase: "normal",
  voiceDescription: "Precise, modern, and approachable. Ledgerwood explains money the way a patient, well-informed banker would: exact figures, plain words, and no pressure. Every rate is labeled illustrative, and every fee comes with what triggers it.",
  voiceDos: [
    "Label every rate \"Illustrative rate, not an offer\".",
    "Explain fees in plain language: the amount, when it applies, and how to avoid it.",
    "Use exact figures and say what each one includes.",
    "Write short sentences a first-time account holder can follow.",
    "Add a worked example when a number needs context.",
  ],
  voiceDonts: [
    "Claim FDIC insurance or any kind of deposit insurance.",
    "Promise or imply guaranteed approval.",
    "Use real rates or name real banks.",
    "Use urgency, pressure, or limited-time language.",
    "Give personalized financial advice.",
  ],
  photoDirection: "People handling money at home and in cafes, small business owners, new home keys. Phone screens left blank.",
  navigation: [
    link("nav-checking", "Checking", checking),
    link("nav-savings", "Savings", savings),
    link("nav-credit-cards", "Credit Cards", card),
    link("nav-personal-loans", "Personal Loans", loan),
    link("nav-rates", "Rates", rates),
  ],
  headerCta: openAccount,
  footerLinks: [
    link("footer-all-accounts", "All accounts", productsPage),
    link("footer-checking", "Everyday Checking", checking),
    link("footer-savings", "High-Yield Savings", savings),
    link("footer-card", "Cash Back Card", card),
    link("footer-loan", "Personal Loan", loan),
    link("footer-rates", "Rates and fees", rates),
    link("footer-insights", "Insights", insights),
    link("footer-apply", "Apply online", apply),
  ],
  promoBarText: "Open a savings account online in about 10 minutes.",
  address: "300 Exchange Street\nWestbury Falls, OH 43999",
  phone: "(614) 555-0181",
  legalDisclaimer: "Fictional company. Sample content for illustration only. Not a real bank. Not FDIC insured. Rates and figures are illustrative.",
  homePage: home,
});

export default s.entries;
