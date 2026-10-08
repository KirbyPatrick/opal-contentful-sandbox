/**
 * Clearwater Health: a fictional multi-location clinic network in Oregon.
 * Funnel: home (1) -> specialties/{specialty} (2) -> providers/{provider} (3) -> book-an-appointment (4).
 * Copy describes services, visits, and logistics only. Nothing here is medical advice.
 */
import { defineBrand, md } from "../lib/builders";

const s = defineBrand("clearwater-health", "ch");

const name = (page: string, block: string) => `Clearwater Health - ${page} - ${block}`;

// Clinic names, used on provider profiles and location cards.
const LARKFIELD = "Larkfield Clinic";
const HALDEN_SPRINGS = "Halden Springs Clinic";
const SORREL_RIDGE = "Sorrel Ridge Clinic";
const MOSSGROVE = "Mossgrove Clinic";

const goalPage = s.ref("page", "book-an-appointment");
const providersPage = s.ref("page", "providers");

// ---------- CTAs ----------
const bookAppointment = s.cta("book-appointment", {
  internalName: name("Global", "Book an appointment"), label: "Book an appointment", goalType: "book_appointment",
  destinationPage: goalPage, style: "primary",
});
const bookWithProvider = s.cta("book-with-provider", {
  internalName: name("Providers", "Book with this provider"), label: "Book with this provider", goalType: "book_appointment",
  destinationPage: goalPage, style: "primary",
});
const findProvider = s.cta("find-a-provider", {
  internalName: name("Specialties", "Find a provider"), label: "Find a provider", goalType: "link",
  destinationPage: providersPage, style: "primary",
});
const exploreSpecialties = s.cta("explore-specialties", {
  internalName: name("Home", "Explore specialties"), label: "Explore specialties", goalType: "next_step", style: "secondary",
});
const meetProviders = s.cta("meet-providers", {
  internalName: name("Home", "Meet our providers"), label: "Meet our providers", goalType: "link",
  destinationPage: providersPage, style: "secondary",
});
const homeBand = s.cta("home-band", {
  internalName: name("Home", "Booking band"), label: "Book an appointment", goalType: "book_appointment",
  destinationPage: goalPage, style: "primary",
  heading: "New patients are welcome at all four clinics",
  body: "Book online in a few minutes, or call (541) 555-0127 and our scheduling team will help you find a time.",
});
const specialtiesBand = s.cta("specialties-band", {
  internalName: name("Specialties", "Providers band"), label: "Browse providers", goalType: "next_step", style: "primary",
  heading: "Find a provider who fits your schedule",
  body: "See each provider's clinics, languages, and whether they are taking new patients, then book a time that works for you.",
});
const locationsBand = s.cta("locations-band", {
  internalName: name("Locations", "Booking band"), label: "Book an appointment", goalType: "book_appointment",
  destinationPage: goalPage, style: "primary",
  heading: "Book at the clinic that suits you",
  body: "Choose your clinic and time when you book. New patients are welcome at all four locations.",
});

