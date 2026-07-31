"use client";

import type { MouseEvent } from "react";

import { useScroll } from "@/features/scroll/ScrollProvider";
import { useScrollSpy } from "@/features/scroll/use-scroll-spy";

import styles from "./ServicesArticle.module.css";

const chapters = [
  { id: "visao-geral", label: "Visão geral", nested: false },
  { id: "processo", label: "Como trabalhamos", nested: false },
  { id: "diagnostico", label: "Diagnóstico", nested: true },
  { id: "direcao", label: "Direção", nested: true },
  { id: "entrega", label: "Entrega", nested: true },
  { id: "sistema", label: "Sistema e acompanhamento", nested: false },
  { id: "continuidade", label: "Continuidade", nested: false },
] as const;

type ChapterId = (typeof chapters)[number]["id"];
const chapterIds: readonly ChapterId[] = chapters.map(({ id }) => id);
const INITIAL_CHAPTER_ID: ChapterId = "visao-geral";

type ServicePanelProps = {
  readonly index: string;
  readonly label: string;
  readonly title: string;
  readonly details: readonly string[];
};

function ServicePanel({ index, label, title, details }: ServicePanelProps) {
  return (
    <figure className={styles["figure"]}>
      <div className={styles["mediaSurface"]}>
        <div className={styles["mediaHeader"]}>
          <span>{index}</span>
          <span>{label}</span>
        </div>
        <p className={styles["mediaTitle"]}>{title}</p>
        <ul className={styles["mediaDetails"]}>
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function ServicesArticle() {
  const activeChapter = useScrollSpy({
    ids: chapterIds,
    initialId: INITIAL_CHAPTER_ID,
  });
  const { scrollToSelector } = useScroll();

  const scrollToChapter = (event: MouseEvent<HTMLAnchorElement>, chapterId: ChapterId) => {
    event.preventDefault();
    window.history.replaceState(null, "", `#${chapterId}`);
    scrollToSelector(`#${chapterId}`);
  };

  return (
    <div className={styles["page"]}>
      <aside className={styles["toc"]}>
        <nav data-service-toc="true" aria-label="Sumário do serviço">
          {chapters.map((chapter) => (
            <a
              key={chapter.id}
              className={chapter.nested ? styles["tocNested"] : undefined}
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
        <div className={styles["intro"]}>
          <p className={styles["eyebrow"]}>Serviços / Estrutura editorial</p>
          <h1>Estrutura de serviço</h1>
          <time dateTime="2026-07-14">Jul 14, 2026</time>
          <p className={styles["lead"]}>
            Texto de teste para apresentar o serviço, seu contexto e a transformação que será
            detalhada nesta página.
          </p>
        </div>

        <section id="visao-geral" className={styles["chapter"]}>
          <h2>
            <a href="#visao-geral">Visão geral</a>
          </h2>
          <p>
            Este bloco reserva espaço para explicar o cenário atual, os desafios prioritários e o
            recorte do trabalho a ser realizado.
          </p>
          <ServicePanel
            index="01"
            label="Contexto e objetivo"
            title="Uma leitura clara do ponto de partida"
            details={["Cenário", "Prioridades", "Critérios"]}
          />
          <p>
            O conteúdo final poderá combinar narrativa, evidências e decisões sem alterar a
            estrutura editorial da página.
          </p>
        </section>

        <section id="processo" className={styles["chapter"]}>
          <h2>
            <a href="#processo">Como trabalhamos</a>
          </h2>
          <div id="diagnostico" className={styles["subchapter"]}>
            <h3>Diagnóstico</h3>
            <p>
              Texto de teste para descrever pesquisa, alinhamento e definição do problema antes das
              decisões de projeto.
            </p>
            <ServicePanel
              index="02"
              label="Diagnóstico"
              title="Sinais organizados antes da ação"
              details={["Pesquisa", "Mapeamento", "Síntese"]}
            />
            <ul className={styles["list"]}>
              <li>Leitura do contexto e dos objetivos.</li>
              <li>Organização dos riscos e oportunidades.</li>
              <li>Definição dos critérios de sucesso.</li>
            </ul>
          </div>

          <div id="direcao" className={styles["subchapter"]}>
            <h3>Direção</h3>
            <ServicePanel
              index="03"
              label="Direção estratégica"
              title="Escolhas que orientam todo o sistema"
              details={["Posicionamento", "Experiência", "Tecnologia"]}
            />
          </div>

          <div id="entrega" className={styles["subchapter"]}>
            <h3>Entrega</h3>
            <ServicePanel
              index="04"
              label="Construção e entrega"
              title="Do plano ao produto em ciclos claros"
              details={["Protótipo", "Implementação", "Validação"]}
            />
          </div>
        </section>

        <section id="sistema" className={styles["chapter"]}>
          <h2>
            <a href="#sistema">Sistema e acompanhamento</a>
          </h2>
          <p>
            Este trecho poderá documentar componentes, rotinas e ferramentas usadas para manter
            consistência depois da primeira entrega.
          </p>
          <ServicePanel
            index="05"
            label="Sistema operacional"
            title="Uma base reutilizável para evoluir"
            details={["Padrões", "Documentação", "Governança"]}
          />
        </section>

        <section id="continuidade" className={styles["chapter"]}>
          <h2>
            <a href="#continuidade">Continuidade</a>
          </h2>
          <ServicePanel
            index="06"
            label="Próximos ciclos"
            title="Aprender, ajustar e avançar"
            details={["Medição", "Aprendizado", "Evolução"]}
          />
          <p>
            Texto final de teste para registrar resultados, aprendizados e os próximos passos do
            serviço.
          </p>
        </section>

        <footer className={styles["footer"]}>
          <div>
            <p className={styles["footerLabel"]}>Metadata</p>
            <dl className={styles["metadata"]}>
              <div>
                <dt>Atualização</dt>
                <dd>Jul 14, 2026</dd>
              </div>
              <div>
                <dt>Formato</dt>
                <dd>Editorial responsivo</dd>
              </div>
              <div>
                <dt>Conteúdo</dt>
                <dd>Texto demonstrativo</dd>
              </div>
            </dl>
          </div>
          <nav className={styles["footerLinks"]} aria-label="Links finais">
            <a href="/">Início</a>
            <a href="/#selected-work">Projetos</a>
            <a href="/#contact">Contato</a>
          </nav>
        </footer>
      </article>
    </div>
  );
}
