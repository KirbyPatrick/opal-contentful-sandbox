import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ToolError, describeRejection, upstreamToToolError } from "../src/lib/opal/errors";

function sdkError(status: number, extra: Record<string, unknown> = {}): Error {
  const error = new Error(
    JSON.stringify({
      status,
      statusText: "Unprocessable Entity",
      message: "Validation error",
      details: {
        errors: [
          { name: "size", path: ["fields", "title", "en-US"], details: "Size must be at most 90", value: "SUBMITTED-VALUE-THAT-MUST-NOT-LEAK" },
          { name: "required", path: ["fields", "heroImage"], details: "The property heroImage is required here" },
        ],
      },
      request: { method: "put", url: "https://api.contentful.com/spaces/SPACE0mqj98qvv8xy/environments/opal-sandbox/entries/abc/published", headers: { Authorization: "Bearer CFPAT-secrettokenvalue123" } },
      requestId: "REQUEST-ID-123",
      ...extra,
    }),
  );
  error.name = "ValidationFailed";
  return error;
}

describe("describeRejection", () => {
  it("keeps the message and the validation problems, and drops everything else", () => {
    const text = describeRejection(sdkError(422));
    assert.match(text, /Validation error/);
    assert.match(text, /title: Size must be at most 90/);
    assert.match(text, /heroImage: The property heroImage is required here/);
    for (const secret of ["SPACE0mqj98qvv8xy", "api.contentful.com", "opal-sandbox", "CFPAT", "Bearer", "REQUEST-ID", "SUBMITTED-VALUE", "en-US"]) {
      assert.ok(!text.includes(secret), `must not include ${secret}`);
    }
  });

  it("has a generic fallback for errors that are not SDK errors, and is length limited", () => {
    assert.match(describeRejection(new Error("plain failure with Bearer abc123")), /did not pass Contentful's validation/);
    assert.match(describeRejection("not an error"), /did not pass/);
    const many = sdkError(422, { details: { errors: Array.from({ length: 50 }, (_, i) => ({ name: "x", path: ["fields", `f${i}`], details: "d".repeat(200) })) } });
    assert.ok(describeRejection(many).length <= 400);
  });

  it("maps a 422 to a rejected ToolError with the safe text", () => {
    const mapped = upstreamToToolError(sdkError(422), "Entry");
    assert.ok(mapped instanceof ToolError);
    assert.equal(mapped.code, "rejected");
    assert.ok(!mapped.message.includes("api.contentful.com"));
  });
});
