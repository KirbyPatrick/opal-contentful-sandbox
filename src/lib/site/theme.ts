import type { SiteEntry } from "./types";

/**
 * Builds the brand's CSS variables. Every value is re-validated here even
 * though Contentful validates it too, because the result is written into a
 * <style> element: only hex colors, known fonts, and fixed numbers get through.
 */
const HEX = /^#[0-9A-Fa-f]{6}$/;
const RADII = new Set([0, 4, 6, 8, 12, 999]);

export const FONT_VARIABLES: Record<string, string> = {
  "Space Grotesk": "--font-space-grotesk",
  Inter: "--font-inter",
  "Libre Caslon Text": "--font-libre-caslon",
  "Source Sans 3": "--font-source-sans",
  "DM Serif Display": "--font-dm-serif",
  "DM Sans": "--font-dm-sans",
  "Merriweather Sans": "--font-merriweather-sans",
  "Nunito Sans": "--font-nunito-sans",
  Manrope: "--font-manrope",
  "IBM Plex Sans": "--font-ibm-plex-sans",
  "Playfair Display": "--font-playfair",
  Lato: "--font-lato",
};

const COLOR_FIELDS: Array<[string, string, string]> = [
  ["colorBrand", "--c-brand", "#1c1c1c"],
  ["colorButton", "--c-button", "#1c1c1c"],
  ["colorButtonText", "--c-button-text", "#ffffff"],
  ["colorAccent", "--c-accent", "#888888"],
  ["colorBackground", "--c-bg", "#ffffff"],
  ["colorSurface", "--c-surface", "#f5f5f5"],
  ["colorText", "--c-text", "#1c1c1c"],
  ["colorMuted", "--c-muted", "#5c5c5c"],
];

/** Card and image corners follow the brand's button corners: square brands stay square, pill brands go soft. */
const CORNERS: Record<number, [number, number]> = { 0: [2, 2], 4: [6, 10], 6: [10, 14], 8: [12, 18], 12: [16, 24], 999: [20, 28] };

const VERTICALS = new Set(["b2b_saas", "apparel_retail", "insurance", "healthcare", "financial_services", "travel"]);

/** The brand's vertical, used as a data attribute for vertical-specific styling. Unknown values get none. */
export function verticalOf(brand: SiteEntry): string | undefined {
  const vertical = String(brand.fields.vertical ?? "");
  return VERTICALS.has(vertical) ? vertical : undefined;
}

export function safeHex(value: unknown, fallback: string): string {
  return typeof value === "string" && HEX.test(value) ? value : fallback;
}

export function themeCss(brand: SiteEntry): string {
  const f = brand.fields;
  const vars = COLOR_FIELDS.map(([field, name, fallback]) => `${name}:${safeHex(f[field], fallback)}`);
  const heading = FONT_VARIABLES[String(f.fontHeading)] ?? "--font-inter";
  const body = FONT_VARIABLES[String(f.fontBody)] ?? "--font-inter";
  const radius = RADII.has(Number(f.buttonRadius)) ? Number(f.buttonRadius) : 6;
  vars.push(`--font-heading:var(${heading}),Georgia,serif`);
  vars.push(`--font-body:var(${body}),system-ui,sans-serif`);
  vars.push(`--btn-radius:${radius}px`);
  const [corner, cornerLarge] = CORNERS[radius] ?? [10, 14];
  vars.push(`--radius:${corner}px`, `--radius-lg:${cornerLarge}px`);
  vars.push(`--btn-case:${f.buttonTextCase === "uppercase" ? "uppercase" : "none"}`);
  vars.push(`--btn-tracking:${f.buttonTextCase === "uppercase" ? "0.08em" : "0"}`);
  return `.brand-theme{${vars.join(";")}}`;
}

/** CSS rules for color swatches, keyed by a generated class name. */
export function swatchCss(swatches: Array<{ className: string; hex: string }>): string {
  return swatches
    .filter((swatch) => HEX.test(swatch.hex) && /^[a-z0-9-]+$/.test(swatch.className))
    .map((swatch) => `.${swatch.className}{background:${swatch.hex}}`)
    .join("");
}
