import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ToolContext } from "../src/lib/opal/context";
import { ToolError } from "../src/lib/opal/errors";
import { deleteEntry, removeFaq, revertEntry } from "../src/lib/opal/tools-undo";
import { createArticle, createFaq, publishEntry, updateEntry } from "../src/lib/opal/tools-write";
import { entry, fakeCma, type FakeCma } from "./fixtures/fake-cma";

const SITE = "https://site.test";
const L = "en-US";
const ref = (id: string) => ({ sys: { type: "Link", linkType: "Entry", id } });
const ctxFor = (cma: FakeCma): ToolContext => ({ client: cma.client, siteUrl: SITE, previewSecret: "preview-secret-value-that-must-never-leak-0123456789", now: new Date("2026-10-08T12:00:00Z"), memo: new Map() });
const brand = "defeo-mutual";
const questions = [
  { question: "How long does a claim take?", answer: "Most claims are settled within ten business days." },
  { question: "Can I change my deductible?", answer: "Yes, at renewal or by calling us at any time." },
];

async function toolError(run: Promise<unknown>): Promise<ToolError> {
  try {
    await run;
  } catch (error) {
    assert.ok(error instanceof ToolError, `expected a ToolError, got ${String(error)}`);
    return error;
  }
  assert.fail("expected the call to be refused");
}

/** The DeFeo home page, live with one section, plus an Opal FAQ added to it as a draft. */
async function withDraftFaq() {
  const cma = fakeCma();
  cma.entries.set("rt-hl-1", entry("rt-hl-1", "richTextSection", { internalName: "DeFeo - Home - Intro", brand: ref("brand-harborline"), body: { nodeType: "document", content: [] } }, { version: 2, publishedVersion: 1 }));
  const page = cma.entries.get("page-hl-home")!;
  page.fields.sections = { [L]: [ref("rt-hl-1")] };
  cma.live.set("page-hl-home", structuredClone(page));
  const draft = await createFaq(ctxFor(cma), { brand, page_id: "page-hl-home", page_version: 4, questions });
  return { cma, draft };
}
const sectionIds = (cma: FakeCma) => ((cma.entries.get("page-hl-home")!.fields.sections as Record<string, Array<{ sys: { id: string } }>> | undefined)?.[L] ?? []).map((l) => l.sys.id);

describe("remove_faq", () => {
  it("takes an Opal FAQ off the page as a draft change and keeps the FAQ", async () => {
    const { cma, draft } = await withDraftFaq();
    const result = await removeFaq(ctxFor(cma), { brand, page_id: "page-hl-home", page_version: draft.version, faq_entry_id: draft.faq_entry_id });
    assert.deepEqual(sectionIds(cma), ["rt-hl-1"]);
    assert.equal(result.removed_faq_entry_id, draft.faq_entry_id);
    assert.ok(cma.entries.has(draft.faq_entry_id));
    assert.match(result.note, /delete_entry/);
  });

  it("publishes in the same call when the page then matches what is live", async () => {
    const { cma, draft } = await withDraftFaq();
    const result = await removeFaq(ctxFor(cma), { brand, page_id: "page-hl-home", page_version: draft.version, faq_entry_id: draft.faq_entry_id, publish: true });
    assert.equal(result.status, "published");
    assert.equal(result.publish_error, undefined);
  });

  it("does not publish when the page has other unpublished changes", async () => {
    const { cma, draft } = await withDraftFaq();
    const titled = await updateEntry(ctxFor(cma), { brand, entry_id: "page-hl-home", version: draft.version, fields: { title: "Welcome home" } });
    const result = await removeFaq(ctxFor(cma), { brand, page_id: "page-hl-home", page_version: titled.version, faq_entry_id: draft.faq_entry_id, publish: true });
    assert.equal(result.status, "changed");
    assert.match(result.publish_error ?? "", /other unpublished changes/);
  });

  it("refuses original sections and IDs that are not on the page", async () => {
    const { cma, draft } = await withDraftFaq();
    const original = await toolError(removeFaq(ctxFor(cma), { brand, page_id: "page-hl-home", page_version: draft.version, faq_entry_id: "rt-hl-1" }));
    assert.equal(original.code, "not_allowed");
    const missing = await toolError(removeFaq(ctxFor(cma), { brand, page_id: "page-hl-home", page_version: draft.version, faq_entry_id: "hero-hl-home" }));
    assert.equal(missing.code, "invalid_input");
    assert.deepEqual(sectionIds(cma), ["rt-hl-1", draft.faq_entry_id]);
  });
});

