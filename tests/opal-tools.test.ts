import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ToolContext } from "../src/lib/opal/context";
import { ToolError } from "../src/lib/opal/errors";
import { findPages, getContentRules, getEntry, listBrandImages, listBrands } from "../src/lib/opal/tools-read";
import { createArticle, publishEntry, unpublishEntry, updateEntry } from "../src/lib/opal/tools-write";
import { fakeCma, type FakeCma } from "./fixtures/fake-cma";

const SITE = "https://site.test";
const PREVIEW_SECRET = "preview-secret-value-that-must-never-leak-0123456789";
const NOW = new Date("2026-10-08T12:00:00Z");

function setup(): { cma: FakeCma; ctx: ToolContext } {
  const cma = fakeCma();
  return { cma, ctx: { client: cma.client, siteUrl: SITE, previewSecret: PREVIEW_SECRET, now: NOW, memo: new Map() } };
}

/** A fresh context over the same fake, as the next request would have. */
const next = (cma: FakeCma): ToolContext => ({ client: cma.client, siteUrl: SITE, previewSecret: PREVIEW_SECRET, now: NOW, memo: new Map() });

async function toolError(run: Promise<unknown>): Promise<ToolError> {
  try {
    await run;
  } catch (error) {
    assert.ok(error instanceof ToolError, `expected a ToolError, got ${String(error)}`);
    return error;
  }
  assert.fail("expected the call to be refused");
}

const article = {
  brand: "defeo-mutual",
  title: "What a deductible really does",
  summary: "A plain look at how deductibles change what you pay.",
  body_markdown: "## The short version\n\nA deductible is what you pay first. See [our guide](https://example.com/guide) for more.\n\n- Higher deductible, lower premium\n- Lower deductible, higher premium",
  hero_image_id: "img-hl-1",
};

