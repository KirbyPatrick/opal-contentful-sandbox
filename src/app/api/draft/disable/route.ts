import { draftMode } from "next/headers";
import { NO_STORE } from "@/lib/site/secrets";

/** Leaves draft preview (POST from the preview banner). */
export async function POST() {
  (await draftMode()).disable();
  return new Response(null, { status: 303, headers: { ...NO_STORE, Location: "/" } });
}
