/**
 * An in-memory stand-in for the Contentful Management API, shaped like the
 * Opal API's restricted client. It keeps real version semantics (update bumps
 * the version, publish sets publishedVersion, a stale version is a 409) and
 * answers the handful of query filters the tools use. Tests wrap it in the
 * real restrictClient with OPAL_API_ALLOW, so a tool that reaches for a
 * method outside the policy fails the test.
 */
import { restrictClient, OPAL_API_ALLOW, type OpalClient } from "../../src/lib/contentful/policy";

type Json = Record<string, unknown>;
export interface FakeEntry { sys: Json & { id: string; version: number; contentType: { sys: { id: string } } }; fields: Json; metadata?: { tags: Array<{ sys: { id: string } }> } }
export interface FakeAsset { sys: Json & { id: string; version: number }; fields: Json; metadata?: { tags: Array<{ sys: { id: string } }> } }

export class FakeSdkError extends Error {
  constructor(status: number, message: string) {
    super(JSON.stringify({ status, message, request: { method: "get", url: "https://api.contentful.com/spaces/s/entries/x" } }));
    this.name = status === 404 ? "NotFound" : status === 409 ? "VersionMismatch" : "UnknownError";
  }
}

const L = "en-US";
const loc = (value: unknown) => ({ [L]: value });
const link = (linkType: string, id: string) => ({ sys: { type: "Link", linkType, id } });

export function entry(id: string, type: string, fields: Json, extra: { version?: number; publishedVersion?: number } = {}): FakeEntry {
  const localized = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, loc(v)]));
  return {
    sys: {
      id,
      version: extra.version ?? 1,
      ...(extra.publishedVersion !== undefined ? { publishedVersion: extra.publishedVersion } : {}),
      updatedAt: "2026-10-01T00:00:00Z",
      contentType: { sys: { id: type } },
    },
    fields: localized,
  };
}

export function asset(id: string, tag: string, title: string, contentType = "image/jpeg"): FakeAsset {
  return {
    sys: { id, version: 3, publishedVersion: 2, updatedAt: "2026-10-01T00:00:00Z" },
    fields: {
      title: loc(title),
      description: loc("Photo credit: Test"),
      file: loc({ url: `//images.ctfassets.net/s/${id}/photo.jpg`, contentType, details: { image: { width: 1200, height: 800 } } }),
    },
    metadata: { tags: [{ sys: { id: tag } }] },
  };
}

