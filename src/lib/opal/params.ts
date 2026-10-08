import { z } from "zod";
import { ID_PATTERN } from "./fields";

/**
 * Parameter building blocks. Opal passes every parameter as text or a plain
 * JSON value, so numbers and booleans accept both forms.
 */
export const brandParam = z.string().trim().min(1).max(80);
export const entryIdParam = z.string().trim().regex(ID_PATTERN, "must be a Contentful entry ID");
export const assetIdParam = z.string().trim().regex(ID_PATTERN, "must be an asset ID");

export const intParam = (min: number, max: number) =>
  z
    .union([z.number(), z.string().trim().regex(/^\d{1,9}$/, "must be a whole number").transform(Number)])
    .pipe(z.number().int().min(min).max(max));

export const boolParam = z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]);