// ---------- People: providers (no photos, initials are shown) ----------
const marisolVance = s.person("marisol-vance", {
  name: "Marisol Vance", slug: "marisol-vance", role: "provider", credentials: "MD", jobTitle: "Family medicine physician",
  bio: "Dr. Marisol Vance is a family medicine physician who sees patients of all ages at our Larkfield and Mossgrove clinics. She joined Clearwater Health in 2017 after completing her residency in a community family medicine program. She likes to keep visits unhurried, leaves time at the end of each appointment for questions, and explains every next step in plain language. Family members are always welcome to join her visits. Outside the clinic, she volunteers with a local youth soccer league.",
  locations: [LARKFIELD, MOSSGROVE], languages: ["English", "Spanish"], acceptingNewPatients: true,
  seoTitle: "Marisol Vance, MD | Family medicine | Clearwater Health",
  seoDescription: "Dr. Marisol Vance is a family medicine physician at our Larkfield and Mossgrove clinics. See her languages and availability, then book a visit.",
});
const priyaRaman = s.person("priya-raman", {
  name: "Priya Raman", slug: "priya-raman", role: "provider", credentials: "DO", jobTitle: "Internal medicine physician",
  bio: "Dr. Priya Raman is an internal medicine physician who cares for adults at our Halden Springs and Sorrel Ridge clinics. Before joining Clearwater Health in 2019, she practiced at a rural community clinic in eastern Oregon. She reviews each patient's records before the appointment and sends a clear after-visit summary through the patient portal the same day. She also leads healthy aging visits for older adults and the family members who support them.",
  locations: [HALDEN_SPRINGS, SORREL_RIDGE], languages: ["English", "Tamil", "Hindi"], acceptingNewPatients: true,
  seoTitle: "Priya Raman, DO | Internal medicine | Clearwater Health",
  seoDescription: "Dr. Priya Raman is an internal medicine physician at our Halden Springs and Sorrel Ridge clinics. See her languages and availability, then book a visit.",
});
const theoAdebayo = s.person("theo-adebayo", {
  name: "Theo Adebayo", slug: "theo-adebayo", role: "provider", credentials: "MD", jobTitle: "Cardiologist",
  bio: "Dr. Theo Adebayo is a cardiologist who sees patients at our Larkfield and Halden Springs clinics. He joined Clearwater Health in 2015 and helped set up in-clinic heart testing at Larkfield, so more appointments can happen in one place. He works closely with primary care providers across the network and makes a point of explaining each test, why it is scheduled, and when the results will be ready. Dr. Adebayo is not taking new patients at this time. Current patients can book follow-up visits with him as usual.",
  locations: [LARKFIELD, HALDEN_SPRINGS], languages: ["English", "Yoruba"], acceptingNewPatients: false,
  seoTitle: "Theo Adebayo, MD | Cardiology | Clearwater Health",
  seoDescription: "Dr. Theo Adebayo is a cardiologist at our Larkfield and Halden Springs clinics. Current patients can book follow-up visits here.",
});
const naomiCastellanos = s.person("naomi-castellanos", {
  name: "Naomi Castellanos", slug: "naomi-castellanos", role: "provider", credentials: "NP", jobTitle: "Nurse practitioner, cardiology",
  bio: "Naomi Castellanos is a nurse practitioner on our cardiology team at the Larkfield and Mossgrove clinics. She sees patients for follow-up visits between appointments with a cardiologist, and she coordinates testing and referrals with the rest of the care team. Before joining Clearwater Health in 2020, she worked as a cardiac nurse for eight years. She is bilingual in English and Spanish and often helps families talk through visit plans in Spanish.",
  locations: [LARKFIELD, MOSSGROVE], languages: ["English", "Spanish"], acceptingNewPatients: true,
  seoTitle: "Naomi Castellanos, NP | Cardiology | Clearwater Health",
  seoDescription: "Naomi Castellanos is a cardiology nurse practitioner at our Larkfield and Mossgrove clinics. See her languages and availability, then book a visit.",
});
const henrikSolberg = s.person("henrik-solberg", {
  name: "Henrik Solberg", slug: "henrik-solberg", role: "provider", credentials: "PT, DPT", jobTitle: "Physical therapist",
  bio: "Henrik Solberg is a physical therapist at our Sorrel Ridge and Larkfield clinics, where he sees patients for evaluations, one-on-one sessions, and visits after surgery. He has practiced physical therapy for more than twelve years, including several years at an outpatient sports clinic. He starts each first visit by asking about the everyday activities that matter most to the patient, then builds a visit schedule around them.",
  locations: [SORREL_RIDGE, LARKFIELD], languages: ["English", "Norwegian"], acceptingNewPatients: true,
  seoTitle: "Henrik Solberg, PT | Physical therapy | Clearwater Health",
  seoDescription: "Henrik Solberg is a physical therapist at our Sorrel Ridge and Larkfield clinics. See his languages and availability, then book a visit.",
});
const imaniBrooks = s.person("imani-brooks", {
  name: "Imani Brooks", slug: "imani-brooks", role: "provider", credentials: "PT, DPT", jobTitle: "Physical therapist",
  bio: "Imani Brooks is a physical therapist who sees patients at our Sorrel Ridge and Halden Springs clinics. She leads the balance and mobility sessions in our healthy aging program and works closely with primary care providers and family caregivers. She joined Clearwater Health in 2018. Imani is fluent in American Sign Language and can hold visits in ASL without an interpreter. Every patient leaves her first session with a printed home program.",
  locations: [SORREL_RIDGE, HALDEN_SPRINGS], languages: ["English", "American Sign Language"], acceptingNewPatients: true,
  seoTitle: "Imani Brooks, PT | Physical therapy | Clearwater Health",
  seoDescription: "Imani Brooks is a physical therapist at our Sorrel Ridge and Halden Springs clinics. See her languages and availability, then book a visit.",
});

// ---------- People: authors (no photos) ----------
const hannahLindqvist = s.person("hannah-lindqvist", {
  name: "Hannah Lindqvist", slug: "hannah-lindqvist", role: "author", jobTitle: "Patient experience writer",
  bio: "Hannah Lindqvist writes patient guides for Clearwater Health. She works with our front desk and scheduling teams to explain visits, forms, and appointments in plain language.",
});
const julianOrtega = s.person("julian-ortega", {
  name: "Julian Ortega", slug: "julian-ortega", role: "author", jobTitle: "Care coordination manager",
  bio: "Julian Ortega manages care coordination across Clearwater Health's four clinics. He writes about scheduling, referrals, and working with your care team.",
});

