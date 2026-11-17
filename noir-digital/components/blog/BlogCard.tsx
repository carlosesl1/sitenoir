"use client";

import Image from "next/image";

import { type BlogPostSummary, formatBlogDate } from "@/features/blog/post-types";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./Blog.module.css";

/** Covers are drawn at 16:9 whatever the file's own size. */
export const BLOG_COVER_WIDTH = 1600;
export const BLOG_COVER_HEIGHT = 900;

export function BlogCard({
  featured = false,
  post,
  priority = false,
}: {
  /** The lead post of a list: wider, with the image beside the text. */
  readonly featured?: boolean;
  readonly post: BlogPostSummary;
  readonly priority?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <a
      className={styles["card"]}
      data-featured={featured ? "true" : undefined}
      href={`/blog/${post.slug}`}
    >
      <span className={styles["cardMedia"]}>
        <Image
          src={post.image.src}
          alt={post.image.alt}
          width={BLOG_COVER_WIDTH}
          height={BLOG_COVER_HEIGHT}
          priority={priority}
          sizes={
            featured
              ? "(max-width: 767px) calc(100vw - 34px), 58vw"
              : "(max-width: 767px) calc(100vw - 34px), 46vw"
          }
        />
      </span>
      <span className={styles["cardCopy"]}>
        <span className={styles["cardMeta"]}>
          <span>{t(post.category)}</span>
          <span>{formatBlogDate(post.date)}</span>
        </span>
        <span className={styles["cardTitle"]}>{post.title}</span>
        <span className={styles["cardDescription"]}>{post.description}</span>
        <span className={styles["cardAside"]}>
          <span>
            {post.readingMinutes} {t("min de leitura")}
          </span>
          <span aria-hidden="true">↗</span>
        </span>
      </span>
    </a>
  );
}
