"use client";

/**
 * Mock goal forms. Fields are defined here for each form kind; Contentful only
 * supplies the wording. Input is checked in the browser and then a
 * confirmation is shown. Nothing is ever sent or stored: the form has no
 * action, submission is cancelled in script, and the submit button stays
 * disabled until script has loaded so a plain HTML submit cannot happen.
 */
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useCart } from "./cart";

export type FormKind = "book_demo" | "quote_start" | "get_quote" | "book_appointment" | "start_application" | "request_booking" | "checkout";
export interface Option { value: string; label: string }

export interface FormOptions {
  offerings?: Option[];
  providers?: Option[];
  specialties?: Option[];
  locations?: Option[];
}

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "date" | "number" | "textarea";
  required?: boolean;
  options?: Option[];
  pattern?: RegExp;
  patternMessage?: string;
  min?: number;
  max?: number;
  sample?: string;
  autoComplete?: string;
  half?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP = /^\d{5}$/;
const PHONE = /^[0-9()+\-.\s]{7,20}$/;

const name = (sample: [string, string]): Field[] => [
  { name: "firstName", label: "First name", type: "text", required: true, sample: sample[0], autoComplete: "given-name", half: true },
  { name: "lastName", label: "Last name", type: "text", required: true, sample: sample[1], autoComplete: "family-name", half: true },
];
const email = (sample: string, label = "Email"): Field => ({ name: "email", label, type: "email", required: true, pattern: EMAIL, patternMessage: "Enter a valid email address.", sample, autoComplete: "email" });
const zip: Field = { name: "zip", label: "ZIP code", type: "text", required: true, pattern: ZIP, patternMessage: "Enter a 5-digit ZIP code.", sample: "97999", autoComplete: "postal-code", half: true };
const phone = (required: boolean): Field => ({ name: "phone", label: required ? "Phone" : "Phone (optional)", type: "tel", required, pattern: PHONE, patternMessage: "Enter a valid phone number.", sample: "(541) 555-0142", autoComplete: "tel", half: true });
const opts = (...labels: string[]): Option[] => labels.map((label) => ({ value: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label }));

function fieldsFor(kind: FormKind, o: FormOptions): Field[] {
  switch (kind) {
    case "book_demo":
      return [
        ...name(["Jordan", "Reyes"]),
        email("jordan.reyes@example.com", "Work email"),
        { name: "company", label: "Company", type: "text", required: true, sample: "Harlow Supply Co.", autoComplete: "organization", half: true },
        { name: "teamSize", label: "Team size", type: "select", required: true, options: opts("1 to 10", "11 to 50", "51 to 200", "201 to 1,000", "More than 1,000"), sample: "51-to-200", half: true },
        { name: "offering", label: "Most interested in", type: "select", required: false, options: o.offerings, half: true },
        { name: "notes", label: "Anything we should know? (optional)", type: "textarea", sample: "We want to move purchase approvals out of email." },
      ];
    case "quote_start":
      return [
        { name: "offering", label: "Coverage", type: "select", required: true, options: o.offerings },
        zip,
        { name: "household", label: "People in your household", type: "select", required: true, options: opts("1", "2", "3", "4", "5 or more"), sample: "3", half: true },
      ];
    case "get_quote":
      return [
        { name: "offering", label: "Coverage", type: "select", required: true, options: o.offerings },
        ...name(["Avery", "Collins"]),
        email("avery.collins@example.com"),
        zip,
        { name: "startDate", label: "Coverage start date", type: "date", required: true, half: true },
      ];
    case "book_appointment":
      return [
        { name: "specialty", label: "Specialty", type: "select", required: true, options: o.specialties, half: true },
        { name: "provider", label: "Provider", type: "select", required: false, options: o.providers, half: true },
        { name: "location", label: "Clinic", type: "select", required: true, options: o.locations, half: true },
        { name: "visitType", label: "Visit type", type: "select", required: true, options: opts("New patient visit", "Follow-up visit", "Annual visit"), sample: "new-patient-visit", half: true },
        { name: "date", label: "Preferred date", type: "date", required: true, half: true },
        { name: "time", label: "Preferred time", type: "select", required: true, options: opts("Morning", "Afternoon", "No preference"), sample: "morning", half: true },
        ...name(["Sam", "Patel"]),
        email("sam.patel@example.com"),
        phone(true),
      ];
    case "start_application":
      return [
        { name: "offering", label: "Product", type: "select", required: true, options: o.offerings },
        ...name(["Taylor", "Morgan"]),
        email("taylor.morgan@example.com"),
        phone(true),
        zip,
        { name: "employment", label: "Employment status", type: "select", required: true, options: opts("Employed", "Self-employed", "Retired", "Student", "Other"), sample: "employed", half: true },
      ];
    case "request_booking":
      return [
        { name: "offering", label: "Trip", type: "select", required: true, options: o.offerings },
        { name: "travelers", label: "Travelers", type: "number", required: true, min: 1, max: 12, sample: "2", half: true },
        { name: "month", label: "Preferred month", type: "select", required: true, options: opts("May", "June", "July", "August", "September"), sample: "june", half: true },
        ...name(["Casey", "Brennan"]),
        email("casey.brennan@example.com"),
        phone(false),
        { name: "notes", label: "Notes (optional)", type: "textarea", sample: "We would like a quiet room if possible." },
      ];
    case "checkout":
      return [
        ...name(["Riley", "Hart"]),
        email("riley.hart@example.com"),
        { name: "address", label: "Street address", type: "text", required: true, sample: "18 Orchard Lane", autoComplete: "street-address" },
        { name: "city", label: "City", type: "text", required: true, sample: "Ashcombe", autoComplete: "address-level2", half: true },
        { name: "state", label: "State", type: "text", required: true, sample: "VT", pattern: /^[A-Za-z]{2}$/, patternMessage: "Use a 2-letter state code.", autoComplete: "address-level1", half: true },
        zip,
      ];
  }
}

function futureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/** An illustrative estimate for the quote demo. Deterministic, never an offer. */
function illustrativeEstimate(offering: string | undefined): string {
  const base = offering?.includes("life") ? [28, 46] : offering?.includes("home") ? [104, 162] : [96, 148];
  return `Illustrative estimate: $${base[0]} to $${base[1]} per month. This is not an offer of insurance.`;
}

export interface MockFormCopy {
  heading: string;
  intro?: string;
  submitLabel: string;
  successHeading: string;
  successMessage: string;
  privacyNote: string;
}

const HANDOFF_KEY = "demo-form-handoff";

export function MockForm({ kind, copy, prefillSample, options, prefill, nextHref }: {
  kind: FormKind; copy: MockFormCopy; prefillSample: boolean; options: FormOptions;
  prefill: Record<string, string>; nextHref?: string;
}) {
  const router = useRouter();
  const cart = useCart();
  const fields = useMemo(() => fieldsFor(kind, options), [kind, options]);
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      const fromQuery = prefill[field.name];
      if (fromQuery && (!field.options || field.options.some((o) => o.value === fromQuery))) initial[field.name] = fromQuery;
      else if (prefillSample && field.sample) initial[field.name] = field.sample;
      else if (prefillSample && field.type === "select" && field.options?.[0]) initial[field.name] = field.options[0].value;
      else if (prefillSample && field.type === "date") initial[field.name] = futureDate(10);
    }
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    // Enable submit only once script runs, and pick up values handed over from the previous step.
    let handoff: Record<string, string> = {};
    try {
      handoff = JSON.parse(window.sessionStorage.getItem(HANDOFF_KEY) ?? "{}");
    } catch {
      handoff = {};
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues((current) => {
      const merged = { ...current };
      for (const field of fields) {
        const value = handoff[field.name];
        if (typeof value === "string" && !prefill[field.name] && (!field.options || field.options.some((o) => o.value === value))) merged[field.name] = value;
      }
      return merged;
    });
    setReady(true);
  }, [fields, prefill]);

  function validate(): Record<string, string> {
    const found: Record<string, string> = {};
    for (const field of fields) {
      const value = (values[field.name] ?? "").trim();
      if (!value) {
        if (field.required) found[field.name] = `${field.label} is required.`;
        continue;
      }
      if (value.length > 500) found[field.name] = "Keep this under 500 characters.";
      if (field.pattern && !field.pattern.test(value)) found[field.name] = field.patternMessage ?? "Check this value.";
      if (field.type === "number") {
        const n = Number(value);
        if (!Number.isInteger(n) || (field.min !== undefined && n < field.min) || (field.max !== undefined && n > field.max)) found[field.name] = `Enter a number from ${field.min} to ${field.max}.`;
      }
      if (field.type === "date" && value < new Date().toISOString().slice(0, 10)) found[field.name] = "Choose a future date.";
      if (field.options && !field.options.some((o) => o.value === value)) found[field.name] = "Choose an option from the list.";
    }
    return found;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (kind === "quote_start" && nextHref) {
      // Hand the answers to the next step inside this browser only (never in the URL).
      try {
        window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ offering: values.offering, zip: values.zip }));
      } catch {
        // Ignore: the next form simply starts without these values.
      }
      router.push(`${nextHref}${values.offering ? `?offering=${encodeURIComponent(values.offering)}` : ""}`);
      return;
    }
    if (kind === "checkout") cart?.clear();
    setDone(kind === "get_quote" ? illustrativeEstimate(values.offering) : "");
  }

  if (done !== null) {
    return (
      <div className="form-success" role="status">
        <h2>{copy.successHeading}</h2>
        {done && <p className="estimate">{done}</p>}
        <p>{copy.successMessage}</p>
        <button type="button" className="btn btn-secondary" onClick={() => setDone(null)}>Start over</button>
      </div>
    );
  }

  if (kind === "checkout" && cart && cart.lines.length === 0) {
    return <p className="muted">Add something to your bag to try the demo checkout.</p>;
  }

  return (
    <form className="mock-form" onSubmit={onSubmit} noValidate aria-describedby="privacy-note">
      <h2>{copy.heading}</h2>
      {copy.intro && <p className="form-intro">{copy.intro}</p>}
      <div className="form-grid">
        {fields.map((field) => {
          const id = `f-${field.name}`;
          const error = errors[field.name];
          const common = {
            id, name: field.name, value: values[field.name] ?? "", "aria-invalid": Boolean(error),
            "aria-describedby": error ? `${id}-error` : undefined, required: field.required, autoComplete: field.autoComplete ?? "off",
            onChange: (event: { target: { value: string } }) => setValues((v) => ({ ...v, [field.name]: event.target.value })),
          };
          return (
            <div key={field.name} className={`form-field ${field.half ? "half" : ""}`}>
              <label htmlFor={id}>{field.label}</label>
              {field.type === "select" ? (
                <select {...common}>
                  <option value="">Select</option>
                  {(field.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : field.type === "textarea" ? (
                <textarea {...common} rows={3} maxLength={500} />
              ) : (
                <input {...common} type={field.type} min={field.type === "date" ? futureDate(1) : field.min} max={field.max} maxLength={field.type === "number" ? undefined : 200} />
              )}
              {error && <span id={`${id}-error`} className="form-error">{error}</span>}
            </div>
          );
        })}
      </div>
      <button type="submit" className="btn btn-primary" disabled={!ready}>{copy.submitLabel}</button>
      <p id="privacy-note" className="privacy-note">{copy.privacyNote}</p>
    </form>
  );
}
