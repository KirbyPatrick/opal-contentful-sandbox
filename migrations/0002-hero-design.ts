/**
 * 0002: optional design fields on the hero, so a draft hero can carry a different layout (for example an
 * experiment's winning variation) and preview exactly as it would look. Every field is optional and empty
 * values mean "today's design", so published heroes render unchanged.
 */
import type { MigrationFunction } from "contentful-migration";
import { HEX_COLOR_PATTERN, fieldsFor } from "./lib/fields";

export const id = "0002-hero-design";
export const description = "Add optional design fields to the hero: layout, overlay and button colors, badge position, proof points";

export const HERO_DESIGN_FIELDS = ["designLayout", "overlayColor", "buttonBackgroundColor", "buttonTextColor", "badgePosition", "proofPoints"] as const;
export const DESIGN_LAYOUTS = ["Standard", "Quote-first"] as const;
export const BADGE_POSITIONS = ["Center", "Top right"] as const;

/** Applied when the hero already has every design field. */
export function isApplied(existing: ReadonlySet<string>, fields?: ReadonlyMap<string, ReadonlySet<string>>): boolean {
  const hero = fields?.get("hero");
  return existing.has("hero") && Boolean(hero) && HERO_DESIGN_FIELDS.every((field) => hero!.has(field));
}

const HEX = { pattern: HEX_COLOR_PATTERN, patternMessage: "Use a hex color like #156666." };

const migration: MigrationFunction = (m) => {
  const ct = m.editContentType("hero");
  const f = fieldsFor(ct);
  f.symbol("designLayout", {
    name: "Design layout", max: 20, values: DESIGN_LAYOUTS,
    help: "Standard is the page's usual hero. Quote-first is a full-width photo with a color gradient, left-aligned text, proof points and one large button. Empty means Standard.",
  });
  ct.editField("designLayout").defaultValue({ "en-US": "Standard" });
  f.symbol("overlayColor", { name: "Overlay color", max: 7, ...HEX, help: "Quote-first only. Hex color of the gradient over the left of the photo. Empty uses the page's default." });
  f.symbol("buttonBackgroundColor", { name: "Button background color", max: 7, ...HEX, help: "Hex color of the main button. Empty keeps the page's usual button color." });
  f.symbol("buttonTextColor", { name: "Button text color", max: 7, ...HEX, help: "Hex color of the main button's label. Empty keeps the page's usual label color." });
  f.symbol("badgePosition", {
    name: "Badge position", max: 20, values: BADGE_POSITIONS,
    help: "Where the page's badge or seal sits on the hero. Empty means Center, the usual position.",
  });
  ct.editField("badgePosition").defaultValue({ "en-US": "Center" });
  f.list("proofPoints", { name: "Proof points", maxItems: 3, itemMax: 40, help: "Quote-first only. Up to 3 short trust points shown with check marks, 40 characters or fewer each." });
};

export default migration;
