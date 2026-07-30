import { describe, expect, it } from "vitest";

import {
  computeHeroLightTarget,
  HERO_BACKGROUND_CONFIG,
  HERO_BACKGROUND_PASS_ORDER,
  pointerSnapshotToUv,
} from "@/scene/hero-effects";

describe("hero effects source contract", () => {
  it("preserves the copied site's background pass order and render budget", () => {
    // Given the source-replay contract
    // When the background configuration is read
    // Then its pass order and reduced resolution remain exact
    expect(HERO_BACKGROUND_PASS_ORDER).toEqual(["vignette", "swirl", "sine", "shatter", "bokeh"]);
    expect(HERO_BACKGROUND_CONFIG.resolutionScale).toBe(0.3);
    expect(HERO_BACKGROUND_CONFIG.smoothing).toBe(0.1);
    expect(HERO_BACKGROUND_CONFIG.leaveSmoothing).toBe(0.05);
    expect(HERO_BACKGROUND_CONFIG.dark.edgeIntensity).toBe(-0.06);
    expect(HERO_BACKGROUND_CONFIG.dark.outputMix).toBe(0.86);
    expect(HERO_BACKGROUND_CONFIG.light.edgeIntensity).toBe(-0.16);
    expect(HERO_BACKGROUND_CONFIG.light.outputMix).toBe(0.65);
    expect(HERO_BACKGROUND_CONFIG.sine.mixRadius).toBe(1);
    expect(HERO_BACKGROUND_CONFIG.shatter).toEqual({
      amount: 1,
      angle: -0.125,
      mixRadius: 1,
      mixRadiusInvert: 0,
      roundness: 0.02,
      skew: 0.9,
      spread: 0.9,
    });
  });

  it("maps the normalized pointer into bottom-left WebGL UV space", () => {
    // Given a pointer at the upper-right viewport corner
    // When it is converted to shader UV coordinates
    // Then the shader receives the same source coordinate convention
    expect(pointerSnapshotToUv({ normalizedX: 1, normalizedY: 1 })).toEqual({ x: 1, y: 1 });
    expect(pointerSnapshotToUv({ normalizedX: -1, normalizedY: -1 })).toEqual({ x: 0, y: 0 });
  });

  it("keeps the source light radius while rotating toward the pointer", () => {
    // Given the pointer at the center-right of the viewport
    // When the target light position is resolved
    // Then the source orbit radius is preserved
    const target = computeHeroLightTarget({ x: 1, y: 0.5 });
    expect(Math.hypot(target.x, target.y)).toBeCloseTo(Math.hypot(4, 9), 8);
    expect(target.x).toBeLessThan(0);
    expect(Math.abs(target.y)).toBeLessThan(0.000_001);
  });
});
