import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PHYSICAL_PRISM_TEST_CONFIG,
  resolvePhysicalPrismSceneScale,
} from "@/scene/physical-prism-test-config";

describe("physical prism prototype configuration", () => {
  it("uses bounded refraction and chromatic-aberration values", () => {
    expect(PHYSICAL_PRISM_TEST_CONFIG.backgroundColor).toBe("#000000");
    expect(PHYSICAL_PRISM_TEST_CONFIG.aberrationStrength).toBeGreaterThanOrEqual(0.04);
    expect(PHYSICAL_PRISM_TEST_CONFIG.aberrationStrength).toBeLessThanOrEqual(0.1);
    expect(PHYSICAL_PRISM_TEST_CONFIG.ior).toBeGreaterThanOrEqual(1.5);
    expect(PHYSICAL_PRISM_TEST_CONFIG.ior).toBeLessThanOrEqual(1.65);
    expect(PHYSICAL_PRISM_TEST_CONFIG.bounces).toBeLessThanOrEqual(2);
  });

  it("uses responsive scene framing", () => {
    expect(resolvePhysicalPrismSceneScale(1440)).toBe(8.8);
    expect(resolvePhysicalPrismSceneScale(767)).toBe(3.4);
  });

  it("describes one static physical optical surface", () => {
    expect(PHYSICAL_PRISM_TEST_CONFIG.surfaceCount).toBe(1);
    expect(PHYSICAL_PRISM_TEST_CONFIG.animated).toBe(false);
    expect(PHYSICAL_PRISM_TEST_CONFIG).not.toHaveProperty("spectralPalette");
    expect(PHYSICAL_PRISM_TEST_CONFIG).not.toHaveProperty("pointer");
  });

  it("keeps the prototype independent from the production spectral source", () => {
    const assetPath = join(process.cwd(), "scene/PhysicalPrismGlassAsset.tsx");
    expect(existsSync(assetPath)).toBe(true);
    if (!existsSync(assetPath)) return;
    const source = readFileSync(assetPath, "utf8");
    expect(source).toContain("MeshRefractionMaterial");
    expect(source).toContain("aberrationStrength={config.aberrationStrength}");
    expect(source).not.toContain("MeshTransmissionMaterial");
    expect(source).not.toContain("createPhysicalPrismOpticalCard");
    expect(source).not.toContain("hero-canvas-ui-spectral-source");
    expect(source).not.toContain("uPointer");
  });
});
