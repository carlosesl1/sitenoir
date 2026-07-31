import Image from "next/image";
import type { ReactNode } from "react";

import type { LegalBlock, LegalDocumentContent, LegalInlineSegment } from "@/data/legal-documents";

import styles from "./LegalDocument.module.css";

function renderInlineSegment(segment: LegalInlineSegment): ReactNode {
  if (typeof segment === "string") return segment;

  if (segment.kind === "strong") {
    return <strong key={`strong-${segment.text}`}>{segment.text}</strong>;
  }

  return (
    <a key={`${segment.href}-${segment.text}`} href={segment.href}>
      {segment.text}
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
  return blocks.map((block) => {
    if (block.kind === "paragraph") {
      return (
        <p key={getBlockKey(block)}>{block.segments?.map(renderInlineSegment) ?? block.text}</p>
      );
    }

    if (block.kind === "list") {
      return (
        <ul key={getBlockKey(block)}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }

    return (
      <section key={block.title} className={styles["subsection"]}>
        <h3>{block.title}</h3>
        <LegalBlocks blocks={block.blocks} />
      </section>
    );
  });
}

export function LegalDocument({ document }: { readonly document: LegalDocumentContent }) {
  return (
    <article className={styles["page"]}>
      <header className={styles["hero"]}>
        <div className={styles["heroLabel"]}>
          <span>DOCUMENTO LEGAL</span>
          <span>{document.code}</span>
        </div>

        <div className={styles["heroTitle"]}>
          <h1 id="legal-document-title">{document.title}</h1>
          <p>{document.description}</p>
        </div>

        <dl className={styles["heroMeta"]} aria-label="Informações do documento">
          <div>
            <dt>Última atualização</dt>
            <dd>{document.lastUpdated}</dd>
          </div>
          <div>
            <dt>Seções</dt>
            <dd>{String(document.sections.length).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Jurisdição</dt>
            <dd>Brasil</dd>
          </div>
        </dl>
      </header>

      <div className={styles["documentGrid"]}>
        <aside className={styles["rail"]} aria-label="Navegação do documento">
          <div className={styles["railMeta"]}>
            <span>{document.code}</span>
            <span>VIGENTE DESDE 31.07.2026</span>
          </div>

          <nav className={styles["sectionIndex"]} aria-label={`Índice — ${document.title}`}>
            <p>Índice</p>
            <ol>
              {document.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <a className={styles["counterpartLink"]} href={document.counterpart.href}>
            <span>Outro documento</span>
            <strong>{document.counterpart.label}</strong>
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
                <h2>{section.title}</h2>
                <LegalBlocks blocks={section.blocks} />
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className={styles["footer"]}>
        <a className={styles["brand"]} href="/" aria-label="NOIR DIGITAL — Página inicial">
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

        <p>DOCUMENTAÇÃO INSTITUCIONAL / NOIR DIGITAL © 2026</p>

        <nav aria-label="Navegação legal final">
          <a href={document.counterpart.href}>{document.counterpart.label}</a>
          <a href="/contato">Contato</a>
          <a href="/">Início</a>
        </nav>
      </footer>
    </article>
  );
}
