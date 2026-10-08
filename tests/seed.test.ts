import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { markdownToRichText, richTextPlainText } from "../src/lib/richtext/markdown";
import { validateGraph, type GraphEntry } from "../seed/lib/validate";
import example from "./fixtures/example-brand";

const ASSETS = new Set(["logo-lumenwork", "favicon-lumenwork", ...Array.from({ length: 11 }, (_, i) => `img-lumenwork-${String(i + 1).padStart(2, "0")}`)]);
const clone = (entries: readonly GraphEntry[]) => JSON.parse(JSON.stringify(entries)) as GraphEntry[];
const find = (entries: GraphEntry[], id: string) => entries.find((entry) => entry.id === id)!;

describe("markdownToRichText", () => {
  it("converts headings, lists, links, and tables", () => {
    const doc = markdownToRichText("## Title\n\nSome **bold** and [a link](https://example.com).\n\n- one\n- two\n\n| A | B |\n|---|---|\n| 1 | 2 |");
    assert.deepEqual(doc.content.map((node) => node.nodeType), ["heading-2", "paragraph", "unordered-list", "table"]);
    const paragraph = doc.content[1]!;
    assert.ok(paragraph.content.some((node) => node.nodeType === "hyperlink"));
    assert.ok(paragraph.content.some((node) => "marks" in node && node.marks.some((mark) => mark.type === "bold")));
  });

  it("drops raw HTML and unsafe links", () => {
    const doc = markdownToRichText('Hello <script>alert(1)</script> [click](javascript:alert(1)) <img src=x onerror=alert(1)>\n\n<div>block</div>');
    const text = richTextPlainText(doc);
    assert.ok(!text.includes("script") && !text.includes("alert(1)") && !text.includes("block"));
    assert.ok(!JSON.stringify(doc).includes("javascript:"));
    assert.ok(text.includes("click"));
  });

  it("clamps heading levels to 2 through 4", () => {
    const doc = markdownToRichText("# One\n\n###### Six");
    assert.deepEqual(doc.content.map((node) => node.nodeType), ["heading-2", "heading-4"]);
  });

  it("rejects very long input", () => {
    assert.throws(() => markdownToRichText("a".repeat(20_001)));
  });
});

describe("validateGraph", () => {
  it("accepts the example brand", () => {
    const { errors } = validateGraph(example, { assets: ASSETS, mode: "seed" });
    assert.deepEqual(errors, []);
  });

  it("catches limits, em dashes, and unknown fields", () => {
    const entries = clone(example);
    const hero = find(entries, "lw-he-home");
    hero.fields.headline = "x".repeat(71);
    hero.fields.subheadline = `One ${String.fromCharCode(0x2014)} two`;
    hero.fields.color = "red";
    const { errors } = validateGraph(entries, { assets: ASSETS, mode: "seed" });
    assert.ok(errors.some((e) => e.includes("lw-he-home.headline") && e.includes("max 70")));
    assert.ok(errors.some((e) => e.includes("lw-he-home.subheadline") && e.includes("em dash")));
    assert.ok(errors.some((e) => e.includes('unknown field "color"')));
  });

  it("catches a broken funnel chain", () => {
    const entries = clone(example);
    delete find(entries, "lw-pg-solutions").fields.nextStep;
    const { errors } = validateGraph(entries, { assets: ASSETS, mode: "seed" });
    assert.ok(errors.some((e) => e.includes("lw-pg-solutions.nextStep")));
  });

  it("catches missing assets and wrong link types", () => {
    const entries = clone(example);
    find(entries, "lw-he-home").fields.image = { sys: { type: "Link", linkType: "Asset", id: "img-nope" } };
    find(entries, "lw-pg-home").fields.hero = { sys: { type: "Link", linkType: "Entry", id: "lw-ct-book-demo" } };
    const { errors } = validateGraph(entries, { assets: ASSETS, mode: "seed" });
    assert.ok(errors.some((e) => e.includes('asset "img-nope" does not exist')));
    assert.ok(errors.some((e) => e.includes("lw-pg-home.hero: links to a cta")));
  });

  it("requires goal CTAs to point at the goal page and stats to be labelled illustrative", () => {
    const entries = clone(example);
    find(entries, "lw-ct-book-demo").fields.destinationPage = { sys: { type: "Link", linkType: "Entry", id: "lw-pg-customers" } };
    find(entries, "lw-st-home-results").fields.footnote = "Real numbers.";
    const { errors } = validateGraph(entries, { assets: ASSETS, mode: "seed" });
    assert.ok(errors.some((e) => e.includes("lw-ct-book-demo") && e.includes("goal page")));
    assert.ok(errors.some((e) => e.includes("lw-st-home-results.footnote")));
  });

  it("requires the legal disclaimer prefix", () => {
    const entries = clone(example);
    find(entries, "brand-lumenwork").fields.legalDisclaimer = "Sample content.";
    const { errors } = validateGraph(entries, { assets: ASSETS, mode: "seed" });
    assert.ok(errors.some((e) => e.includes("legalDisclaimer")));
  });
});
