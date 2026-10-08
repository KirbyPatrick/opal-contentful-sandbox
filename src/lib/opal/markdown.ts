/**
 * Markdown handling for the Opal API.
 *
 * - markdownIssues(): strict checks. The shared converter (lib/richtext/markdown.ts)
 *   silently drops raw HTML, images, and non-web links. The API refuses them instead,
 *   so the agent finds out and fixes its text.
 * - richTextToMarkdown(): turns a stored rich text document back into Markdown, so an
 *   agent can read a body, edit it, and send it back without losing structure or links.
 */
import { lexer, type Token, type Tokens } from "marked";
import { isSafeHttpUrl } from "../richtext/markdown";

const EM_DASH = String.fromCharCode(0x2014);

/**
 * Longest Markdown body the API accepts. The tokenizer's cost grows faster than the length of
 * adversarial text (repeated unmatched emphasis markers), so this is lower than the seed limit
 * and is enforced before any tokenizing.
 */
export const MAX_API_MARKDOWN_LENGTH = 10_000;

function walk(tokens: Token[] | undefined, issues: Set<string>): void {
  for (const token of tokens ?? []) {
    if (token.type === "html") {
      issues.add("raw HTML is not allowed; use Markdown only");
    } else if (token.type === "image") {
      issues.add("images are not allowed in the body; the hero image is set separately");
    } else if (token.type === "link" && !isSafeHttpUrl((token as Tokens.Link).href)) {
      issues.add(`link "${(token as Tokens.Link).href.slice(0, 60)}" must be a full http or https URL`);
    }
    if ("tokens" in token) walk(token.tokens as Token[] | undefined, issues);
    if (token.type === "list") for (const item of (token as Tokens.List).items) walk(item.tokens, issues);
    if (token.type === "table") {
      const table = token as Tokens.Table;
      for (const cell of [...table.header, ...table.rows.flat()]) walk(cell.tokens, issues);
    }
  }
}

/** Problems that make the text unacceptable. An empty list means it is fine to convert. */
export function markdownIssues(markdown: string): string[] {
  if (markdown.length > MAX_API_MARKDOWN_LENGTH) return [`longer than ${MAX_API_MARKDOWN_LENGTH} characters`];
  const issues = new Set<string>();
  if (markdown.includes(EM_DASH)) issues.add("contains an em dash; use a hyphen");
  walk(lexer(markdown, { gfm: true }), issues);
  return [...issues];
}

interface Mark { type: string }
interface RichNode {
  nodeType: string;
  value?: string;
  marks?: Mark[];
  data?: { uri?: string };
  content?: RichNode[];
}

/** Marks must hug the text, so spaces move outside the asterisks. */
function wrap(value: string, marker: string): string {
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(value);
  if (!match || match[2] === "") return value;
  return `${match[1]}${marker}${match[2]}${marker}${match[3]}`;
}

function inline(nodes: RichNode[] | undefined): string {
  return (nodes ?? [])
    .map((node) => {
      if (node.nodeType === "hyperlink") return `[${inline(node.content)}](${node.data?.uri ?? ""})`;
      if (node.nodeType !== "text") return inline(node.content);
      let value = node.value ?? "";
      const marks = new Set((node.marks ?? []).map((mark) => mark.type));
      if (marks.has("italic")) value = wrap(value, "*");
      if (marks.has("bold")) value = wrap(value, "**");
      return value;
    })
    .join("");
}

function indent(text: string, prefix: string, firstPrefix: string): string {
  return text
    .split("\n")
    .map((line, index) => (index === 0 ? firstPrefix : line === "" ? "" : prefix) + line)
    .join("\n");
}

function blocks(nodes: RichNode[] | undefined): string {
  return (nodes ?? []).map(block).filter((text) => text !== "").join("\n\n");
}

function block(node: RichNode): string {
  const heading = /^heading-([2-6])$/.exec(node.nodeType);
  if (heading) return `${"#".repeat(Number(heading[1]))} ${inline(node.content)}`;
  switch (node.nodeType) {
    case "paragraph":
      return inline(node.content);
    case "unordered-list":
    case "ordered-list": {
      const ordered = node.nodeType === "ordered-list";
      return (node.content ?? [])
        .map((item, index) => {
          const marker = ordered ? `${index + 1}. ` : "- ";
          return indent(blocks(item.content).replace(/\n\n/g, "\n"), " ".repeat(marker.length), marker);
        })
        .join("\n");
    }
    case "blockquote":
      return indent(blocks(node.content), "> ", "> ");
    case "hr":
      return "---";
    case "table": {
      const rows = (node.content ?? []).map((row) =>
        `| ${(row.content ?? []).map((cell) => blocks(cell.content).replace(/\n+/g, " ").replace(/\|/g, "\\|")).join(" | ")} |`,
      );
      const columns = (node.content?.[0]?.content ?? []).length;
      const separator = `| ${Array.from({ length: columns }, () => "---").join(" | ")} |`;
      return rows.length ? [rows[0], separator, ...rows.slice(1)].join("\n") : "";
    }
    default:
      return inline(node.content);
  }
}

export function richTextToMarkdown(document: unknown): string {
  const root = document as RichNode | undefined;
  if (!root || root.nodeType !== "document") return "";
  return blocks(root.content).trim();
}