// ---------- Specialties (collections; rendered by the specialties template) ----------
const primaryCare = s.collection("primary-care", {
  name: "Primary Care", slug: "primary-care", collectionType: "specialty", eyebrow: "All ages",
  summary: "Checkups, preventive visits, and ongoing care for patients of all ages, with a care team that coordinates referrals across our network.",
  description: md(`## What primary care covers

Primary care is often the first place to start with Clearwater Health. Our family medicine and internal medicine providers see patients for annual checkups, preventive visits, vaccinations, and follow-up visits for ongoing conditions. When you need a specialist, your primary care provider can arrange a referral within our network and share your records, so you do not have to repeat your history.

## What a visit involves

- **Check-in:** Arrive about 15 minutes early to confirm your insurance and review your forms.
- **With a medical assistant:** They take routine measurements and go over your current medications.
- **With your provider:** Time to talk through the reason for your visit and any questions you bring.
- **Before you leave:** You receive an after-visit summary. Lab work can usually be done on site at our Larkfield and Halden Springs clinics.

New patient visits are scheduled for about 45 minutes, and follow-up visits are usually 20 to 30 minutes. If you are not sure which provider to see, our scheduling team can help you choose based on clinic, language, and availability.`),
  image: s.img(2), items: [marisolVance, priyaRaman],
  seoTitle: "Primary care | Clearwater Health",
  seoDescription: "Checkups, preventive visits, and ongoing care for all ages at Clearwater Health clinics in Larkfield, Halden Springs, Sorrel Ridge, and Mossgrove.",
});
const cardiology = s.collection("cardiology", {
  name: "Cardiology", slug: "cardiology", collectionType: "specialty", eyebrow: "Heart care",
  summary: "Consultations, follow-up visits, and in-clinic heart tests with our cardiology team at the Larkfield, Halden Springs, and Mossgrove clinics.",
  description: md(`## What our cardiology team offers

Clearwater Health cardiology providers see patients for consultations, ongoing follow-up visits, and in-clinic testing. Many patients come to us through a referral from their primary care provider, and you can also contact us directly. Our scheduling team will check whether your insurance plan needs a referral first.

Services include:

- Consultation and follow-up visits
- Electrocardiograms (ECGs) done during your visit
- Fitting and return of wearable heart monitors
- Echocardiograms, scheduled at our Larkfield clinic
- Coordination with your primary care provider

## What a visit involves

A first consultation usually takes about 60 minutes. Your provider will review your records, talk with you about the reason for your visit, and explain any tests they suggest and how each one is scheduled. Some tests happen the same day, while others are booked as a separate appointment.

Wear comfortable clothing with a top that is easy to remove or open, and bring a list of your current medications with doses. If another clinic has done tests for you, ask them to send the results to us before your visit, or bring copies with you.`),
  image: s.img(11), items: [theoAdebayo, naomiCastellanos],
  seoTitle: "Cardiology | Clearwater Health",
  seoDescription: "Cardiology consultations, follow-up visits, and in-clinic testing at Clearwater Health clinics in Larkfield, Halden Springs, and Mossgrove, Oregon.",
});
const physicalTherapy = s.collection("physical-therapy", {
  name: "Physical Therapy", slug: "physical-therapy", collectionType: "specialty", eyebrow: "Movement and mobility",
  summary: "One-on-one evaluations and sessions with licensed physical therapists at our Sorrel Ridge, Larkfield, and Halden Springs clinics.",
  description: md(`## What physical therapy includes

Our physical therapists see patients of all ages for evaluations and one-on-one sessions. That includes visits after surgery that follow the plan from your surgeon, and balance and mobility sessions offered through our healthy aging program. Your therapist shares notes with the rest of your Clearwater Health care team, so everyone works from the same plan.

## What a visit involves

- **First visit:** An evaluation of about 60 minutes. Your therapist asks about your daily activities and goals, looks at how you move, and talks through a schedule of visits with you.
- **Follow-up sessions:** About 45 minutes, one-on-one with the same therapist where possible.
- **Home program:** A printed plan of exercises your therapist sets up with you, also available in the patient portal.

Wear comfortable clothing and supportive shoes you can move in. Our Sorrel Ridge clinic has a full therapy gym and private treatment rooms. Larkfield and Halden Springs have private treatment rooms and a smaller gym.

Some insurance plans require a referral or prior approval for physical therapy. Our scheduling team can check your plan before your first visit and let you know what it requires.`),
  image: s.img(4), items: [henrikSolberg, imaniBrooks],
  seoTitle: "Physical therapy | Clearwater Health",
  seoDescription: "One-on-one physical therapy evaluations and sessions at Clearwater Health clinics in Sorrel Ridge, Larkfield, and Halden Springs, Oregon.",
});
const healthyAging = s.collection("healthy-aging", {
  name: "Healthy Aging", slug: "healthy-aging", collectionType: "specialty", eyebrow: "Older adults and caregivers",
  summary: "Longer appointments for older adults and the people who support them, covering wellness visits, medication reviews, and care planning.",
  description: md(`## Care with more time built in

Healthy aging visits at Clearwater Health are scheduled with extra time, so there is room to talk through everything on your list. Family members and caregivers are welcome to join in person or by phone.

Services include:

- Annual wellness visits
- Medication reviews, where you bring every medication and supplement you take
- Care planning conversations, including advance care planning
- Balance and mobility sessions with our physical therapists
- Help coordinating visits across specialties and clinics

## What a visit involves

Healthy aging appointments are usually 60 minutes. Before your visit, we send a short questionnaire you can complete at home or in the clinic. Bring your medication bottles in a bag, your insurance cards, and a few notes about what you would like to cover. At the end of the visit, you receive a written summary, and a member of the care team can help you schedule any follow-up appointments.

Healthy aging visits are offered at all four of our clinics: Larkfield, Halden Springs, Sorrel Ridge, and Mossgrove.`),
  image: s.img(9), items: [marisolVance, priyaRaman, imaniBrooks],
  seoTitle: "Healthy aging | Clearwater Health",
  seoDescription: "Longer visits for older adults and caregivers, including wellness visits, medication reviews, and care planning, at all four Clearwater Health clinics.",
});
const specialties = [primaryCare, cardiology, physicalTherapy, healthyAging];

