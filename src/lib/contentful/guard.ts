/**
 * The master guard.
 *
 * The space's `master` environment holds someone else's experimentation setup
 * and must never be modified. Every client that can write to Contentful comes
 * from management.ts, which runs both checks below before handing it out.
 */
import { describeError } from "./errors";

export const PROTECTED_ENVIRONMENT_ID = "master";

export class MasterGuardError extends Error {
  override name = "MasterGuardError";
}

function isProtected(environmentId: string): boolean {
  return environmentId.trim().toLowerCase() === PROTECTED_ENVIRONMENT_ID;
}

function sameId(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Static check, no network. Requires an explicit environment ID (there is no
 * default) and refuses master in any capitalization or padding.
 */
export function assertSafeEnvironmentId(environmentId: unknown): string {
  if (typeof environmentId !== "string" || environmentId.trim() === "") {
    throw new MasterGuardError(
      "CONTENTFUL_ENVIRONMENT_ID must be set explicitly. There is no default environment.",
    );
  }
  if (isProtected(environmentId)) {
    throw new MasterGuardError(`Refusing to target the "${PROTECTED_ENVIRONMENT_ID}" environment.`);
  }
  if (environmentId !== environmentId.trim()) {
    throw new MasterGuardError(
      "CONTENTFUL_ENVIRONMENT_ID must not have leading or trailing whitespace.",
    );
  }
  return environmentId;
}

interface Link {
  sys: { id: string };
}

/** The parts of a CMA environment response the live check reads. */
export interface EnvironmentSnapshot {
  sys: {
    id: string;
    aliases?: readonly Link[];
    aliasedEnvironment?: Link;
  };
}

export type EnvironmentLookup = (environmentId: string) => Promise<EnvironmentSnapshot>;

/**
 * Live check. Looks up the target and master environments, then refuses when
 * the target is an alias, when master is one of its aliases, or when master
 * resolves to it. Fails closed: if either lookup fails, the target is refused.
 */
export async function assertDoesNotResolveToMaster(
  environmentId: string,
  lookup: EnvironmentLookup,
): Promise<void> {
  const id = assertSafeEnvironmentId(environmentId);

  let target: EnvironmentSnapshot;
  let master: EnvironmentSnapshot;
  try {
    [target, master] = await Promise.all([lookup(id), lookup(PROTECTED_ENVIRONMENT_ID)]);
  } catch (error) {
    throw new MasterGuardError(
      `Could not confirm that "${id}" is separate from master, so refusing to continue. ${describeError(error)}`,
    );
  }

  if (target.sys.aliasedEnvironment) {
    throw new MasterGuardError(
      `"${id}" is an environment alias. Point CONTENTFUL_ENVIRONMENT_ID at a concrete environment.`,
    );
  }
  if (!sameId(target.sys.id, id)) {
    throw new MasterGuardError(
      `"${id}" resolved to a different environment ("${target.sys.id}"), so refusing to continue.`,
    );
  }
  if ((target.sys.aliases ?? []).some((alias) => isProtected(alias.sys.id))) {
    throw new MasterGuardError(`The master alias points to "${id}", so refusing to continue.`);
  }
  const masterResolvesTo = master.sys.aliasedEnvironment?.sys.id ?? master.sys.id;
  if (sameId(masterResolvesTo, id)) {
    throw new MasterGuardError(`Master resolves to "${id}", so refusing to continue.`);
  }
}
