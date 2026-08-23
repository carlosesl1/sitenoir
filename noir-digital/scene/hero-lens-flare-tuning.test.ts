import { describe, expect, it } from "vitest";

import { resolveLensFlareTuning } from "@/scene/hero-lens-flare-tuning";

describe("resolveLensFlareTuning", () => {
  it("keeps the hero highlight extraction strict", () => {
    expect(resolveLensFlareTuning(false)).toEqual({
      gate: 0.88,
      hotspotPower: 32,
      intensity: 0.7,
      spectrumMix: 1,
      streakJitter: 1,
      streakScale: 1,
      threshold: 0.99,
    });
  });

  it("keeps the footer RGB flare compact and smooth", () => {
    const contact = resolveLensFlareTuning(true);

    expect(contact.threshold).toBeLessThan(0.78);
    expect(contact.gate).toBeLessThan(0.2);
    expect(contact.intensity).toBeLessThan(0.8);
    expect(contact.spectrumMix).toBeLessThan(0.5);
    expect(contact.streakJitter).toBeLessThan(0.2);
    expect(contact.streakScale).toBeLessThan(0.7);
  });
});
