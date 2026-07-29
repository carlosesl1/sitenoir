import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { GoogleCaseLayout } from "@/components/services/case-v2/GoogleCaseLayout";
import { getCaseStudyV2 } from "@/data/case-studies-v2";
import { projects } from "@/data/projects";

afterEach(cleanup);

describe("GoogleCaseLayout", () => {
  it("renders the documentary search journey with real evidence", () => {
    const project = projects.find(({ slug }) => slug === "chapada-backpackers");
    const study = getCaseStudyV2("chapada-backpackers");
    if (!project || !study) throw new Error("Missing Chapada fixture");

    render(<GoogleCaseLayout project={project} study={study} />);

    expect(screen.getByRole("heading", { name: "Buscar" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Encontrar" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Verificar" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Decidir" })).toBeVisible();
    expect(screen.getAllByRole("figure")).toHaveLength(3);
    expect(document.body.textContent).not.toMatch(/geramos? as avaliações/i);
  });
});
