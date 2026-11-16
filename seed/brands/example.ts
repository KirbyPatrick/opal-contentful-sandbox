import { assetLink, defineBrand, md } from "../lib/builders";

const s = defineBrand("example", "ex");

/**
 * Example: a sandbox brand with one page, rendered at /example by src/app/example.
 * It currently recreates a clinical laboratory's dementia testing campaign page (the control for a landing page
 * test in a demo). The layout lives in src/app/example; the copy below lives in Contentful so Opal can edit it,
 * and npm run reset puts it back after a demo. The copy is written for this sandbox and the page is a mockup.
 *
 * Conventions the layout reads:
 * - **bold** in the hero headline, hero subheadline and section headings marks the heavier phrase.
 * - In the test categories and highlights sections, each level 3 heading starts a new accordion or card.
 * - Stats render as the three tiles under the intro.
 */

const CATALOG = "https://www.mayocliniclabs.com/test-catalog";
const C2AD2 = "https://www.mayocliniclabs.com/test-catalog/overview/621652";
const C2AD2_APOE = "https://www.mayocliniclabs.com/test-catalog/overview/621654";
const INSIGHTS = "https://news.mayocliniclabs.com/";
const HOME = "https://www.mayocliniclabs.com/";

// ---------- Intro and figures ----------
const intro = s.richText("intro", {
  internalName: "Example - Home - Intro", heading: "**Focused dementia testing** for a complex diagnostic journey",
  body: md(`As research continues to confirm the value of fluid biomarkers in detecting the brain changes linked to Alzheimer's disease and related dementias, the number of blood and cerebrospinal fluid tests available to clinicians has grown quickly. Choosing the right test for risk assessment, diagnosis or prognosis is harder when symptoms overlap.

We help reduce that uncertainty with a full portfolio of fluid biomarker, genetic and antibody testing for Alzheimer's disease and related dementias. Our assays are developed and reviewed by laboratory and clinical specialists with decades of experience in dementia care, so you have dependable answers at each point in your patient's evaluation.`),
});

const figures = s.stats("figures", {
  internalName: "Example - Home - Figures",
  items: [
    s.item("stat-primary-care", { value: "61%", title: "of Alzheimer's disease cases correctly identified in primary care with standard assessment" }),
    s.item("stat-biomarker", { value: ">90%", title: "diagnostic accuracy when a validated fluid biomarker test is added" }),
    s.item("stat-prevalence", { value: "1 in 9", title: "adults age 65 and older in the United States live with Alzheimer's dementia" }),
  ],
  footnote: "Illustrative figures summarized from the published references listed at the end of this page.",
});

// ---------- Expertise ----------
const expertise = s.richText("expertise", {
  internalName: "Example - Home - Expertise", heading: "From specimen to interpretation: expertise you can trust",
  body: md(`Objective biomarker results help confirm what is driving cognitive decline, so patients can move to appropriate care sooner. With our collaborators, we offer a broad menu of blood and cerebrospinal fluid testing for Alzheimer's disease, Alzheimer's disease with mixed pathology, dementia with Lewy bodies, autoimmune dementia, rapidly progressive dementia including Creutzfeldt-Jakob disease, and hereditary dementias.

Our integration with Mayo Clinic practice keeps test development focused on results that change patient management, and our specialists are available to discuss test selection and interpretation.`),
});

const quote = s.richText("expertise-quote", {
  internalName: "Example - Home - Expert quote",
  body: md(`> Biomarker testing is becoming a routine part of the cognitive evaluation. The aim is not more testing, but the right test at the right point in the workup, with an interpretation the ordering clinician can act on.

**A Mayo Clinic Laboratories neurology expert**`),
});

