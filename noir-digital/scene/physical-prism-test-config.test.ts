import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PHYSICAL_PRISM_TEST_CONFIG,
  resolvePhysicalPrismSceneScale,
} from "@/scene/physical-prism-test-config";

describe("physical prism prototype configuration", () => {
  it("uses a bounded dark physical-glass base", () => {
    expect(PHYSICAL_PRISM_TEST_CONFIG.backgroundColor).toBe("#000000");
    expect(PHYSICAL_PRISM_TEST_CONFIG.glassColor).toBe("#0a0c10");
    expect(PHYSICAL_PRISM_TEST_CONFIG.ior).toBeGreaterThanOrEqual(1.5);
    expect(PHYSICAL_PRISM_TEST_CONFIG.ior).toBeLessThanOrEqual(1.65);
    expect(PHYSICAL_PRISM_TEST_CONFIG.roughness).toBeLessThanOrEqual(0.1);
    expect(PHYSICAL_PRISM_TEST_CONFIG.transmission).toBeGreaterThanOrEqual(0.7);
    expect(PHYSICAL_PRISM_TEST_CONFIG.transmission).toBeLessThanOrEqual(0.9);
  });

  it("uses responsive scene framing", () => {
    expect(resolvePhysicalPrismSceneScale(1440)).toBe(8.8);
    expect(resolvePhysicalPrismSceneScale(767)).toBe(3.4);
  });

  it("describes only the base, reflection atlas and rim layers", () => {
    expect(PHYSICAL_PRISM_TEST_CONFIG.surfaceCount).toBe(3);
    expect(PHYSICAL_PRISM_TEST_CONFIG.animated).toBe(true);
    expect(PHYSICAL_PRISM_TEST_CONFIG).not.toHaveProperty("spectralPalette");
    expect(PHYSICAL_PRISM_TEST_CONFIG).not.toHaveProperty("pointer");
  });

  it("uses the isolated hybrid stack rather than cubemap-only refraction", () => {
    const assetPath = join(process.cwd(), "scene/PhysicalPrismGlassAsset.tsx");
    expect(existsSync(assetPath)).toBe(true);
    if (!existsSync(assetPath)) return;
    const source = readFileSync(assetPath, "utf8");
    expect(source).toContain("meshPhysicalMaterial");
    expect(source).toContain("PhysicalPrismReflectionAtlas");
    expect(source).toContain("createHeroCanvasUiEnvironment");
    expect(source).not.toContain("PhysicalPrismCausticsOverlay");
    expect(source).not.toContain("MeshRefractionMaterial");
    expect(source).not.toContain("createPhysicalPrismEnvironment");
    expect(source).not.toContain("createPhysicalPrismOpticalCard");
    expect(source).not.toContain("hero-canvas-ui-spectral-source");
    expect(source).not.toContain("uPointer");
  });
});
