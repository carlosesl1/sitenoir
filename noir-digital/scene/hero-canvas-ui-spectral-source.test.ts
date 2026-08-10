import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const configPath = join(process.cwd(), "scene/hero-canvas-ui-spectral-source-config.ts");
const shaderPath = join(process.cwd(), "scene/hero-canvas-ui-spectral-source-shaders.ts");
const configModulePath = "@/scene/" + "hero-canvas-ui-spectral-source-config";
const shaderModulePath = "@/scene/" + "hero-canvas-ui-spectral-source-shaders";

describe("Canvas UI spectral source", () => {
  it("defines four bounded beams and responsive intensities", async () => {
    expect(existsSync(configPath)).toBe(true);
    if (!existsSync(configPath)) return;

    const { HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG, resolveHeroCanvasUiSpectralIntensity } =
      await import(configModulePath);

    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams).toHaveLength(4);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.desktopIntensity).toBe(0.62);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileIntensity).toBe(0.48);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileBreakpoint).toBe(768);
    expect(resolveHeroCanvasUiSpectralIntensity(1440)).toBe(0.62);
    expect(resolveHeroCanvasUiSpectralIntensity(767)).toBe(0.48);

    for (const beam of HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams) {
      expect(beam.center[0]).toBeGreaterThanOrEqual(0);
      expect(beam.center[0]).toBeLessThanOrEqual(1);
      expect(beam.center[1]).toBeGreaterThanOrEqual(0);
      expect(beam.center[1]).toBeLessThanOrEqual(1);
      expect(beam.width).toBeGreaterThan(0);
      expect(beam.width).toBeLessThan(0.1);
      expect(beam.length).toBeGreaterThan(beam.width);
      expect(beam.strength).toBeGreaterThan(0);
      expect(beam.strength).toBeLessThanOrEqual(1);
    }
  });

  it("builds a stable spectral shader without autonomous animation", async () => {
    expect(existsSync(shaderPath)).toBe(true);
    if (!existsSync(shaderPath)) return;

    const { HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER } = await import(shaderModulePath);

    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("prismSpectrum");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("spectralBeam");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER.match(/spectralBeam\(/g)).toHaveLength(5);
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("uniform float uIntensity");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("uTime");
  });
});
