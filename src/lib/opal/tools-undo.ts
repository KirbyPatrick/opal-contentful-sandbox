/**
 * Undo and delete tools: remove_faq, revert_entry, delete_entry.
 *
 * - remove_faq takes an FAQ that create_faq added back off its page.
 * - revert_entry puts an entry's copy back to what is live (throwing away unpublished edits), or to the
 *   site's original seed content. The sandbox keeps no version history (Contentful snapshots exist only in
 *   master), so "live" is read from the published version and "original" from the seed files.
 * - delete_entry deletes only entries this API created (tagged opal, never seed) that nothing links to,
 *   in either the draft or the live version of any entry. Deleting an FAQ also deletes its questions.
 *   Original site content can never be deleted.
 *
 * Every tool names the brand, the entry must belong to it, and the version the agent last read is checked,
 * as for the other write tools. revert_entry only writes the fields update_entry may write (plus a page's
 * sections), so slugs, brands, page types, and funnel links are never touched.
 */
import { z } from "zod";
import {
  contentTypeOf,
  entryStatus,
  fieldValue,
  linkId,
  viewEntry,
  type Entry,
  type ToolContext,
} from "./context";
import { ToolError, upstreamToToolError } from "./errors";
import type { TypeSpec } from "./fields";
import { boolParam, brandParam, entryIdParam } from "./params";
import { originalFields } from "./seed-original";
import { isOpalCreated, linkIds, loadForWrite, loadMany, localized, publishIfNeeded, safeMessage, version } from "./tools-write";

type Fields = Record<string, unknown>;

/** JSON with sorted keys, for comparing field values. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

const isSeed = (entry: Entry) => entry.metadata?.tags.some((tag) => tag.sys.id === "seed") ?? false;

/** The fields of the entry's live (published) version, or undefined if it is not live. */
async function liveFields(ctx: ToolContext, entryId: string): Promise<Fields | undefined> {
  try {
    const result = await ctx.client.entry.getPublished({ query: { "sys.id": entryId, limit: 1 } });
    return result.items[0]?.fields as Fields | undefined;
  } catch (error) {
    throw upstreamToToolError(error, `The live version of "${entryId}"`);
  }
}

/** Entries whose draft or live version links to this one, at most a few, for a clear refusal. */
async function linkedFrom(ctx: ToolContext, entryId: string): Promise<string[]> {
  try {
    const query = { links_to_entry: entryId, limit: 5 };
    const [draft, live] = await Promise.all([ctx.client.entry.getMany({ query }), ctx.client.entry.getPublished({ query })]);
    return [...new Set([...draft.items, ...live.items].map((user) => `${user.sys.id} (${contentTypeOf(user)})`))];
  } catch (error) {
    throw upstreamToToolError(error, `Links to "${entryId}"`);
  }
}

// ---------- remove_faq ----------

export const removeFaqSchema = z.strictObject({
  brand: brandParam,
  page_id: entryIdParam,
  page_version: version,
  faq_entry_id: entryIdParam,
  publish: boolParam.optional(),
});

/**
 * Takes an FAQ that create_faq added off a page. The page change is a draft unless publish is true and
 * publishing would change nothing but this. The FAQ itself is kept, so delete_entry can remove it after.
 */
