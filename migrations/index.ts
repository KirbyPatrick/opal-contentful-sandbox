/**
 * Ordered list of migrations. Add new files here with the next number.
 * Each migration exports an id, a description, isApplied(), and the migration function.
 */
import * as m0001 from "./0001-content-model";
import * as m0002 from "./0002-hero-design";

export const MIGRATIONS = [m0001, m0002];
