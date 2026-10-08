/**
 * Ordered list of migrations. Add new files here with the next number.
 * Each migration exports an id, a description, isApplied(), and the migration function.
 */
import * as m0001 from "./0001-content-model";

export const MIGRATIONS = [m0001];
