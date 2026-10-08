import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Migration from "contentful-migration";
import { MIGRATIONS } from "../migrations";

/** Records what a migration would create, without talking to Contentful. */
function recordMigration(run: (m: Migration) => void) {
  const types = new Map<string, { fields: Map<string, Record<string, unknown>>; controls: Map<string, string>; displayField?: string }>();
  const migration = {
    createContentType(id: string) {
      const type = { fields: new Map<string, Record<string, unknown>>(), controls: new Map<string, string>(), displayField: undefined as string | undefined };
      types.set(id, type);
      const ct = {
        createField(fieldId: string) {
          const field: Record<string, unknown> = {};
          type.fields.set(fieldId, field);
          const chain: Record<string, (value: unknown) => unknown> = new Proxy({}, {
            get: (_target, key: string) => (value: unknown) => {
              field[key] = value;
              return chain;
            },
          });
          return chain;
        },
        changeFieldControl(fieldId: string, _ns: string, _widget: string, settings: { helpText?: string }) {
          type.controls.set(fieldId, settings.helpText ?? "");
        },
        displayField(fieldId: string) {
          type.displayField = fieldId;
          return ct;
        },
      };
      return ct;
    },
  } as unknown as Migration;
  run(migration);
  return types;
}

describe("content model migration 0001", () => {
  const types = recordMigration((m) => MIGRATIONS[0]!.default(m));

  it("defines 18 content types (target 16 to 18, hard max 22)", () => {
    assert.equal(types.size, 18);
  });

  it("puts a required brand reference on every type except brand", () => {
    for (const [id, type] of types) {
      if (id === "brand") continue;
      assert.equal(type.fields.get("brand")?.required, true, `${id}.brand must be required`);
    }
  });

  it("gives every field help text of 255 characters or fewer", () => {
    for (const [id, type] of types) {
      for (const fieldId of type.fields.keys()) {
        const help = type.controls.get(fieldId);
        assert.ok(help && help.length > 0 && help.length <= 255, `${id}.${fieldId} help text`);
      }
    }
  });

  it("sets a display field that exists on every type", () => {
    for (const [id, type] of types) {
      assert.ok(type.displayField && type.fields.has(type.displayField), `${id} display field`);
    }
  });

  it("keeps every type under Contentful's 50 field limit", () => {
    for (const [id, type] of types) assert.ok(type.fields.size <= 50, `${id} has ${type.fields.size} fields`);
  });

  it("rejects em dashes on every text field", () => {
    const emDash = String.fromCharCode(0x2014);
    for (const [id, type] of types) {
      for (const [fieldId, field] of type.fields) {
        const validations = (field.type === "Array" ? (field.items as { validations?: unknown[] })?.validations : field.validations) as
          | Array<{ prohibitRegexp?: { pattern: string } }>
          | undefined;
        const isText = field.type === "Symbol" || field.type === "Text" || (field.type === "Array" && (field.items as { type?: string })?.type === "Symbol");
        if (!isText) continue;
        assert.ok(validations?.some((v) => v.prohibitRegexp?.pattern === emDash), `${id}.${fieldId} must reject em dashes`);
      }
    }
  });

  it("isApplied is true only when all 18 types exist", () => {
    assert.equal(MIGRATIONS[0]!.isApplied(new Set(types.keys())), true);
    assert.equal(MIGRATIONS[0]!.isApplied(new Set(["brand", "page"])), false);
  });
});
