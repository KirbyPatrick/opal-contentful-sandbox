import type { ReadOnlyClient } from "../../src/lib/contentful/policy";
import type { LiveEntry, LocalizedFields } from "../../seed/lib/baseline";
import { LOCALE } from "../../seed/lib/sync";

/** Reads every entry in the sandbox (paged) in the shape the baseline and reset logic uses. */
export async function readLiveEntries(client: Pick<ReadOnlyClient, "entry">, environmentId: string): Promise<LiveEntry[]> {
  const live: LiveEntry[] = [];
  for (let skip = 0; ; skip += 1000) {
    const page = await client.entry.getMany({ environmentId, query: { limit: 1000, skip, order: "sys.id" } });
    for (const item of page.items) {
      const fields = item.fields as LocalizedFields;
      const title = [fields.title, fields.name, fields.internalName, fields.headline]
        .map((field) => field?.[LOCALE])
        .find((value): value is string => typeof value === "string" && value !== "");
      const publishedVersion = item.sys.publishedVersion;
      live.push({
        id: item.sys.id,
        type: item.sys.contentType.sys.id,
        title: title ?? "(untitled)",
        tags: (item.metadata?.tags ?? []).map((tag) => tag.sys.id),
        published: publishedVersion !== undefined && item.sys.version <= publishedVersion + 1,
        fields,
      });
    }
    if (skip + page.items.length >= page.total) break;
  }
  return live;
}
