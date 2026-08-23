import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const componentPath = join(process.cwd(), "scene/HeroCanvasUiGlassAsset.tsx");
const configPath = join(process.cwd(), "scene/hero-canvas-ui-glass-config.ts");
const rejectedOverlayPaths = [
  "scene/hero-canvas-ui-spectrum-config.ts",
  "scene/hero-canvas-ui-spectrum-shaders.ts",
  "scene/hero-canvas-ui-spectrum-material.ts",
  "scene/hero-canvas-ui-spectrum-layers.ts",
  "scene/hero-canvas-ui-spectrum.test.ts",
];

describe("Canvas UI hero glass integration", () => {
  it("uses the existing scene refraction for neutral edge reflections", () => {
    const source = readFileSync(componentPath, "utf8");
    const configSource = readFileSync(configPath, "utf8");

    expect(source).toContain(
      'import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";',
    );
    expect(source).toContain(
      'import { createHeroCanvasUiEnvironment } from "@/scene/hero-canvas-ui-environment";',
    );
    expect(source).toContain('import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";');
    expect(source).toContain("const { texture } = useHeroRefraction();");
    expect(source).not.toContain("createHeroCanvasUiNeutralBuffer");
    expect(source).not.toContain(
      'import { pointerStore } from "@/features/pointer/pointer-store";',
    );
    expect(source).toContain("createHeroCanvasUiEnvironment(gl)");
    expect(source).toContain("resolveHeroCanvasUiSamples(width)");
    expect(source).toContain("buffer={texture}");
    expect(source).not.toContain("createPhysicalPrismSpectrumBuffer");
    expect(source.match(/<mesh\b/g)).toHaveLength(3);
    expect(source.match(/geometry=\{geometry\}/g)).toHaveLength(3);
    expect(source.match(/<meshBasicMaterial\b/g) ?? []).toHaveLength(0);
    expect(source.match(/<MeshTransmissionMaterial\b/g)).toHaveLength(1);
    expect(source.match(/<shaderMaterial\b/g)).toHaveLength(2);
    expect(source).toContain("HERO_CANVAS_UI_RIM_CONFIG as rimConfig");
    expect(source).toContain("HERO_CANVAS_UI_RIM_FRAGMENT_SHADER");
    expect(source).toContain("HERO_CANVAS_UI_RIM_VERTEX_SHADER");
    expect(source).toContain("HERO_CANVAS_UI_EDGE_FLARE_LAYER");
    expect(source).toContain("HERO_CANVAS_UI_EDGE_FLARE_FRAGMENT_SHADER");
    expect(source).not.toContain("uPointerLight");
    expect(source).toContain("renderOrder={1}");
    const transmissionMaterial = source.match(/<MeshTransmissionMaterial[\s\S]*?\/>/)?.[0] ?? "";
    expect(transmissionMaterial).toContain("depthWrite");
    expect(transmissionMaterial).toContain("transparent");
    expect(source).toContain("depthWrite={false}");
    expect(source).toContain("renderOrder={2}");
    expect(source).toContain("renderOrder={3}");
    expect(source).toContain("toneMapped={false}");
    expect(source).toContain("polygonOffset");
    expect(source).not.toContain("EdgesGeometry");
    expect(source).not.toContain("createHeroCanvasUiSpectrum");
    expect(source).not.toContain("PhysicalPrismReflectionAtlas");
    expect(source).not.toContain("iridescenceThicknessRange");
    expect(source).not.toContain("new RoomEnvironment");
    expect(configSource).not.toContain("dispersion:");
  });

  it("keeps the retired caustic source out of the production capture buffer", () => {
    const bufferSource = readFileSync(
      join(process.cwd(), "scene/HeroRefractionBuffer.tsx"),
      "utf8",
    );

    expect(bufferSource).not.toContain("PrismaticCaustics");
    expect(bufferSource).not.toContain("prismaticCaustics");
  });

  it("keeps the previous live caustics out of the Canvas UI route", () => {
    const siteCanvasSource = readFileSync(join(process.cwd(), "scene/SiteCanvas.tsx"), "utf8");

    expect(siteCanvasSource).not.toContain("prismaticCaustics");
  });

  it("keeps the lower cursor out of the post-process flare extraction", () => {
    const principlePointerSource = readFileSync(
      join(process.cwd(), "scene/PrinciplePointerModel.tsx"),
      "utf8",
    );
    const heroPointerSource = readFileSync(
      join(process.cwd(), "scene/HeroCanvasUiPointerAsset.tsx"),
      "utf8",
    );
    const flareSource = readFileSync(join(process.cwd(), "scene/HeroLensFlare.tsx"), "utf8");
    const flareShaderSource = readFileSync(
      join(process.cwd(), "scene/hero-lens-flare-shaders.ts"),
      "utf8",
    );

    expect(principlePointerSource).toContain("HERO_CANVAS_UI_CURSOR_NO_FLARE_LAYER");
    expect(heroPointerSource).not.toContain("HERO_CANVAS_UI_CURSOR_NO_FLARE_LAYER");
    expect(flareSource).toContain("cursorNoFlareSourceTarget");
    expect(flareSource).toContain("camera.layers.set(HERO_CANVAS_UI_CURSOR_NO_FLARE_LAYER)");
    expect(flareShaderSource).toContain("uniform sampler2D tNoFlareMask");
    expect(flareShaderSource).toContain("if (noFlareMask > 0.001) return vec3(0.0)");
  });

  it("declares the compatible Drei version as a runtime dependency", () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

    expect(packageJson.dependencies["@react-three/drei"]).toBe("10.7.8");
  });

  it("removes every rejected additive-spectrum module", () => {
    for (const relativePath of rejectedOverlayPaths) {
      expect(existsSync(join(process.cwd(), relativePath)), relativePath).toBe(false);
    }
  });
});