// ---------- Test categories (accordions) ----------
const categories = s.richText("test-categories", {
  internalName: "Example - Home - Test categories",
  body: md(`### Alzheimer's disease blood testing

Plasma testing can support the evaluation of adults with mild cognitive impairment or dementia when interpreted alongside a clinical assessment.

- **PrecivityAD2, Plasma** (Mayo ID: C2AD2). Measures the amyloid beta 42/40 ratio and percent p-tau217 and reports an Amyloid Probability Score 2. Offered in collaboration with C2N Diagnostics. [View test details](${C2AD2})
- **PrecivityAD2 with reflex to apolipoprotein E, Plasma**. Adds apolipoprotein E genotyping when the PrecivityAD2 result is positive. [View test details](${C2AD2_APOE})

### Alzheimer's disease cerebrospinal fluid (CSF) testing

Cerebrospinal fluid amyloid and tau measures remain an established option when a lumbar puncture is part of the workup or when blood results need confirmation.

[Browse CSF tests in our catalog](${CATALOG})

### Mixed pathology and dementia with Lewy bodies testing

Seed amplification testing for alpha-synuclein helps identify Lewy body pathology, which often occurs alongside Alzheimer's disease.

[Browse synucleinopathy tests](${CATALOG})

### Autoimmune dementia testing

Antibody evaluations in serum and spinal fluid help identify autoimmune causes of cognitive decline that may respond to treatment.

[Browse autoimmune neurology tests](${CATALOG})

### Hereditary Alzheimer's disease and dementia testing

Genetic panels and apolipoprotein E genotyping support the evaluation of early-onset and familial presentations.

[Browse genetic dementia tests](${CATALOG})

### Rapidly progressive dementia testing

Real-time quaking-induced conversion and related spinal fluid testing help distinguish prion disease from other causes of rapid decline.

[Browse rapidly progressive dementia tests](${CATALOG})

### Glial fibrillary acidic protein testing

Glial fibrillary acidic protein is a marker of astrocyte activation that can add context to amyloid and tau findings.

[Browse GFAP testing](${CATALOG})

### Neurofilament light chain testing

Neurofilament light chain reflects neuroaxonal injury across a range of neurodegenerative conditions.

[Browse neurofilament light chain testing](${CATALOG})`),
});

// ---------- Test menu ----------
const menu = s.richText("test-menu", {
  internalName: "Example - Home - Test menu", heading: "One-stop laboratory solution",
  body: md(`When blood-based testing does not give a definitive answer, our full dementia test menu covers the next steps.

| Alzheimer's disease | Prion disease | Autoimmune dementia | Genetic testing | Nonspecific | Synucleinopathies |
| --- | --- | --- | --- | --- | --- |
| Plasma biomarker testing | Rapidly progressive dementia evaluation | Autoimmune and paraneoplastic antibody testing | Apolipoprotein E genotyping | Neurofilament light chain | Spinal fluid alpha-synuclein seed amplification |
| Cerebrospinal fluid biomarker testing | Creutzfeldt-Jakob disease testing | | NOTCH3 full-gene analysis | Glial fibrillary acidic protein | |
| | | | Inherited frontotemporal dementia and ALS panel | | |
| | | | Early-onset familial testing | | |`),
});

// ---------- Highlights (cards) ----------
const highlights = s.richText("highlights", {
  internalName: "Example - Home - Highlights", heading: "Highlights",
  body: md(`### Blood-based biomarkers for Alzheimer's disease: an introduction

A short presentation on how plasma biomarkers fit into the evaluation of cognitive impairment.

[Learn more](${INSIGHTS})

### Join our webinar with C2N Diagnostics on blood biomarker testing for Alzheimer's disease

Our laboratory specialists and C2N Diagnostics discuss ordering, specimen handling and how to read an Amyloid Probability Score.

[Register](${INSIGHTS})

### A practical approach to testing in mild cognitive impairment

How to sequence testing in the cognitive neurology clinic, from first visit to specialist referral.

[Learn more](${INSIGHTS})

### Advancing precision diagnostics for neurodegenerative disorders

Seed amplification testing brings new accuracy to the diagnosis of Parkinson's disease and dementia with Lewy bodies.

[Learn more](${INSIGHTS})

### Understanding cerebrospinal fluid biomarkers

What amyloid and tau measures in spinal fluid add to the diagnosis of Alzheimer's disease.

[Learn more](${INSIGHTS})

### Podcast: what new diagnostics mean for neurodegenerative disease

Laboratory leaders discuss how new assays are changing the diagnostic pathway.

[Listen now](${INSIGHTS})

### Neurodegenerative diseases: diagnostic advancements

A continuing education course on assessment and testing options for patients with neurodegenerative disease.

[Learn more](${INSIGHTS})

### Distinguishing prion disease in rapidly progressive dementia

How spinal fluid testing separates prion disease from other causes of rapid cognitive decline.

[Learn more](${INSIGHTS})

### Building a diagnostic ecosystem for timely Alzheimer's testing

How a connected test menu helps physicians order the right test the first time.

[Learn more](${INSIGHTS})

### Podcast: expanding access to Alzheimer's testing

Our specialists discuss plasma testing and what it means for patients far from a memory clinic.

[Listen now](${INSIGHTS})

### Specimen collection for plasma biomarker testing

Collection, processing and frozen shipping requirements that protect plasma biomarker results.

[Learn more](${INSIGHTS})

### Interpreting results across the dementia test menu

A reference for reading amyloid, tau and neurodegeneration markers together.

[Learn more](${INSIGHTS})`),
});

