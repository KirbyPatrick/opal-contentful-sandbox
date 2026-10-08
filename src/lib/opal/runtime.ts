/**
 * Production wiring for the Opal API routes: real configuration, the
 * narrow Contentful client, rate limits, and structured logs. Kept apart from
 * http.ts so tests can run the same layer with fakes.
 */
import { getOpalClient } from "../contentful/management";
import { readOpalConfig } from "./config";
import type { HttpDeps } from "./http";
import { RateLimiter } from "./rate-limit";

// One window per server instance. 60 calls a minute overall, 20 of them writes.
const limits = { all: new RateLimiter(60, 60_000), write: new RateLimiter(20, 60_000) };

export function productionDeps(): HttpDeps {
  return {
    config: () => readOpalConfig(),
    client: getOpalClient,
    now: () => new Date(),
    limits,
    log: (event) => console.log(JSON.stringify({ source: "opal-api", at: new Date().toISOString(), ...event })),
  };
}
