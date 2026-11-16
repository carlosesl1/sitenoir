import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseMarkdown } from "@/features/blog/markdown";
import type { BlogPost, BlogPostSummary } from "@/features/blog/post-types";

/** One Markdown file per post. The file name is the address: `meu-post.md` is `/blog/meu-post`. */
const POSTS_DIRECTORY = join(process.cwd(), "content", "blog");
const WORDS_PER_MINUTE = 200;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function createBlogPost(slug: string, source: string): BlogPost {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`Blog post "${slug}": use only lowercase letters, numbers and hyphens.`);
  }

  const { blocks, frontmatter, wordCount } = parseMarkdown(source);
  const field = (name: string): string => {
    const value = frontmatter[name];
    if (!value) throw new Error(`Blog post "${slug}": missing "${name}" in the header.`);
    return value;
  };
  const date = field("date");
  if (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error(`Blog post "${slug}": "date" must look like 2026-11-16.`);
  }

  return {
    blocks,
    category: field("category"),
    date,
    description: field("description"),
    readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
    slug,
    title: field("title"),
  };
}

export function sortBlogPosts<T extends BlogPostSummary>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getAllBlogPosts(): BlogPost[] {
  const files = readdirSync(POSTS_DIRECTORY).filter((file) => file.endsWith(".md"));
  return sortBlogPosts(
    files.map((file) =>
      createBlogPost(file.slice(0, -3), readFileSync(join(POSTS_DIRECTORY, file), "utf8")),
    ),
  );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug);
}

export function toBlogPostSummary(post: BlogPostSummary): BlogPostSummary {
  return {
    category: post.category,
    date: post.date,
    description: post.description,
    readingMinutes: post.readingMinutes,
    slug: post.slug,
    title: post.title,
  };
}