export async function removeFaq(ctx: ToolContext, input: z.infer<typeof removeFaqSchema>) {
  const { brand, entry: page } = await loadForWrite(ctx, input.brand, input.page_id, input.page_version);
  if (contentTypeOf(page) !== "page") {
    throw new ToolError("invalid_input", `page_id: entry "${input.page_id}" is a ${contentTypeOf(page)}, not a page.`);
  }
  const current = Array.isArray(fieldValue(page, "sections")) ? (fieldValue(page, "sections") as unknown[]) : [];
  const index = current.findIndex((value) => linkId(value) === input.faq_entry_id);
  if (index < 0) {
    throw new ToolError("invalid_input", `faq_entry_id: "${input.faq_entry_id}" is not one of this page's sections. Its sections, in order: ${linkIds(current).join(", ") || "none"}.`);
  }
  const [faq] = await loadMany(ctx, [input.faq_entry_id]);
  // A link to an entry that no longer exists is broken either way, so it may be removed too.
  if (faq && (contentTypeOf(faq) !== "faq" || !isOpalCreated(faq) || linkId(fieldValue(faq, "brand")) !== brand.id)) {
    throw new ToolError("not_allowed", `Section "${input.faq_entry_id}" is not an FAQ added with create_faq, so it cannot be removed through this API.`);
  }

  const sections = current.filter((_, i) => i !== index);
  const next = structuredClone(page);
  if (sections.length > 0) (next.fields as Fields).sections = localized(sections);
  else delete (next.fields as Fields).sections;
  let saved: Entry;
  try {
    saved = await ctx.client.entry.update({ entryId: page.sys.id }, next);
  } catch (error) {
    throw upstreamToToolError(error, `Page "${page.sys.id}"`);
  }

  let publishError: string | undefined;
  if (input.publish === true) {
    try {
      // Publish only if that changes nothing but the FAQ: the page had no other edits, or now matches what is live.
      const live = entryStatus(page.sys) === "published" ? undefined : await liveFields(ctx, page.sys.id);
      if (entryStatus(page.sys) === "published" || (live !== undefined && stable(live) === stable(saved.fields))) {
        saved = await publishIfNeeded(ctx, saved);
      } else {
        publishError = `Not published: the page has other unpublished changes, and publishing it would publish those too. Show the user preview_url, then call publish_entry on the page with version ${saved.sys.version}.`;
      }
    } catch (error) {
      publishError = `${safeMessage(error, "Publishing failed unexpectedly.")} The FAQ is off the page as a draft change; call publish_entry on the page with version ${saved.sys.version} to try again.`;
    }
  }

  const view = await viewEntry(ctx, saved, brand);
  return {
    ...view,
    removed_faq_entry_id: input.faq_entry_id,
    publish_error: publishError,
    note:
      (view.status === "published"
        ? "FAQ removed from the page and published. The live site refreshes within a few seconds."
        : `FAQ removed from the page as a draft change. The live page keeps showing it until publish_entry is called on the page with version ${view.version}.`) +
      (faq
        ? ` The FAQ entry still exists. Once the page change is published, delete_entry on ${faq.sys.id} (version ${faq.sys.version}) removes it for good, if the user agrees.`
        : " The FAQ entry no longer existed, so this removed a broken link."),
  };
}

// ---------- revert_entry ----------

export const revertEntrySchema = z.strictObject({
  brand: brandParam,
  entry_id: entryIdParam,
  version,
  to: z.enum(["live", "original"]),
});

/** The fields revert_entry may write: what update_entry may write, plus a page's sections. */
const revertable = (type: string, spec: TypeSpec): string[] => [...Object.keys(spec.editable), ...(type === "page" ? ["sections"] : [])];

/**
 * to "live": throws away unpublished edits, so the entry matches what is live again (republished
 * unchanged when nothing else differs, which clears its draft state). to "original": puts back the site's
 * original copy from the seed, saved as a draft for the user to preview and publish.
 */
export async function revertEntry(ctx: ToolContext, input: z.infer<typeof revertEntrySchema>) {
  const { brand, entry, spec } = await loadForWrite(ctx, input.brand, input.entry_id, input.version);
  if (!spec.canPublish) throw new ToolError("not_allowed", `${spec.label} entries cannot be reverted through this API.`);
  const type = contentTypeOf(entry);
  const status = entryStatus(entry.sys);

  let target: Fields | undefined;
  if (input.to === "live") {
    if (status === "published") {
      return { ...(await viewEntry(ctx, entry, brand)), changed: false, note: "Nothing to undo: there are no unpublished changes. To undo a change that is already live, use to: original." };
    }
    if (status === "draft") {
      throw new ToolError(
        "not_allowed",
        `Entry "${entry.sys.id}" is not live, so there is no live version to go back to.${isOpalCreated(entry) ? " It was created through this API, so delete_entry can remove it." : " Use to: original to restore the site's original copy."}`,
      );
    }
    target = await liveFields(ctx, entry.sys.id);
    if (!target) throw new ToolError("not_found", `No live version of "${entry.sys.id}" was found to go back to.`);
  } else {
    if (isOpalCreated(entry) && !isSeed(entry)) {
      throw new ToolError("not_allowed", `Entry "${entry.sys.id}" was created through this API, so it has no original version. Use delete_entry to remove it.`);
    }
    target = originalFields(entry.sys.id);
    if (!target) throw new ToolError("not_allowed", `Entry "${entry.sys.id}" is not part of the site's original content, so there is no original version to restore.`);
  }

  const next = structuredClone(entry);
  const fields = next.fields as Fields;
  for (const name of revertable(type, spec)) {
    if (target[name] === undefined) delete fields[name];
    else fields[name] = structuredClone(target[name]);
  }
  // Never write back a link to a section that has since been deleted.
  if (type === "page" && fields.sections) {
    const wanted = linkIds(fieldValue(next, "sections"));
    const existing = new Set((await loadMany(ctx, wanted)).map((section) => section.sys.id));
    const kept = (fieldValue(next, "sections") as unknown[]).filter((value) => existing.has(linkId(value) ?? ""));
    if (kept.length > 0) fields.sections = localized(kept);
    else delete fields.sections;
  }
  if (stable(fields) === stable(entry.fields)) {
    return { ...(await viewEntry(ctx, entry, brand)), changed: false, note: `Nothing to change: the copy already matches the ${input.to} version.` };
  }

  let saved: Entry;
  try {
    saved = await ctx.client.entry.update({ entryId: entry.sys.id }, next);
  } catch (error) {
    throw upstreamToToolError(error, `Entry "${entry.sys.id}"`);
  }
  let publishError: string | undefined;
  let otherChanges = false;
  if (input.to === "live") {
    // Republishing is safe only when the entry now matches what is live in every field.
    otherChanges = stable(saved.fields) !== stable(target);
    if (!otherChanges) {
      try {
        saved = await publishIfNeeded(ctx, saved);
      } catch (error) {
        publishError = `${safeMessage(error, "Republishing failed unexpectedly.")} The copy was reverted as a draft at version ${saved.sys.version}.`;
      }
    }
  }

  const view = await viewEntry(ctx, saved, brand);
  return {
    ...view,
    changed: true,
    publish_error: publishError,
    note: input.to === "live"
      ? otherChanges
        ? `Opal's unpublished changes are discarded. Other unpublished changes made outside this API remain, so the entry was not republished.`
        : "Unpublished changes discarded. The entry matches the live site again. Entries that only those changes used, such as an FAQ added with create_faq, still exist; delete_entry can remove them."
      : `The original copy is restored as a draft. The live site does not change until publish_entry is called with version ${view.version}. Show the user preview_url first.`,
  };
}

