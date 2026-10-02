"use client";

import type {
  CaseStudyV2,
  EvidenceSection,
  InsightSection,
  TextSection,
} from "@/data/case-studies-v2";
import type { Project } from "@/data/projects";
import { useLanguage } from "@/features/i18n/LanguageProvider";
import { CaseDetails, CaseJumpLink } from "./CaseDetails";
import { CaseMediaV2 } from "./CaseMediaV2";
import styles from "./GoogleCaseLayout.module.css";

const journey = [
  ["01", "Buscar", "Uma necessidade local inicia a pesquisa."],
  ["02", "Encontrar", "O perfil aparece com identidade e categoria."],
  ["03", "Verificar", "Fotos, localização e contato ajudam a avaliar."],
  ["04", "Decidir", "A pessoa escolhe rota, visita ou contato."],
] as const;

export function GoogleCaseLayout({
  project,
  study,
}: {
  readonly project: Project;
  readonly study: CaseStudyV2;
}) {
  const { t } = useLanguage();
  const text = study.sections.find((section): section is TextSection => section.type === "text");
  const evidence = study.sections.find(
    (section): section is EvidenceSection => section.type === "evidence",
  );
  const insights = study.sections.find(
    (section): section is InsightSection => section.type === "insights",
  );

  if (!text || !evidence || !insights || evidence.presentation !== "search-journey") {
    throw new Error(`Google case ${study.slug} requires the search journey structure`);
  }

  return (
    <div className={styles["layout"]}>
      <header className={styles["hero"]}>
        <h1>{t(study.headline)}</h1>
        <div className={styles["heroStage"]}>
          <div className={styles["heroMedia"]}>
            <CaseMediaV2 media={study.hero} priority />
          </div>
          <div className={styles["heroCopy"]}>
            <p className={styles["summary"]}>{t(study.summary)}</p>
            <CaseDetails project={project} />
            <CaseJumpLink id={evidence.id} label="Explorar o perfil" />
          </div>
        </div>
      </header>

      <ol className={styles["journey"]} aria-label={t("Jornada da busca local")}>
        {journey.map(([index, title, body]) => (
          <li key={title}>
            <span>{index}</span>
            <h2>{t(title)}</h2>
            <p>{t(body)}</p>
          </li>
        ))}
      </ol>

      <section className={styles["context"]} id={text.id}>
        <h2>{t(text.title)}</h2>
        <div>
          {text.paragraphs.map((paragraph) => (
            <p key={paragraph}>{t(paragraph)}</p>
          ))}
        </div>
      </section>

      <section className={styles["evidenceSection"]} id={evidence.id}>
        <div className={styles["sectionHeading"]}>
          <h2>{t(evidence.title)}</h2>
        </div>
        <div className={styles["evidence"]}>
          {evidence.media.map((media) => (
            <CaseMediaV2 key={media.src} media={media} />
          ))}
        </div>
      </section>

      <section className={styles["insights"]} id={insights.id}>
        <h2>{t(insights.title)}</h2>
        <dl>
          {insights.items.map((item) => (
            <div key={item.label}>
              <dt>{t(item.label)}</dt>
              <dd>{t(item.body)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