/** Two brands with a home page, an article index, an author, a seed article, a hero, and a CTA. */
export function seedData() {
  const entries = [
    entry("brand-harborline", "brand", {
      name: "DeFeo Mutual", slug: "defeo-mutual", vertical: "insurance", shortDescription: "Home and auto insurance.",
      tagline: "Coverage you can read.", voiceDescription: "Plain and steady.", voiceDos: ["Use short sentences", "Name the benefit"],
      voiceDonts: ["No hype", "No jargon"], homePage: link("Entry", "page-hl-home"),
    }, { version: 5, publishedVersion: 4 }),
    entry("brand-stoutware", "brand", {
      name: "StoutWare", slug: "stoutware", vertical: "b2b_saas", shortDescription: "Workflow software.",
      voiceDescription: "Crisp.", voiceDos: ["a", "b"], voiceDonts: ["c", "d"], homePage: link("Entry", "page-lw-home"),
    }, { version: 5, publishedVersion: 4 }),
    entry("page-hl-home", "page", { title: "Home", slug: "home", brand: link("Entry", "brand-harborline"), pageType: "home", funnelStep: 1, hero: link("Entry", "hero-hl-home"), primaryCta: link("Entry", "cta-hl-quote") }, { version: 4, publishedVersion: 3 }),
    entry("page-hl-journal", "page", { title: "Journal", slug: "journal", brand: link("Entry", "brand-harborline"), pageType: "article_index", funnelStep: 0 }, { version: 2, publishedVersion: 1 }),
    entry("page-hl-coverage", "page", { title: "Coverage", slug: "coverage", brand: link("Entry", "brand-harborline"), pageType: "offering_detail", funnelStep: 2 }, { version: 2, publishedVersion: 1 }),
    entry("page-lw-home", "page", { title: "Home", slug: "home", brand: link("Entry", "brand-stoutware"), pageType: "home", funnelStep: 1 }, { version: 4, publishedVersion: 3 }),
    entry("hero-hl-home", "hero", { internalName: "DeFeo - Home - Hero", brand: link("Entry", "brand-harborline"), headline: "Insurance without the fine print maze", layout: "split" }, { version: 3, publishedVersion: 2 }),
    entry("cta-hl-quote", "cta", { internalName: "DeFeo - Home - Quote", brand: link("Entry", "brand-harborline"), label: "Get a quote", goalType: "get_quote" }, { version: 3, publishedVersion: 2 }),
    entry("person-hl-author", "person", { name: "Dana Whitfield", slug: "dana-whitfield", brand: link("Entry", "brand-harborline"), role: "author" }, { version: 2, publishedVersion: 1 }),
    entry("person-hl-provider", "person", { name: "Pat Rivers", slug: "pat-rivers", brand: link("Entry", "brand-harborline"), role: "provider" }, { version: 2, publishedVersion: 1 }),
    entry("person-lw-author", "person", { name: "Lee Park", slug: "lee-park", brand: link("Entry", "brand-stoutware"), role: "author" }, { version: 2, publishedVersion: 1 }),
    entry("offering-hl-home", "offering", { name: "Home coverage", slug: "home-coverage", brand: link("Entry", "brand-harborline"), offeringType: "insurance_coverage", summary: "Covers your home." }, { version: 3, publishedVersion: 2 }),
    entry("article-hl-seed", "article", {
      title: "How claims work", slug: "how-claims-work", brand: link("Entry", "brand-harborline"), summary: "A short guide to claims.",
      body: { nodeType: "document", data: {}, content: [{ nodeType: "paragraph", data: {}, content: [{ nodeType: "text", value: "Claims start with a call. Then an adjuster visits.", marks: [], data: {} }] }] },
      heroImage: link("Asset", "img-hl-1"), publishDate: "2026-09-01", topics: ["claims"],
    }, { version: 6, publishedVersion: 5 }),
  ];
  const assets = [
    asset("img-hl-1", "brand-defeo-mutual", "A family at a kitchen table"),
    asset("img-hl-2", "brand-defeo-mutual", "A sunny front porch"),
    asset("img-lw-1", "brand-stoutware", "A team at a whiteboard"),
    asset("doc-hl-1", "brand-defeo-mutual", "A PDF brochure", "application/pdf"),
  ];
  return { entries, assets };
}

function linkedIds(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(linkedIds);
  const id = (value as { sys?: { type?: string; id?: string } } | null)?.sys;
  return id?.type === "Link" && id.id ? [id.id] : [];
}

function matches(item: FakeEntry | FakeAsset, query: Json): boolean {
  const typeOf = (item as FakeEntry).sys.contentType?.sys.id;
  if (query.content_type && typeOf !== query.content_type) return false;
  const types = query["sys.contentType.sys.id[in]"];
  if (typeof types === "string" && !types.split(",").includes(typeOf ?? "")) return false;
  if (typeof query.links_to_entry === "string") {
    const ids = Object.values(item.fields).flatMap((f) => linkedIds(Object.values(f as Json)[0]));
    if (!ids.includes(query.links_to_entry)) return false;
  }
  const tags = query["metadata.tags.sys.id[in]"];
  if (typeof tags === "string" && !(item.metadata?.tags ?? []).some((t) => tags.split(",").includes(t.sys.id))) return false;
  const mime = query["fields.file.contentType[match]"];
  if (typeof mime === "string") {
    const file = (item.fields.file as Json | undefined)?.[L] as { contentType?: string } | undefined;
    if (!file?.contentType?.includes(mime)) return false;
  }
  for (const [key, expected] of Object.entries(query)) {
    if (!key.startsWith("fields.") || key === "fields.file.contentType[match]") continue;
    const inList = key.endsWith("[in]");
    const path = key.replace(/^fields\./, "").replace(/\[in\]$/, "");
    const [field, ...rest] = path.split(".");
    const raw = (item.fields[field as string] as Json | undefined)?.[L];
    const actual = rest.join(".") === "sys.id" ? (raw as { sys?: { id?: string } } | undefined)?.sys?.id : raw;
    if (inList ? !String(expected).split(",").includes(String(actual)) : actual !== expected) return false;
  }
  if (typeof query.query === "string" && !JSON.stringify(item.fields).toLowerCase().includes(query.query.toLowerCase())) return false;
  return true;
}