// ---------- Closing call to action ----------
const appointment = s.cta("appointment", {
  internalName: "Example - Home - Schedule an appointment", heading: "Let us help you dial in **your patient's diagnosis**",
  body: "Take the next step toward accurate, clinically relevant plasma and cerebrospinal fluid biomarker results. Schedule an appointment with a member of our team.",
  label: "Schedule an appointment", goalType: "link", destinationUrl: HOME, style: "primary",
});

// ---------- Resources and references ----------
const resources = s.richText("resources", {
  internalName: "Example - Home - Resources", heading: "Resources",
  body: md(`- **Download** [Dementia fluid biomarker testing guide](${INSIGHTS})
- **View** [Dementia test menu](${CATALOG})
- **Download** [Neurology test request form](${HOME})`),
});

const references = s.richText("references", {
  internalName: "Example - Home - References", heading: "References",
  body: md(`1. Alzheimer's Association. 2024 Alzheimer's disease facts and figures. *Alzheimers Dement*. 2024;20(5):3708-3821.
2. Palmqvist S, Tideman P, Mattsson-Carlgren N, et al. Blood biomarkers to detect Alzheimer disease in primary and secondary care. *JAMA*. 2024;332(15):1245-1257.`),
});

// ---------- Page and brand ----------
const hero = s.hero("home", {
  internalName: "Example - Home - Hero", eyebrow: "Neurology",
  headline: "One trusted laboratory for **the full dementia workup**",
  subheadline: "A complete dementia test menu for each stage of evaluation, backed by laboratory specialists who help you interpret every result.",
  image: assetLink("img-example-01"), layout: "full_bleed",
});

const home = s.page("home", {
  title: "Dementia testing", slug: "home", pageType: "home", funnelStep: 0, hero,
  sections: [intro, figures, expertise, quote, categories, menu, highlights, appointment, resources, references],
  seoTitle: "Dementia testing",
  seoDescription: "Fluid biomarker, genetic and antibody testing for Alzheimer's disease and related dementias, with specialist support for test selection and interpretation.",
});

s.brand({
  name: "Example",
  slug: "example",
  vertical: "healthcare",
  shortDescription: "Sandbox page for recreating a prospect's web page in a demo. Currently a clinical laboratory's dementia testing campaign page.",
  // A logo is required, but the Example page draws its own header, so it borrows an existing one.
  logo: assetLink("logo-ledgerwood-bank"),
  colorBrand: "#1F5BC0", colorButton: "#1F5BC0", colorButtonText: "#FFFFFF", colorAccent: "#0E8A9C",
  colorBackground: "#FFFFFF", colorSurface: "#F2F4F7", colorText: "#111111", colorMuted: "#4D4D4D",
  fontHeading: "Inter", fontBody: "Inter", buttonRadius: 4, buttonTextCase: "normal",
  voiceDescription: "Measured, clinical and evidence based. Speaks to neurologists, primary care physicians and laboratory directors in the first person plural, explaining what each test adds to a dementia evaluation without hype.",
  voiceDos: [
    "Write in the first person plural (we, our)",
    "Name tests precisely, with the Mayo ID where one exists",
    "Support claims with published references",
    "Use sentence case",
  ],
  voiceDonts: [
    "No hype or exclamation marks",
    "No promises about outcomes for individual patients",
    "No em dashes",
  ],
  address: "200 Placeholder Avenue SW\nRochester, MN 55905",
  phone: "(507) 555-0142",
  legalDisclaimer: "Fictional company. Sample content for illustration only. This sandbox page recreates a prospect's campaign page for a product demo.",
  homePage: home,
});

export default s.entries;
