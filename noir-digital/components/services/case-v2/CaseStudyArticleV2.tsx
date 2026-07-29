"use client";

import type { CaseStudyV2 } from "@/data/case-studies-v2";
import type { Project } from "@/data/projects";

import { GoogleCaseLayout } from "./GoogleCaseLayout";
import { SiteCaseLayout } from "./SiteCaseLayout";
import { VideoCaseLayout } from "./VideoCaseLayout";
import styles from "./CaseStudyArticleV2.module.css";

type Navigation = {
  readonly previous: CaseStudyV2 | undefined;
  readonly next: CaseStudyV2 | undefined;
};

export function CaseStudyArticleV2({
  project,
  study,
  navigation,
}: {
  readonly project: Project;
  readonly study: CaseStudyV2;
  readonly navigation: Navigation;
}) {
  const Layout = {
    site: SiteCaseLayout,
    video: VideoCaseLayout,
    google: GoogleCaseLayout,
  }[study.categoryLayout];

  return (
    <article
      className={styles["page"]}
      data-case-study={study.slug}
      data-case-layout={study.categoryLayout}
      data-accent={study.accent}
    >
      <Layout project={project} study={study} />

      <section className={styles["closing"]}>
        <p>Próximo passo</p>
        <h2>{study.cta.body}</h2>
        <a href="/#contact">
          {study.cta.label}
          <span aria-hidden="true">↗</span>
        </a>
      </section>

      <nav className={styles["navigation"]} aria-label="Navegação entre cases">
        {navigation.previous ? (
          <a href={`/services/${navigation.previous.slug}`}>
            <span>Anterior</span>
            {navigation.previous.headline}
          </a>
        ) : (
          <a href="/#selected-work">
            <span>Voltar</span>
            Todos os cases
          </a>
        )}
        {navigation.next ? (
          <a href={`/services/${navigation.next.slug}`}>
            <span>Próximo</span>
            {navigation.next.headline}
          </a>
        ) : (
          <a href="/#contact">
            <span>Próximo</span>
            Iniciar uma conversa
          </a>
        )}
      </nav>
    </article>
  );
}
