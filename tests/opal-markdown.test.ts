import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { markdownIssues, richTextToMarkdown } from "../src/lib/opal/markdown";
import { markdownToRichText } from "../src/lib/richtext/markdown";

const EM_DASH = String.fromCharCode(0x2014);

describe("markdownIssues", () => {
  it("accepts the supported subset", () => {
    const text = "## Heading\n\nA paragraph with **bold**, *italic*, and a [link](https://example.com/a?b=1).\n\n- one\n- two\n\n> quote\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n---\n";
    assert.deepEqual(markdownIssues(text), []);
  });

  it("flags raw HTML, block and inline", () => {
    assert.ok(markdownIssues("<div>block</div>").some((i) => /HTML/.test(i)));
    assert.ok(markdownIssues("text <span>inline</span> text").some((i) => /HTML/.test(i)));
    assert.ok(markdownIssues("<script>alert(1)</script>").some((i) => /HTML/.test(i)));
  });

  it("flags images, including inside lists and tables", () => {
    assert.ok(markdownIssues("![alt](https://example.com/a.png)").some((i) => /images/.test(i)));
    assert.ok(markdownIssues("- item ![alt](https://example.com/a.png)").some((i) => /images/.test(i)));
    assert.ok(markdownIssues("| a |\n|---|\n| ![x](https://example.com/a.png) |").some((i) => /images/.test(i)));
  });

  it("flags every link that is not a full http or https URL, wherever it sits", () => {
    for (const href of ["/relative", "javascript:alert(1)", "data:text/html,x", "mailto:a@b.co", "ftp://x.test/f", "//evil.test/x", "#anchor"]) {
      assert.ok(markdownIssues(`See [here](${href}) now`).some((i) => /http or https/.test(i)), href);
    }
    assert.ok(markdownIssues("- a [bad](/x) link in a list").some((i) => /http or https/.test(i)));
    assert.ok(markdownIssues("> a [bad](/x) link in a quote").some((i) => /http or https/.test(i)));
    assert.ok(markdownIssues("| a |\n|---|\n| [bad](/x) |").some((i) => /http or https/.test(i)));
    assert.deepEqual(markdownIssues("See [here](http://example.com) and [there](https://example.com)"), []);
  });

  it("flags em dashes and over-long text", () => {
    assert.ok(markdownIssues(`a ${EM_DASH} b`).some((i) => /em dash/.test(i)));
    assert.ok(markdownIssues("x".repeat(20_001)).some((i) => /longer than/.test(i)));
  });
});

describe("richTextToMarkdown", () => {
  const samples = [
    "## Heading two\n\n### Heading three\n\nA paragraph with **bold**, *italic*, ***both***, and a [link](https://example.com/path).",
    "- first\n- second\n- third",
    "1. one\n2. two\n3. three",
    "> A quoted line.",
    "Before\n\n---\n\nAfter",
    "| Plan | Price |\n| --- | --- |\n| Basic | $10 |\n| Plus | $20 |",
    "- parent item with **bold**\n- another item",
  ];

  for (const sample of samples) {
    it(`round-trips: ${sample.slice(0, 32).replace(/\n/g, " ")}`, () => {
      const first = richTextToMarkdown(markdownToRichText(sample));
      assert.equal(first, sample);
      // Converting the output again must not change the document.
      assert.deepEqual(markdownToRichText(first), markdownToRichText(sample));
    });
  }

  it("keeps spaces outside bold and italic markers", () => {
    const document = markdownToRichText("a **bold** b");
    assert.equal(richTextToMarkdown(document), "a **bold** b");
  });

  it("returns an empty string for missing or odd input", () => {
    assert.equal(richTextToMarkdown(undefined), "");
    assert.equal(richTextToMarkdown({ nodeType: "paragraph" }), "");
    assert.equal(richTextToMarkdown({ nodeType: "document", content: [] }), "");
  });
});
