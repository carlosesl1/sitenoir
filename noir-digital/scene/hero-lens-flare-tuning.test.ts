import { describe, expect, it } from "vitest";

import { resolveLensFlareTuning } from "@/scene/hero-lens-flare-tuning";

describe("resolveLensFlareTuning", () => {
  it("keeps the hero highlight extraction strict", () => {
    expect(resolveLensFlareTuning(false)).toEqual({
      gate: 0.88,
      hotspotPower: 32,
      intensity: 0.7,
      threshold: 0.99,
    });
  });

  it("accepts the semi-transparent footer highlights", () => {
    const contact = resolveLensFlareTuning(true);

    expect(contact.threshold).toBeLessThan(0.78);
    expect(contact.gate).toBeLessThan(0.2);
  });
});
