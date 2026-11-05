import { describe, expect, it } from "vitest";

import { HERO_FLARE_TUNING } from "@/scene/hero-lens-flare-tuning";

describe("HERO_FLARE_TUNING", () => {
  it("keeps the hero highlight extraction strict", () => {
    expect(HERO_FLARE_TUNING).toEqual({
      gate: 0.88,
      hotspotPower: 32,
      intensity: 0.7,
      spectrumMix: 1,
      streakJitter: 1,
      streakScale: 1,
      threshold: 0.99,
    });
  });
});
