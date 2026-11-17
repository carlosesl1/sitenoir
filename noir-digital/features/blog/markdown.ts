/**
 * A small, safe Markdown reader for blog posts. It understands the subset the
 * posts use and turns it into data, so no HTML from a file ever reaches the page.
 */

export type BlogInline =
  | string
  | { readonly kind: "strong" | "emphasis"; readonly text: string }
  | { readonly kind: "link"; readonly href: string; readonly text: string };

export type BlogBlock =
  | { readonly kind: "heading"; readonly id: string; readonly level: 2 | 3; readonly text: string }
  | { readonly kind: "paragraph"; readonly content: readonly BlogInline[] }
  | { readonly kind: "quote"; readonly content: readonly BlogInline[] }
  | {
      readonly kind: "list";
      readonly items: readonly (readonly BlogInline[])[];
      readonly ordered: boolean;
    };

export interface ParsedMarkdown {
  readonly blocks: readonly BlogBlock[];
  readonly frontmatter: Readonly<Record<string, string>>;
  readonly wordCount: number;
}

const INLINE_PATTERN = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
const UNORDERED_ITEM = /^[-*]\s+/;
const ORDERED_ITEM = /^\d+[.)]\s+/;

export function slugifyHeading(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseInline(text: string): readonly BlogInline[] {
  const result: BlogInline[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index;
    if (start > cursor) result.push(text.slice(cursor, start));
    const [whole, strong, emphasis, linkText, href] = match;
    if (strong !== undefined) result.push({ kind: "strong", text: strong });
    else if (emphasis !== undefined) result.push({ kind: "emphasis", text: emphasis });
    else if (linkText !== undefined && href !== undefined && SAFE_HREF.test(href))
      result.push({ kind: "link", href, text: linkText });
    else result.push(linkText ?? whole);
    cursor = start + whole.length;
  }
  if (cursor < text.length) result.push(text.slice(cursor));
  return result;
}

function splitFrontmatter(source: string): {
  readonly body: string;
  readonly frontmatter: Record<string, string>;
} {
  const normalized = source.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized);
  if (!match) return { body: normalized, frontmatter: {} };

  const frontmatter: Record<string, string> = {};
  for (const line of (match[1] ?? "").split("\n")) {
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2");
    if (key) frontmatter[key] = value;
  }
  return { body: normalized.slice(match[0].length), frontmatter };
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function parseMarkdown(source: string): ParsedMarkdown {
  const { body, frontmatter } = splitFrontmatter(source);
  const blocks: BlogBlock[] = [];
  const headingIds = new Map<string, number>();
  let wordCount = 0;

  for (const chunk of body.split(/\n{2,}/)) {
    const lines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const first = lines[0];
    if (first === undefined) continue;

    const heading = /^(#{2,3})\s+(.+)$/.exec(first);
    if (heading && lines.length === 1) {
      const text = (heading[2] ?? "").trim();
      const base = slugifyHeading(text) || "secao";
      const seen = headingIds.get(base) ?? 0;
      headingIds.set(base, seen + 1);
      blocks.push({
        kind: "heading",
        id: seen === 0 ? base : `${base}-${seen + 1}`,
        level: heading[1] === "##" ? 2 : 3,
        text,
      });
      wordCount += countWords(text);
      continue;
    }

    const ordered = lines.every((line) => ORDERED_ITEM.test(line));
    if (ordered || lines.every((line) => UNORDERED_ITEM.test(line))) {
      const pattern = ordered ? ORDERED_ITEM : UNORDERED_ITEM;
      const items = lines.map((line) => line.replace(pattern, ""));
      blocks.push({ kind: "list", items: items.map(parseInline), ordered });
      wordCount += countWords(items.join(" "));
      continue;
    }

    if (lines.every((line) => line.startsWith(">"))) {
      const text = lines.map((line) => line.replace(/^>\s?/, "")).join(" ");
      blocks.push({ kind: "quote", content: parseInline(text) });
      wordCount += countWords(text);
      continue;
    }

    const text = lines.join(" ");
    blocks.push({ kind: "paragraph", content: parseInline(text) });
    wordCount += countWords(text);
  }

  return { blocks, frontmatter, wordCount };
}
