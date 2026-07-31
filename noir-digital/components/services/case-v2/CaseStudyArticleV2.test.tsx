import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CaseMediaV2 } from "@/components/services/case-v2/CaseMediaV2";
import { CaseStudyArticleV2 } from "@/components/services/case-v2/CaseStudyArticleV2";
import {
  type EvidenceSection,
  getCaseStudyV2,
  getCaseStudyV2Navigation,
} from "@/data/case-studies-v2";
import { projects } from "@/data/projects";

afterEach(cleanup);

function getFixture(slug: (typeof projects)[number]["slug"]) {
  const project = projects.find((candidate) => candidate.slug === slug);
  const study = getCaseStudyV2(slug);
  if (!project || !study) throw new Error(`Missing V2 case fixture: ${slug}`);
  return { project, study };
}

describe("CaseStudyArticleV2", () => {
  it("preserves authored image dimensions and fit", () => {
    const { study } = getFixture("together-site");
    const evidence = study.sections.find(
      (section): section is EvidenceSection => section.type === "evidence",
    );
    const media = evidence?.media[0];
    if (media?.kind !== "image") throw new Error("Missing image fixture");

    const { container } = render(<CaseMediaV2 media={media} />);

    expect(screen.getByRole("img", { name: media.alt })).toHaveAttribute(
      "width",
      String(media.width),
    );
    expect(screen.getByRole("img", { name: media.alt })).toHaveAttribute(
      "height",
      String(media.height),
    );
    expect(container.querySelector("[data-fit='contain']")).toBeInTheDocument();
  });

  it("renders controllable video without autoplay", () => {
    const { study } = getFixture("together-motion");
    const evidence = study.sections.find(
      (section): section is EvidenceSection => section.type === "evidence",
    );
    const media = evidence?.media[0];
    if (media?.kind !== "video") throw new Error("Missing video fixture");

    const { container } = render(<CaseMediaV2 media={media} />);
    const video = container.querySelector("video");

    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "metadata");
    expect(video).not.toHaveAttribute("autoplay");
  });

  it("dispatches the category layout and renders closing navigation", () => {
    const { project, study } = getFixture("together-site");
    const { container } = render(
      <CaseStudyArticleV2
        project={project}
        study={study}
        navigation={getCaseStudyV2Navigation(study.slug)}
      />,
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container.firstElementChild).toHaveAttribute("data-case-layout", "site");
    expect(screen.getByTestId("site-case-hero")).toBeVisible();
    const contactAction = screen.getByRole("link", { name: /Planejar meu site/i });
    expect(contactAction).toHaveAttribute("href", "/#contact");
    expect(contactAction).toHaveAttribute("data-spectrum-contact-cta", "true");
    expect(screen.getByRole("navigation", { name: "Navegação entre cases" })).toBeVisible();
  });
});
