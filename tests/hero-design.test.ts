import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { heroDesign, heroDesignCss, quoteLabel } from "../src/lib/site/hero-design";
import type { SiteEntry } from "../src/lib/site/types";

const hero = (fields: Record<string, unknown>) => ({ id: "h", type: "hero", fields }) as unknown as SiteEntry;

describe("hero design fields", () => {
  it("treats a hero without design fields as today's standard design", () => {
    const design = heroDesign(hero({ headline: "Hi" }));
    assert.equal(design.layout, "standard");
    assert.equal(design.badge, "center");
    assert.deepEqual(design.proofPoints, []);
    assert.equal(heroDesignCss("#hero-banner", design), "");
  });

  it("reads Quote-first, top-right badge, colors and up to three proof points", () => {
    const design = heroDesign(hero({ designLayout: "Quote-first", badgePosition: "Top right", overlayColor: "#156666", buttonBackgroundColor: "#F89F23", buttonTextColor: "#1A1A1A", proofPoints: ["a", " ", "b", "c", "d"] }));
    assert.equal(design.layout, "quote-first");
    assert.equal(design.badge, "top-right");
    assert.deepEqual(design.proofPoints, ["a", "b", "c"]);
    assert.equal(heroDesignCss("#hero-banner", design), "#hero-banner{--qf-overlay:21 102 102;--qf-button-bg:#f89f23;--qf-button-text:#1a1a1a}");
  });

  it("drops color values that are not plain hex, so drafts cannot inject CSS", () => {
    const design = heroDesign(hero({ overlayColor: "red;}body{display:none", buttonBackgroundColor: "#12345", buttonTextColor: "url(x)" }));
    assert.equal(heroDesignCss("#hero-banner", design), "");
    assert.equal(heroDesignCss("body{}", heroDesign(hero({ overlayColor: "#000000" }))), "");
  });

  it("adds the chevron to the button label only when it is missing", () => {
    assert.equal(quoteLabel("Get a Free Quote ›", "x"), "Get a Free Quote ›");
    assert.equal(quoteLabel("Get Prices", "x"), "Get Prices ›");
    assert.equal(quoteLabel(undefined, "Get Prices"), "Get Prices ›");
  });
});
