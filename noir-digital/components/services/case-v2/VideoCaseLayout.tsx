"use client";

import Image from "next/image";
import type {
  CaseStudyV2,
  EvidenceSection,
  InsightSection,
  TextSection,
} from "@/data/case-studies-v2";
import type { Project } from "@/data/projects";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import { CaseMediaV2 } from "./CaseMediaV2";
import styles from "./VideoCaseLayout.module.css";

const presentationClasses = {
  campaign: "campaign",
  "single-film": "singleFilm",
  "paired-films": "pairedFilms",
} as const;

function Story({ section }: { readonly section: TextSection }) {
  const { t } = useLanguage();
  return (
    <section className={styles["story"]} id={section.id}>
      <p>{t(section.eyebrow ?? "Direção")}</p>
      <div>
        <h2>{t(section.title)}</h2>
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{t(paragraph)}</p>
        ))}
      </div>
    </section>
  );
}

function Films({ section }: { readonly section: EvidenceSection }) {
  const { t } = useLanguage();
  const className =
    section.presentation in presentationClasses
      ? styles[presentationClasses[section.presentation as keyof typeof presentationClasses]]
      : undefined;

  if (!className) {
    throw new Error(`Unsupported video evidence presentation: ${section.presentation}`);
  }

  return (
    <section className={styles["films"]} id={section.id}>
      <div className={styles["sectionHeading"]}>
        <span>{t("PLAY")}</span>
        <h2>{t(section.title)}</h2>
      </div>
      <div className={className} data-video-presentation={section.presentation}>
        {section.media.map((media, index) => (
          <div key={media.src} data-primary-video={index === 0 ? "" : undefined}>
            <CaseMediaV2 media={media} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Direction({ section }: { readonly section: InsightSection }) {
  const { t } = useLanguage();
  return (
    <section className={styles["direction"]} id={section.id}>
      <h2>{t(section.title)}</h2>
      <ol>
        {section.items.map((item, index) => (
          <li key={item.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{t(item.label)}</h3>
              <p>{t(item.body)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function VideoCaseLayout({
  project,
  study,
}: {
  readonly project: Project;
  readonly study: CaseStudyV2;
}) {
  const { t } = useLanguage();
  if (!study.credit) {
    throw new Error(`Video case ${study.slug} requires production credit`);
  }

  const text = study.sections.find((section): section is TextSection => section.type === "text");
  const evidence = study.sections.find(
    (section): section is EvidenceSection => section.type === "evidence",
  );
  const insights = study.sections.find(
    (section): section is InsightSection => section.type === "insights",
  );

  if (!text || !evidence || !insights) {
    throw new Error(`Video case ${study.slug} is missing a required editorial section`);
  }

  return (
    <div className={styles["layout"]}>
      <header className={styles["hero"]}>
        <div className={styles["heroTopline"]}>
          <p>
            {project.client}
            {t(" / Filme")}
          </p>
          <span>{project.year}</span>
        </div>
        <h1>{t(study.headline)}</h1>
        <p className={styles["summary"]}>{t(study.summary)}</p>
        <div className={styles["heroMedia"]}>
          <CaseMediaV2 media={study.hero} priority />
        </div>
      </header>

      <Story section={text} />
      <Films section={evidence} />

      <aside className={styles["credit"]}>
        <div className={styles["portrait"]}>
          <Image
            src={study.credit.portrait.src}
            alt={t(study.credit.portrait.alt)}
            width={study.credit.portrait.width}
            height={study.credit.portrait.height}
            sizes="(max-width: 767px) calc(100vw - 82px), 240px"
          />
        </div>
        <div>
          <p>{t("Designer responsável")}</p>
          <h2>{study.credit.name}</h2>
          <p className={styles["creditRole"]}>{t(study.credit.role)}</p>
          <p>{t(study.credit.contribution)}</p>
        </div>
      </aside>

      <Direction section={insights} />
    </div>
  );
}
