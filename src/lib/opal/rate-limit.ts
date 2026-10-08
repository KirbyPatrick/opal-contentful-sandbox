/**
 * Sliding window rate limiter, kept in memory. On serverless hosting each
 * instance has its own window, so this is a best effort guard against a
 * runaway agent loop, not an exact global quota. The Contentful client
 * throttle (5 requests per second) still applies underneath.
 */
export class RateLimiter {
  private readonly hits: number[] = [];

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  take(nowMs: number): { ok: true } | { ok: false; retryAfterSeconds: number } {
    while (this.hits.length > 0 && (this.hits[0] as number) <= nowMs - this.windowMs) this.hits.shift();
    if (this.hits.length >= this.max) {
      const oldest = this.hits[0] as number;
      return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + this.windowMs - nowMs) / 1000)) };
    }
    this.hits.push(nowMs);
    return { ok: true };
  }
}
