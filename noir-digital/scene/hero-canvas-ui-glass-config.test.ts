import { describe, expect, it } from "vitest";

import {
  HERO_CANVAS_UI_GLASS_CONFIG,
  HERO_CANVAS_UI_REFLECTOR_CONFIG,
  resolveHeroCanvasUiThickness,
} from "@/scene/hero-canvas-ui-glass-config";

describe("Canvas UI hero glass configuration", () => {
  it("keeps the glass neutral while bounding chromatic refraction", () => {
    expect(HERO_CANVAS_UI_GLASS_CONFIG).toMatchObject({
      anisotropicBlur: 0.03,
      backside: false,
      chromaticAberration: 0.07,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      environmentBlur: 0.02,
      environmentIntensity: 1.9,
      highlight: "#ffffff",
      ior: 1.58,
      roughness: 0.05,
      samples: 6,
      thickness: 4,
      transmission: 1,
    });
    expect(HERO_CANVAS_UI_REFLECTOR_CONFIG).toHaveLength(3);
    expect(HERO_CANVAS_UI_REFLECTOR_CONFIG.map((reflector) => reflector.intensity)).toEqual([
      78, 62.4, 90,
    ]);
    expect(
      HERO_CANVAS_UI_REFLECTOR_CONFIG.every((reflector) => reflector.color === "#ffffff"),
    ).toBe(true);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.chromaticAberration).toBeGreaterThanOrEqual(0.04);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.chromaticAberration).toBeLessThanOrEqual(0.07);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.ior).toBeGreaterThanOrEqual(1.5);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.ior).toBeLessThanOrEqual(1.65);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.roughness).toBeLessThanOrEqual(0.12);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.samples).toBeLessThanOrEqual(6);
    expect(HERO_CANVAS_UI_GLASS_CONFIG).not.toHaveProperty("dispersion");
  });

  it("keeps optical thickness stable after the parent scene scale", () => {
    expect(resolveHeroCanvasUiThickness(2)).toBe(2);
    expect(resolveHeroCanvasUiThickness(0.5)).toBe(8);
    expect(resolveHeroCanvasUiThickness(-2)).toBe(2);
    expect(resolveHeroCanvasUiThickness(0)).toBe(40_000);
  });
});
