import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const assetPath = join(process.cwd(), "scene/ContactCanvasUiGlassAsset.tsx");
const modelPath = join(process.cwd(), "scene/ContactModel.tsx");

describe("Canvas UI contact glass", () => {
  it("uses the hero glass, rim, and flare source without changing contact motion", () => {
    const assetSource = readFileSync(assetPath, "utf8");
    const modelSource = readFileSync(modelPath, "utf8");

    expect(assetSource).toContain(
      'import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";',
    );
    expect(assetSource).toContain(
      'import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";',
    );
    expect(assetSource).toContain(
      'import { useSharedOpticalEnvironment } from "@/scene/use-shared-optical-environment";',
    );
    expect(assetSource).toContain("const { texture } = useHeroRefraction();");
    expect(assetSource).toContain("buffer={texture}");
    expect(assetSource).toContain('color="#ffffff"');
    expect(assetSource).toContain("transmission={glassConfig.transmission}");
    expect(assetSource).toContain("roughness={glassConfig.roughness}");
    expect(assetSource).toContain("anisotropicBlur={glassConfig.anisotropicBlur}");
    expect(assetSource).toContain("envMapIntensity={CONTACT_REFLECTION.environmentIntensity}");
    expect(assetSource).toContain("resolveHeroCanvasUiThickness(sceneScale)");
    expect(assetSource).toContain("resolveContactCanvasUiGeometryScale()");
    expect(assetSource).toContain("new Float32BufferAttribute(positions, 3)");
    expect(assetSource).toContain("reverseIndexedWinding");
    expect(assetSource).toContain("userData={{ contactRefractiveObject: true }}");
    expect(assetSource).toContain("ref={opticalSources?.contact ?? null}");
    expect(assetSource).not.toContain("CONTACT_FLARE_LAYER");
    expect(assetSource.match(/<MeshTransmissionMaterial\b/g)).toHaveLength(1);
    expect(assetSource.match(/<shaderMaterial\b/g)).toHaveLength(1);
    expect(assetSource).not.toContain("pointerStore");

    expect(modelSource).toContain(
      'import { ContactCanvasUiGlassAsset } from "@/scene/ContactCanvasUiGlassAsset";',
    );
    expect(modelSource).toContain("<ContactCanvasUiGlassAsset");
    expect(modelSource).toContain("sceneScale={layout.scale}");
    expect(modelSource).toContain("resolveContactCanvasUiAssetScale");
    expect(modelSource).not.toContain("ContactRefractiveAsset");
  });
});
