"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { BLOG_COVER_HEIGHT, BLOG_COVER_WIDTH, BlogCard } from "@/components/blog/BlogCard";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";
import type { BlogBlock, BlogInline } from "@/features/blog/markdown";
import { type BlogPost, type BlogPostSummary, formatBlogDate } from "@/features/blog/post-types";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./Blog.module.css";

function renderInline(content: readonly BlogInline[]): ReactNode[] {
  return content.map((segment, index) => {
    const key = `${index}-${typeof segment === "string" ? segment : segment.text}`;
    if (typeof segment === "string") return segment;
    if (segment.kind !== "link") {
      return segment.kind === "strong" ? (
        <strong key={key}>{segment.text}</strong>
      ) : (
        <em key={key}>{segment.text}</em>
      );
    }
    const external = /^https?:\/\//i.test(segment.href);
    return (
      <a
        key={key}
        href={segment.href}
        {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
      >
        {segment.text}
      </a>
    );
  });
}

function blockKey(block: BlogBlock, index: number): string {
  return block.kind === "heading" ? block.id : `${block.kind}-${index}`;
}

function ArticleBlock({ block }: { readonly block: BlogBlock }) {
  if (block.kind === "heading") {
    return block.level === 2 ? (
      <h2 id={block.id}>{block.text}</h2>
    ) : (
      <h3 id={block.id}>{block.text}</h3>
    );
  }
  if (block.kind === "quote") return <blockquote>{renderInline(block.content)}</blockquote>;
  if (block.kind === "paragraph") return <p>{renderInline(block.content)}</p>;

  const items = block.items.map((item) => {
    const text = item.map((segment) => (typeof segment === "string" ? segment : segment.text));
    return <li key={text.join("")}>{renderInline(item)}</li>;
  });
  return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
}

export function BlogArticle({
  post,
  related,
}: {
  readonly post: BlogPost;
  readonly related: readonly BlogPostSummary[];
}) {
  const { t } = useLanguage();
  return (
    <article className={styles["page"]}>
      <header className={`${styles["hero"]} ${styles["articleHero"]}`}>
        <div className={styles["heroLabel"]}>
          <a className={styles["backLink"]} href="/blog">
            <span aria-hidden="true">←</span> {t("Blog")}
          </a>
          <span>{t(post.category)}</span>
        </div>

        <div className={styles["heroTitle"]}>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
        </div>

        <dl className={styles["heroMeta"]}>
          <div>
            <dt>{t("Publicado em")}</dt>
            <dd>
              <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            </dd>
          </div>
          <div>
            <dt>{t("Leitura")}</dt>
            <dd>
              {post.readingMinutes} {t("min")}
            </dd>
          </div>
        </dl>
      </header>

      <figure className={styles["cover"]}>
        <Image
          src={post.image.src}
          alt={post.image.alt}
          width={BLOG_COVER_WIDTH}
          height={BLOG_COVER_HEIGHT}
          priority
          sizes="(max-width: 767px) calc(100vw - 34px), 92vw"
        />
      </figure>

      <div className={styles["articleGrid"]}>
        <div className={styles["articleBody"]}>
          {post.blocks.map((block, index) => (
            <ArticleBlock key={blockKey(block, index)} block={block} />
          ))}
        </div>

        <aside className={styles["closing"]}>
          <p className={styles["closingLabel"]}>{t("Próximo passo")}</p>
          <p className={styles["closingTitle"]}>{t("Quer aplicar isso na sua empresa?")}</p>
          <SpectrumContactCta emphasis />
        </aside>
      </div>

      {related.length > 0 ? (
        <section className={styles["listing"]} aria-labelledby="blog-related-heading">
          <h2 id="blog-related-heading" className={styles["relatedHeading"]}>
            {t("Continue lendo")}
          </h2>
          <ol className={styles["cardGrid"]}>
            {related.map((item) => (
              <li key={item.slug}>
                <BlogCard post={item} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <BlogFooter />
    </article>
  );
}
