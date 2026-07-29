import type {
  EvidenceSection,
  InsightSection,
  TextSection,
  CaseStudyV2,
} from "@/data/case-studies-v2";
import type { Project } from "@/data/projects";

import { CaseMediaV2 } from "./CaseMediaV2";
import styles from "./SiteCaseLayout.module.css";

function EditorialCopy({ section }: { readonly section: TextSection }) {
  return (
    <section className={styles["copy"]} id={section.id}>
      <div>
        <p className={styles["eyebrow"]}>{section.eyebrow ?? "Contexto"}</p>
        <span aria-hidden="true">↘</span>
      </div>
      <div>
        <h2>{section.title}</h2>
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

function Evidence({ section }: { readonly section: EvidenceSection }) {
  if (
    section.presentation !== "wide-sequence" &&
    section.presentation !== "device-comparison"
  ) {
    throw new Error(`Unsupported site evidence presentation: ${section.presentation}`);
  }

  return (
    <section className={styles["evidenceSection"]} id={section.id}>
      <div className={styles["sectionHeading"]}>
        <span>02</span>
        <h2>{section.title}</h2>
      </div>
      <div className={styles["evidence"]} data-presentation={section.presentation}>
        {section.media.map((media) => (
          <CaseMediaV2 key={media.src} media={media} />
        ))}
      </div>
    </section>
  );
}

function Insights({ section }: { readonly section: InsightSection }) {
  return (
    <section className={styles["insights"]} id={section.id}>
      <div className={styles["sectionHeading"]}>
        <span>03</span>
        <h2>{section.title}</h2>
      </div>
      <ol>
        {section.items.map((item, index) => (
          <li key={item.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.label}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SiteCaseLayout({
  project,
  study,
}: {
  readonly project: Project;
  readonly study: CaseStudyV2;
}) {
  return (
    <div className={styles["layout"]}>
      <header className={styles["hero"]}>
        <div className={styles["heroCopy"]}>
          <p>
            {project.client} <span>/</span> Site
          </p>
          <h1>{study.headline}</h1>
          <p className={styles["summary"]}>{study.summary}</p>
          <dl>
            <div>
              <dt>Entrega</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Escopo</dt>
              <dd>{project.deliveryLabels.join(" / ")}</dd>
            </div>
          </dl>
        </div>
        <div data-testid="site-case-hero" className={styles["heroMedia"]}>
          <CaseMediaV2 media={study.hero} priority />
        </div>
      </header>

      {study.sections.map((section) => {
        if (section.type === "text") {
          return <EditorialCopy key={section.id} section={section} />;
        }
        if (section.type === "evidence") {
          return <Evidence key={section.id} section={section} />;
        }
        return <Insights key={section.id} section={section} />;
      })}
    </div>
  );
}
