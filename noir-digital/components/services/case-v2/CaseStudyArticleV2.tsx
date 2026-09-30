"use client";

import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";
import type { CaseStudyV2 } from "@/data/case-studies-v2";
import type { Project } from "@/data/projects";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./CaseStudyArticleV2.module.css";
import { GoogleCaseLayout } from "./GoogleCaseLayout";
import { SiteCaseLayout } from "./SiteCaseLayout";
import { VideoCaseLayout } from "./VideoCaseLayout";

type Navigation = {
  readonly previous: CaseStudyV2 | undefined;
  readonly next: CaseStudyV2 | undefined;
};

const contactServiceByLayout = {
  site: "Sites e experiências digitais",
  video: "Vídeos e motion",
  google: "Presença no Google",
} as const;

function getContactHref(study: CaseStudyV2) {
  const service = encodeURIComponent(contactServiceByLayout[study.categoryLayout]);
  return `/contato?service=${service}&case=${encodeURIComponent(study.slug)}`;
}

export function CaseStudyArticleV2({
  project,
  study,
  navigation,
}: {
  readonly project: Project;
  readonly study: CaseStudyV2;
  readonly navigation: Navigation;
}) {
  const { t } = useLanguage();
  const Layout = {
    site: SiteCaseLayout,
    video: VideoCaseLayout,
    google: GoogleCaseLayout,
  }[study.categoryLayout];
  const contactHref = getContactHref(study);

  return (
    <article
      className={styles["page"]}
      data-case-study={study.slug}
      data-case-layout={study.categoryLayout}
      data-accent={study.accent}
    >
      <Layout project={project} study={study} />

      <section className={styles["closing"]}>
        <p>{t("Próximo passo")}</p>
        <h2>{t(study.cta.body)}</h2>
        <div className={styles["closingAction"]}>
          <SpectrumContactCta href={contactHref} label={study.cta.label} />
        </div>
      </section>

      <nav className={styles["navigation"]} aria-label={t("Navegação entre cases")}>
        {navigation.previous ? (
          <a href={`/services/${navigation.previous.slug}`}>
            <span>{t("Anterior")}</span>
            {t(navigation.previous.headline)}
          </a>
        ) : (
          <a href="/#selected-work">
            <span>{t("Voltar")}</span>
            {t("Todos os cases")}
          </a>
        )}
        {navigation.next ? (
          <a href={`/services/${navigation.next.slug}`}>
            <span>{t("Próximo")}</span>
            {t(navigation.next.headline)}
          </a>
        ) : (
          <a href={contactHref}>
            <span>{t("Próximo")}</span>
            {t("Iniciar uma conversa")}
          </a>
        )}
      </nav>
    </article>
  );
}
