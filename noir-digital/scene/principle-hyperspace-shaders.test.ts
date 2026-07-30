import { describe, expect, it } from "vitest";

import { principleCursorFragmentShader } from "@/scene/principle-hyperspace-shaders";

describe("principle cursor hyperspace shader", () => {
  it("samples the ray field in screen space inside the cursor material", () => {
    expect(principleCursorFragmentShader).toContain("gl_FragCoord");
    expect(principleCursorFragmentShader).toContain("uResolution");
    expect(principleCursorFragmentShader).toContain("uScaleReveal");
    expect(principleCursorFragmentShader).toContain("cellDensity = 100.0");
    expect(principleCursorFragmentShader).toContain("keepProbability");
    expect(principleCursorFragmentShader).toContain("hsv2rgb");
    expect(principleCursorFragmentShader).toContain("uStripeColorA");
    expect(principleCursorFragmentShader).toContain("uFresnelSideDir");
    expect(principleCursorFragmentShader).toContain("uSpecularStrength");
    expect(principleCursorFragmentShader).toContain("tonemapping_fragment");
    expect(principleCursorFragmentShader).toContain("colorspace_fragment");
  });
});
