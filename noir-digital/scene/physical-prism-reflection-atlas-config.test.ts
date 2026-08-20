import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  createPhysicalPrismReflectionLayerAdjustments,
  PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG,
  PHYSICAL_PRISM_REFLECTION_LAYERS,
  resolvePhysicalPrismReflectionAtlasOpacity,
  resolvePhysicalPrismReflectionLayerRegion,
} from "@/scene/physical-prism-reflection-atlas-config";

describe("physical prism reflection atlas", () => {
  it("uses compact local WebP assets for the N, O, and I/R regions", () => {
    expect(PHYSICAL_PRISM_REFLECTION_LAYERS.map((layer) => layer.id)).toEqual(["n", "o", "ir"]);

    const totalBytes = PHYSICAL_PRISM_REFLECTION_LAYERS.reduce((total, layer) => {
      const asset = join(process.cwd(), "public", layer.assetUrl.replace(/^\//, ""));
      expect(existsSync(asset)).toBe(true);
      expect(statSync(asset).size).toBeLessThan(70_000);
      return total + statSync(asset).size;
    }, 0);

    expect(totalBytes).toBeLessThan(150_000);
  });

  it("exposes independent, non-overlapping horizontal regions for fine fitting", () => {
    expect(PHYSICAL_PRISM_REFLECTION_LAYERS[0].planarMax).toEqual([0.305, 1]);
    expect(PHYSICAL_PRISM_REFLECTION_LAYERS[1].planarMin).toEqual([0.315, 0]);
    expect(PHYSICAL_PRISM_REFLECTION_LAYERS[2].planarMin).toEqual([0.61, 0]);
    expect(PHYSICAL_PRISM_REFLECTION_LAYERS.map((layer) => layer.adjustment)).toEqual([
      { offsetX: -0.015, offsetY: -0.07, scaleX: 0.995, scaleY: 1 },
      { offsetX: 0.006, offsetY: -0.039, scaleX: 1.01, scaleY: 0.995 },
      { offsetX: 0.009, offsetY: 0.12, scaleX: 1.045, scaleY: 1.18 },
    ]);
  });

  it("supports independent position and scale adjustments for each letter", () => {
    const adjustments = createPhysicalPrismReflectionLayerAdjustments();
    const nAdjustment = {
      ...adjustments.n,
      offsetX: 0.01,
      offsetY: -0.02,
      scaleX: 0.5,
      scaleY: 0.5,
    };

    const region = resolvePhysicalPrismReflectionLayerRegion(
      PHYSICAL_PRISM_REFLECTION_LAYERS[0],
      nAdjustment,
    );

    expect(region.planarMin[0]).toBeCloseTo(0.07625 + 0.01);
    expect(region.planarMin[1]).toBeCloseTo(0.25 - 0.02);
    expect(region.planarMax[0]).toBeCloseTo(0.22875 + 0.01);
    expect(region.planarMax[1]).toBeCloseTo(0.75 - 0.02);
    expect(adjustments.o).toEqual({ offsetX: 0.006, offsetY: -0.039, scaleX: 1.01, scaleY: 0.995 });
    expect(adjustments.ir).toEqual({ offsetX: 0.009, offsetY: 0.12, scaleX: 1.045, scaleY: 1.18 });
  });

  it("keeps saturated reflections visible and softer on mobile", () => {
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.luminanceStart).toBeLessThan(
      PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.luminanceEnd,
    );
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.saturationStart).toBeLessThan(
      PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.saturationEnd,
    );
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.opticalDispersion).toBeGreaterThan(0);
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.opticalBloom).toBeGreaterThan(0);
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.opticalSoftness).toBeGreaterThan(0);
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.opticalSoftnessRadius).toBeGreaterThan(0);
    expect(resolvePhysicalPrismReflectionAtlasOpacity(1440)).toBe(0.76);
    expect(resolvePhysicalPrismReflectionAtlasOpacity(390)).toBe(0.6);
  });

  it("uses separate local texture overlays without procedural lobes or pointer input", () => {
    const component = readFileSync(
      join(process.cwd(), "scene/PhysicalPrismReflectionAtlas.tsx"),
      "utf8",
    );
    const shader = readFileSync(
      join(process.cwd(), "scene/physical-prism-reflection-atlas-shaders.ts"),
      "utf8",
    );

    expect(component).toContain("TextureLoader");
    expect(component).toContain("PHYSICAL_PRISM_REFLECTION_LAYERS");
    expect(component).toContain("depthWrite={false}");
    expect(component).toContain("renderOrder={2}");
    expect(component).not.toContain("useFrame");
    expect(shader).toContain("uReflectionMap");
    expect(shader).toContain("uRegionMin");
    expect(shader).toContain("uRegionSize");
    expect(shader).toContain("saturation");
    expect(shader).toContain("uOpticalDispersion");
    expect(shader).toContain("dispersedColor");
    expect(shader).toContain("uOpticalSoftness");
    expect(shader).toContain("softenedSample");
    expect(shader).not.toContain("uLeftAnchorShift");
    expect(shader).not.toContain("uRightAnchorShift");
    expect(shader).not.toContain("causticField");
    expect(shader).not.toContain("uPointer");
    expect(shader).not.toContain("WebGLRenderTarget");
  });
});
