import { AdditiveBlending, DoubleSide } from "three";
import { describe, expect, it } from "vitest";

import { HERO_CANVAS_UI_SPECTRUM_CONFIG } from "@/scene/hero-canvas-ui-spectrum-config";
import { createHeroCanvasUiSpectrumMaterial } from "@/scene/hero-canvas-ui-spectrum-material";
import { HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER } from "@/scene/hero-canvas-ui-spectrum-shaders";

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

  it("separates grazing rims from narrow face bands without time animation", () => {
    expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).toContain(
      "float grazing = clamp(1.0 - viewAlignment, 0.0, 1.0);",
    );
    expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).toContain(
      "float rim = pow(grazing, max(uRimPower, 0.0001)) * uRimStrength;",
    );
    expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).toContain("float bands = pow(");
    expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).toContain("uBandStrength");
    expect(HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER).not.toContain("uTime");
  });

  it("creates a transparent additive overlay that cannot occlude the glass", () => {
    const material = createHeroCanvasUiSpectrumMaterial();

    expect(material.transparent).toBe(true);
    expect(material.depthWrite).toBe(false);
    expect(material.blending).toBe(AdditiveBlending);
    expect(material.side).toBe(DoubleSide);
    expect(material.toneMapped).toBe(false);
    expect(material.polygonOffset).toBe(true);
    expect(material.polygonOffsetFactor).toBeLessThan(0);
    expect(material.uniforms["uRimStrength"]?.value).toBeGreaterThan(
      material.uniforms["uBandStrength"]?.value,
    );

    material.dispose();
  });
});
