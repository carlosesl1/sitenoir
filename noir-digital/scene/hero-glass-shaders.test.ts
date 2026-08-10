import { describe, expect, it } from "vitest";

import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { HERO_GLASS_FRAGMENT_SHADER } from "@/scene/hero-glass-shaders";

describe("hero prismatic glass material", () => {
  it("preserves enough refracted scene energy for a transparent dark face", () => {
    expect(HERO_GLASS_CONFIG.dark.faceTransmission).toBeGreaterThanOrEqual(0.72);
    expect(HERO_GLASS_CONFIG.dark.brightness).toBeGreaterThanOrEqual(0.6);
    expect(HERO_GLASS_CONFIG.dark.tintMaximumAlpha).toBeLessThan(0.1);
  });

  it("reserves stronger energy for the rims", () => {
    expect(HERO_GLASS_CONFIG.dark.neutralRimStrength).toBeGreaterThan(
      HERO_GLASS_CONFIG.dark.faceTransmission,
    );
    expect(HERO_GLASS_CONFIG.dark.spectralRimStrength).toBeGreaterThan(0.5);
    expect(HERO_GLASS_CONFIG.dark.neutralRimPower).toBeGreaterThan(
      HERO_GLASS_CONFIG.dark.spectralRimPower,
    );
  });

  it("defines explicit face, neutral-rim, and spectral-rim shader controls", () => {
    for (const uniform of [
      "uFaceTransmission",
      "uNeutralRimPower",
      "uNeutralRimStrength",
      "uSpectralRimPower",
      "uSpectralRimStrength",
      "uSpectralSaturation",
    ]) {
      expect(HERO_GLASS_FRAGMENT_SHADER).toContain(`uniform float ${uniform};`);
    }
  });

  it("concentrates color and white light at grazing angles without alpha blending", () => {
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain(
      "float grazing = clamp(1.0 - viewAlignment, 0.0, 1.0);",
    );
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain("color *= faceAttenuation;");
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain("color += spectralSource * spectralRim;");
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain("color += vec3(neutralRim);");
    expect(HERO_GLASS_FRAGMENT_SHADER).toContain("gl_FragColor = vec4(color, 1.0);");
  });
});
