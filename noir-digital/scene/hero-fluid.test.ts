import { describe, expect, it } from "vitest";

import {
  HERO_FLUID_CONFIG,
  shouldCompositeHeroEffects,
  shouldRenderFluidFrame,
  shouldRunFluidPush,
} from "@/scene/hero-fluid";

describe("hero fluid push", () => {
  it("runs for a recent desktop pointer while the scene is not solid", () => {
    expect(
      shouldRunFluidPush({
        compactViewport: false,
        idleMilliseconds: 599,
        pointerInside: true,
        reducedMotion: false,
        solid: false,
      }),
    ).toBe(true);
  });

  it("stops for stale, compact, reduced-motion and solid states", () => {
    expect(
      shouldRunFluidPush({
        compactViewport: false,
        idleMilliseconds: 600,
        pointerInside: true,
        reducedMotion: false,
        solid: false,
      }),
    ).toBe(false);
    expect(
      shouldRunFluidPush({
        compactViewport: true,
        idleMilliseconds: 0,
        pointerInside: true,
        reducedMotion: false,
        solid: false,
      }),
    ).toBe(false);
    expect(
      shouldRunFluidPush({
        compactViewport: false,
        idleMilliseconds: 0,
        pointerInside: true,
        reducedMotion: true,
        solid: false,
      }),
    ).toBe(false);
    expect(
      shouldRunFluidPush({
        compactViewport: false,
        idleMilliseconds: 0,
        pointerInside: true,
        reducedMotion: false,
        solid: true,
      }),
    ).toBe(false);
  });

  it("skips dormant fluid and post-processing frames", () => {
    expect(shouldRenderFluidFrame(false, 0)).toBe(false);
    expect(shouldRenderFluidFrame(false, 0.01)).toBe(true);
    expect(shouldRenderFluidFrame(true, 0)).toBe(true);
    expect(shouldCompositeHeroEffects(false, 0)).toBe(false);
    expect(shouldCompositeHeroEffects(true, 0)).toBe(true);
    expect(shouldCompositeHeroEffects(false, 0.01)).toBe(true);
  });

  it("preserves the original multipass fluid parameters", () => {
    expect(HERO_FLUID_CONFIG).toEqual({
      chromaticStrength: 0.002,
      curlStrength: 0,
      idleTimeout: 600,
      pressureIterations: 4,
      radius: 1.5,
      resolution: 160,
      strength: 0.3,
      velocityDissipation: 3,
      velocityScale: 1,
    });
  });
});
