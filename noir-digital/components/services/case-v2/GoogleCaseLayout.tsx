import type {
  EvidenceSection,
  InsightSection,
  TextSection,
  CaseStudyV2,
} from "@/data/case-studies-v2";
import type { Project } from "@/data/projects";

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
  const text = study.sections.find(
    (section): section is TextSection => section.type === "text",
  );
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
        <div className={styles["heroCopy"]}>
          <p>Presença no Google / {project.client}</p>
          <h1>{study.headline}</h1>
          <p className={styles["summary"]}>{study.summary}</p>
        </div>
        <div className={styles["heroMedia"]}>
          <CaseMediaV2 media={study.hero} priority />
        </div>
      </header>

      <ol className={styles["journey"]} aria-label="Jornada da busca local">
        {journey.map(([index, title, body]) => (
          <li key={title}>
            <span>{index}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </li>
        ))}
      </ol>

      <section className={styles["context"]} id={text.id}>
        <p>{text.eyebrow ?? "Contexto local"}</p>
        <div>
          <h2>{text.title}</h2>
          {text.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className={styles["evidenceSection"]} id={evidence.id}>
        <div className={styles["sectionHeading"]}>
          <span>Prova real</span>
          <h2>{evidence.title}</h2>
        </div>
        <div className={styles["evidence"]}>
          {evidence.media.map((media) => (
            <CaseMediaV2 key={media.src} media={media} />
          ))}
        </div>
      </section>

      <section className={styles["insights"]} id={insights.id}>
        <h2>{insights.title}</h2>
        <dl>
          {insights.items.map((item, index) => (
            <div key={item.label}>
              <dt>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </dt>
              <dd>{item.body}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
