import { stat } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { caseStudies, getCaseStudy, getCaseStudyNavigation } from "@/data/case-studies";
import { projects } from "@/data/projects";

describe("caseStudies", () => {
  it("publishes exactly one case for every project", () => {
    expect(caseStudies.map(({ slug }) => slug)).toEqual(projects.map(({ slug }) => slug));
    expect(new Set(caseStudies.map(({ slug }) => slug)).size).toBe(9);
  });

  it("exposes complete evidence media", () => {
    for (const study of caseStudies) {
      expect(study.summary.trim()).not.toBe("");
      expect(study.context.length).toBeGreaterThan(0);
      expect(study.deliveries.length).toBeGreaterThan(0);
      expect(study.benefits.length).toBeGreaterThan(0);
      expect(study.media.length).toBeGreaterThan(0);
      for (const media of study.media) {
        expect(media.alt.trim()).not.toBe("");
        expect(media.caption.trim()).not.toBe("");
        expect(media.width).toBeGreaterThan(0);
        expect(media.height).toBeGreaterThan(0);
      }
    }
  });

  it("credits DOLA on every video case and nowhere else", () => {
    for (const study of caseStudies) {
      if (study.service === "videos") {
        expect(study.credit).toEqual({
          name: "DOLA",
          role: "Design, motion design e edição de vídeo",
        });
      } else {
        expect(study.credit).toBeUndefined();
      }
    }
  });

  it("resolves adjacent case navigation in portfolio order", () => {
    expect(getCaseStudyNavigation("together-site")).toMatchObject({
      previous: undefined,
      next: { slug: "madeireira-fortaleza" },
    });
    expect(getCaseStudyNavigation("posto-ipiranga")).toMatchObject({
      previous: { slug: "contabil-sudoeste" },
      next: undefined,
    });
  });

  it("returns undefined for an unknown slug", () => {
    expect(getCaseStudy("unknown")).toBeUndefined();
  });

  it("ships every authored case asset as a non-empty public file", async () => {
    const paths = caseStudies.flatMap((study) =>
      study.media.flatMap((media) =>
        media.kind === "video" ? [media.src, media.poster] : [media.src],
      ),
    );

    for (const publicPath of paths) {
      const asset = await stat(path.join(process.cwd(), "public", publicPath.slice(1)));
      expect(asset.isFile()).toBe(true);
      expect(asset.size).toBeGreaterThan(0);
    }
  });
});
