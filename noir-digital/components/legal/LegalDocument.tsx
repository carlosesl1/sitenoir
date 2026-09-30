"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { LegalBlock, LegalDocumentContent, LegalInlineSegment } from "@/data/legal-documents";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./LegalDocument.module.css";

function renderInlineSegment(segment: LegalInlineSegment, t: (text: string) => string): ReactNode {
  if (typeof segment === "string") return t(segment);

  if (segment.kind === "strong") {
    return <strong key={`strong-${segment.text}`}>{t(segment.text)}</strong>;
  }

  return (
    <a key={`${segment.href}-${segment.text}`} href={segment.href}>
      {t(segment.text)}
    </a>
  );
}

function getBlockKey(block: LegalBlock): string {
  if (block.kind === "paragraph") {
    const content =
      block.text ??
      block.segments
        ?.map((segment) => (typeof segment === "string" ? segment : segment.text))
        .join("");

    return `paragraph-${content}`;
  }

  if (block.kind === "list") return `list-${block.items.join("|")}`;

  return `subsection-${block.title}`;
}

function LegalBlocks({ blocks }: { readonly blocks: readonly LegalBlock[] }) {
  const { t } = useLanguage();
  return blocks.map((block) => {
    if (block.kind === "paragraph") {
      return (
        <p key={getBlockKey(block)}>
          {block.segments?.map((segment) => renderInlineSegment(segment, t)) ?? t(block.text ?? "")}
        </p>
      );
    }

    if (block.kind === "list") {
      return (
        <ul key={getBlockKey(block)}>
          {block.items.map((item) => (
            <li key={item}>{t(item)}</li>
          ))}
        </ul>
      );
    }

    return (
      <section key={block.title} className={styles["subsection"]}>
        <h3>{t(block.title)}</h3>
        <LegalBlocks blocks={block.blocks} />
      </section>
    );
  });
}

export function LegalDocument({ document }: { readonly document: LegalDocumentContent }) {
  const { t } = useLanguage();
  return (
    <article className={styles["page"]}>
      <header className={styles["hero"]}>
        <div className={styles["heroLabel"]}>
          <span>{t("DOCUMENTO LEGAL")}</span>
          <span>{t(document.code)}</span>
        </div>

        <div className={styles["heroTitle"]}>
          <h1 id="legal-document-title">{t(document.title)}</h1>
          <p>{t(document.description)}</p>
        </div>

        <dl className={styles["heroMeta"]} aria-label={t("Informações do documento")}>
          <div>
            <dt>{t("Última atualização")}</dt>
            <dd>{t(document.lastUpdated)}</dd>
          </div>
          <div>
            <dt>{t("Seções")}</dt>
            <dd>{String(document.sections.length).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>{t("Jurisdição")}</dt>
            <dd>{t("Brasil")}</dd>
          </div>
        </dl>
      </header>

      <div className={styles["documentGrid"]}>
        <aside className={styles["rail"]} aria-label={t("Navegação do documento")}>
          <div className={styles["railMeta"]}>
            <span>{t(document.code)}</span>
            <span>{t("VIGENTE DESDE 31.07.2026")}</span>
          </div>

          <nav
            className={styles["sectionIndex"]}
            aria-label={`${t("Índice")} — ${t(document.title)}`}
          >
            <p>{t("Índice")}</p>
            <ol>
              {document.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {t(section.title)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <a className={styles["counterpartLink"]} href={document.counterpart.href}>
            <span>{t("Outro documento")}</span>
            <strong>{t(document.counterpart.label)}</strong>
            <span aria-hidden="true">↗</span>
          </a>
        </aside>

        <div className={styles["documentBody"]}>
          {document.sections.map((section, index) => (
            <section key={section.id} id={section.id} className={styles["legalSection"]}>
              <span className={styles["sectionNumber"]} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles["sectionContent"]}>
                <h2>{t(section.title)}</h2>
                <LegalBlocks blocks={section.blocks} />
              </div>
            </section>
          ))}
        </div>
      </div>

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

        <p>{t("DOCUMENTAÇÃO INSTITUCIONAL / NOIR DIGITAL © 2026")}</p>

        <nav aria-label={t("Navegação legal final")}>
          <a href={document.counterpart.href}>{t(document.counterpart.label)}</a>
          <a href="/contato">{t("Contato")}</a>
          <a href="/">{t("Início")}</a>
        </nav>
      </footer>
    </article>
  );
}
