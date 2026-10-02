"use client";

import Image from "next/image";
import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";
import type { CaseStudyV2 } from "@/data/case-studies-v2";
import type { Project } from "@/data/projects";
import { useLanguage } from "@/features/i18n/LanguageProvider";
import { CaseArrow } from "./CaseDetails";
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
  const featured = navigation.next ?? navigation.previous;

  return (
    <article
      className={styles["page"]}
      data-case-study={study.slug}
      data-case-layout={study.categoryLayout}
      data-accent={study.accent}
    >
      <div className={styles["wayfinding"]}>
        <a href="/#selected-work">
          <CaseArrow direction="back" />
          {t("Todos os cases")}
        </a>
        <span>{t(contactServiceByLayout[study.categoryLayout])}</span>
      </div>
      <Layout project={project} study={study} />

      <section className={styles["closing"]}>
        <h2>{t(study.cta.body)}</h2>
        <div className={styles["closingAction"]}>
          <SpectrumContactCta href={contactHref} label={study.cta.label} />
        </div>
      </section>

      <nav className={styles["navigation"]} aria-label={t("Navegação entre cases")}>
        {featured && (
          <a className={styles["nextProject"]} href={`/services/${featured.slug}`}>
            <div className={styles["nextImage"]}>
              <Image
                src={featured.hero.src}
                alt=""
                width={featured.hero.width}
                height={featured.hero.height}
                sizes="(max-width: 767px) calc(100vw - 40px), 45vw"
              />
            </div>
            <div className={styles["nextCopy"]}>
              <span>{t(navigation.next ? "Próximo projeto" : "Projeto anterior")}</span>
              <h2>{t(featured.headline)}</h2>
              <CaseArrow />
            </div>
          </a>
        )}
        <div className={styles["navigationFooter"]}>
          <a
            href={
              navigation.previous && navigation.next
                ? `/services/${navigation.previous.slug}`
                : "/#selected-work"
            }
          >
            <CaseArrow direction="back" />
            {t(navigation.previous && navigation.next ? "Projeto anterior" : "Todos os cases")}
          </a>
          <a href="/#selected-work">
            {t("Explorar todos os projetos")}
            <CaseArrow />
          </a>
        </div>
      </nav>
    </article>
  );
}
