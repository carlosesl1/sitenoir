import type {
  EvidenceSection,
  InsightSection,
  TextSection,
  CaseStudyV2,
} from "@/data/case-studies-v2";
import type { Project } from "@/data/projects";

import { CaseMediaV2 } from "./CaseMediaV2";
import styles from "./VideoCaseLayout.module.css";

const presentationClasses = {
  campaign: "campaign",
  "single-film": "singleFilm",
  "paired-films": "pairedFilms",
} as const;

function Story({ section }: { readonly section: TextSection }) {
  return (
    <section className={styles["story"]} id={section.id}>
      <p>{section.eyebrow ?? "Direção"}</p>
      <div>
        <h2>{section.title}</h2>
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

function Films({ section }: { readonly section: EvidenceSection }) {
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
        <span>PLAY</span>
        <h2>{section.title}</h2>
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
  return (
    <section className={styles["direction"]} id={section.id}>
      <h2>{section.title}</h2>
      <ol>
        {section.items.map((item, index) => (
          <li key={item.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{item.label}</h3>
              <p>{item.body}</p>
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
  if (!study.credit) {
    throw new Error(`Video case ${study.slug} requires production credit`);
  }

  const text = study.sections.find(
    (section): section is TextSection => section.type === "text",
  );
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
          <p>{project.client} / Filme</p>
          <span>{project.year}</span>
        </div>
        <h1>{study.headline}</h1>
        <p className={styles["summary"]}>{study.summary}</p>
        <div className={styles["heroMedia"]}>
          <CaseMediaV2 media={study.hero} priority />
        </div>
      </header>

      <Story section={text} />
      <Films section={evidence} />

      <aside className={styles["credit"]}>
        <div className={styles["portrait"]} aria-hidden="true">
          D
        </div>
        <div>
          <p>Crédito de produção</p>
          <h2>{study.credit.name}</h2>
          <p className={styles["creditRole"]}>{study.credit.role}</p>
          <p>{study.credit.contribution}</p>
        </div>
      </aside>

      <Direction section={insights} />
    </div>
  );
}
