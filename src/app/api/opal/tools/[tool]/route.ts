import { handleToolRequest } from "@/lib/opal/http";
import { productionDeps } from "@/lib/opal/runtime";

/**
 * One route for every tool: POST /api/opal/tools/<tool-name>, for example
 * /api/opal/tools/list-brands. Needs "Authorization: Bearer <OPAL_API_TOKEN>".
 * All logic lives in src/lib/opal; this file only connects it to Next.js.
 */
export async function POST(request: Request, context: { params: Promise<{ tool: string }> }) {
  const { tool } = await context.params;
  return handleToolRequest(request, tool, productionDeps());
}
