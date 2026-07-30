"use client";

import Image from "next/image";
import type { MouseEvent } from "react";

import type { CaseMedia, CaseStudy, CaseStudyNavigation } from "@/data/case-studies";
import type { Project } from "@/data/projects";
import { useScroll } from "@/features/scroll/ScrollProvider";
import { useScrollSpy } from "@/features/scroll/use-scroll-spy";

import styles from "./CaseStudyArticle.module.css";

type CaseStudyArticleProps = {
  readonly project: Project;
  readonly study: CaseStudy;
  readonly navigation: CaseStudyNavigation;
};

type ChapterId = "visao-geral" | "entrega" | "evidencias" | "valor" | "creditos" | "proximo-passo";

type Chapter = {
  readonly id: ChapterId;
  readonly label: string;
};

const coreChapters = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "entrega", label: "O que foi feito" },
  { id: "evidencias", label: "Evidências" },
  { id: "valor", label: "Valor para a empresa" },
] as const satisfies readonly Chapter[];

const finalChapter = {
  id: "proximo-passo",
  label: "Próximo passo",
} as const satisfies Chapter;

const serviceLabels = {
  sites: "Sites",
  videos: "Vídeos",
  google: "Presença no Google",
} as const;

function CaseMediaFigure({ media }: { readonly media: CaseMedia }) {
  if (media.kind === "video") {
    return (
      <figure className={styles["mediaFigure"]} data-layout={media.layout}>
        {/* biome-ignore lint/a11y/useMediaCaption: the supplied portfolio videos have no dialogue transcripts or caption tracks. */}
        <video
          className={styles["video"]}
          aria-label={media.alt}
          controls
          playsInline
          preload="metadata"
          poster={media.poster}
          width={media.width}
          height={media.height}
        >
          <source src={media.src} type="video/mp4" />
        </video>
        <figcaption>{media.caption}</figcaption>
      </figure>
    );
  }

  return (
    <figure className={styles["mediaFigure"]} data-layout={media.layout}>
      <div
        className={styles["mediaFrame"]}
        style={{ aspectRatio: `${media.width} / ${media.height}` }}
      >
        <Image
          className={styles["evidenceImage"]}
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes={
            media.layout === "wide"
              ? "(max-width: 767px) calc(100vw - 32px), 920px"
              : "(max-width: 767px) calc(100vw - 32px), 440px"
          }
        />
      </div>
      <figcaption>{media.caption}</figcaption>
    </figure>
  );
}

function CaseCredit({ credit }: { readonly credit: NonNullable<CaseStudy["credit"]> }) {
  return (
    <div className={styles["credit"]}>
      <div className={styles["creditPortrait"]} aria-hidden="true">
        D
      </div>
      <div className={styles["creditCopy"]}>
        <p className={styles["creditLabel"]}>Crédito de produção</p>
        <h2>{credit.name}</h2>
        <p className={styles["creditRole"]}>{credit.role}</p>
        <p>Editor responsável pelos vídeos apresentados neste case.</p>
      </div>
    </div>
  );
}

