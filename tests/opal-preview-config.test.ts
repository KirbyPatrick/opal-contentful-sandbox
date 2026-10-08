import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OpalConfigError, readOpalConfig } from "../src/lib/opal/config";
import { PREVIEW_LINK_TTL_SECONDS, buildPreviewUrl, signPreviewLink, verifyPreviewLink } from "../src/lib/opal/preview";

const SECRET = "preview-secret-value-that-must-never-leak-0123456789";
const NOW = new Date("2026-10-08T12:00:00Z");

describe("signed preview links", () => {
  const url = new URL(buildPreviewUrl("https://site.test", SECRET, "entry-1", NOW));
  const param = (name: string) => url.searchParams.get(name);

  it("builds a link for one entry that never contains the secret", () => {
    assert.equal(url.origin + url.pathname, "https://site.test/api/draft");
    assert.equal(param("entry"), "entry-1");
    assert.equal(Number(param("exp")), Math.floor(NOW.getTime() / 1000) + PREVIEW_LINK_TTL_SECONDS);
    assert.ok(!url.toString().includes(SECRET));
    assert.equal(param("secret"), null);
  });

  it("verifies its own links until they expire", () => {
    const at = (ms: number) => verifyPreviewLink(SECRET, param("entry"), param("exp"), param("sig"), ms);
    assert.equal(at(NOW.getTime()), true);
    assert.equal(at(NOW.getTime() + (PREVIEW_LINK_TTL_SECONDS - 1) * 1000), true);
    assert.equal(at(NOW.getTime() + (PREVIEW_LINK_TTL_SECONDS + 1) * 1000), false);
  });

  it("is bound to the entry, the expiry, and the secret", () => {
    const now = NOW.getTime();
    assert.equal(verifyPreviewLink(SECRET, "entry-2", param("exp"), param("sig"), now), false);
    assert.equal(verifyPreviewLink(SECRET, "entry-1", String(Number(param("exp")) + 1), param("sig"), now), false);
    assert.equal(verifyPreviewLink("another-secret-value-0123456789-0123456789", "entry-1", param("exp"), param("sig"), now), false);
  });

  it("refuses missing, malformed, and truncated parts", () => {
    const now = NOW.getTime();
    const exp = param("exp");
    const sig = param("sig");
    assert.equal(verifyPreviewLink(SECRET, null, exp, sig, now), false);
    assert.equal(verifyPreviewLink(SECRET, "entry-1", null, sig, now), false);
    assert.equal(verifyPreviewLink(SECRET, "entry-1", exp, null, now), false);
    assert.equal(verifyPreviewLink(SECRET, "entry-1", "abc", sig, now), false);
    assert.equal(verifyPreviewLink(SECRET, "entry-1", exp, sig?.slice(0, 62) ?? null, now), false);
    assert.equal(verifyPreviewLink(SECRET, "entry-1", exp, "z".repeat(64), now), false);
    assert.equal(verifyPreviewLink(SECRET, "", exp, sig, now), false);
  });

  it("a signature made for previews is not a signature of the bare secret or an empty string", () => {
    assert.notEqual(signPreviewLink(SECRET, "entry-1", 1), SECRET);
    assert.notEqual(signPreviewLink(SECRET, "entry-1", 1), signPreviewLink(SECRET, "entry-1", 2));
  });
});

describe("readOpalConfig", () => {
  const good = { OPAL_API_TOKEN: "t".repeat(40), SITE_URL: "https://site.test/", PREVIEW_SECRET: "p".repeat(40) };

  it("reads settings and normalizes the site URL to its origin", () => {
    assert.deepEqual(readOpalConfig(good), { apiToken: "t".repeat(40), siteUrl: "https://site.test", previewSecret: "p".repeat(40) });
  });

  it("names the missing or weak variables but never their values", () => {
    for (const [name, value] of [["OPAL_API_TOKEN", "short-secret-value"], ["PREVIEW_SECRET", "has spaces in it " + "x".repeat(40)], ["SITE_URL", "not a url"], ["OPAL_API_TOKEN", ""]] as const) {
      assert.throws(
        () => readOpalConfig({ ...good, [name]: value }),
        (error: unknown) => error instanceof OpalConfigError && error.message.includes(name) && !error.message.includes(value || "\u0000"),
      );
    }
  });
});
