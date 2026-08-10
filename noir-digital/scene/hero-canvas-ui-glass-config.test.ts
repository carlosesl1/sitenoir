import { describe, expect, it } from "vitest";

import { HERO_CANVAS_UI_GLASS_CONFIG } from "@/scene/hero-canvas-ui-glass-config";

describe("Canvas UI hero glass configuration", () => {
  it("starts from the approved physical glass values", () => {
    expect(HERO_CANVAS_UI_GLASS_CONFIG).toMatchObject({
      clearcoat: 0.5,
      clearcoatRoughness: 0.06,
      dispersion: 1.5,
      environmentIntensity: 1,
      highlight: "#066aff",
      ior: 1.75,
      roughness: 0.25,
      thickness: 4,
      transmission: 1,
    });
  });
});
