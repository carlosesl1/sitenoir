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
  it("defines ten varied bounded fragments and responsive intensities", async () => {
    expect(existsSync(configPath)).toBe(true);
    if (!existsSync(configPath)) return;

    const {
      HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE,
      HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG,
      resolveHeroCanvasUiSpectralIntensity,
    } = await import(configModulePath);

    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.desktopIntensity).toBe(0.52);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileIntensity).toBe(0.4);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileBreakpoint).toBe(768);
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE).toBe(0.58);
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG).not.toHaveProperty("beams");
    expect(HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments).toHaveLength(10);
    expect(
      new Set(
        HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments.map(
          ({ kind }: { readonly kind: string }) => kind,
        ),
      ),
    ).toEqual(new Set(["lens", "wedge", "glint"]));

    const colorWindows = new Set(
      HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments.map(
        ({ colorEnd, colorStart }: { readonly colorEnd: number; readonly colorStart: number }) =>
          `${colorStart}:${colorEnd}`,
      ),
    );
    expect(colorWindows.size).toBeGreaterThanOrEqual(3);
    expect(resolveHeroCanvasUiSpectralIntensity(1440)).toBe(0.52);
    expect(resolveHeroCanvasUiSpectralIntensity(767)).toBe(0.4);

    const fragmentCenters = HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments.map(
      ({ center }: { readonly center: readonly [number, number] }) => center,
    );
    expect(fragmentCenters).toEqual([
      [0.205, 0.61],
      [0.275, 0.725],
      [0.345, 0.56],
      [0.395, 0.54],
      [0.505, 0.72],
      [0.54, 0.52],
      [0.585, 0.715],
      [0.595, 0.565],
      [0.655, 0.59],
      [0.745, 0.635],
    ]);

    for (const fragment of HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments) {
      expect(fragment.center[0]).toBeGreaterThanOrEqual(0.19);
      expect(fragment.center[0]).toBeLessThanOrEqual(0.78);
      expect(fragment.center[1]).toBeGreaterThanOrEqual(0.48);
      expect(fragment.center[1]).toBeLessThanOrEqual(0.74);
      expect(fragment.size[0]).toBeGreaterThan(0);
      expect(fragment.size[0]).toBeLessThanOrEqual(0.078);
      expect(fragment.size[1]).toBeGreaterThan(0);
      expect(fragment.size[1]).toBeLessThanOrEqual(0.035);
      expect(fragment.strength).toBeGreaterThan(0);
      expect(fragment.strength).toBeLessThanOrEqual(1);
      expect(fragment.softness).toBeGreaterThanOrEqual(0.55);
      expect(fragment.softness).toBeLessThanOrEqual(0.9);
      expect(Math.abs(fragment.skew)).toBeLessThanOrEqual(0.25);
      expect(fragment.colorStart).toBeGreaterThanOrEqual(0);
      expect(fragment.colorEnd).toBeLessThanOrEqual(1);
      expect(fragment.colorEnd).toBeGreaterThan(fragment.colorStart);
    }
  });

  it("builds a stable spectral shader without autonomous animation", async () => {
    expect(existsSync(shaderPath)).toBe(true);
    if (!existsSync(shaderPath)) return;

    const { HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER } = await import(shaderModulePath);

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
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("spectralFragment");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER.match(/spectralFragment\(/g)).toHaveLength(11);
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("lensMask");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("wedgeMask");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("glintMask");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("colorStart");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("colorEnd");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("spectralBeam");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("streakWidth");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("asymmetricEnvelope");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("float red = exp");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("hsvToRgb");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("fract(value)");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain("uniform float uIntensity");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).toContain(
      "vec2(0.205, 0.61), vec2(0.066, 0.032), 0.58, 0.0, 0.82, 0.74, 0.1, 0.0, 0.0, 1.0)",
    );
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("whiteCore");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("uTime");
    expect(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER).not.toContain("uPointer");
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