// ---------- Shared sections ----------
const emergencyNotice = s.richText("emergency-notice", {
  internalName: name("Global", "Emergency notice"), heading: "In an emergency",
  body: md(`**If you have a medical emergency, call 911.**

Clearwater Health clinics do not provide emergency care. For questions that can wait, call your clinic during open hours at (541) 555-0127, or send a message to your care team through the patient portal.`),
});

// ---------- Home (step 1) ----------
const homeHero = s.hero("home", {
  internalName: name("Home", "Hero"), eyebrow: "Primary and specialty care", headline: "Care that keeps up with you",
  subheadline: "Primary care, cardiology, physical therapy, and healthy aging at four clinics in Larkfield and nearby towns.",
  image: s.img(5), layout: "split", cta: bookAppointment, secondaryCta: exploreSpecialties,
});
const homeSpecialties = s.cardGrid("home-specialties", {
  internalName: name("Home", "Specialties grid"), heading: "Find care by specialty",
  intro: "Each specialty page explains the services we offer, what a visit involves, and which providers see patients there.",
  source: "manual", items: specialties, layout: "cards", columns: 4,
});
const homeCareTeam = s.mediaText("home-care-team", {
  internalName: name("Home", "Connected care team"), eyebrow: "Connected care", heading: "One care team across four clinics",
  body: "Your Clearwater Health providers use the same records system at every location, so your primary care provider, specialists, and therapists all see the same visit notes. You can book at whichever clinic suits your week without starting over.\n\nBetween visits, you can message your care team, request prescription refills, and read your after-visit summaries in the patient portal.",
  image: s.img(1), imagePosition: "left", cta: meetProviders,
});
const homeLogistics = s.cardGrid("home-visit-logistics", {
  internalName: name("Home", "Visit logistics"), heading: "Planning your visit",
  source: "manual", layout: "icons", columns: 3,
  items: [
    s.item("logistics-online-booking", {
      title: "Online booking",
      text: "See open appointment times for the next two weeks and book at any of our clinics, whenever it suits you.",
    }),
    s.item("logistics-extended-hours", {
      title: "Evening and Saturday hours",
      text: "Our Larkfield clinic is open until 7 p.m. on weekdays. Larkfield and Mossgrove are also open on Saturday mornings for scheduled visits.",
    }),
    s.item("logistics-video-visits", {
      title: "Video visits",
      text: "Some follow-up appointments can happen by video from home. Your care team will let you know when a video visit is an option.",
    }),
  ],
});
const home = s.page("home", {
  title: "Clearwater Health", slug: "home", pageType: "home", funnelStep: 1, nextStep: s.ref("page", "specialties"),
  hero: homeHero, primaryCta: bookAppointment,
  sections: [homeSpecialties, homeCareTeam, homeLogistics, emergencyNotice, homeBand],
  seoTitle: "Clearwater Health | Primary and specialty care in Oregon",
  seoDescription: "Primary care, cardiology, physical therapy, and healthy aging at four Clearwater Health clinics in Larkfield and nearby towns. Book online.",
});

