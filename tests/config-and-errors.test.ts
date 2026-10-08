import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ConfigError, readManagementToken, readOptionalSpaceId, readSandboxTarget } from "../src/lib/contentful/config";
import { describeError, redactSecrets } from "../src/lib/contentful/errors";
import { MasterGuardError } from "../src/lib/contentful/guard";

const FAKE_TOKEN = "CFPAT-not-a-real-token";

describe("config", () => {
  it("reads a valid sandbox target", () => {
    const target = readSandboxTarget({ CONTENTFUL_SPACE_ID: "abc123", CONTENTFUL_ENVIRONMENT_ID: "opal-sandbox" });
    assert.deepEqual(target, { spaceId: "abc123", environmentId: "opal-sandbox" });
  });

  it("refuses master as the target", () => {
    assert.throws(
      () => readSandboxTarget({ CONTENTFUL_SPACE_ID: "abc123", CONTENTFUL_ENVIRONMENT_ID: "Master" }),
      MasterGuardError,
    );
  });

  it("has no default environment", () => {
    assert.throws(() => readSandboxTarget({ CONTENTFUL_SPACE_ID: "abc123" }), MasterGuardError);
  });

  it("names a bad variable without echoing its value", () => {
    const badSpace = "not a valid id!";
    assert.throws(
      () => readSandboxTarget({ CONTENTFUL_SPACE_ID: badSpace, CONTENTFUL_ENVIRONMENT_ID: "opal-sandbox" }),
      (error: unknown) =>
        error instanceof ConfigError &&
        error.message.includes("CONTENTFUL_SPACE_ID") &&
        !error.message.includes(badSpace),
    );
  });

  it("never echoes the token", () => {
    assert.equal(readManagementToken({ CONTENTFUL_MANAGEMENT_TOKEN: FAKE_TOKEN }), FAKE_TOKEN);
    assert.throws(
      () => readManagementToken({ CONTENTFUL_MANAGEMENT_TOKEN: "CFPAT-has whitespace inside it" }),
      (error: unknown) =>
        error instanceof ConfigError &&
        error.message.includes("CONTENTFUL_MANAGEMENT_TOKEN") &&
        !error.message.includes("CFPAT"),
    );
  });

  it("treats an empty space ID as not set", () => {
    assert.equal(readOptionalSpaceId({ CONTENTFUL_SPACE_ID: "" }), undefined);
  });
});

describe("errors", () => {
  it("redacts tokens and authorization headers", () => {
    const text = `token ${FAKE_TOKEN} header "Bearer ...12345" and Bearer abc.def`;
    const redacted = redactSecrets(text);
    assert.ok(!redacted.includes("CFPAT-"));
    assert.ok(!redacted.includes("12345"));
    assert.ok(!redacted.includes("abc.def"));
  });

  it("keeps only safe fields from an SDK error", () => {
    const sdkError = new Error(
      JSON.stringify({
        status: 422,
        statusText: "Unprocessable Entity",
        message: "Validation error",
        details: { errors: [{ name: "size", path: ["fields", "title"] }] },
        requestId: "req-1",
        request: {
          url: "/spaces/s/environments/opal-sandbox/entries/e1?x=1",
          method: "put",
          headers: { Authorization: "Bearer ...ab123" },
          payloadData: '{"fields":{"body":"SECRET BODY TEXT"}}',
        },
      }),
    );
    sdkError.name = "ValidationFailed";
    const description = describeError(sdkError);
    assert.match(description, /ValidationFailed \(HTTP 422\)/);
    assert.match(description, /PUT \/spaces\/s\/environments\/opal-sandbox\/entries\/e1 /);
    assert.match(description, /request id req-1/);
    assert.ok(!description.includes("ab123"));
    assert.ok(!description.includes("SECRET BODY TEXT"));
    assert.ok(!description.includes("x=1"));
  });

  it("describes non-errors without throwing", () => {
    assert.equal(describeError("oops"), "Unknown error.");
  });
});
