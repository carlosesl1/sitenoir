import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VideoCaseLayout } from "@/components/services/case-v2/VideoCaseLayout";
import { getCaseStudyV2 } from "@/data/case-studies-v2";
import { projects } from "@/data/projects";

afterEach(cleanup);

function renderCase(slug: "strong" | "together-motion" | "ecox-hostel-cabanas") {
  const project = projects.find((candidate) => candidate.slug === slug);
  const study = getCaseStudyV2(slug);
  if (!project || !study) throw new Error(`Missing video fixture: ${slug}`);
  return render(<VideoCaseLayout project={project} study={study} />);
}

describe("VideoCaseLayout", () => {
  it.each([
    ["strong", 3],
    ["together-motion", 1],
    ["ecox-hostel-cabanas", 2],
  ] as const)("renders %s with %i controllable films and production credit", (slug, count) => {
    const view = renderCase(slug);
    const videos = view.container.querySelectorAll("video");

    expect(videos).toHaveLength(count);
    for (const video of videos) {
      expect(video).toHaveAttribute("controls");
      expect(video).not.toHaveAttribute("autoplay");
    }
    expect(screen.getByRole("heading", { name: "Dolomon" })).toBeVisible();
    expect(screen.getByText("Design, motion design e edição de vídeo")).toBeVisible();
    const portrait = screen.getByRole("img", { name: "Retrato de Dolomon" });
    expect(decodeURIComponent(portrait.getAttribute("src") ?? "")).toContain(
      "/cases-v2/shared/dolomon.webp",
    );
  });
});
