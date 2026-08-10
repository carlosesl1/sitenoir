import { existsSync } from "node:fs";
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
});