// ---------- delete_entry ----------

export const deleteEntrySchema = z.strictObject({
  brand: brandParam,
  entry_id: entryIdParam,
  version,
});

/**
 * Deletes an entry this API created. Refused for original site content, entries of another brand, and
 * anything still linked from another entry's draft or live version (remove an FAQ from its page and publish
 * that first). Deleting an FAQ also deletes its questions that this API created and nothing else uses.
 */
export async function deleteEntry(ctx: ToolContext, input: z.infer<typeof deleteEntrySchema>) {
  const { brand, entry } = await loadForWrite(ctx, input.brand, input.entry_id, input.version);
  const type = contentTypeOf(entry);
  if (!isOpalCreated(entry) || isSeed(entry) || originalFields(entry.sys.id)) {
    throw new ToolError("not_allowed", `Entry "${entry.sys.id}" is part of the site's original content and can never be deleted through this API. Only entries created through this API can be.`);
  }
  if (!["article", "faq", "item"].includes(type)) {
    throw new ToolError("not_allowed", `${type} entries cannot be deleted through this API.`);
  }
  const users = await linkedFrom(ctx, entry.sys.id);
  if (users.length > 0) {
    throw new ToolError(
      "not_allowed",
      `Entry "${entry.sys.id}" is still used by ${users.join(", ")}, in its draft or on the live site. ` +
        (type === "faq" ? "Take it off the page with remove_faq and publish the page first." : "Remove it from there first."),
    );
  }

  const questions = type === "faq"
    ? (await loadMany(ctx, linkIds(fieldValue(entry, "items")))).filter((item) =>
        contentTypeOf(item) === "item" && isOpalCreated(item) && !isSeed(item) && linkId(fieldValue(item, "brand")) === brand.id)
    : [];
  const deleted: string[] = [];
  const kept: string[] = [];
  const remove = async (target: Entry) => {
    let current = target;
    try {
      if (entryStatus(current.sys) !== "draft") current = await ctx.client.entry.unpublish({ entryId: current.sys.id }, current);
      await ctx.client.entry.delete({ entryId: current.sys.id });
    } catch (error) {
      const mapped = upstreamToToolError(error, `Entry "${target.sys.id}"`);
      if (!(mapped instanceof ToolError)) throw mapped;
      const state = current !== target ? ` It was taken off the live site but not deleted (now version ${current.sys.version}).` : "";
      throw new ToolError(mapped.code, `${mapped.message}${state}${deleted.length > 0 ? ` Already deleted: ${deleted.join(", ")}.` : ""}`);
    }
    deleted.push(target.sys.id);
  };

  await remove(entry);
  for (const question of questions) {
    // A question another FAQ also uses stays.
    if ((await linkedFrom(ctx, question.sys.id)).length > 0) {
      kept.push(question.sys.id);
      continue;
    }
    await remove(question);
  }

  return {
    brand: brand.slug,
    brand_name: brand.name,
    deleted_entry_ids: deleted,
    kept_entry_ids: kept.length > 0 ? kept : undefined,
    note: `Deleted ${deleted.length} ${deleted.length === 1 ? "entry" : "entries"}. This cannot be undone. Anything that was live is gone from the site within a few seconds.`,
  };
}