// ---------- Specialties template (step 2) ----------
const specialtiesHero = s.hero("specialties", {
  internalName: name("Specialties", "Hero"), eyebrow: "Specialties", headline: "Care across four specialties",
  subheadline: "Learn what each specialty offers and what to expect at a visit, then choose a provider at the clinic that suits you.",
  image: s.img(10), layout: "split", cta: findProvider,
});
const specialtiesGrid = s.cardGrid("specialties-index", {
  internalName: name("Specialties", "Specialties grid"), heading: "Choose a specialty",
  intro: "Every specialty is offered at more than one clinic, and each page lists the providers who see patients there.",
  source: "manual", items: specialties, layout: "cards", columns: 2,
});
const visitFaq = s.faq("visit-expectations", {
  internalName: name("Specialties", "What to expect FAQ"), heading: "What to expect at your visit",
  items: [
    s.item("faq-arrival", {
      title: "How early should I arrive?",
      text: "Please arrive 15 minutes before your appointment time to check in, confirm your insurance, and review your forms. If you have already completed your forms in the patient portal, 10 minutes is usually enough.",
    }),
    s.item("faq-what-to-bring", {
      title: "What should I bring?",
      text: "Bring a photo ID, your insurance card, and a list of your current medications with doses. If you have records or test results from another clinic, bring copies or ask that clinic to send them to us. If you use glasses, hearing aids, or a mobility aid, bring those too.",
    }),
    s.item("faq-visit-length", {
      title: "How long will my visit take?",
      text: "Follow-up visits are usually scheduled for 20 to 30 minutes. New patient visits and first specialty consultations are usually 45 to 60 minutes, and physical therapy evaluations are about 60 minutes. Your confirmation will show the time set aside for your visit.",
    }),
    s.item("faq-companion", {
      title: "Can someone come with me?",
      text: "Yes. You are welcome to bring a family member, friend, or caregiver to any visit. They can also join by phone. Let the front desk know when you check in.",
    }),
    s.item("faq-interpreters", {
      title: "Can I have an interpreter?",
      text: "Yes. Interpreters for spoken languages and American Sign Language are available at no cost to you. Ask for one when you book, and we will arrange it before your visit.",
    }),
    s.item("faq-referral", {
      title: "Do I need a referral?",
      text: "Some insurance plans require a referral for specialty visits or physical therapy. Our scheduling team can check your plan's requirements when you book.",
    }),
    s.item("faq-reschedule", {
      title: "What if I need to cancel or reschedule?",
      text: "Please let us know at least 24 hours ahead by phone or through the patient portal, so we can offer the time to another patient.",
    }),
  ],
});
s.page("specialties", {
  title: "Specialties", slug: "specialties", pageType: "collection_detail", funnelStep: 2, nextStep: providersPage,
  hero: specialtiesHero, primaryCta: findProvider, sections: [specialtiesGrid], detailSections: [visitFaq, specialtiesBand],
  seoTitle: "Specialties | Clearwater Health",
  seoDescription: "Primary care, cardiology, physical therapy, and healthy aging at Clearwater Health. See what each specialty offers and what to expect at a visit.",
});

// ---------- Providers template (step 3) ----------
const providersHero = s.hero("providers", {
  internalName: name("Providers", "Hero"), eyebrow: "Our providers", headline: "Meet the providers at Clearwater Health",
  subheadline: "Physicians, nurse practitioners, and physical therapists across our four clinics. Compare locations, languages, and availability.",
  image: s.img(3), layout: "split", cta: bookAppointment,
});
const providersGrid = s.cardGrid("providers-profiles", {
  internalName: name("Providers", "Provider profiles"), heading: "Our providers",
  intro: "Choose a provider to see their clinics, the languages they speak, and whether they are accepting new patients.",
  source: "manual", items: [marisolVance, priyaRaman, theoAdebayo, naomiCastellanos, henrikSolberg, imaniBrooks],
  layout: "profiles", columns: 3,
});
const schedulingNote = s.richText("scheduling-and-insurance", {
  internalName: name("Providers", "Scheduling and insurance"), heading: "Scheduling and insurance",
  body: md(`You can book with this provider online, through the patient portal, or by calling (541) 555-0127. If this provider is not taking new patients, or the open times do not work for you, our scheduling team can suggest another provider in the same specialty or a different clinic.

- **Insurance:** Clearwater Health works with many insurance plans. Bring your current card to every visit, and call us before your appointment if you would like us to check your coverage.
- **Referrals:** Some plans require a referral for specialty visits. We can check this for you when you book.
- **Changes:** Please give at least 24 hours' notice if you need to cancel or reschedule.
- **Interpreters:** Spoken language and American Sign Language interpreters are available at no cost. Ask when you book.`),
});
s.page("providers", {
  title: "Providers", slug: "providers", pageType: "person_detail", funnelStep: 3, nextStep: goalPage,
  hero: providersHero, primaryCta: bookWithProvider, sections: [providersGrid], detailSections: [schedulingNote],
  seoTitle: "Find a provider | Clearwater Health",
  seoDescription: "Meet the physicians, nurse practitioners, and physical therapists at Clearwater Health. Compare clinics and languages, then book a visit.",
});

