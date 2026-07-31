import { describe, expect, it } from "vitest";

import { resolveCameraParallax } from "@/scene/site-camera-parallax";

describe("resolveCameraParallax", () => {
  it("keeps the footer scene centered while preserving hero parallax", () => {
    expect(resolveCameraParallax(1, -0.5, false, false)).toEqual({ x: -1.4, y: 0.42 });
    expect(resolveCameraParallax(1, -0.5, false, true)).toEqual({ x: 0, y: 0 });
  });

  it("disables camera parallax for reduced motion", () => {
    expect(resolveCameraParallax(1, 1, true, false)).toEqual({ x: 0, y: 0 });
  });

  it("locks the camera center while the principles effect owns the viewport", () => {
    expect(resolveCameraParallax(-1, 0.5, false, false, true)).toEqual({ x: 0, y: 0 });
    expect(resolveCameraParallax(1, -0.5, false, false, true)).toEqual({ x: 0, y: 0 });
  });
});
