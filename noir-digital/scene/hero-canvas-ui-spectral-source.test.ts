import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AdditiveBlending, Mesh, type Scene, type ShaderMaterial, type WebGLRenderer } from "three";
import { describe, expect, it, vi } from "vitest";

const configPath = join(process.cwd(), "scene/hero-canvas-ui-spectral-source-config.ts");
const shaderPath = join(process.cwd(), "scene/hero-canvas-ui-spectral-source-shaders.ts");
const sourcePath = join(process.cwd(), "scene/hero-canvas-ui-spectral-source.ts");
const configModulePath = "@/scene/" + "hero-canvas-ui-spectral-source-config";
const shaderModulePath = "@/scene/" + "hero-canvas-ui-spectral-source-shaders";
const sourceModulePath = "@/scene/" + "hero-canvas-ui-spectral-source";

describe("Canvas UI spectral source", () => {
  it("defines four bounded beams and responsive intensities", async () => {
    expect(existsSync(configPath)).toBe(true);
    if (!existsSync(configPath)) return;

    const { HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG, resolveHeroCanvasUiSpectralIntensity } =
      await import(configModulePath);

    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams).toHaveLength(4);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.desktopIntensity).toBe(0.52);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileIntensity).toBe(0.4);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileBreakpoint).toBe(768);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams).toMatchObject([
      { angle: -0.65, center: [0.24, 0.64], length: 0.15, width: 0.04 },
      { angle: 0.48, center: [0.44, 0.46], length: 0.18, width: 0.048 },
      { angle: -0.42, center: [0.63, 0.65], length: 0.13, width: 0.035 },
      { angle: 0.62, center: [0.78, 0.53], length: 0.14, width: 0.032 },
    ]);
    expect(resolveHeroCanvasUiSpectralIntensity(1440)).toBe(0.52);
    expect(resolveHeroCanvasUiSpectralIntensity(767)).toBe(0.4);

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

    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("dispersedSpectrum");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("spectralPalette");
    for (const color of [
      "vec3(0.823529, 0.188235, 0.070588)",
      "vec3(0.988235, 0.901961, 0.035294)",
      "vec3(0.129412, 0.827451, 0.266667)",
      "vec3(0.011765, 0.207843, 0.486275)",
    ]) {
      expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain(color);
    }
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("normalizeSpectrumColor");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain(
      "color / max(max(color.r, color.g), color.b)",
    );
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("(0.72 - transversePosition) / 1.44");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain(
      "(1.15 - transversePosition) / 2.3",
    );
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("float whiteCore");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("mix(paletteColor, vec3(1.0)");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("return paletteColor * 2.2");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("smoothstep(0.18, 0.72, transverse)");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("float red = exp");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("hsvToRgb");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("fract(value)");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("spectralBeam");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER.match(/spectralBeam\(/g)).toHaveLength(5);
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("uniform float uIntensity");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("0.15, 1.0, 0.0)");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("0.15, 1, 0)");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("uTime");
  });

  it("uses a transparent additive material that cannot write depth", async () => {
    expect(existsSync(sourcePath)).toBe(true);
    if (!existsSync(sourcePath)) return;

    const { createHeroCanvasUiSpectralMaterial } = await import(sourceModulePath);
    const material = createHeroCanvasUiSpectralMaterial() as ShaderMaterial;

    expect(material.transparent).toBe(true);
    expect(material.blending).toBe(AdditiveBlending);
    expect(material.depthTest).toBe(false);
    expect(material.depthWrite).toBe(false);
    expect(material.toneMapped).toBe(false);
    expect(material.uniforms["uIntensity"]?.value).toBe(0);

    material.dispose();
  });

  it("renders one fullscreen quad and disposes its resources once", async () => {
    expect(existsSync(sourcePath)).toBe(true);
    if (!existsSync(sourcePath)) return;

    const { createHeroCanvasUiSpectralSource } = await import(sourceModulePath);
    const source = createHeroCanvasUiSpectralSource();
    const render = vi.fn();
    const renderer = { render } as unknown as WebGLRenderer;

    source.render(renderer, 0.62);

    expect(render).toHaveBeenCalledTimes(1);
    const scene = render.mock.calls[0]?.[0] as Scene;
    const meshes = scene.children.filter((child): child is Mesh => child instanceof Mesh);
    expect(meshes).toHaveLength(1);
    const mesh = meshes[0];
    if (!mesh) throw new Error("Expected one spectral fullscreen mesh");
    const geometryDispose = vi.spyOn(mesh.geometry, "dispose");
    const material = (
      Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
    ) as ShaderMaterial;
    const materialDispose = vi.spyOn(material, "dispose");
    expect(material.uniforms["uIntensity"]?.value).toBe(0.62);

    source.dispose();
    source.dispose();

    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
  });

  it("activates the source only for Canvas UI and restores capture state", () => {
    const bufferSource = readFileSync(
      join(process.cwd(), "scene/HeroRefractionBuffer.tsx"),
      "utf8",
    );
    const siteCanvasSource = readFileSync(join(process.cwd(), "scene/SiteCanvas.tsx"), "utf8");

    expect(bufferSource).toContain("spectralSourceActive = false");
    expect(bufferSource).toContain("createHeroCanvasUiSpectralSource()");
    expect(bufferSource).toContain("resolveHeroCanvasUiSpectralIntensity(size.width)");
    expect(bufferSource).toContain("spectralSource.render(gl, spectralIntensity)");
    expect(bufferSource).toContain("try {");
    expect(bufferSource).toContain("finally {");
    expect(siteCanvasSource).toContain('spectralSourceActive={heroGlassVariant === "canvas-ui"}');
    expect(siteCanvasSource).toContain(
      "<HeroLensFlare active resolutionScale={qualityConfig.flareResolutionScale} />",
    );
    expect(siteCanvasSource).not.toContain('active={heroGlassVariant !== "canvas-ui"}');
  });
});
