import { describe, expect, it } from "vitest";

import {
  resolvePrincipleProgress,
  resolvePrincipleStage,
  resolvePrincipleViewportProgress,
} from "@/components/principles/principles-progress";

describe("resolvePrincipleStage", () => {
  it.each([
    [0, "positioning"],
    [0.26, "design"],
    [0.51, "principles"],
    [0.76, "technology"],
    [1, "technology"],
  ] as const)("maps %s to %s", (progress, stage) => {
    expect(resolvePrincipleStage(progress)).toBe(stage);
  });

  it("clamps progress outside the normalized range", () => {
    expect(resolvePrincipleStage(-1)).toBe("positioning");
    expect(resolvePrincipleStage(2)).toBe("technology");
  });
});

describe("resolvePrincipleViewportProgress", () => {
  it("uses the four scrollable intervals inside a five-viewport story", () => {
    expect(resolvePrincipleViewportProgress({ sectionTop: 200, viewportHeight: 1000 })).toBe(0);
    expect(resolvePrincipleViewportProgress({ sectionTop: -1000, viewportHeight: 1000 })).toBe(
      0.25,
    );
    expect(resolvePrincipleViewportProgress({ sectionTop: -2000, viewportHeight: 1000 })).toBe(0.5);
    expect(resolvePrincipleViewportProgress({ sectionTop: -4000, viewportHeight: 1000 })).toBe(1);
  });

  it("clamps progress before entry and after the closing frame", () => {
    expect(resolvePrincipleViewportProgress({ sectionTop: 1500, viewportHeight: 1000 })).toBe(0);
    expect(resolvePrincipleViewportProgress({ sectionTop: -6000, viewportHeight: 1000 })).toBe(1);
  });
});

describe("resolvePrincipleProgress", () => {
  it("returns deterministic local progress for each quarter", () => {
    expect(resolvePrincipleProgress(0.125)).toEqual({
      stage: "positioning",
      localProgress: 0.5,
    });
    expect(resolvePrincipleProgress(0.625)).toEqual({
      stage: "principles",
      localProgress: 0.5,
    });
    expect(resolvePrincipleProgress(1)).toEqual({
      stage: "technology",
      localProgress: 1,
    });
  });
});