// ---------- Book an appointment (step 4, goal) ----------
const bookingHero = s.hero("book-an-appointment", {
  internalName: name("Book an appointment", "Hero"), eyebrow: "Appointments", headline: "Book an appointment",
  subheadline: "Choose a specialty, clinic, and time. New and returning patients can book here, with or without a provider in mind.",
  image: s.img(8), layout: "split",
});
const bookingForm = s.form("book-appointment", {
  internalName: name("Book an appointment", "Form"), formKind: "book_appointment", heading: "Request your appointment",
  intro: "Tell us the kind of visit you need, the clinic that suits you, and when you are available. If you do not have a provider in mind, our scheduling team will suggest one.",
  submitLabel: "Request appointment", successHeading: "Thank you for your request",
  successMessage: "On a live site, our scheduling team would confirm your appointment by phone or email within one business day and send any forms to complete before your visit. This is a demo, so no appointment has been made and no one will contact you.",
  privacyNote: "This is a demo. Nothing you enter is sent or stored. Please do not enter real personal or health information.",
  prefillSample: true,
});
s.page("book-an-appointment", {
  title: "Book an appointment", slug: "book-an-appointment", pageType: "goal", funnelStep: 4,
  hero: bookingHero, sections: [emergencyNotice, bookingForm],
  seoTitle: "Book an appointment | Clearwater Health",
  seoDescription: "Request an appointment at any of our four clinics in Larkfield, Halden Springs, Sorrel Ridge, and Mossgrove. New patients are welcome.",
});

// ---------- Locations (off-funnel) ----------
const locationsHero = s.hero("locations", {
  internalName: name("Locations", "Hero"), eyebrow: "Locations", headline: "Four clinics in Larkfield and nearby towns",
  subheadline: "Every clinic welcomes new patients. Find the address, hours, and services at each location.",
  image: s.img(6), layout: "split", cta: bookAppointment,
});
const locationsGrid = s.cardGrid("locations-clinics", {
  internalName: name("Locations", "Clinics grid"), heading: "Our clinics",
  intro: "Call (541) 555-0127 to reach any clinic, or book online and choose your location.",
  source: "manual", layout: "cards", columns: 2,
  items: [
    s.item("location-larkfield", {
      title: LARKFIELD, image: s.img(8), link: goalPage,
      text: "1200 Willow Creek Parkway, Larkfield, OR 97999. Open Monday to Friday, 7:30 a.m. to 7 p.m., and Saturday, 8 a.m. to 1 p.m. Primary care, cardiology, physical therapy, and healthy aging, with an on-site lab. Free parking in the front lot.",
    }),
    s.item("location-halden-springs", {
      title: HALDEN_SPRINGS, image: s.img(7), link: goalPage,
      text: "418 Station Street, Halden Springs, OR 97998. Open Monday to Friday, 8 a.m. to 5:30 p.m. Primary care, cardiology, physical therapy, and healthy aging, with an on-site lab. Free parking behind the building, entered from Second Avenue.",
    }),
    s.item("location-sorrel-ridge", {
      title: SORREL_RIDGE, image: s.img(6), link: goalPage,
      text: "7300 Ridgeline Drive, Suite 110, Sorrel Ridge, OR 97997. Open Monday to Thursday, 7 a.m. to 6 p.m., and Friday, 7 a.m. to 4 p.m. Primary care, physical therapy, and healthy aging, with our largest therapy gym. Free parking in the shared lot.",
    }),
    s.item("location-mossgrove", {
      title: MOSSGROVE, image: s.img(8), link: goalPage,
      text: "95 Orchard Lane, Mossgrove, OR 97996. Open Monday to Friday, 8 a.m. to 5 p.m., and Saturday, 9 a.m. to 1 p.m. Primary care, cardiology, and healthy aging. Free parking on site, with a bus stop at the front entrance.",
    }),
  ],
});
const gettingHere = s.richText("getting-here", {
  internalName: name("Locations", "Getting here"), heading: "Before you visit a clinic",
  body: md(`All four clinics have step-free entrances, accessible restrooms, and wheelchairs available at the front desk. If you would like help getting from the parking lot to your appointment, call ahead and a member of our team will meet you at the door.

Clinic hours can change on holidays. Any changes are posted in the patient portal at least two weeks ahead.`),
});
s.page("locations", {
  title: "Locations", slug: "locations", pageType: "standard", funnelStep: 0,
  hero: locationsHero, primaryCta: bookAppointment, sections: [locationsGrid, gettingHere, locationsBand],
  seoTitle: "Clinic locations and hours | Clearwater Health",
  seoDescription: "Addresses, hours, parking, and services for Clearwater Health clinics in Larkfield, Halden Springs, Sorrel Ridge, and Mossgrove, Oregon.",
});

