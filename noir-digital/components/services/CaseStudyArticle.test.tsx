import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CaseStudyArticle } from "@/components/services/CaseStudyArticle";
import { getCaseStudy, getCaseStudyNavigation } from "@/data/case-studies";
import { projects } from "@/data/projects";

const scrollMocks = vi.hoisted(() => ({
  activeId: "visao-geral",
  scrollToSelector: vi.fn(),
}));

vi.mock("@/features/scroll/ScrollProvider", () => ({
  useScroll: () => ({ scrollToSelector: scrollMocks.scrollToSelector }),
}));

vi.mock("@/features/scroll/use-scroll-spy", () => ({
  useScrollSpy: () => scrollMocks.activeId,
}));

afterEach(() => {
  cleanup();
  scrollMocks.activeId = "visao-geral";
  scrollMocks.scrollToSelector.mockClear();
  window.history.replaceState(null, "", "/");
});

function getFixture(slug: (typeof projects)[number]["slug"]) {
  const project = projects.find((candidate) => candidate.slug === slug);
  const study = getCaseStudy(slug);
  if (!project || !study) throw new Error(`Missing case fixture: ${slug}`);
  return { project, study };
}

describe("CaseStudyArticle", () => {
  it("renders the approved editorial chapters and scrolls through the summary", () => {
    const { project, study } = getFixture("together-site");

    render(
      <CaseStudyArticle
        project={project}
        study={study}
        navigation={getCaseStudyNavigation(study.slug)}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: study.headline })).toBeVisible();
    const summary = screen.getByRole("navigation", { name: "Sumário do case" });
    expect(
      within(summary)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual([
      "Visão geral",
      "O que foi feito",
      "Evidências",
      "Valor para a empresa",
      "Próximo passo",
    ]);

    fireEvent.click(within(summary).getByRole("link", { name: "Evidências" }));
    expect(scrollMocks.scrollToSelector).toHaveBeenCalledWith("#evidencias");
    expect(window.location.hash).toBe("#evidencias");
  });

  it("renders images with authored alternatives and no video credit for site cases", () => {
    const { project, study } = getFixture("together-site");

    render(
      <CaseStudyArticle
        project={project}
        study={study}
        navigation={getCaseStudyNavigation(study.slug)}
      />,
    );

    for (const media of study.media) {
      if (media.kind === "image") {
        expect(screen.getByRole("img", { name: media.alt })).toBeInTheDocument();
      }
    }
    expect(screen.queryByRole("heading", { name: "DOLA" })).not.toBeInTheDocument();
  });

  it("renders three controllable videos and DOLA credit for Strong", () => {
    const { project, study } = getFixture("strong");
    const view = render(
      <CaseStudyArticle
        project={project}
        study={study}
        navigation={getCaseStudyNavigation(study.slug)}
      />,
    );

    const videos = view.container.querySelectorAll("video");
    expect(videos).toHaveLength(3);
    for (const video of videos) {
      expect(video).toHaveAttribute("controls");
      expect(video).toHaveAttribute("playsinline");
      expect(video).toHaveAttribute("preload", "metadata");
      expect(video).not.toHaveAttribute("autoplay");
    }
    expect(screen.getByRole("heading", { name: "DOLA" })).toBeVisible();
    expect(screen.getByText("Design, motion design e edição de vídeo")).toBeVisible();
  });

  it("does not attribute Chapada Backpackers reviews to the service", () => {
    const { project, study } = getFixture("chapada-backpackers");

    render(
      <CaseStudyArticle
        project={project}
        study={study}
        navigation={getCaseStudyNavigation(study.slug)}
      />,
    );

    expect(document.body.textContent).not.toMatch(/criamos? (as )?avaliações/i);
    expect(document.body.textContent).not.toMatch(/geramos? (as )?avaliações/i);
    expect(screen.getByRole("link", { name: study.cta.label })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });
});
