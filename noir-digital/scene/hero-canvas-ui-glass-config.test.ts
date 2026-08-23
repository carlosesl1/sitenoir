import { describe, expect, it } from "vitest";

import {
  HERO_CANVAS_UI_GLASS_CONFIG,
  HERO_CANVAS_UI_REFLECTOR_CONFIG,
  resolveHeroCanvasUiSamples,
  resolveHeroCanvasUiThickness,
} from "@/scene/hero-canvas-ui-glass-config";

describe("Canvas UI hero glass configuration", () => {
  it("keeps the physical glass neutral while preserving a bright rim", () => {
    expect(HERO_CANVAS_UI_GLASS_CONFIG).toMatchObject({
      anisotropicBlur: 0.02,
      backside: false,
      chromaticAberration: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.035,
      environmentBlur: 0.18,
      environmentIntensity: 0.42,
      highlight: "#ffffff",
      ior: 1.58,
      roughness: 0.075,
      samples: 3,
      thickness: 3.6,
      transmission: 1,
    });
    expect(HERO_CANVAS_UI_REFLECTOR_CONFIG).toHaveLength(3);
    expect(HERO_CANVAS_UI_REFLECTOR_CONFIG.map((reflector) => reflector.intensity)).toEqual([
      78, 62.4, 90,
    ]);
    expect(
      HERO_CANVAS_UI_REFLECTOR_CONFIG.every((reflector) => reflector.color === "#ffffff"),
    ).toBe(true);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.chromaticAberration).toBe(0);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.environmentBlur).toBeGreaterThanOrEqual(0.14);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.environmentBlur).toBeLessThanOrEqual(0.22);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.environmentIntensity).toBeLessThanOrEqual(0.8);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.ior).toBeGreaterThanOrEqual(1.5);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.ior).toBeLessThanOrEqual(1.65);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.roughness).toBeLessThanOrEqual(0.12);
    expect(HERO_CANVAS_UI_GLASS_CONFIG.samples).toBeLessThanOrEqual(3);
    expect(HERO_CANVAS_UI_GLASS_CONFIG).not.toHaveProperty("dispersion");
    expect(HERO_CANVAS_UI_GLASS_CONFIG).not.toHaveProperty("iridescence");
  });

  it("keeps optical thickness stable after the parent scene scale", () => {
    expect(resolveHeroCanvasUiThickness(2)).toBe(1.8);
    expect(resolveHeroCanvasUiThickness(0.5)).toBe(7.2);
    expect(resolveHeroCanvasUiThickness(-2)).toBe(1.8);
    expect(resolveHeroCanvasUiThickness(0)).toBe(36_000);
  });

  it("reduces transmission samples on narrower viewports", () => {
    expect(resolveHeroCanvasUiSamples(1440)).toBe(3);
    expect(resolveHeroCanvasUiSamples(1024)).toBe(3);
    expect(resolveHeroCanvasUiSamples(1023)).toBe(3);
    expect(resolveHeroCanvasUiSamples(768)).toBe(3);
    expect(resolveHeroCanvasUiSamples(767)).toBe(2);
    expect(resolveHeroCanvasUiSamples(390)).toBe(2);
  });
});
