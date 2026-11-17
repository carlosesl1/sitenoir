"use client";

import Image from "next/image";

import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./Blog.module.css";

export function BlogFooter() {
  const { t } = useLanguage();
  return (
    <footer className={styles["footer"]}>
      <a className={styles["brand"]} href="/" aria-label={t("NOIR DIGITAL — Página inicial")}>
        <Image
          className={styles["brandSymbol"]}
          src="/brand/noir-symbol.svg"
          width="164"
          height="186"
          alt=""
          aria-hidden="true"
        />
        <Image
          className={styles["brandWordmark"]}
          src="/brand/noir-wordmark.svg"
          width="389"
          height="116"
          alt=""
          aria-hidden="true"
        />
      </a>

      <p>{t("BLOG / NOIR DIGITAL © 2026")}</p>

      <nav aria-label={t("Navegação final do blog")}>
        <a href="/blog">{t("Blog")}</a>
        <a href="/contato">{t("Contato")}</a>
        <a href="/">{t("Início")}</a>
      </nav>
    </footer>
  );
}
