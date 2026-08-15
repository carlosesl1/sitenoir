import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG,
  resolvePhysicalPrismReflectionAtlasOpacity,
} from "@/scene/physical-prism-reflection-atlas-config";

describe("physical prism reflection atlas", () => {
  it("uses one compact local WebP asset", () => {
    const asset = join(
      process.cwd(),
      "public",
      PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.assetUrl.replace(/^\//, ""),
    );

    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.assetUrl).toBe(
      "/assets/v1/textures/noir-prism-reflections-atlas-v1.webp",
    );
    expect(existsSync(asset)).toBe(true);
    expect(statSync(asset).size).toBeLessThan(100_000);
  });

  it("keeps saturated reflections visible and softer on mobile", () => {
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.luminanceStart).toBeLessThan(
      PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.luminanceEnd,
    );
    expect(PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.saturationStart).toBeLessThan(
      PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.saturationEnd,
    );
    expect(resolvePhysicalPrismReflectionAtlasOpacity(1440)).toBe(0.76);
    expect(resolvePhysicalPrismReflectionAtlasOpacity(390)).toBe(0.6);
  });
});
