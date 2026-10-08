import "server-only";

export { safeEqual } from "@/lib/safe-equal";

export const NO_STORE = { "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate" };
