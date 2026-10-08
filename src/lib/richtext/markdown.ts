/**
 * Converts Markdown to a Contentful rich text document.
 *
 * Supported: headings (levels 2 to 4), paragraphs, bold, italic, links,
 * ordered and unordered lists, quotes, horizontal rules, and tables.
 * Raw HTML is dropped (its text is not kept), images are dropped, and only
 * http and https links become hyperlinks; any other link keeps its text only.
 */
import { lexer, type Token, type Tokens } from "marked";

export const MAX_MARKDOWN_LENGTH = 20_000;

export class MarkdownError extends Error {
  override name = "MarkdownError";
}

type Mark = { type: "bold" | "italic" };
interface TextNode { nodeType: "text"; value: string; marks: Mark[]; data: Record<string, never> }
interface LinkNode { nodeType: "hyperlink"; data: { uri: string }; content: TextNode[] }
type Inline = TextNode | LinkNode;
export interface RichTextNode { nodeType: string; data: Record<string, unknown>; content: Array<RichTextNode | Inline> }
export interface RichTextDocument { nodeType: "document"; data: Record<string, never>; content: RichTextNode[] }

const block = (nodeType: string, content: Array<RichTextNode | Inline>): RichTextNode => ({ nodeType, data: {}, content });
const text = (value: string, marks: Mark[] = []): TextNode => ({ nodeType: "text", value, marks, data: {} });

export function isSafeHttpUrl(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function inline(tokens: Token[] | undefined, marks: Mark[] = []): Inline[] {
  const out: Inline[] = [];
  for (const token of tokens ?? []) {
    switch (token.type) {
      case "text":
      case "escape":
        if ("tokens" in token && token.tokens?.length) out.push(...inline(token.tokens, marks));
        else out.push(text(decode(token.text), marks));
        break;
      case "strong":
        out.push(...inline((token as Tokens.Strong).tokens, [...marks, { type: "bold" }]));
        break;
      case "em":
        out.push(...inline((token as Tokens.Em).tokens, [...marks, { type: "italic" }]));
        break;
      case "codespan":
        out.push(text(decode((token as Tokens.Codespan).text), marks));
        break;
      case "br":
        out.push(text("\n", marks));
        break;
      case "link": {
        const link = token as Tokens.Link;
        const children = inline(link.tokens, marks).filter((n): n is TextNode => n.nodeType === "text");
        if (isSafeHttpUrl(link.href)) out.push({ nodeType: "hyperlink", data: { uri: link.href }, content: children.length ? children : [text(link.href)] });
        else out.push(...children);
        break;
      }
      case "del":
        out.push(...inline((token as Tokens.Del).tokens, marks));
        break;
      // Dropped on purpose: raw HTML, images.
      case "html":
      case "image":
        break;
      default:
        if ("text" in token && typeof token.text === "string") out.push(text(decode(token.text), marks));
    }
  }
  return out;
}

/** marked keeps HTML entities encoded in text tokens; decode the common ones. */
function decode(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function paragraph(content: Inline[]): RichTextNode {
  return block("paragraph", content.length ? content : [text("")]);
}

function blocks(tokens: Token[]): RichTextNode[] {
  const out: RichTextNode[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const heading = token as Tokens.Heading;
        const level = Math.min(Math.max(heading.depth, 2), 4);
        out.push(block(`heading-${level}`, inline(heading.tokens)));
        break;
      }
      case "paragraph":
        out.push(paragraph(inline((token as Tokens.Paragraph).tokens)));
        break;
      case "text": {
        const plain = token as Tokens.Text;
        out.push(paragraph(plain.tokens?.length ? inline(plain.tokens) : [text(decode(plain.text))]));
        break;
      }
      case "list": {
        const list = token as Tokens.List;
        out.push(block(list.ordered ? "ordered-list" : "unordered-list", list.items.map((item) => {
          const children = blocks(item.tokens);
          return block("list-item", children.length ? children : [paragraph([])]);
        })));
        break;
      }
      case "blockquote": {
        const quote = (token as Tokens.Blockquote).tokens;
        const paragraphs = blocks(quote).filter((node) => node.nodeType === "paragraph");
        out.push(block("blockquote", paragraphs.length ? paragraphs : [paragraph([])]));
        break;
      }
      case "hr":
        out.push(block("hr", []));
        break;
      case "table": {
        const table = token as Tokens.Table;
        const row = (cells: Tokens.TableCell[], cellType: string) =>
          block("table-row", cells.map((cell) => block(cellType, [paragraph(inline(cell.tokens))])));
        out.push(block("table", [row(table.header, "table-header-cell"), ...table.rows.map((r) => row(r, "table-cell"))]));
        break;
      }
      case "code":
        out.push(paragraph([text((token as Tokens.Code).text)]));
        break;
      // Dropped on purpose: raw HTML blocks, spacing tokens, and anything unsupported.
      default:
        break;
    }
  }
  return out;
}

export function markdownToRichText(markdown: string): RichTextDocument {
  if (typeof markdown !== "string") throw new MarkdownError("Markdown must be a string.");
  if (markdown.length > MAX_MARKDOWN_LENGTH) throw new MarkdownError(`Markdown is longer than ${MAX_MARKDOWN_LENGTH} characters.`);
  // Remove elements whose text should never appear, then let the tokenizer drop the remaining tags.
  const withoutScripts = markdown.replace(/<(script|style|iframe|object|embed|noscript|template|textarea)\b[\s\S]*?<\/\1\s*>/gi, "");
  const content = blocks(lexer(withoutScripts, { gfm: true }));
  return { nodeType: "document", data: {}, content: content.length ? content : [paragraph([])] };
}

/** All visible text in a document, for validation (em dashes, length). */
export function richTextPlainText(node: { nodeType: string; value?: string; content?: unknown[] }): string {
  if (node.nodeType === "text") return node.value ?? "";
  return (node.content ?? []).map((child) => richTextPlainText(child as typeof node)).join(" ");
}
