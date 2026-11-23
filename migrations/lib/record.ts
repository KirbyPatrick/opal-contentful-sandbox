/**
 * Records what a migration would create, without talking to Contentful.
 * Used by tests and by the offline seed validator, so field rules have one
 * source of truth: the migration files.
 */
import type Migration from "contentful-migration";

export interface RecordedValidation {
  in?: Array<string | number>;
  size?: { min?: number; max?: number };
  range?: { min?: number; max?: number };
  regexp?: { pattern: string };
  prohibitRegexp?: { pattern: string };
  linkContentType?: string[];
  linkMimetypeGroup?: string[];
  unique?: boolean;
  message?: string;
}

export interface RecordedField {
  id: string;
  name?: string;
  type?: string;
  linkType?: "Entry" | "Asset";
  required?: boolean;
  validations?: RecordedValidation[];
  items?: { type: string; linkType?: "Entry" | "Asset"; validations?: RecordedValidation[] };
}

export interface RecordedType {
  id: string;
  fields: Map<string, RecordedField>;
  helpText: Map<string, string>;
  displayField?: string;
}

export function recordMigration(run: (m: Migration) => void): Map<string, RecordedType> {
  const types = new Map<string, RecordedType>();
  const recorder = (id: string) => {
    const type: RecordedType = types.get(id) ?? { id, fields: new Map(), helpText: new Map(), displayField: undefined };
    types.set(id, type);
    const chainFor = (field: RecordedField): Record<string, (value: unknown) => unknown> => {
      const chain: Record<string, (value: unknown) => unknown> = new Proxy({}, {
        get: (_target, key: string) => (value: unknown) => {
          (field as unknown as Record<string, unknown>)[key] = value;
          return chain;
        },
      });
      return chain;
    };
    const ct = {
      createField(fieldId: string) {
        const field: RecordedField = { id: fieldId };
        type.fields.set(fieldId, field);
        return chainFor(field);
      },
      // Later migrations edit fields an earlier one created (for example to set a default value).
      editField(fieldId: string) {
        const field = type.fields.get(fieldId) ?? { id: fieldId };
        type.fields.set(fieldId, field);
        return chainFor(field);
      },
      changeFieldControl(fieldId: string, _ns: string, _widget: string, settings: { helpText?: string }) {
        type.helpText.set(fieldId, settings.helpText ?? "");
      },
      displayField(fieldId: string) {
        type.displayField = fieldId;
        return ct;
      },
    };
    return ct;
  };
  const migration = {
    createContentType(id: string) {
      return recorder(id);
    },
    editContentType(id: string) {
      return recorder(id);
    },
  } as unknown as Migration;
  run(migration);
  return types;
}
