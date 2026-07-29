import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SiteCaseLayout } from "@/components/services/case-v2/SiteCaseLayout";
import { getCaseStudyV2 } from "@/data/case-studies-v2";
import { projects } from "@/data/projects";

afterEach(cleanup);

describe("SiteCaseLayout", () => {
  it("renders a site hero, concise story, and native-ratio evidence", () => {
    const project = projects.find(({ slug }) => slug === "together-site");
    const study = getCaseStudyV2("together-site");
    if (!project || !study) throw new Error("Missing Together fixture");

    render(<SiteCaseLayout project={project} study={study} />);

    expect(screen.getByRole("heading", { level: 1, name: study.headline })).toBeVisible();
    expect(screen.getByTestId("site-case-hero")).toBeVisible();
    expect(screen.getAllByRole("figure")).toHaveLength(3);
    expect(screen.queryByText("Valor para a empresa")).not.toBeInTheDocument();
  });
});
