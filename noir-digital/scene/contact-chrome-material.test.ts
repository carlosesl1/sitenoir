import { describe, expect, it } from "vitest";

import { CONTACT_CHROME_MATERIAL } from "@/scene/contact-chrome-material";

describe("CONTACT_CHROME_MATERIAL", () => {
  it("uses a mirror-chrome physical profile", () => {
    expect(CONTACT_CHROME_MATERIAL.metalness).toBe(1);
    expect(CONTACT_CHROME_MATERIAL.roughness).toBeGreaterThanOrEqual(0.06);
    expect(CONTACT_CHROME_MATERIAL.roughness).toBeLessThanOrEqual(0.1);
    expect(CONTACT_CHROME_MATERIAL.environmentIntensity).toBeGreaterThan(1);
  });
});
