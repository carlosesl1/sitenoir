import { describe, expect, it } from "vitest";

import { easeEntryReveal, getEntryMaskAlpha } from "@/components/preloader/entry-reveal-mask";

describe("entry reveal mask", () => {
  it("starts fully closed and ends open across the viewport", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 720, y: 450 },
      { x: 1440, y: 900 },
    ];

    for (const point of points) {
      expect(getEntryMaskAlpha({ ...point, width: 1440, height: 900, progress: 1 })).toBeCloseTo(
        1,
        5,
      );
      expect(getEntryMaskAlpha({ ...point, width: 1440, height: 900, progress: 0 })).toBeCloseTo(
        0,
        5,
      );
    }
  });

  it("opens from the center while preserving the dotted outer edge", () => {
    const center = getEntryMaskAlpha({
      x: 720,
      y: 450,
      width: 1440,
      height: 900,
      progress: 0.7,
    });
    const edge = getEntryMaskAlpha({
      x: 80,
      y: 80,
      width: 1440,
      height: 900,
      progress: 0.7,
    });

    expect(center).toBeLessThan(0.01);
    expect(edge).toBeGreaterThan(center);
  });

  it("uses the same reveal easing as the copied site", () => {
    expect(easeEntryReveal(0)).toBe(0);
    expect(easeEntryReveal(1)).toBe(1);
    expect(easeEntryReveal(0.5)).toBeGreaterThan(0.5);
  });
});
