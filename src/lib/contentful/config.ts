/**
 * Contentful settings, read from environment variables only. Space and
 * environment are config so the whole build can be repointed.
 *
 * Error messages name the variable but never include its value.
 */
import { z } from "zod";
import { assertSafeEnvironmentId } from "./guard";

/** Space and environment IDs: letters, digits, dot, dash, underscore; at most 64 characters. */
export const CONTENTFUL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export class ConfigError extends Error {
  override name = "ConfigError";
}

type Env = Readonly<Record<string, string | undefined>>;

export interface SandboxTarget {
  spaceId: string;
  environmentId: string;
}

const contentfulId = z.string().regex(CONTENTFUL_ID_PATTERN);

const tokenSchema = z.object({
  // Management tokens are long opaque strings without whitespace.
  CONTENTFUL_MANAGEMENT_TOKEN: z.string().min(20).max(512).regex(/^\S+$/),
});

const targetSchema = z.object({
  CONTENTFUL_SPACE_ID: contentfulId,
  CONTENTFUL_ENVIRONMENT_ID: contentfulId,
});

const optionalSpaceSchema = z.object({
  CONTENTFUL_SPACE_ID: contentfulId.optional(),
});

function parseEnv<S extends z.ZodObject>(schema: S, env: Env): z.infer<S> {
  const input = Object.fromEntries(
    Object.keys(schema.shape).map((name) => [name, env[name] === "" ? undefined : env[name]]),
  );
  const result = schema.safeParse(input);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new ConfigError(
      `Missing or invalid environment variable(s): ${names.join(", ")}. See .env.example.`,
    );
  }
  return result.data;
}

export function readManagementToken(env: Env = process.env): string {
  return parseEnv(tokenSchema, env).CONTENTFUL_MANAGEMENT_TOKEN;
}

/** The space and environment that scripts and the API may write to. Runs the static master check first. */
export function readSandboxTarget(env: Env = process.env): SandboxTarget {
  assertSafeEnvironmentId(env.CONTENTFUL_ENVIRONMENT_ID);
  const parsed = parseEnv(targetSchema, env);
  return { spaceId: parsed.CONTENTFUL_SPACE_ID, environmentId: parsed.CONTENTFUL_ENVIRONMENT_ID };
}

/** The configured space, if any. Preflight runs before the space ID is known. */
export function readOptionalSpaceId(env: Env = process.env): string | undefined {
  return parseEnv(optionalSpaceSchema, env).CONTENTFUL_SPACE_ID;
}
