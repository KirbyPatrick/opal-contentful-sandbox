import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contentModel } from "../seed/lib/validate";
import { SLUG_MAX, TYPES, slugify, validateField, type FieldSpec } from "../src/lib/opal/fields";
import { ToolError } from "../src/lib/opal/errors";

const EM_DASH = String.fromCharCode(0x2014);
const model = contentModel();

const sizeMax = (validations?: Array<{ size?: { max?: number } }>) => validations?.find((v) => v.size)?.size?.max;

describe("allowlist matches the content model", () => {
  for (const [typeName, spec] of Object.entries(TYPES)) {
    describe(typeName, () => {
      const type = model.get(typeName);

      it("exists in the content model, along with every field it mentions", () => {
        assert.ok(type, `${typeName} is not a content type`);
        for (const name of [spec.titleField, ...Object.keys(spec.editable), ...spec.readOnly, ...spec.links]) {
          assert.ok(type?.fields.has(name), `${typeName}.${name} is not a field`);
        }
      });

      for (const [name, rule] of Object.entries(spec.editable)) {
        it(`${name}: type, required flag, and limits match`, () => {
          const field = type?.fields.get(name);
          assert.ok(field, "field exists");
          const required = "required" in rule ? Boolean(rule.required) : false;
          assert.equal(Boolean(field?.required), required, "required");
          switch (rule.kind) {
            case "text":
              assert.ok(field?.type === "Symbol" || field?.type === "Text");
              assert.equal(sizeMax(field?.validations), rule.max, "max length");
              break;
            case "richText":
              assert.equal(field?.type, "RichText");
              break;
            case "asset":
              assert.equal(field?.type, "Link");
              assert.equal(field?.linkType, "Asset");
              break;
            case "date":
              assert.equal(field?.type, "Date");
              break;
            case "list":
              assert.equal(field?.type, "Array");
              assert.equal(sizeMax(field?.validations), rule.maxItems, "max items");
              assert.equal(sizeMax(field?.items?.validations), rule.itemMax, "max item length");
              break;
          }
        });
      }
    });
  }

  it("never lets the API edit identity, structure, or links", () => {
    const forbidden = ["slug", "brand", "pageType", "funnelStep", "nextStep", "hero", "primaryCta", "sections", "detailSections",
      "layout", "goalType", "destinationPage", "destinationUrl", "offeringType", "collectionType", "price", "internalName",
      "author", "relatedPage", "cta", "faq", "items", "role", "style"];
    for (const [typeName, spec] of Object.entries(TYPES)) {
      for (const name of Object.keys(spec.editable)) assert.ok(!forbidden.includes(name), `${typeName}.${name} must not be editable`);
    }
  });

  it("only editable kinds that cannot point at other entries", () => {
    for (const spec of Object.values(TYPES)) {
      for (const rule of Object.values(spec.editable)) assert.ok(["text", "richText", "asset", "list", "date"].includes(rule.kind));
    }
  });

  it("only articles can be created or unpublished", () => {
    assert.deepEqual(Object.entries(TYPES).filter(([, s]) => s.canCreate).map(([n]) => n), ["article"]);
    assert.deepEqual(Object.entries(TYPES).filter(([, s]) => s.canUnpublish).map(([n]) => n), ["article"]);
  });
});

describe("validateField", () => {
  const text: FieldSpec = { kind: "text", max: 10, required: true };

  const refuses = (rule: FieldSpec, value: unknown, pattern: RegExp) => {
    assert.throws(() => validateField("f", rule, value), (error: unknown) => error instanceof ToolError && error.code === "invalid_input" && pattern.test(error.message));
  };

  it("trims and accepts valid text", () => {
    assert.equal(validateField("f", text, "  hello  "), "hello");
  });

  it("refuses empty, long, multi-line, non-text, and em dash values", () => {
    refuses(text, "   ", /empty/);
    refuses(text, "x".repeat(11), /limit is 10/);
    refuses(text, "a\nb", /single line/);
    refuses(text, 5, /must be text/);
    refuses(text, `a${EM_DASH}b`, /em dash/);
  });

  it("enforces patterns and allowed values", () => {
    refuses({ kind: "text", max: 10, values: ["a", "b"] }, "c", /one of/);
    refuses({ kind: "text", max: 10, pattern: /^\d+$/ }, "abc", /wrong format/);
  });

  it("validates lists item by item", () => {
    const list: FieldSpec = { kind: "list", maxItems: 2, itemMax: 5, pattern: /^[a-z]+$/ };
    assert.deepEqual(validateField("f", list, ["ab", "cd"]), ["ab", "cd"]);
    refuses(list, ["a", "b", "c"], /limit is 2/);
    refuses(list, ["toolong"], /limit is 5/);
    refuses(list, ["AB"], /lowercase/);
    refuses(list, "ab", /array/);
    refuses(list, [1], /must be text/);
  });

  it("checks dates", () => {
    const date: FieldSpec = { kind: "date" };
    assert.equal(validateField("f", date, "2026-10-08"), "2026-10-08");
    refuses(date, "2026-13-45", /date like/);
    refuses(date, "yesterday", /date like/);
  });

  it("converts Markdown to rich text and refuses what the converter would silently drop", () => {
    const rich: FieldSpec = { kind: "richText" };
    const doc = validateField("body", rich, "A paragraph with plenty of words in it, and [a link](https://example.com).") as { nodeType: string };
    assert.equal(doc.nodeType, "document");
    refuses(rich, "Some text with enough words <b>bold</b> in it.", /raw HTML/);
    refuses(rich, "Some text with enough words and a [bad](ftp://example.com) link.", /http or https/);
    refuses(rich, "short", /nearly empty/);
    refuses(rich, 5, /Markdown/);
    refuses(rich, `Some text with enough words ${EM_DASH} and a dash.`, /em dash/);
  });

  it("accepts asset IDs only, never URLs", () => {
    const asset: FieldSpec = { kind: "asset" };
    assert.equal(validateField("image", asset, "img-1"), "img-1");
    refuses(asset, "https://images.ctfassets.net/x.jpg", /asset ID/);
    refuses(asset, "../etc", /asset ID/);
  });
});

describe("slugify", () => {
  it("makes lowercase hyphenated slugs and strips accents", () => {
    assert.equal(slugify("How Claims Work!"), "how-claims-work");
    assert.equal(slugify("Café déjà vu"), "cafe-deja-vu");
    assert.equal(slugify("  --A  B--  "), "a-b");
  });
  it("is empty when there is nothing usable, and never exceeds the limit", () => {
    assert.equal(slugify("!!!"), "");
    assert.ok(slugify("word ".repeat(60)).length <= SLUG_MAX);
    assert.ok(!slugify("word ".repeat(60)).endsWith("-"));
  });
});
