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
  it("uses one transmission material with the existing refraction buffer", () => {
    const source = readFileSync(componentPath, "utf8");
    const configSource = readFileSync(configPath, "utf8");

    expect(source).toContain(
      'import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";',
    );
    expect(source).toContain('import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";');
    expect(source).toContain(
      'import { createHeroCanvasUiEnvironment } from "@/scene/hero-canvas-ui-environment";',
    );
    expect(source).toContain("const { texture } = useHeroRefraction();");
    expect(source).toContain("createHeroCanvasUiEnvironment(gl)");
    expect(source).toContain("buffer={texture}");
    expect(source.match(/<mesh\b/g)).toHaveLength(2);
    expect(source.match(/geometry=\{geometry\}/g)).toHaveLength(2);
    expect(source.match(/<MeshTransmissionMaterial\b/g)).toHaveLength(1);
    expect(source.match(/<shaderMaterial\b/g)).toHaveLength(1);
    expect(source).toContain("HERO_CANVAS_UI_RIM_CONFIG as rimConfig");
    expect(source).toContain("HERO_CANVAS_UI_RIM_FRAGMENT_SHADER");
    expect(source).toContain("HERO_CANVAS_UI_RIM_VERTEX_SHADER");
    expect(source).toContain("depthWrite={false}");
    expect(source).toContain("toneMapped={false}");
    expect(source).toContain("polygonOffset");
    expect(source).not.toContain("EdgesGeometry");
    expect(source).not.toContain("createHeroCanvasUiSpectrum");
    expect(source).not.toContain("new RoomEnvironment");
    expect(configSource).not.toContain("dispersion:");
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
