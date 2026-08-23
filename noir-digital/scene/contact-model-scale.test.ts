import { describe, expect, it } from "vitest";

import {
  CONTACT_ASSET_PATH,
  resolveContactAssetScale,
  resolveContactCanvasUiAssetScale,
  resolveContactCanvasUiDepthScale,
  resolveContactCanvasUiGeometryScale,
} from "@/scene/contact-model-scale";

describe("resolveContactAssetScale", () => {
  it("preserves the original contact model's rendered height", () => {
    expect(resolveContactAssetScale()).toBeCloseTo(0.0026057491, 8);
    expect(resolveContactCanvasUiAssetScale()).toBeCloseTo(0.4880015127, 8);
    expect(resolveContactCanvasUiDepthScale()).toBeCloseTo(1.7357832027, 8);
    expect(resolveContactCanvasUiGeometryScale()).toBeCloseTo(0.0053396332, 8);
  });

  it("uses a content-versioned asset URL so replacements cannot reuse stale browser caches", () => {
    expect(CONTACT_ASSET_PATH).toBe("/assets/v1/model/contact-10b2fb07-meshopt.glb");
  });
});
