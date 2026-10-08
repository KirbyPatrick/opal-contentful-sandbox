import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_API_MARKDOWN_LENGTH, MAX_EMPHASIS_MARKERS, MAX_QUOTE_DEPTH, markdownIssues, richTextToMarkdown } from "../src/lib/opal/markdown";
import { isSafeHttpUrl, markdownToRichText } from "../src/lib/richtext/markdown";

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
    assert.deepEqual(markdownIssues("x".repeat(MAX_API_MARKDOWN_LENGTH + 1)), [`longer than ${MAX_API_MARKDOWN_LENGTH} characters`]);
    assert.deepEqual(markdownIssues("x".repeat(MAX_API_MARKDOWN_LENGTH)), []);
  });

  it("refuses over-long text before tokenizing, so adversarial input cannot tie up the server", () => {
    // Repeated unmatched emphasis markers make the tokenizer's cost grow much faster than the length.
    for (const unit of ["*a ", "**a_", "[a](", "> "]) {
      const started = Date.now();
      const issues = markdownIssues(unit.repeat(Math.ceil(256 * 1024 / unit.length)));
      assert.ok(Date.now() - started < 100, "an oversized body must be refused almost instantly");
      assert.equal(issues.length, 1);
    }
  });

  it("caps emphasis markers so the tokenizer's worst case stays in milliseconds", () => {
    for (const unit of ["*a ", "**a_", "_a ", "~~a "]) {
      const markersPerUnit = (unit.match(/[*_~]/g) ?? []).length;
      // Just inside the budget: must be fast.
      let started = Date.now();
      markdownIssues(unit.repeat(Math.floor(MAX_EMPHASIS_MARKERS / markersPerUnit)));
      assert.ok(Date.now() - started < 100, `${JSON.stringify(unit)} inside the budget took ${Date.now() - started} ms`);
      // Over the budget at the full length limit: refused before tokenizing.
      started = Date.now();
      const issues = markdownIssues(unit.repeat(Math.floor(MAX_API_MARKDOWN_LENGTH / unit.length)));
      assert.ok(Date.now() - started < 50);
      assert.match(issues[0] ?? "", /emphasis characters/);
    }
  });

  it("accepts ordinary formatted articles within the budget", () => {
    const article = Array.from({ length: 20 }, (_, i) => `Paragraph ${i} with **bold**, *italic*, and a [link](https://example.com/p_${i}).`).join("\n\n");
    assert.deepEqual(markdownIssues(article), []);
  });

  it("refuses deeply nested quotes and lists with a clear message instead of crashing", () => {
    const deepQuote = `${"> ".repeat(MAX_QUOTE_DEPTH + 1)}text that is nested`;
    assert.match(markdownIssues(deepQuote)[0] ?? "", /nested more than/);
    assert.deepEqual(markdownIssues(`${"> ".repeat(MAX_QUOTE_DEPTH)}text that is nested`), []);
    const started = Date.now();
    assert.match(markdownIssues(`${">".repeat(9000)} x`)[0] ?? "", /nested more than/);
    assert.ok(Date.now() - started < 200);
    // Deep list nesting must never throw, whatever the tokenizer does with it.
    const deepList = Array.from({ length: 400 }, (_, i) => `${"  ".repeat(i)}- item ${i}`).join("\n");
    assert.doesNotThrow(() => markdownIssues(deepList));
  });
});

describe("isSafeHttpUrl", () => {
  it("accepts only full http and https URLs", () => {
    for (const ok of ["https://example.com", "http://example.com/a?b=1#c", "HTTPS://EXAMPLE.COM"]) assert.equal(isSafeHttpUrl(ok), true, ok);
    for (const bad of ["http:evil.example", "https:evil.example", "https://a b.com", "https://x.test/\tpath", "//evil.test", "/relative", "javascript:alert(1)", "data:text/html,x", "ftp://x.test", "mailto:a@b.co", "", "https://"]) {
      assert.equal(isSafeHttpUrl(bad), false, JSON.stringify(bad));
    }
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
