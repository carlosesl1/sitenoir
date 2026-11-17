import type { BlogBlock } from "@/features/blog/markdown";

export interface BlogPostSummary {
  readonly category: string;
  /** ISO day, `2026-11-16`. */
  readonly date: string;
  readonly description: string;
  /** Featured image: on the card in lists and at the top of the article. */
  readonly image: {
    readonly alt: string;
    readonly src: string;
  };
  readonly readingMinutes: number;
  readonly slug: string;
  readonly title: string;
}

export interface BlogPost extends BlogPostSummary {
  readonly blocks: readonly BlogBlock[];
}

/** `2026-11-16` becomes `16.11.2026`, the date style used across the site. */
export function formatBlogDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}
