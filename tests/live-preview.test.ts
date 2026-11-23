import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isEntryId, livePreviewPath, sandboxSlugFromId } from "../src/lib/site/live-preview";

describe("live preview routing", () => {
  it("maps seeded entry IDs to their sandbox page", () => {
    assert.equal(livePreviewPath(sandboxSlugFromId("ex-he-home")), "/example?preview=true");
    assert.equal(livePreviewPath(sandboxSlugFromId("ph-he-home")), "/placeholder?preview=true");
    assert.equal(livePreviewPath(sandboxSlugFromId("ex-pa-home")), "/example?preview=true");
  });

  it("returns nothing for other brands or unknown slugs", () => {
    assert.equal(sandboxSlugFromId("lw-he-home"), undefined);
    assert.equal(sandboxSlugFromId("4xYz12abc"), undefined);
    assert.equal(livePreviewPath("lumenwork"), undefined);
    assert.equal(livePreviewPath("https://evil.example"), undefined);
    assert.equal(livePreviewPath(undefined), undefined);
  });

  it("accepts only Contentful-style entry IDs", () => {
    assert.equal(isEntryId("ex-he-home"), true);
    assert.equal(isEntryId(null), false);
    assert.equal(isEntryId("../etc"), false);
    assert.equal(isEntryId("a".repeat(65)), false);
  });
});