// ---------- Health Library (article index, off-funnel) ----------
const libraryHero = s.hero("health-library", {
  internalName: name("Health Library", "Hero"), eyebrow: "Health Library", headline: "Guides for planning your visits",
  subheadline: "Practical articles on appointments, paperwork, and working with your care team.",
  image: s.img(1), layout: "split",
});
const latestArticles = s.cardGrid("health-library-latest", {
  internalName: name("Health Library", "Latest articles"), heading: "Latest articles",
  intro: "Our articles cover visits and logistics. For questions about your health, talk with your care team.",
  source: "latest_articles", layout: "cards", limit: 6,
});
const libraryNote = s.richText("health-library-note", {
  internalName: name("Health Library", "Article note"), heading: "About the Health Library",
  body: md(`Health Library articles explain how visits, scheduling, and paperwork work at Clearwater Health. They are not medical advice. For questions about your health, talk with your care team.

If you have a medical emergency, call 911.`),
});
s.page("health-library", {
  title: "Health Library", slug: "health-library", pageType: "article_index", funnelStep: 0,
  hero: libraryHero, sections: [latestArticles], detailSections: [libraryNote],
  seoTitle: "Health Library | Clearwater Health",
  seoDescription: "Plain-language guides from Clearwater Health on booking appointments, preparing for visits, and working with your care team.",
});

// ---------- Articles ----------
s.article("what-to-bring-to-your-first-visit", {
  title: "What to bring to your first visit", slug: "what-to-bring-to-your-first-visit",
  summary: "A simple checklist for your first appointment at Clearwater Health, from ID and insurance cards to medication lists and records.",
  body: md(`## Start with the basics

A first appointment at a new clinic involves a little more paperwork than a usual visit. Bringing the right things helps check-in go quickly and leaves more of the appointment for time with your provider. Here is what our front desk teams ask new patients to bring:

- A photo ID, such as a driver's license or state ID card
- Your current insurance card, plus any secondary insurance cards
- A form of payment, in case your plan has a copay for the visit
- Your completed new patient forms, if you filled them out on paper

If you completed your forms in the patient portal, you do not need to print them. The front desk will see them when you check in.

## Your medication list

Bring a list of every medication you take, with the name, the dose, and how often you take it. Include vitamins, supplements, and anything you buy without a prescription. If keeping a list is hard, you can bring the bottles themselves in a bag. Either way works, and it saves time during the visit.

## Records from other providers

If you are moving your care from another clinic, your records help your new provider understand your history without asking you to remember every detail. You have a few options:

1. Ask your previous clinic to send your records to Clearwater Health before your visit. Our front desk can give you a records release form.
2. Bring copies of recent test results, imaging reports, or visit summaries with you.
3. If your previous clinic has a patient portal, download a visit summary and bring it on your phone.

Records can take a week or more to arrive, so it helps to request them as soon as you book.

## Names and contact details

Write down the names and phone numbers of other providers you see regularly, such as specialists, therapists, or dentists, along with your preferred pharmacy. If you would like a family member or caregiver to be able to speak with us about your care, bring their contact details too. The front desk can help you complete a form that gives them permission.

## Small things that help

A few practical items can make a first visit more comfortable:

- Glasses, hearing aids, or any mobility aids you use
- A short list of what you would like to talk about, with the most important topic first
- A notebook, or the notes app on your phone, for anything you want to remember
- Something to read, in case you have a short wait before your visit

If you would like an interpreter, including American Sign Language, let us know when you book. Interpreters are available at no cost to you, and we will arrange one before your appointment.

## Plan your arrival

New patient appointments are scheduled for about 45 minutes. Plan to arrive 15 minutes early so there is time to check in, confirm your insurance, and get settled. Each of our four clinics has its own parking and entrance details, which you can find on our locations page.

If something comes up and you need to reschedule, please call us or use the patient portal at least 24 hours ahead, so we can offer the time to someone else.

## After your first visit

Before you leave, you will receive an after-visit summary with the plan you discussed and any next appointments. The same summary appears in your patient portal. If a question comes up later, send a message to your care team through the portal or call your clinic during open hours.`),
  heroImage: s.img(10), author: hannahLindqvist, publishDate: "2026-08-12",
  topics: ["first visit", "appointments", "planning ahead"], relatedPage: primaryCare, cta: bookAppointment,
  seoTitle: "What to bring to your first visit | Clearwater Health",
  seoDescription: "A checklist for your first Clearwater Health appointment: ID, insurance cards, a medication list, past records, and how to plan your arrival.",
});
s.article("preparing-questions-for-your-care-team", {
  title: "How to prepare questions for your care team", slug: "preparing-questions-for-your-care-team",
  summary: "Appointments go by quickly. A little preparation helps you cover what matters most to you and leave knowing what happens next.",
  body: md(`## Why a little preparation helps

Most appointments have a set length, and it is easy to remember a question on the drive home. Preparing ahead gives you a clear plan for the time you have, and it makes it easier for your care team to help. You do not need anything formal. A few notes on paper or on your phone are enough.

## Start with a short list

A day or two before your visit, write down what you want to talk about. Then put the list in order, with the most important topic first. If time runs short, you will have covered what matters most to you, and your provider can help you plan a follow-up visit for the rest.

For a standard visit, try to keep the list to three or four main topics. If you have more, mention that at the start of the appointment so your provider can help decide what to cover today and what to schedule separately.

## Questions about next steps

Many of the most useful questions are about what happens after the visit. Consider adding a few of these to your list:

- What is the next step after today, and who will arrange it?
- If I need a test, where is it done and how do I schedule it?
- When will results be ready, and how will I hear about them?
- Do I need a follow-up visit, and when should I book it?
- Who should I contact if I have a question before my next appointment?

## Questions about logistics

Practical details matter too, and our care teams are glad to answer them:

- Can this visit, or the next one, be done by video?
- Does my insurance plan need a referral or prior approval for what we discussed?
- Can a family member or caregiver join future visits or receive updates?
- Is there a clinic or appointment time that would be easier for me?

## Bring someone along

A family member, friend, or caregiver can help you remember what was said and may think of questions you did not. They can join in person or by phone. If you would like them involved in your care beyond the visit, ask the front desk for a form that lets us speak with them directly.

## During the appointment

Share your list at the start of the visit. It helps your provider plan the time with you. Take notes as you go, or ask whether your companion can take notes for you. If something is unclear, it is always fine to ask your provider to explain it another way or to write it down.

Before the visit ends, try repeating the main points back in your own words. It is a simple way to check that you and your care team have the same understanding of the plan.

## After the visit

Your after-visit summary will be in the patient portal, usually by the end of the day. Read it through while the appointment is still fresh. If a new question comes up, send a portal message to your care team or call your clinic. Portal messages are answered during clinic hours, so they are not the right place for anything urgent.

If you are helping a parent or partner with their care, the same approach works for their visits too. Keeping one shared list, with questions and answers from each appointment, makes it easier to pick up where you left off next time.`),
  heroImage: s.img(12), author: julianOrtega, publishDate: "2026-09-09",
  topics: ["care team", "appointments", "caregivers"], relatedPage: healthyAging, cta: findProvider,
  seoTitle: "Preparing questions for your care team | Clearwater Health",
  seoDescription: "How to plan your questions before an appointment, what to ask about next steps and logistics, and how to follow up after your visit.",
});

