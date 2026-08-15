import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PHYSICAL_PRISM_CAUSTICS_CONFIG,
  resolvePhysicalPrismCausticsIntensity,
} from "@/scene/physical-prism-caustics-config";

describe("physical prism caustic art direction", () => {
  it("uses nine irregular lobes on one coherent optical direction", () => {
    expect(PHYSICAL_PRISM_CAUSTICS_CONFIG.lobes).toHaveLength(9);
    expect(PHYSICAL_PRISM_CAUSTICS_CONFIG.lightAngle).toBeCloseTo(0.61, 2);

    for (const lobe of PHYSICAL_PRISM_CAUSTICS_CONFIG.lobes) {
      expect(lobe.angleOffset).toBeGreaterThanOrEqual(-0.0524);
      expect(lobe.angleOffset).toBeLessThanOrEqual(0.0524);
      expect(lobe.radius[0]).toBeGreaterThan(0);
      expect(lobe.radius[1]).toBeGreaterThan(0);
      expect(lobe.strength).toBeGreaterThan(0);
    }
  });

  it("uses the approved palette without broad white centres", () => {
    expect(PHYSICAL_PRISM_CAUSTICS_CONFIG.palette).toEqual({
      blue: "#03357C",
      green: "#21D344",
      red: "#d23012",
      yellow: "#FCE609",
    });
    expect(PHYSICAL_PRISM_CAUSTICS_CONFIG.whiteCoreStrength).toBeLessThanOrEqual(0.08);
  });

  it("keeps the field visible but softer on mobile", () => {
    expect(resolvePhysicalPrismCausticsIntensity(1440)).toBe(0.88);
    expect(resolvePhysicalPrismCausticsIntensity(390)).toBe(0.68);
  });

  it("keeps caustics local, bounded and independent from pointer or FBO input", () => {
    const source = readFileSync(
      join(process.cwd(), "scene/physical-prism-caustics-shaders.ts"),
      "utf8",
    );

    expect(source).toContain("uPlanarMin");
    expect(source).toContain("uPlanarSize");
    expect(source).toContain("causticField");
    expect(source).toContain("uTime");
    expect(source).not.toContain("uPointer");
    expect(source).not.toContain("WebGLRenderTarget");
  });
});
