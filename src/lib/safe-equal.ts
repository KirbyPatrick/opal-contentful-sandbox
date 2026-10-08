import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time comparison. Hashing first keeps the comparison length-independent. */
export function safeEqual(provided: string | null | undefined, expected: string): boolean {
  if (typeof provided !== "string" || provided.length === 0 || provided.length > 512) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
