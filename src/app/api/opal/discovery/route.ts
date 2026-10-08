import { handleDiscovery } from "@/lib/opal/http";

/**
 * Opal reads this once when the registry is added or synced:
 *   https://<site>/api/opal/discovery
 * Public on purpose. It lists tool names, descriptions, and parameters only.
 * Calling a tool requires the bearer token.
 */
export function GET() {
  return handleDiscovery();
}