// ---------- Brand ----------
const navLocations = s.item("nav-locations", { title: "Locations", link: s.ref("page", "locations") });
const navHealthLibrary = s.item("nav-health-library", { title: "Health Library", link: s.ref("page", "health-library") });

s.brand({
  name: "Clearwater Health", slug: "clearwater-health", vertical: "healthcare",
  shortDescription: "Multi-location clinic network offering primary and specialty care.",
  tagline: "Care that keeps up with you.", logo: s.logo, favicon: s.favicon,
  colorBrand: "#163E5C", colorButton: "#0F7C8C", colorButtonText: "#FFFFFF", colorAccent: "#DDF2EE",
  colorBackground: "#FBFBF9", colorSurface: "#FFFFFF", colorText: "#1F2D3A", colorMuted: "#5A6B78",
  fontHeading: "Merriweather Sans", fontBody: "Nunito Sans", buttonRadius: 12, buttonTextCase: "normal",
  voiceDescription: "Calm, compassionate, and inclusive. Clearwater Health speaks to patients and families in plain language and explains how services, visits, and scheduling work. It never gives medical advice and points every health question back to the care team.",
  voiceDos: [
    "Say \"talk with your care team\" whenever a question is about someone's health.",
    "Include an emergency notice telling people to call 911.",
    "Describe services, visits, and logistics in plain language.",
    "Write for patients of all ages, backgrounds, and abilities.",
    "Keep sentences short, warm, and calm.",
  ],
  voiceDonts: [
    "Diagnose, describe symptoms, or give medical advice.",
    "Promise outcomes or results.",
    "Quote health statistics.",
    "Use fear or urgency to drive bookings.",
  ],
  photoDirection: "Clinicians with patients of all ages in bright rooms. Nothing graphic. No hospital logos.",
  navigation: [
    s.item("nav-specialties", { title: "Specialties", link: s.ref("page", "specialties") }),
    s.item("nav-providers", { title: "Providers", link: providersPage }),
    navLocations,
    navHealthLibrary,
  ],
  headerCta: bookAppointment,
  footerLinks: [
    s.item("footer-primary-care", { title: "Primary Care", link: primaryCare }),
    s.item("footer-cardiology", { title: "Cardiology", link: cardiology }),
    s.item("footer-physical-therapy", { title: "Physical Therapy", link: physicalTherapy }),
    s.item("footer-healthy-aging", { title: "Healthy Aging", link: healthyAging }),
    s.item("footer-find-a-provider", { title: "Find a provider", link: providersPage }),
    navLocations,
    navHealthLibrary,
    s.item("footer-book-an-appointment", { title: "Book an appointment", link: goalPage }),
  ],
  promoBarText: "New patients welcome at all four locations.",
  address: "1200 Willow Creek Parkway\nLarkfield, OR 97999",
  phone: "(541) 555-0127",
  legalDisclaimer: "Fictional company. Sample content for illustration only. Nothing on this site is medical advice. In an emergency, call 911.",
  homePage: home,
});

export default s.entries;