describe("read tools", () => {
  it("list_brands returns every brand with a slug to use elsewhere", async () => {
    const { ctx } = setup();
    const result = await listBrands(ctx);
    assert.deepEqual(result.brands.map((b) => b.slug), ["defeo-mutual", "stoutware"]);
    assert.equal(result.brands[0]?.home_url, `${SITE}/defeo-mutual`);
  });

  it("an unknown brand is refused and the agent is told to ask the user", async () => {
    const { ctx } = setup();
    const error = await toolError(findPages(ctx, { brand: "acme" }));
    assert.equal(error.code, "unknown_brand");
    assert.match(error.message, /ask the user/i);
    assert.match(error.message, /defeo-mutual/);
  });

  it("accepts the brand name as well as the slug, but never guesses", async () => {
    const { ctx } = setup();
    assert.equal((await findPages(ctx, { brand: "DeFeo Mutual" })).brand, "defeo-mutual");
    assert.equal((await toolError(findPages(ctx, { brand: "harbor" }))).code, "unknown_brand");
  });

  it("find_pages stays inside the brand and echoes status, preview URL, and live URL", async () => {
    const { ctx } = setup();
    const result = await findPages(ctx, { brand: "defeo-mutual" });
    assert.ok(result.results.length >= 5);
    assert.ok(result.results.every((r) => r.brand === "defeo-mutual"));
    assert.ok(!result.results.some((r) => r.entry_id === "page-lw-home"));
    const seed = result.results.find((r) => r.entry_id === "article-hl-seed");
    assert.equal(seed?.status, "published");
    assert.equal(seed?.live_url, `${SITE}/defeo-mutual/journal/how-claims-work`);
    assert.match(seed?.preview_url ?? "", /^https:\/\/site\.test\/api\/draft\?entry=article-hl-seed&exp=\d+&sig=[0-9a-f]{64}$/);
    const home = result.results.find((r) => r.entry_id === "page-hl-home");
    assert.equal(home?.live_url, `${SITE}/defeo-mutual`);
  });

  it("find_pages filters by type and query", async () => {
    const { ctx } = setup();
    const articles = await findPages(ctx, { brand: "defeo-mutual", type: "article" });
    assert.deepEqual(articles.results.map((r) => r.entry_id), ["article-hl-seed"]);
    const none = await findPages(ctx, { brand: "defeo-mutual", query: "zzz-no-match" });
    assert.equal(none.count, 0);
  });

  it("no response ever contains the preview secret", async () => {
    const { ctx } = setup();
    const everything = JSON.stringify([
      await listBrands(ctx),
      await findPages(ctx, { brand: "defeo-mutual" }),
      await getEntry(ctx, { entry_id: "article-hl-seed" }),
      await getContentRules(ctx, { brand: "defeo-mutual" }),
      await listBrandImages(ctx, { brand: "defeo-mutual" }),
    ]);
    assert.ok(!everything.includes(PREVIEW_SECRET));
  });

  it("get_entry returns editable text as Markdown, the version, and linked entry IDs", async () => {
    const { ctx } = setup();
    const result = await getEntry(ctx, { entry_id: "article-hl-seed" });
    assert.equal(result.version, 6);
    assert.equal(result.status, "published");
    assert.equal(result.editable_fields.body, "Claims start with a call. Then an adjuster visits.");
    assert.equal(result.editable_fields.heroImage, "img-hl-1");
    assert.equal(result.can_unpublish, true);
    const page = await getEntry(ctx, { entry_id: "page-hl-home" });
    assert.deepEqual(page.links, { hero: ["hero-hl-home"], primaryCta: ["cta-hl-quote"] });
    assert.equal(page.can_unpublish, false);
  });

  it("get_entry refuses a brand mismatch and entries it does not expose", async () => {
    const { ctx } = setup();
    assert.equal((await toolError(getEntry(ctx, { entry_id: "article-hl-seed", brand: "stoutware" }))).code, "not_allowed");
    assert.equal((await toolError(getEntry(ctx, { entry_id: "brand-harborline" }))).code, "not_allowed");
    assert.equal((await toolError(getEntry(ctx, { entry_id: "does-not-exist" }))).code, "not_found");
  });

  it("get_content_rules returns the brand voice and which fields are editable", async () => {
    const { ctx } = setup();
    const rules = await getContentRules(ctx, { brand: "defeo-mutual" });
    assert.equal(rules.voice.description, "Plain and steady.");
    assert.deepEqual(rules.voice.dont, ["No hype", "No jargon"]);
    const types = rules.content_types as Record<string, { can_create: boolean; editable_fields: Record<string, unknown> }>;
    assert.equal(types.article?.can_create, true);
    assert.equal(types.page?.can_create, false);
    assert.ok(!("slug" in (types.page?.editable_fields ?? {})));
    const narrowed = await getContentRules(ctx, { brand: "defeo-mutual", content_type: "hero" });
    assert.deepEqual(Object.keys(narrowed.content_types), ["hero"]);
  });

  it("list_brand_images lists only that brand's images, no documents", async () => {
    const { ctx } = setup();
    const result = await listBrandImages(ctx, { brand: "defeo-mutual" });
    assert.deepEqual(result.images.map((i) => i.asset_id).sort(), ["img-hl-1", "img-hl-2"]);
    assert.equal(result.images[0]?.alt_text, "A family at a kitchen table");
    assert.match(result.images[0]?.thumbnail_url ?? "", /^https:\/\/images\.ctfassets\.net\//);
    assert.equal(result.images[0]?.published, true);
  });
});

describe("create_article", () => {
  it("creates a tagged draft in the right brand, with a preview link and no live URL", async () => {
    const { cma, ctx } = setup();
    const result = await createArticle(ctx, article);
    assert.equal(result.status, "draft");
    assert.equal(result.live_url, null);
    assert.equal(result.version, 1);
    assert.equal(result.slug, "what-a-deductible-really-does");
    assert.equal(result.brand, "defeo-mutual");
    assert.match(result.preview_url, /\/api\/draft\?entry=new-1&exp=\d+&sig=/);
    assert.ok(!JSON.stringify(result).includes(PREVIEW_SECRET));
    const stored = cma.entries.get("new-1");
    assert.deepEqual(stored?.metadata?.tags, [{ sys: { type: "Link", linkType: "Tag", id: "opal" } }]);
    const fields = stored?.fields as Record<string, Record<string, unknown>>;
    assert.deepEqual(fields.brand?.["en-US"], { sys: { type: "Link", linkType: "Entry", id: "brand-harborline" } });
    assert.deepEqual(fields.heroImage?.["en-US"], { sys: { type: "Link", linkType: "Asset", id: "img-hl-1" } });
    assert.equal(fields.publishDate?.["en-US"], "2026-10-08");
    assert.equal((fields.body?.["en-US"] as { nodeType: string }).nodeType, "document");
    assert.ok(!cma.calls.includes("entry.publish"));
  });

  it("can publish in the same call when asked, and reports a failed publish without losing the draft", async () => {
    const { cma, ctx } = setup();
    const published = await createArticle(ctx, { ...article, publish: true });
    assert.equal(published.status, "published");
    assert.equal(published.live_url, `${SITE}/defeo-mutual/journal/what-a-deductible-really-does`);

    cma.failNextPublish.value = true;
    const failed = await createArticle(next(cma), { ...article, title: "A second deductible guide", publish: true });
    assert.equal(failed.status, "draft");
    assert.match(failed.publish_error ?? "", /rejected/i);
    assert.ok(cma.entries.has(failed.entry_id));
  });

  it("accepts optional author, related page, topics, and SEO fields in the same brand", async () => {
    const { cma, ctx } = setup();
    await createArticle(ctx, {
      ...article,
      author_id: "person-hl-author",
      related_page_id: "offering-hl-home",
      topics: "Claims, Home insurance",
      seo_title: "Deductibles explained",
      seo_description: "How deductibles change what you pay.",
      publish_date: "2026-10-15",
    });
    const fields = cma.entries.get("new-1")?.fields as Record<string, Record<string, unknown>>;
    assert.deepEqual(fields.topics?.["en-US"], ["claims", "home insurance"]);
    assert.equal(fields.publishDate?.["en-US"], "2026-10-15");
    assert.ok(fields.author && fields.relatedPage && fields.seoTitle && fields.seoDescription);
  });

  const refused: Array<[string, Partial<typeof article> & Record<string, unknown>, string | RegExp]> = [
    ["an unknown brand", { brand: "acme" }, "unknown_brand"],
    ["an em dash in the title", { title: `A title ${String.fromCharCode(0x2014)} with a dash` }, /em dash/],
    ["a title over 90 characters", { title: "x".repeat(91) }, /91 characters/],
    ["a summary over 200 characters", { summary: "x".repeat(201) }, /limit is 200/],
    ["raw HTML in the body", { body_markdown: "A paragraph <script>alert(1)</script> with enough text to count." }, /raw HTML/],
    ["an image in the body", { body_markdown: "A paragraph with enough text to count ![x](https://example.com/a.png)" }, /images are not allowed/],
    ["a relative link", { body_markdown: "A paragraph with enough text to count and a [link](/relative/path) inside." }, /http or https/],
    ["a javascript link", { body_markdown: "A paragraph with enough text to count and a [link](javascript:alert(1)) inside." }, /http or https/],
    ["a nearly empty body", { body_markdown: "Too short" }, /nearly empty/],
    ["a hero image from another brand", { hero_image_id: "img-lw-1" }, /not in DeFeo Mutual's image pool/],
    ["a hero image that is not an image", { hero_image_id: "doc-hl-1" }, /image pool/],
    ["a hero image that does not exist", { hero_image_id: "nope" }, /does not exist/],
    ["a bad slug", { slug: "Not A Slug" }, /slug/],
    ["a bad date", { publish_date: "10/08/2026" }, /date like/],
    ["too many topics", { topics: "a,b,c,d,e,f" }, /limit is 5/],
    ["an author from another brand", { author_id: "person-lw-author" }, /belongs to StoutWare/],
    ["an author who is not an author", { author_id: "person-hl-provider" }, /not an author/],
    ["a related page from another brand", { related_page_id: "page-lw-home" }, /belongs to StoutWare/],
    ["a related entry of the wrong type", { related_page_id: "hero-hl-home" }, /must be one of/],
  ];
  for (const [label, override, expected] of refused) {
    it(`refuses ${label} and writes nothing`, async () => {
      const { cma, ctx } = setup();
      const error = await toolError(createArticle(ctx, { ...article, ...override } as typeof article));
      if (typeof expected === "string") assert.equal(error.code, expected);
      else assert.match(error.message, expected);
      assert.ok(!cma.calls.includes("entry.create"), "no entry may be created");
    });
  }

  it("refuses a duplicate slug within the brand and points to the existing entry", async () => {
    const { cma, ctx } = setup();
    const error = await toolError(createArticle(ctx, { ...article, title: "How claims work" }));
    assert.equal(error.code, "slug_taken");
    assert.match(error.message, /article-hl-seed/);
    assert.ok(!cma.calls.includes("entry.create"));
  });

  it("allows the same slug in a different brand", async () => {
    const { ctx } = setup();
    const result = await createArticle(ctx, { ...article, brand: "stoutware", title: "How claims work", hero_image_id: "img-lw-1" });
    assert.equal(result.brand, "stoutware");
  });
});

describe("update_entry", () => {
  it("saves an allowlisted change as a draft change and bumps the version", async () => {
    const { cma, ctx } = setup();
    const result = await updateEntry(ctx, { brand: "defeo-mutual", entry_id: "hero-hl-home", version: 3, fields: '{"headline": "Insurance you can actually read"}' });
    assert.equal(result.status, "changed");
    assert.equal(result.version, 4);
    assert.deepEqual(result.changed_fields, ["headline"]);
    assert.equal(result.live_url, null, "a hero has no page of its own");
    assert.match(result.note, /publish_entry/);
    const fields = cma.entries.get("hero-hl-home")?.fields as Record<string, Record<string, unknown>>;
    assert.equal(fields.headline?.["en-US"], "Insurance you can actually read");
    assert.equal(fields.layout?.["en-US"], "split", "untouched fields are preserved");
  });

  it("keeps the live URL of a published article that now has unpublished changes", async () => {
    const { ctx } = setup();
    const result = await updateEntry(ctx, { brand: "defeo-mutual", entry_id: "article-hl-seed", version: 6, fields: { summary: "A clearer guide to claims." } });
    assert.equal(result.status, "changed");
    assert.equal(result.live_url, `${SITE}/defeo-mutual/journal/how-claims-work`);
  });

  it("converts Markdown to rich text and round-trips it through get_entry", async () => {
    const { cma, ctx } = setup();
    const markdown = "## Steps\n\nCall us **first**, then see [the guide](https://example.com/g).\n\n1. Report\n2. Inspect";
    await updateEntry(ctx, { brand: "defeo-mutual", entry_id: "article-hl-seed", version: 6, fields: { body: markdown } });
    const read = await getEntry(next(cma), { entry_id: "article-hl-seed" });
    assert.equal(read.editable_fields.body, markdown);
  });

  it("clears an optional field with null but never a required one", async () => {
    const { cma, ctx } = setup();
    await updateEntry(ctx, { brand: "defeo-mutual", entry_id: "article-hl-seed", version: 6, fields: '{"topics": null}' });
    const stored = cma.entries.get("article-hl-seed")?.fields as Record<string, unknown>;
    assert.ok(!("topics" in stored), "the optional field is cleared");
    const error = await toolError(updateEntry(next(cma), { brand: "defeo-mutual", entry_id: "hero-hl-home", version: 3, fields: '{"headline": null}' }));
    assert.match(error.message, /required/);
  });

  const notEditable = ["slug", "brand", "pageType", "funnelStep", "nextStep", "hero", "primaryCta", "sections", "layout", "goalType", "price", "offeringType", "author", "relatedPage", "sys", "metadata", "__proto__"];
  for (const field of notEditable) {
    it(`never changes ${field}`, async () => {
      const { cma } = setup();
      const entries = ["article-hl-seed", "page-hl-home", "hero-hl-home", "cta-hl-quote", "offering-hl-home"];
      for (const entryId of entries) {
        const entry = cma.entries.get(entryId);
        const body = field === "__proto__" ? `{"__proto__": "x"}` : JSON.stringify({ [field]: "x" });
        const error = await toolError(updateEntry(next(cma), { brand: "defeo-mutual", entry_id: entryId, version: entry?.sys.version ?? 0, fields: body }));
        assert.match(error.message, /cannot change|not editable/i);
      }
      assert.ok(!cma.calls.includes("entry.update"));
    });
  }

  it("refuses entries the API may not change: brands, people", async () => {
    const { cma, ctx } = setup();
    assert.equal((await toolError(updateEntry(ctx, { brand: "defeo-mutual", entry_id: "brand-harborline", version: 5, fields: '{"name": "x"}' }))).code, "not_allowed");
    assert.equal((await toolError(updateEntry(next(cma), { brand: "defeo-mutual", entry_id: "person-hl-author", version: 2, fields: '{"name": "x"}' }))).code, "not_allowed");
    assert.ok(!cma.calls.includes("entry.update"));
  });

  it("refuses an entry from a different brand than the one named", async () => {
    const { cma, ctx } = setup();
    const error = await toolError(updateEntry(ctx, { brand: "stoutware", entry_id: "hero-hl-home", version: 3, fields: '{"headline": "x"}' }));
    assert.equal(error.code, "not_allowed");
    assert.match(error.message, /belongs to DeFeo Mutual/);
    assert.ok(!cma.calls.includes("entry.update"));
  });

  it("refuses a stale version without writing, and says which version is current", async () => {
    const { cma, ctx } = setup();
    const error = await toolError(updateEntry(ctx, { brand: "defeo-mutual", entry_id: "hero-hl-home", version: 2, fields: '{"headline": "x"}' }));
    assert.equal(error.code, "version_conflict");
    assert.match(error.message, /version 3/);
    assert.ok(!cma.calls.includes("entry.update"));
  });

  it("maps a conflict raised by Contentful itself to version_conflict", async () => {
    const { cma, ctx } = setup();
    // Someone else saves between our read and our write.
    cma.hooks.beforeUpdate = (entryId) => {
      const stored = cma.entries.get(entryId);
      if (stored) stored.sys.version += 1;
    };
    const error = await toolError(updateEntry(ctx, { brand: "defeo-mutual", entry_id: "hero-hl-home", version: 3, fields: '{"headline": "x"}' }));
    assert.equal(error.code, "version_conflict");
  });

  it("validates each value and refuses bad input without writing", async () => {
    const { cma } = setup();
    const cases: Array<[string, RegExp]> = [
      ['{"headline": "' + "x".repeat(71) + '"}', /limit is 70/],
      [`{"headline": "Fast ${String.fromCharCode(0x2014)} faster"}`, /em dash/],
      ['{"headline": 5}', /must be text/],
      ['{"image": "img-lw-1"}', /image pool/],
      ['{"image": "doc-hl-1"}', /image pool/],
      ["not json", /JSON object/],
      ["[1,2]", /JSON object/],
      ["{}", /is empty/],
    ];
    for (const [fields, expected] of cases) {
      const error = await toolError(updateEntry(next(cma), { brand: "defeo-mutual", entry_id: "hero-hl-home", version: 3, fields }));
      assert.match(error.message, expected);
    }
    assert.ok(!cma.calls.includes("entry.update"));
  });

  it("accepts an image from the brand's own pool", async () => {
    const { cma, ctx } = setup();
    await updateEntry(ctx, { brand: "defeo-mutual", entry_id: "hero-hl-home", version: 3, fields: '{"image": "img-hl-2"}' });
    const fields = cma.entries.get("hero-hl-home")?.fields as Record<string, Record<string, unknown>>;
    assert.deepEqual(fields.image?.["en-US"], { sys: { type: "Link", linkType: "Asset", id: "img-hl-2" } });
  });
});

describe("publish_entry and unpublish_entry", () => {
  it("update then publish chains using the returned version", async () => {
    const { cma, ctx } = setup();
    const saved = await updateEntry(ctx, { brand: "defeo-mutual", entry_id: "article-hl-seed", version: 6, fields: { summary: "A clearer guide to claims." } });
    const published = await publishEntry(next(cma), { brand: "defeo-mutual", entry_id: "article-hl-seed", version: saved.version });
    assert.equal(published.status, "published");
    assert.equal(published.changed, true);
    assert.equal(published.live_url, `${SITE}/defeo-mutual/journal/how-claims-work`);
  });

  it("publishing an already published entry is a no-op", async () => {
    const { cma, ctx } = setup();
    const result = await publishEntry(ctx, { brand: "defeo-mutual", entry_id: "article-hl-seed", version: 6 });
    assert.equal(result.changed, false);
    assert.ok(!cma.calls.includes("entry.publish"));
  });

  it("refuses a stale version, a wrong brand, and types that cannot be published", async () => {
    const { cma, ctx } = setup();
    assert.equal((await toolError(publishEntry(ctx, { brand: "defeo-mutual", entry_id: "hero-hl-home", version: 1 }))).code, "version_conflict");
    assert.equal((await toolError(publishEntry(next(cma), { brand: "stoutware", entry_id: "hero-hl-home", version: 3 }))).code, "not_allowed");
    assert.equal((await toolError(publishEntry(next(cma), { brand: "defeo-mutual", entry_id: "person-hl-author", version: 2 }))).code, "not_allowed");
    assert.equal((await toolError(publishEntry(next(cma), { brand: "defeo-mutual", entry_id: "brand-harborline", version: 5 }))).code, "not_allowed");
    assert.ok(!cma.calls.includes("entry.publish"));
  });

  it("turns a Contentful validation failure into a clear rejected error", async () => {
    const { cma, ctx } = setup();
    const draft = await createArticle(ctx, article);
    cma.failNextPublish.value = true;
    const error = await toolError(publishEntry(next(cma), { brand: "defeo-mutual", entry_id: draft.entry_id, version: draft.version }));
    assert.equal(error.code, "rejected");
  });

  it("never leaks the Contentful URL, space, or submitted values through a rejection", async () => {
    const { cma, ctx } = setup();
    const draft = await createArticle(ctx, article);
    cma.failNextPublish.value = true;
    const error = await toolError(publishEntry(next(cma), { brand: "defeo-mutual", entry_id: draft.entry_id, version: draft.version }));
    assert.ok(!/api\.contentful\.com|spaces\/|request id/i.test(error.message), error.message);
  });

  it("reports an unexpected publish failure on create_article generically", async () => {
    const { cma, ctx } = setup();
    cma.failNextPublish.value = true;
    cma.failNextPublish.error = new Error("kaboom Authorization: Bearer super-secret");
    const created = await createArticle(ctx, { ...article, publish: true });
    assert.equal(created.status, "draft");
    assert.match(created.publish_error ?? "", /failed unexpectedly/);
    assert.ok(!JSON.stringify(created).includes("super-secret") && !JSON.stringify(created).includes("kaboom"));
  });

  it("unpublishes an article back to draft and keeps it", async () => {
    const { cma, ctx } = setup();
    const result = await unpublishEntry(ctx, { brand: "defeo-mutual", entry_id: "article-hl-seed", version: 6 });
    assert.equal(result.status, "draft");
    assert.equal(result.live_url, null);
    assert.ok(cma.entries.has("article-hl-seed"), "nothing is deleted");
  });

  it("only articles can be unpublished; an already unpublished article is a no-op", async () => {
    const { cma, ctx } = setup();
    assert.equal((await toolError(unpublishEntry(ctx, { brand: "defeo-mutual", entry_id: "page-hl-home", version: 4 }))).code, "not_allowed");
    assert.equal((await toolError(unpublishEntry(next(cma), { brand: "defeo-mutual", entry_id: "hero-hl-home", version: 3 }))).code, "not_allowed");
    const draft = await createArticle(next(cma), article);
    const again = await unpublishEntry(next(cma), { brand: "defeo-mutual", entry_id: draft.entry_id, version: draft.version });
    assert.equal(again.changed, false);
    assert.ok(!cma.calls.includes("entry.unpublish"));
  });
});

describe("what the tools can reach", () => {
  it("only ever call methods the Opal policy allows", async () => {
    const { cma, ctx } = setup();
    await listBrands(ctx);
    await findPages(next(cma), { brand: "defeo-mutual" });
    await listBrandImages(next(cma), { brand: "defeo-mutual" });
    const draft = await createArticle(next(cma), article);
    const saved = await updateEntry(next(cma), { brand: "defeo-mutual", entry_id: draft.entry_id, version: draft.version, fields: { summary: "Another summary line." } });
    await publishEntry(next(cma), { brand: "defeo-mutual", entry_id: draft.entry_id, version: saved.version });
    await unpublishEntry(next(cma), { brand: "defeo-mutual", entry_id: draft.entry_id, version: saved.version + 1 });
    const allowed = new Set(["entry.get", "entry.getMany", "entry.create", "entry.update", "entry.publish", "entry.unpublish", "asset.get", "asset.getMany"]);
    assert.ok(cma.calls.every((call) => allowed.has(call)));
    assert.ok(!cma.calls.some((call) => /delete|archive/.test(call)));
  });
});
