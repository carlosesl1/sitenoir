import { describe, expect, it } from "vitest";

import {
  MISSION_STORY_VIEWPORTS,
  resolveMissionProgress,
  resolveMissionViewportProgress,
} from "@/components/mission/mission-progress";

describe("mission scroll progress", () => {
  it("starts when the section enters from below and ends after the pinned travel", () => {
    const viewportHeight = 800;
    expect(resolveMissionViewportProgress({ sectionTop: 900, viewportHeight })).toBe(0);
    expect(resolveMissionViewportProgress({ sectionTop: viewportHeight, viewportHeight })).toBe(0);
    expect(resolveMissionViewportProgress({ sectionTop: 0, viewportHeight })).toBeCloseTo(
      1 / MISSION_STORY_VIEWPORTS,
    );
    expect(
      resolveMissionViewportProgress({
        sectionTop: -(MISSION_STORY_VIEWPORTS - 1) * viewportHeight,
        viewportHeight,
      }),
    ).toBe(1);
  });

  it("slides the statement in from the right, then shifts to the detail panel", () => {
    expect(resolveMissionProgress(0).trackX).toBe(1);
    expect(resolveMissionProgress(0.25).trackX).toBe(0);
    expect(resolveMissionProgress(0.45).trackX).toBe(0);
    expect(resolveMissionProgress(0.6).trackX).toBe(-1);
    expect(resolveMissionProgress(1).trackX).toBe(-1);
  });

  it("fills the statement before the detail and finishes both", () => {
    const early = resolveMissionProgress(0.3);
    expect(early.fillStatement).toBeGreaterThan(0);
    expect(early.fillStatement).toBeLessThan(1);
    expect(early.fillDetail).toBe(0);

    expect(resolveMissionProgress(0.5).fillStatement).toBe(1);
    expect(resolveMissionProgress(1)).toEqual({ trackX: -1, fillStatement: 1, fillDetail: 1 });
  });
});