describe("revert_entry", () => {
  it("to live throws away unpublished edits and leaves the entry published", async () => {
    const cma = fakeCma();
    const edited = await updateEntry(ctxFor(cma), { brand, entry_id: "hero-hl-home", version: 3, fields: { headline: "A different headline" } });
    assert.equal(edited.status, "changed");
    const result = await revertEntry(ctxFor(cma), { brand, entry_id: "hero-hl-home", version: edited.version, to: "live" });
    assert.equal(result.status, "published");
    assert.equal((cma.entries.get("hero-hl-home")!.fields.headline as Record<string, string>)[L], "Insurance without the fine print maze");
  });

  it("to live on a page undoes an unpublished create_faq", async () => {
    const { cma, draft } = await withDraftFaq();
    await revertEntry(ctxFor(cma), { brand, entry_id: "page-hl-home", version: draft.version, to: "live" });
    assert.deepEqual(sectionIds(cma), ["rt-hl-1"]);
  });

  it("to original puts back the seed copy as a draft, and only the copy fields", async () => {
    const cma = fakeCma();
    // A real seed entry ID (the Example hero), here owned by the fake DeFeo brand with an edited, live headline.
    cma.entries.set("ex-he-home", entry("ex-he-home", "hero", { internalName: "Edited name", brand: ref("brand-harborline"), headline: "An edited headline", layout: "split" }, { version: 5, publishedVersion: 4 }));
    const result = await revertEntry(ctxFor(cma), { brand, entry_id: "ex-he-home", version: 5, to: "original" });
    assert.equal(result.status, "changed");
    const hero = cma.entries.get("ex-he-home")!;
    assert.equal((hero.fields.headline as Record<string, string>)[L], "UPC, Barcodes & Prefixes");
    assert.equal((hero.fields.internalName as Record<string, string>)[L], "Edited name", "read-only fields are untouched");
    assert.equal((hero.fields.brand as Record<string, { sys: { id: string } }>)[L]?.sys.id, "brand-harborline", "the brand is untouched");
    assert.equal((hero.fields.layout as Record<string, string>)[L], "split");
  });

  it("explains when there is nothing to revert, and refuses what has no live or original version", async () => {
    const cma = fakeCma();
    assert.equal((await revertEntry(ctxFor(cma), { brand, entry_id: "hero-hl-home", version: 3, to: "live" })).changed, false);
    assert.match((await toolError(revertEntry(ctxFor(cma), { brand, entry_id: "hero-hl-home", version: 3, to: "original" }))).message, /not part of the site's original content/);
    const article = await createArticle(ctxFor(cma), { brand, title: "A new article title", summary: "A short summary of the article.", body_markdown: "## Heading\n\nA paragraph of body text for the article.", hero_image_id: "img-hl-1" });
    assert.match((await toolError(revertEntry(ctxFor(cma), { brand, entry_id: article.entry_id, version: article.version, to: "live" }))).message, /not live.*delete_entry/);
    assert.match((await toolError(revertEntry(ctxFor(cma), { brand, entry_id: article.entry_id, version: article.version, to: "original" }))).message, /created through this API/);
  });

  it("does not republish when the draft has other changes outside the copy fields", async () => {
    const cma = fakeCma();
    const edited = await updateEntry(ctxFor(cma), { brand, entry_id: "hero-hl-home", version: 3, fields: { headline: "A different headline" } });
    const hero = cma.entries.get("hero-hl-home")!;
    hero.fields.layout = { [L]: "full_bleed" }; // someone else changed a field Opal cannot write
    const result = await revertEntry(ctxFor(cma), { brand, entry_id: "hero-hl-home", version: edited.version, to: "live" });
    assert.equal(result.status, "changed");
    assert.match(result.note, /not republished/);
    assert.equal((cma.entries.get("hero-hl-home")!.fields.layout as Record<string, string>)[L], "full_bleed");
  });

  it("never writes back a link to a section that was deleted", async () => {
    const { cma, draft } = await withDraftFaq();
    const page = cma.entries.get("page-hl-home")!;
    cma.live.set("page-hl-home", structuredClone(page)); // the FAQ went live with the page
    page.sys.publishedVersion = page.sys.version;
    page.sys.version += 1;
    const removed = await removeFaq(ctxFor(cma), { brand, page_id: "page-hl-home", page_version: page.sys.version, faq_entry_id: draft.faq_entry_id });
    cma.entries.delete(draft.faq_entry_id); // deleted behind the API's back
    await revertEntry(ctxFor(cma), { brand, entry_id: "page-hl-home", version: removed.version, to: "live" });
    assert.deepEqual(sectionIds(cma), ["rt-hl-1"]);
  });

  it("refuses people and other brands", async () => {
    const cma = fakeCma();
    assert.equal((await toolError(revertEntry(ctxFor(cma), { brand, entry_id: "person-hl-author", version: 2, to: "live" }))).code, "not_allowed");
    assert.equal((await toolError(revertEntry(ctxFor(cma), { brand, entry_id: "page-lw-home", version: 4, to: "live" }))).code, "not_allowed");
  });
});

describe("delete_entry", () => {
  it("deletes an article Opal created, even a published one, but never original content", async () => {
    const cma = fakeCma();
    const article = await createArticle(ctxFor(cma), { brand, title: "A new article title", summary: "A short summary of the article.", body_markdown: "## Heading\n\nA paragraph of body text for the article.", hero_image_id: "img-hl-1", publish: true });
    const result = await deleteEntry(ctxFor(cma), { brand, entry_id: article.entry_id, version: article.version });
    assert.deepEqual(result.deleted_entry_ids, [article.entry_id]);
    assert.ok(!cma.entries.has(article.entry_id));
    const seed = await toolError(deleteEntry(ctxFor(cma), { brand, entry_id: "article-hl-seed", version: 6 }));
    assert.equal(seed.code, "not_allowed");
    assert.match(seed.message, /original content/);
    for (const id of ["hero-hl-home", "page-hl-home"]) {
      assert.equal((await toolError(deleteEntry(ctxFor(cma), { brand, entry_id: id, version: cma.entries.get(id)!.sys.version }))).code, "not_allowed");
    }
    assert.ok(cma.entries.has("article-hl-seed"));
  });

  it("refuses an FAQ still on a page or a question still in an FAQ, then deletes the FAQ and its questions once removed", async () => {
    const { cma, draft } = await withDraftFaq();
    const onPage = await toolError(deleteEntry(ctxFor(cma), { brand, entry_id: draft.faq_entry_id, version: 1 }));
    assert.match(onPage.message, /page-hl-home.*remove_faq/);
    const question = await toolError(deleteEntry(ctxFor(cma), { brand, entry_id: draft.question_entry_ids[0]!, version: 1 }));
    assert.match(question.message, /still used by/);
    const removed = await removeFaq(ctxFor(cma), { brand, page_id: "page-hl-home", page_version: draft.version, faq_entry_id: draft.faq_entry_id });
    assert.ok(removed);
    const result = await deleteEntry(ctxFor(cma), { brand, entry_id: draft.faq_entry_id, version: 1 });
    assert.deepEqual(result.deleted_entry_ids, [draft.faq_entry_id, ...draft.question_entry_ids]);
    for (const id of [draft.faq_entry_id, ...draft.question_entry_ids]) assert.ok(!cma.entries.has(id));
  });

  it("refuses an FAQ the live page still shows, even after it was taken off the draft page", async () => {
    const { cma, draft } = await withDraftFaq();
    await publishEntry(ctxFor(cma), { brand, entry_id: "page-hl-home", version: draft.version });
    const page = cma.entries.get("page-hl-home")!;
    await removeFaq(ctxFor(cma), { brand, page_id: "page-hl-home", page_version: page.sys.version, faq_entry_id: draft.faq_entry_id });
    const error = await toolError(deleteEntry(ctxFor(cma), { brand, entry_id: draft.faq_entry_id, version: cma.entries.get(draft.faq_entry_id)!.sys.version }));
    assert.match(error.message, /page-hl-home.*live site.*publish the page/);
    assert.ok(cma.entries.has(draft.faq_entry_id));
  });

  it("refuses a stale version", async () => {
    const cma = fakeCma();
    const article = await createArticle(ctxFor(cma), { brand, title: "A new article title", summary: "A short summary of the article.", body_markdown: "## Heading\n\nA paragraph of body text for the article.", hero_image_id: "img-hl-1" });
    assert.equal((await toolError(deleteEntry(ctxFor(cma), { brand, entry_id: article.entry_id, version: article.version + 1 }))).code, "version_conflict");
  });

  it("refuses a seed-tagged entry even if it also carries the opal tag, and another brand's entry", async () => {
    const cma = fakeCma();
    const both = entry("faq-hl-both", "faq", { internalName: "DeFeo - FAQ", brand: ref("brand-harborline"), items: [] });
    both.metadata = { tags: [{ sys: { id: "opal" } }, { sys: { id: "seed" } }] };
    cma.entries.set("faq-hl-both", both);
    assert.equal((await toolError(deleteEntry(ctxFor(cma), { brand, entry_id: "faq-hl-both", version: 1 }))).code, "not_allowed");
    const other = await createArticle(ctxFor(cma), { brand: "stoutware", title: "Another new article", summary: "A short summary of the article.", body_markdown: "## Heading\n\nA paragraph of body text for the article.", hero_image_id: "img-lw-1" });
    assert.equal((await toolError(deleteEntry(ctxFor(cma), { brand, entry_id: other.entry_id, version: other.version }))).code, "not_allowed");
    assert.ok(cma.entries.has(other.entry_id));
  });

  it("only calls methods the Opal policy allows, and never archives", async () => {
    const { cma, draft } = await withDraftFaq();
    await revertEntry(ctxFor(cma), { brand, entry_id: "page-hl-home", version: draft.version, to: "live" });
    await deleteEntry(ctxFor(cma), { brand, entry_id: draft.faq_entry_id, version: 1 });
    const allowed = new Set(["entry.get", "entry.getMany", "entry.create", "entry.update", "entry.publish", "entry.unpublish", "entry.delete", "entry.getPublished", "asset.get", "asset.getMany"]);
    assert.ok(cma.calls.every((call) => allowed.has(call)), cma.calls.join(", "));
    assert.ok(!cma.calls.some((call) => /archive/.test(call)));
  });
});
