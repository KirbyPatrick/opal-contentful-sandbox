import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OPTIMIZELY_IMAGE_ORIGIN, OPTIMIZELY_SITE, parseOptimizelyBrands } from "../src/lib/site/optimizely-parse";

const good = {
  slug: "stoutware", name: "StoutWare", verticalLabel: "B2B software", summary: "Workflow software.", colorBrand: "#171A3A", colorBackground: "#F6F6FA",
  logoUrl: `${OPTIMIZELY_IMAGE_ORIGIN}/globalassets/stoutware/logo.svg`, logoAlt: "StoutWare logo", url: `${OPTIMIZELY_SITE}/stoutware`,
};

describe("Optimizely CMS brand list", () => {
  it("accepts a well formed brand", () => {
    assert.deepEqual(parseOptimizelyBrands({ brands: [good] }).map((b) => b.slug), ["stoutware"]);
  });
  it("drops brands whose address is not on the Optimizely CMS demo site", () => {
    assert.equal(parseOptimizelyBrands({ brands: [{ ...good, url: "https://evil.example/stoutware" }] }).length, 0);
    assert.equal(parseOptimizelyBrands({ brands: [{ ...good, url: `${OPTIMIZELY_SITE}/other` }] }).length, 0);
  });
  it("never passes through a logo from another host", () => {
    assert.equal(parseOptimizelyBrands({ brands: [{ ...good, logoUrl: "https://evil.example/x.svg" }] })[0]?.logoUrl, null);
  });
  it("drops malformed entries and non-lists", () => {
    assert.equal(parseOptimizelyBrands({ brands: [{ ...good, colorBrand: "red; background:url(x)" }, { ...good, slug: "Bad Slug" }, 5, null] }).length, 0);
    assert.deepEqual(parseOptimizelyBrands(null), []);
    assert.deepEqual(parseOptimizelyBrands({ brands: "nope" }), []);
  });
});
