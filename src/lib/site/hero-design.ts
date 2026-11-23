import type { SiteEntry } from "./types";

/**
 * The hero's optional design fields (migration 0002-hero-design). Empty fields mean "today's design", so a
 * published hero without them renders exactly as before. Values are checked again here because Contentful
 * only enforces field validations when an entry is published, and drafts are rendered in preview.
 */
export interface HeroDesign {
  layout: "standard" | "quote-first";
  badge: "center" | "top-right";
  overlayColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  proofPoints: string[];
}

const HEX = /^#[0-9a-f]{6}$/i;
const hex = (value: unknown) => (typeof value === "string" && HEX.test(value) ? value.toLowerCase() : undefined);

export function heroDesign(hero: SiteEntry | undefined): HeroDesign {
  const fields = hero?.fields ?? {};
  const proof = Array.isArray(fields.proofPoints) ? fields.proofPoints : [];
  return {
    layout: fields.designLayout === "Quote-first" ? "quote-first" : "standard",
    badge: fields.badgePosition === "Top right" ? "top-right" : "center",
    overlayColor: hex(fields.overlayColor),
    buttonBackgroundColor: hex(fields.buttonBackgroundColor),
    buttonTextColor: hex(fields.buttonTextColor),
    proofPoints: proof.filter((item): item is string => typeof item === "string" && item.trim() !== "").map((item) => item.trim().slice(0, 60)).slice(0, 3),
  };
}

/** "#156666" to "21 102 102", for rgb(var(--x) / alpha) in CSS. Only called with validated hex values. */
const rgbTriplet = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)).join(" ");

/**
 * CSS custom properties for the hero's colors, scoped to one selector, for a nonce'd style element (the CSP
 * blocks inline style attributes). Only validated hex values reach the output; anything else is left out so
 * the stylesheet's defaults apply.
 */
export function heroDesignCss(selector: string, design: HeroDesign): string {
  if (!/^[.#][a-z0-9-]+$/i.test(selector)) return "";
  const vars = [
    design.overlayColor && `--qf-overlay:${rgbTriplet(design.overlayColor)}`,
    design.buttonBackgroundColor && `--qf-button-bg:${design.buttonBackgroundColor}`,
    design.buttonTextColor && `--qf-button-text:${design.buttonTextColor}`,
  ].filter(Boolean);
  return vars.length ? `${selector}{${vars.join(";")}}` : "";
}

/** The button label, with the design's trailing chevron if the label does not already end in one. */
export const quoteLabel = (label: string | undefined, fallback: string) => {
  const value = (label ?? fallback).trim();
  return /[›>]$/.test(value) ? value : `${value} ›`;
};
