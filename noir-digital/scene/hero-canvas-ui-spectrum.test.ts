import { describe, expect, it } from "vitest";

import { HERO_CANVAS_UI_SPECTRUM_CONFIG } from "@/scene/hero-canvas-ui-spectrum-config";

describe("Canvas UI hero spectrum", () => {
  it("keeps the rim dominant and the internal bands sparse", () => {
    const config = HERO_CANVAS_UI_SPECTRUM_CONFIG;

    expect(config.rimStrength).toBeGreaterThan(config.bandStrength);
    expect(config.rimPower).toBeGreaterThan(1);
    expect(config.bandSharpness).toBeGreaterThanOrEqual(12);
    expect(config.bandStrength).toBeLessThanOrEqual(0.55);
    expect(config.maximumOpacity).toBeLessThan(1);
    expect(config.saturation).toBeGreaterThan(1);
  });

  it("offsets the overlay without changing the geometry", () => {
    expect(HERO_CANVAS_UI_SPECTRUM_CONFIG.polygonOffsetFactor).toBeLessThan(0);
    expect(HERO_CANVAS_UI_SPECTRUM_CONFIG.polygonOffsetUnits).toBeLessThan(0);
  });
});
