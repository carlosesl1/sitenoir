import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const configPath = join(process.cwd(), "scene/hero-canvas-ui-rim-config.ts");
const shaderPath = join(process.cwd(), "scene/hero-canvas-ui-rim-shaders.ts");
const configModulePath = "@/scene/" + "hero-canvas-ui-rim-config";
const shaderModulePath = "@/scene/" + "hero-canvas-ui-rim-shaders";

describe("Canvas UI neutral glass rim", () => {
  it("keeps a narrow neutral core and a softer halo", async () => {
    expect(existsSync(configPath)).toBe(true);
    if (!existsSync(configPath)) return;

    const { HERO_CANVAS_UI_RIM_CONFIG } = await import(configModulePath);

    expect(HERO_CANVAS_UI_RIM_CONFIG.color).toBe("#ffffff");
    expect(HERO_CANVAS_UI_RIM_CONFIG.coreStart).toBeGreaterThan(
      HERO_CANVAS_UI_RIM_CONFIG.haloStart,
    );
    expect(HERO_CANVAS_UI_RIM_CONFIG.coreOpacity).toBeGreaterThanOrEqual(0.92);
    expect(HERO_CANVAS_UI_RIM_CONFIG.coreOpacity).toBeLessThanOrEqual(0.98);
    expect(HERO_CANVAS_UI_RIM_CONFIG.haloStart).toBeLessThanOrEqual(0.2);
    expect(HERO_CANVAS_UI_RIM_CONFIG.haloOpacity).toBeGreaterThanOrEqual(0.24);
    expect(HERO_CANVAS_UI_RIM_CONFIG.haloOpacity).toBeLessThanOrEqual(0.32);
  });

  it("keeps the neutral Fresnel rim without pointer-bound illumination", async () => {
    expect(existsSync(shaderPath)).toBe(true);
    if (!existsSync(shaderPath)) return;

    const { HERO_CANVAS_UI_RIM_FRAGMENT_SHADER, HERO_CANVAS_UI_RIM_VERTEX_SHADER } = await import(
      shaderModulePath
    );

    expect(HERO_CANVAS_UI_RIM_VERTEX_SHADER).toContain("vViewNormal");
    expect(HERO_CANVAS_UI_RIM_VERTEX_SHADER).toContain("vViewDirection");
    expect(HERO_CANVAS_UI_RIM_VERTEX_SHADER).not.toContain("vScreenUv");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).toContain("1.0 - abs(dot");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).toContain("float core = smoothstep");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).toContain("float halo = smoothstep");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).not.toContain("rightGlint");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).not.toContain("uPointerLight");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).not.toContain("pointerLight");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).not.toContain("spectralPalette");
    expect(HERO_CANVAS_UI_RIM_FRAGMENT_SHADER).not.toContain("uTime");
  });
});
