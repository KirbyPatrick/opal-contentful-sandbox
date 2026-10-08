# Opal API

**Status: built in Phase 8.** Lets Optimizely Opal read, create, update, publish, and unpublish content in the `opal-sandbox` environment through nine tools. There is no delete tool and the code cannot delete.

## How Opal connects

Opal calls it a custom tool registry. This is an ordinary HTTP service:

| What | Value |
|---|---|
| Discovery URL (public) | `https://opal-contentful-sandbox.vercel.app/api/opal/discovery` |
| Tool URLs | `https://opal-contentful-sandbox.vercel.app/api/opal/tools/<tool-name>` (POST), for example `/api/opal/tools/list-brands` |
| Authentication | `Authorization: Bearer <OPAL_API_TOKEN>` on every tool call. Discovery needs no token. |
| Request body | Opal sends `{ "parameters": { ... }, "auth": {...}, "environment": {...}, "chat_metadata": {...} }`. Only `parameters` is used. |

Opal joins each tool's relative `endpoint` (`/tools/list-brands`) to the discovery URL with `/discovery` removed, so the routes sit under `/api/opal`. This matches how Optimizely's own registries behave.

## Register it in Opal

Registering is a manual step in the Opal web app (the `opal-cli` command is read only for tools).

1. Set `OPAL_API_TOKEN` in Vercel (Production and Preview) to a random value of at least 32 characters, and redeploy. Generate one with `openssl rand -hex 32`. The local `.env` and Vercel must hold the same value.
2. Check the deployed API: `npm run opal:smoke -- https://opal-contentful-sandbox.vercel.app`. All checks must pass.
3. In Opal, open **Tools**, then **Add Custom Tool** (also called a registry). Enter:
   - Name: `Contentful Sandbox`
   - Discovery URL: `https://opal-contentful-sandbox.vercel.app/api/opal/discovery`
   - Bearer token: the same value as `OPAL_API_TOKEN`
4. Review the 9 discovered tools, click **Add**, then switch the registry **Active** and, if wanted, **Enabled in Chat**.
5. After any change to a tool's name, description, or parameters, redeploy and click **Sync** on the registry. Opal does not notice changes on its own. Changes to internal logic need no sync.

To copy the token to the clipboard without showing it, run this in a Terminal in the repo folder (it overwrites the clipboard):

```bash
grep '^OPAL_API_TOKEN=' .env | cut -d= -f2- | tr -d '\n' | pbcopy
```

## The tools

| Tool | Reads or writes | What it does |
|---|---|---|
| `list_brands` | Read | The six brands: slug, name, industry, description, home URL |
| `find_pages` | Read | Pages, articles, offerings, collections (and optionally people) for one brand, with status, version, preview and live URLs |
| `get_entry` | Read | One entry: editable text (rich text as Markdown), read-only fields, linked entry IDs, status, version, URLs |
| `get_content_rules` | Read | Brand voice, global rules, and per content type which fields are editable with limits |
| `list_brand_images` | Read | Images in a brand's pool (`brand-<slug>` tag): asset ID, alt text, credit, thumbnail |
| `create_article` | Write | New article as a draft tagged `opal` (published only if `publish` is `"true"`) |
| `update_entry` | Write | Changes allowlisted copy fields, saved as a draft change |
| `publish_entry` | Write | Publishes the saved version, so the live site refreshes in about 3 seconds |
| `unpublish_entry` | Write | Takes an article off the live site (back to draft, never deleted) |

Every response that describes an entry includes `entry_id`, `content_type`, `brand`, `brand_name`, `title`, `status` (`draft`, `published`, or `changed`), `version`, `preview_url`, and `live_url`.

