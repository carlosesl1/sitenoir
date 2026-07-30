import { describe, expect, it } from "vitest";

import { CONTACT_ASSET_PATH, resolveContactAssetScale } from "@/scene/contact-model-scale";

describe("resolveContactAssetScale", () => {
  it("preserves the original contact model's rendered height", () => {
    expect(resolveContactAssetScale()).toBeCloseTo(0.00125062, 8);
  });

  it("uses a content-versioned asset URL so replacements cannot reuse stale browser caches", () => {
    expect(CONTACT_ASSET_PATH).toBe("/assets/v1/model/contact-551d0148de55.glb");
  });
});
