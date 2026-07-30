import { describe, expect, it } from "vitest";

import { CONTACT_FLARE_LAYER, resolveFlareSourceLayer } from "@/scene/contact-flare-layer";

describe("resolveFlareSourceLayer", () => {
  it("uses the complete scene for the hero flare", () => {
    expect(resolveFlareSourceLayer(false)).toBeNull();
  });

  it("isolates the contact model when the footer is visible", () => {
    expect(resolveFlareSourceLayer(true)).toBe(CONTACT_FLARE_LAYER);
  });
});