export function CaseStudyArticle({ navigation, project, study }: CaseStudyArticleProps) {
  const chapters: readonly Chapter[] = study.credit
    ? [...coreChapters, { id: "creditos", label: "Créditos" }, finalChapter]
    : [...coreChapters, finalChapter];
  const chapterIds = chapters.map(({ id }) => id);
  const activeChapter = useScrollSpy({
    ids: chapterIds,
    initialId: "visao-geral",
  });
  const { scrollToSelector } = useScroll();

  const scrollToChapter = (event: MouseEvent<HTMLAnchorElement>, chapterId: ChapterId) => {
    event.preventDefault();
    window.history.replaceState(null, "", `#${chapterId}`);
    scrollToSelector(`#${chapterId}`);
  };

  return (
    <div className={styles["page"]} data-case-study={study.slug}>
      <aside className={styles["toc"]}>
        <nav aria-label="Sumário do case">
          {chapters.map((chapter) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              aria-current={activeChapter === chapter.id ? "location" : undefined}
              onClick={(event) => scrollToChapter(event, chapter.id)}
            >
              {chapter.label}
            </a>
          ))}
        </nav>
      </aside>

      <article className={styles["article"]}>
        <header className={styles["intro"]}>
          <p className={styles["eyebrow"]}>
            {serviceLabels[study.service]} / {project.client}
          </p>
          <h1>{study.headline}</h1>
          <div className={styles["introMeta"]}>
            <span>{project.year}</span>
            <span>{project.deliveryLabels.join(" / ")}</span>
          </div>
          <p className={styles["lead"]}>{study.summary}</p>
          <figure className={styles["heroFigure"]}>
            <div className={styles["heroFrame"]}>
              <Image
                className={styles["heroImage"]}
                src={project.image}
                alt={project.imageAlt}
                fill
                priority
                sizes="(max-width: 767px) calc(100vw - 32px), 920px"
                unoptimized
              />
            </div>
            <figcaption>
              {project.client} / {serviceLabels[study.service]}
            </figcaption>
          </figure>
        </header>

        <section id="visao-geral" className={styles["chapter"]}>
          <h2>
            <a href="#visao-geral">Visão geral</a>
          </h2>
          <div className={styles["prose"]}>
            {study.context.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section id="entrega" className={styles["chapter"]}>
          <h2>
            <a href="#entrega">O que foi feito</a>
          </h2>
          <div className={styles["deliveryGrid"]}>
            {study.deliveries.map((delivery, index) => (
              <article key={delivery.title} className={styles["delivery"]}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{delivery.title}</h3>
                <p>{delivery.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="evidencias" className={styles["chapter"]}>
          <h2>
            <a href="#evidencias">Evidências</a>
          </h2>
          <p className={styles["chapterLead"]}>
            Imagens e vídeos do trabalho realizado, acompanhados pelo contexto que cada peça
            comprova.
          </p>
          <div className={styles["mediaGrid"]}>
            {study.media.map((media) => (
              <CaseMediaFigure key={media.src} media={media} />
            ))}
          </div>
        </section>

        <section id="valor" className={styles["chapter"]}>
          <h2>
            <a href="#valor">Valor para a empresa</a>
          </h2>
          <ul className={styles["benefits"]}>
            {study.benefits.map((benefit, index) => (
              <li key={benefit}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <p>{benefit}</p>
              </li>
            ))}
          </ul>
        </section>

        {study.credit ? (
          <section id="creditos" className={styles["chapter"]}>
            <CaseCredit credit={study.credit} />
          </section>
        ) : null}

        <section id="proximo-passo" className={styles["chapter"]}>
          <div className={styles["ctaBlock"]}>
            <p className={styles["eyebrow"]}>Próximo passo</p>
            <h2>{study.cta.body}</h2>
            <a className={styles["cta"]} href="/#contact">
              {study.cta.label}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <footer className={styles["footer"]}>
          <div>
            <p className={styles["footerLabel"]}>Case metadata</p>
            <dl className={styles["metadata"]}>
              <div>
                <dt>Cliente</dt>
                <dd>{project.client}</dd>
              </div>
              <div>
                <dt>Serviço</dt>
                <dd>{serviceLabels[study.service]}</dd>
              </div>
              <div>
                <dt>Entrega</dt>
                <dd>{project.year}</dd>
              </div>
            </dl>
          </div>
          <nav className={styles["caseNavigation"]} aria-label="Navegação entre cases">
            {navigation.previous ? (
              <a href={`/services/${navigation.previous.slug}`}>
                <span>← Anterior</span>
                {navigation.previous.headline}
              </a>
            ) : (
              <a href="/#selected-work">
                <span>← Voltar</span>
                Todos os cases
              </a>
            )}
            {navigation.next ? (
              <a href={`/services/${navigation.next.slug}`}>
                <span>Próximo →</span>
                {navigation.next.headline}
              </a>
            ) : (
              <a href="/#contact">
                <span>Próximo →</span>
                Iniciar uma conversa
              </a>
            )}
          </nav>
        </footer>
      </article>
    </div>
  );
}
