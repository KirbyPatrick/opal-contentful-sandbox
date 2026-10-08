/**
 * Signed draft preview links.
 *
 * The draft route accepts the long-lived PREVIEW_SECRET (used by Contentful's
 * own preview button). Tool responses must never contain that secret, because
 * an agent shows them in chat. They carry a link signed for one entry that
 * stops working after PREVIEW_LINK_TTL_SECONDS instead.
 *
 * Limit to know about: opening a valid link turns on Next.js draft mode for that browser,
 * and draft mode is site-wide (every brand's drafts) until the browser session ends or the
 * next deploy. The expiry bounds when a link can be redeemed, not what a redeemed link allows.
 * Preview links should be shared like draft content: not in public channels.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const PREVIEW_LINK_TTL_SECONDS = 24 * 60 * 60;

// The prefix keeps a signature made here from being valid for any other purpose.
const payload = (entryId: string, expires: number) => `preview-link\n${entryId}\n${expires}`;

export function signPreviewLink(secret: string, entryId: string, expires: number): string {
  return createHmac("sha256", secret).update(payload(entryId, expires)).digest("hex");
}

/** True only for an unexpired signature made for exactly this entry. */
export function verifyPreviewLink(
  secret: string,
  entryId: string | null,
  expires: string | null,
  signature: string | null,
  nowMs: number,
): boolean {
  if (!entryId || !expires || !signature) return false;
  if (!/^\d{1,12}$/.test(expires) || !/^[0-9a-f]{64}$/.test(signature)) return false;
  const expiresAt = Number(expires);
  if (expiresAt * 1000 < nowMs) return false;
  const expected = Buffer.from(signPreviewLink(secret, entryId, expiresAt), "hex");
  const given = Buffer.from(signature, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function buildPreviewUrl(siteUrl: string, secret: string, entryId: string, now: Date): string {
  const expires = Math.floor(now.getTime() / 1000) + PREVIEW_LINK_TTL_SECONDS;
  const query = new URLSearchParams({ entry: entryId, exp: String(expires), sig: signPreviewLink(secret, entryId, expires) });
  return `${siteUrl}/api/draft?${query.toString()}`;
}
