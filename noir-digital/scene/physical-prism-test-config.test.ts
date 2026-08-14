import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PHYSICAL_PRISM_TEST_CONFIG,
  resolvePhysicalPrismCardResolution,
  resolvePhysicalPrismSamples,
  resolvePhysicalPrismSceneScale,
} from "@/scene/physical-prism-test-config";

describe("physical prism prototype configuration", () => {
  it("uses only monochrome light regions and bounded physical glass values", () => {
    expect(PHYSICAL_PRISM_TEST_CONFIG.lightRegions).toHaveLength(6);
    expect(PHYSICAL_PRISM_TEST_CONFIG.lightColor).toBe("#ffffff");
    expect(PHYSICAL_PRISM_TEST_CONFIG.backgroundColor).toBe("#000000");
    expect(PHYSICAL_PRISM_TEST_CONFIG.chromaticAberration).toBeGreaterThanOrEqual(0.035);
    expect(PHYSICAL_PRISM_TEST_CONFIG.chromaticAberration).toBeLessThanOrEqual(0.06);
    expect(PHYSICAL_PRISM_TEST_CONFIG.ior).toBeGreaterThanOrEqual(1.5);
    expect(PHYSICAL_PRISM_TEST_CONFIG.ior).toBeLessThanOrEqual(1.65);
    expect(PHYSICAL_PRISM_TEST_CONFIG.roughness).toBeLessThanOrEqual(0.08);
    for (const region of PHYSICAL_PRISM_TEST_CONFIG.lightRegions) {
      expect(region.center[0]).toBeGreaterThanOrEqual(0);
      expect(region.center[0]).toBeLessThanOrEqual(1);
      expect(region.center[1]).toBeGreaterThanOrEqual(0);
      expect(region.center[1]).toBeLessThanOrEqual(1);
      expect(region.radius[0]).toBeGreaterThan(0);
      expect(region.radius[1]).toBeGreaterThan(0);
      expect(region.intensity).toBeGreaterThan(0);
      expect(region.intensity).toBeLessThanOrEqual(1);
    }
  });

  it("uses four desktop samples, two mobile samples, and bounded card sizes", () => {
    expect(resolvePhysicalPrismSamples(1440)).toBe(4);
    expect(resolvePhysicalPrismSamples(767)).toBe(2);
    expect(resolvePhysicalPrismCardResolution(1440)).toBe(512);
    expect(resolvePhysicalPrismCardResolution(767)).toBe(384);
    expect(resolvePhysicalPrismSceneScale(1440)).toBe(4.2);
    expect(resolvePhysicalPrismSceneScale(767)).toBe(2.15);
  });

  it("describes one static monochrome optical surface", () => {
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
    expect(source).toContain("createPhysicalPrismOpticalCard");
    expect(source).toContain("MeshTransmissionMaterial");
    expect(source).toContain("chromaticAberration={config.chromaticAberration}");
    expect(source).toContain("samples={resolvePhysicalPrismSamples(width)}");
    expect(source).not.toContain("hero-canvas-ui-spectral-source");
    expect(source).not.toContain("uPointer");
  });
});
