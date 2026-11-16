"use client";

import { useMemo, useState } from "react";

import { BlogFooter } from "@/components/blog/BlogFooter";
import { type BlogPostSummary, formatBlogDate } from "@/features/blog/post-types";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./Blog.module.css";

const ALL_CATEGORIES = "Todos";

export function BlogIndex({ posts }: { readonly posts: readonly BlogPostSummary[] }) {
  const { t } = useLanguage();
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const categories = useMemo(
    () => [ALL_CATEGORIES, ...new Set(posts.map((post) => post.category))],
    [posts],
  );
  const visiblePosts =
    category === ALL_CATEGORIES ? posts : posts.filter((post) => post.category === category);

  return (
    <div className={styles["page"]}>
      <header className={styles["hero"]}>
        <div className={styles["heroLabel"]}>
          <span>{t("BLOG")}</span>
          <span>{t("NOIR DIGITAL")}</span>
        </div>

        <div className={styles["heroTitle"]}>
          <h1>{t("Blog")}</h1>
          <p>
            {t(
              "Posicionamento, design e tecnologia explicados de forma direta, para quem decide o rumo da empresa.",
            )}
          </p>
        </div>

        <dl className={styles["heroMeta"]}>
          <div>
            <dt>{t("Artigos")}</dt>
            <dd>{String(posts.length).padStart(2, "0")}</dd>
          </div>
          {posts[0] ? (
            <div>
              <dt>{t("Mais recente")}</dt>
              <dd>{formatBlogDate(posts[0].date)}</dd>
            </div>
          ) : null}
        </dl>
      </header>

      <section className={styles["listing"]} aria-label={t("Artigos")}>
        <fieldset className={styles["filters"]}>
          <legend>{t("Categorias")}</legend>
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className={styles["filter"]}
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {t(name)}
            </button>
          ))}
        </fieldset>

        {visiblePosts.length > 0 ? (
          <ol className={styles["postList"]}>
            {visiblePosts.map((post) => (
              <li key={post.slug}>
                <a className={styles["postRow"]} href={`/blog/${post.slug}`}>
                  <span className={styles["postMeta"]}>
                    <span>{formatBlogDate(post.date)}</span>
                    <span>{t(post.category)}</span>
                  </span>
                  <span className={styles["postCopy"]}>
                    <span className={styles["postTitle"]}>{post.title}</span>
                    <span className={styles["postDescription"]}>{post.description}</span>
                  </span>
                  <span className={styles["postAside"]}>
                    <span>
                      {post.readingMinutes} {t("min de leitura")}
                    </span>
                    <span aria-hidden="true">↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles["empty"]}>{t("Nenhum artigo publicado ainda.")}</p>
        )}
      </section>

      <BlogFooter />
    </div>
  );
}