- **`preview_url`** is a signed link that opens the draft for that one entry and can only be redeemed for 24 hours. It never contains `PREVIEW_SECRET`, because agents show these links in chat. The draft route (`/api/draft`) accepts either the secret (Contentful's own preview button) or this signed link. Opening a valid link turns on draft mode for that browser, and draft mode covers every brand's drafts until the browser session ends or the next deploy, so share preview links like draft content, not in public channels.
- **`live_url`** is set only while a published version exists and the entry has a page of its own. Heroes and CTAs have no page, so it is `null` for them.

### What can be edited

`update_entry` accepts only these fields. Everything else is refused with a message listing what is allowed. `get_content_rules` returns the same list with limits.

| Content type | Editable fields | Create | Publish | Unpublish |
|---|---|---|---|---|
| article | title, summary, body, heroImage, publishDate, topics, seoTitle, seoDescription | Yes | Yes | Yes |
| page | title, seoTitle, seoDescription | No | Yes | No |
| hero | eyebrow, headline, subheadline, image | No | Yes | No |
| cta | label, heading, body | No | Yes | No |
| offering | summary, description, features, badge, seoTitle, seoDescription | No | Yes | No |
| collection | summary, description, eyebrow, image, seoTitle, seoDescription | No | Yes | No |
| person | none (readable only) | No | No | No |

**Never changeable:** brands, themes, slugs, page types, funnel links (`nextStep` and similar), prices, content types, references between entries (except the related page and author set once when an article is created), and anything that deletes. A brand entry cannot be read or changed through `get_entry` or `update_entry`.

`tests/opal-fields.test.ts` compares every limit above with the content model in `migrations/0001-content-model.ts`, so the two cannot drift apart.

## Rules the code enforces

- **Brand must be named, and must match.** The agent passes the brand slug (or exact name). An unknown brand returns an error telling the agent to ask the user. Writes also require the entry to belong to that brand.
- **Strict input.** Every parameter is validated. Unknown parameters are rejected. Text limits, patterns, and dates follow the content model. No em dashes anywhere.
- **Markdown only.** Bodies are Markdown (at most 10,000 characters) (headings 2 to 4, paragraphs, bold, italic, lists, quotes, tables, links). Raw HTML, images, and any link that is not a full http or https URL are refused, not silently dropped.
- **Images by asset ID only,** and only from the same brand's pool. URLs, other brands' images, and non-images are refused.
- **Version locking.** `update_entry`, `publish_entry`, and `unpublish_entry` require the `version` the agent last read. A stale version returns a `version_conflict` error and nothing is written. Contentful checks the version again on its side.
- **Draft first.** New articles and edits are drafts. A live page changes only after `publish_entry`.
- **Created content is tagged `opal`.** The reset script (Phase 9) uses the tag to find it.

## Authentication and the narrow client

- The token is checked in constant time before anything else. A wrong or missing token returns 401 with no detail, and the tool name is not revealed.
- Only `src/lib/contentful/management.ts` creates Contentful clients. The API uses `getOpalClient()`, which runs the same static and live master checks as `getSandboxClient()`, then exposes only: entries (get, getMany, create, update, publish, unpublish) and assets (get, getMany). The methods for deleting and archiving do not exist on it. Tests check this against the real SDK.
- The Contentful management token is never sent to Opal and never appears in a response or a log.

## Responses and errors

| Situation | HTTP | Body |
|---|---|---|
| Success | 200 | `{ "ok": true, ... }` |
| The agent can fix it (invalid input, unknown brand, stale version, Contentful rejected the change, slug taken, not allowed) | 200 | `{ "ok": false, "error": { "code", "message" } }` |
| Missing or wrong token | 401 | `{ "ok": false, "error": { "code": "unauthorized" } }` |
| Unknown tool (with a valid token) | 404 | |
| Body over 256 KB | 413 | |
| Rate limited | 429 | `Retry-After` header |
| Unexpected failure or missing configuration | 500 | Generic message, details only in the server log |

Agent-fixable errors use 200 on purpose, so Opal always shows the agent the message. Codes: `invalid_input`, `unknown_brand`, `not_found`, `not_allowed`, `version_conflict`, `slug_taken`, `rejected`.

## Limits

- 256 KB per request. Markdown bodies up to 10,000 characters (longer text is refused before it is parsed, because the Markdown parser slows down sharply on adversarial input).
- 60 calls per minute per server instance, 20 of them writes. This is a best effort guard against a runaway agent loop (each serverless instance keeps its own count). The Contentful client also stays under 5 requests per second.
- Free plan Contentful quotas still apply (7 requests per second, monthly call quota).

## Logs

One structured JSON line per call (`source: "opal-api"`): tool, result (`ok`, `tool_error`, `denied`, `invalid_input`, `rate_limited`, `error`), milliseconds, and when present the entry ID, brand, status, and the Opal thread and execution IDs. Parameter values, tokens, and raw SDK errors are never logged.

## Rotating the token

1. Generate a new value: `openssl rand -hex 32`.
2. Update `OPAL_API_TOKEN` in `.env` and in Vercel (Production and Preview), then redeploy.
3. Update the bearer token on the registry in Opal and click **Sync**.
4. Run `npm run opal:smoke -- https://opal-contentful-sandbox.vercel.app`.

To stop all tool calls immediately without a deploy, switch the registry to inactive in Opal.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Opal says a tool is unavailable | The registry is inactive, or the deployment is down. Run the smoke test. |
| Every tool call fails in Opal but the smoke test passes | The token in the Opal registry differs from `OPAL_API_TOKEN`. Re-enter it and Sync. |
| Opal does not see a new or changed tool | Click **Sync** on the registry after redeploying. |
| `server_misconfigured` (HTTP 500) | `OPAL_API_TOKEN`, `SITE_URL`, or `PREVIEW_SECRET` is missing or too short in Vercel. |
| `version_conflict` | The entry changed after the agent read it. The agent should call `get_entry` again and retry. |
| The preview link says not authorized | The link expired (24 hours) or was edited. Ask the agent for a fresh one with `get_entry`. |

## Code map

| Path | Contents |
|---|---|
| `src/app/api/opal/discovery/route.ts` | Public discovery document |
| `src/app/api/opal/tools/[tool]/route.ts` | One route for every tool |
| `src/lib/opal/http.ts` | Token check, size and rate limits, parsing, error mapping, logs |
| `src/lib/opal/registry.ts` | The nine tools, their descriptions and schemas, and the manifest |
| `src/lib/opal/tools-read.ts`, `tools-write.ts` | Tool logic (no HTTP) |
| `src/lib/opal/fields.ts` | The allowlist of editable fields and their validators |
| `src/lib/opal/context.ts` | Brand lookup, status, URLs, the entry view |
| `src/lib/opal/markdown.ts` | Strict Markdown checks, rich text to Markdown |
| `src/lib/opal/preview.ts` | Signed preview links |
| `src/lib/contentful/policy.ts` | `OPAL_API_ALLOW`, the narrow client allowlist |
| `scripts/opal-smoke.ts` | Read-only smoke test (`npm run opal:smoke`) |
