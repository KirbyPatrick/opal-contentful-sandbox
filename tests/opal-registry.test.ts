import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { z } from "zod";
import { TOOLS, buildManifest, endpointSlug, findTool } from "../src/lib/opal/registry";

type Shape = Record<string, z.ZodType>;
const shapeOf = (schema: z.ZodType): Shape => (schema as unknown as { shape: Shape }).shape;

describe("tool registry", () => {
  it("has unique names and unique endpoints", () => {
    assert.equal(new Set(TOOLS.map((t) => t.name)).size, TOOLS.length);
    assert.equal(new Set(TOOLS.map((t) => endpointSlug(t.name))).size, TOOLS.length);
  });

  it("looks tools up by their endpoint slug", () => {
    assert.equal(findTool("create-article")?.name, "create_article");
    assert.equal(findTool("create_article"), undefined);
    assert.equal(findTool("nope"), undefined);
  });

  for (const tool of TOOLS) {
    describe(tool.name, () => {
      const shape = shapeOf(tool.schema);

      it("documents exactly the parameters its schema accepts, with matching required flags", () => {
        assert.deepEqual(tool.parameters.map((p) => p.name).sort(), Object.keys(shape).sort());
        for (const parameter of tool.parameters) {
          const field = shape[parameter.name] as z.ZodType;
          assert.equal(field.safeParse(undefined).success, !parameter.required, `${parameter.name}: required flag`);
          assert.ok(parameter.description.length > 10, `${parameter.name}: needs a description`);
        }
      });

      it("documents number parameters as numbers and text parameters as text", () => {
        for (const parameter of tool.parameters) {
          const field = shape[parameter.name] as z.ZodType;
          if (parameter.type === "number") assert.equal(field.safeParse(5).success, true, `${parameter.name} should accept 5`);
          else assert.equal(field.safeParse(5).success, false, `${parameter.name} should not accept a bare number`);
        }
      });

      it("is strict: an extra parameter is rejected", () => {
        const valid = Object.fromEntries(tool.parameters.filter((p) => p.required).map((p) => [p.name, "x"]));
        assert.equal(tool.schema.safeParse({ ...valid, extra_parameter: "x" }).success, false);
      });

      it("has an agent-facing description of reasonable length", () => {
        assert.ok(tool.description.length >= 80 && tool.description.length <= 1200, `${tool.description.length} characters`);
      });
    });
  }

  it("marks exactly the four writing tools as writes", () => {
    assert.deepEqual(TOOLS.filter((t) => t.write).map((t) => t.name), ["create_article", "update_entry", "publish_entry", "unpublish_entry"]);
  });

  it("builds a manifest in the shape Opal reads", () => {
    const manifest = buildManifest();
    assert.deepEqual(Object.keys(manifest), ["functions"]);
    for (const fn of manifest.functions) {
      assert.deepEqual(Object.keys(fn).sort(), ["description", "endpoint", "http_method", "name", "parameters"]);
      for (const p of fn.parameters) assert.deepEqual(Object.keys(p).sort(), ["description", "name", "required", "type"]);
    }
  });
});