export interface FakeCma {
  client: OpalClient;
  entries: Map<string, FakeEntry>;
  assets: Map<string, FakeAsset>;
  /** Every call, as "namespace.method". */
  calls: string[];
  /** Makes the next publish fail with a 422. */
  failNextPublish: { value: boolean; error?: Error };
  /** Runs inside update before the version check, to simulate another editor saving first. */
  hooks: { beforeUpdate?: (entryId: string) => void };
}

export function fakeCma(seed = seedData()): FakeCma {
  const entries = new Map(seed.entries.map((e) => [e.sys.id, structuredClone(e)]));
  const assets = new Map(seed.assets.map((a) => [a.sys.id, structuredClone(a)]));
  const calls: string[] = [];
  const failNextPublish: FakeCma["failNextPublish"] = { value: false };
  const hooks: FakeCma["hooks"] = {};
  let counter = 0;

  const collection = <T extends FakeEntry | FakeAsset>(items: Iterable<T>, query: Json = {}) => {
    const found = [...items].filter((item) => matches(item, query));
    const skip = Number(query.skip ?? 0);
    const limit = Number(query.limit ?? 100);
    return { total: found.length, skip, limit, items: structuredClone(found.slice(skip, skip + limit)) };
  };
  const need = <T,>(map: Map<string, T>, id: string): T => {
    const found = map.get(id);
    if (!found) throw new FakeSdkError(404, "The resource could not be found.");
    return found;
  };

  const raw = {
    entry: {
      getMany: async ({ query }: { query?: Json }) => (calls.push("entry.getMany"), collection(entries.values(), query)),
      get: async ({ entryId }: { entryId: string }) => (calls.push("entry.get"), structuredClone(need(entries, entryId))),
      create: async ({ contentTypeId }: { contentTypeId: string }, body: { fields: Json; metadata?: FakeEntry["metadata"] }) => {
        calls.push("entry.create");
        const id = `new-${++counter}`;
        const created: FakeEntry = { sys: { id, version: 1, updatedAt: "2026-10-08T00:00:00Z", contentType: { sys: { id: contentTypeId } } }, fields: structuredClone(body.fields), metadata: structuredClone(body.metadata) };
        entries.set(id, created);
        return structuredClone(created);
      },
      update: async ({ entryId }: { entryId: string }, body: FakeEntry) => {
        calls.push("entry.update");
        hooks.beforeUpdate?.(entryId);
        const stored = need(entries, entryId);
        if (body.sys.version !== stored.sys.version) throw new FakeSdkError(409, "Version mismatch");
        stored.fields = structuredClone(body.fields);
        stored.sys.version += 1;
        return structuredClone(stored);
      },
      publish: async ({ entryId }: { entryId: string }, body: FakeEntry) => {
        calls.push("entry.publish");
        const stored = need(entries, entryId);
        if (body.sys.version !== stored.sys.version) throw new FakeSdkError(409, "Version mismatch");
        if (failNextPublish.value) {
          failNextPublish.value = false;
          throw failNextPublish.error ?? new FakeSdkError(422, "Validation error");
        }
        stored.sys.publishedVersion = stored.sys.version;
        stored.sys.version += 1;
        return structuredClone(stored);
      },
      unpublish: async ({ entryId }: { entryId: string }) => {
        calls.push("entry.unpublish");
        const stored = need(entries, entryId);
        delete stored.sys.publishedVersion;
        stored.sys.version += 1;
        return structuredClone(stored);
      },
    },
    asset: {
      get: async ({ assetId }: { assetId: string }) => (calls.push("asset.get"), structuredClone(need(assets, assetId))),
      getMany: async ({ query }: { query?: Json }) => {
        calls.push("asset.getMany");
        // Real Contentful answers 400 InvalidQuery when ordering by a Text field such as the title.
        if (typeof query?.order === "string" && /fields\.(title|description)/.test(query.order)) {
          throw new FakeSdkError(400, "Text fields do not support ordering.");
        }
        return collection(assets.values(), query);
      },
    },
  };

  const client = restrictClient(raw, { name: "opal-api", allow: OPAL_API_ALLOW, pin: { spaceId: "space1", environmentId: "opal-sandbox" } }) as unknown as OpalClient;
  return { client, entries, assets, calls, failNextPublish, hooks };
}
