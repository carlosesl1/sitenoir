import { describe, expect, it } from "vitest";

import { caseStudiesV2, getCaseStudyV2 } from "@/data/case-studies-v2";
import { projects } from "@/data/projects";

describe("caseStudiesV2", () => {
  it("defines exactly one V2 case for every project", () => {
    expect(caseStudiesV2.map(({ slug }) => slug)).toEqual(projects.map(({ slug }) => slug));
  });

  it("uses one of the three approved category layouts", () => {
    expect(new Set(caseStudiesV2.map(({ categoryLayout }) => categoryLayout))).toEqual(
      new Set(["site", "video", "google"]),
    );
  });

  it("keeps every case concise and evidence-led", () => {
    for (const study of caseStudiesV2) {
      expect(study.sections.length).toBeGreaterThanOrEqual(3);
      expect(study.sections.length).toBeLessThanOrEqual(5);
      expect(study.sections.some(({ type }) => type === "evidence")).toBe(true);
      expect(study.hero.src).toMatch(/^\/cases-v2\/.+\.webp$/);
      expect(study.hero.width).toBeGreaterThan(0);
      expect(study.hero.height).toBeGreaterThan(0);
    }
  });

  it("credits DOLA only on video cases", () => {
    const contributions = {
      strong:
        "Na campanha Strong, uniu direção visual, motion e edição para dar identidade própria a cada produto e manter unidade entre as três peças.",
      "together-motion":
        "No projeto da Together, combinou design, motion e edição para transformar um processo técnico em uma narrativa visual clara e fácil de acompanhar.",
      "ecox-hostel-cabanas":
        "Nos vídeos da ECOX, combinou design, motion e edição para apresentar espaços, detalhes e atmosfera com uma linguagem envolvente e coerente com a hospedagem.",
    } as const;

    for (const study of caseStudiesV2) {
      expect(Boolean(study.credit)).toBe(study.categoryLayout === "video");
      if (study.credit) {
        expect(study.credit.role).toBe(
          "Designer multidisciplinar com 7 anos de experiência em design gráfico, motion design, edição de vídeo e 3D.",
        );
        expect(study.credit.contribution).toBe(
          contributions[study.slug as keyof typeof contributions],
        );
        expect(study.credit.portrait).toEqual({
          src: "/cases-v2/shared/dolomon.webp",
          alt: "Retrato de DOLA",
          width: 960,
          height: 960,
        });
      }
    }
  });

  it("does not claim that SEO created visible reviews", () => {
    const googleCopy = caseStudiesV2
      .filter(({ categoryLayout }) => categoryLayout === "google")
      .flatMap(({ sections }) => sections)
      .map((section) => JSON.stringify(section))
      .join(" ");

    expect(googleCopy).not.toMatch(/(criamos|geramos|aumentamos) as avaliações/i);
  });

  it("returns undefined for unknown slugs", () => {
    expect(getCaseStudyV2("unknown")).toBeUndefined();
  });
});
