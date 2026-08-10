import { describe, expect, it } from "vitest";

import {
  resetWorkCardCanvas,
  resolveScreenCurlProfile,
  resolveWorkCardCanvasMetrics,
  resolveWorkCardCurl,
  shouldRenderWorkCardCanvas,
} from "@/components/work/work-card-motion";

describe("work card curl", () => {
  it("keeps the project image framing stable at every scroll velocity", () => {
    expect(resolveWorkCardCurl(0)).toBe(0);
    expect(resolveWorkCardCurl(400)).toBe(0);
    expect(resolveWorkCardCurl(800)).toBe(0);
    expect(resolveWorkCardCurl(1600)).toBe(0);
  });

  it("uses the original screen-space profile at the viewport edges", () => {
    expect(resolveScreenCurlProfile(0, 900)).toBe(1);
    expect(resolveScreenCurlProfile(450, 900)).toBe(0);
    expect(resolveScreenCurlProfile(900, 900)).toBe(1);
    expect(resolveScreenCurlProfile(225, 900)).toBeCloseTo(1 - Math.sqrt(0.75));
  });

  it("keeps one render surface at rest instead of swapping back to the image", () => {
    expect(
      shouldRenderWorkCardCanvas({
        imageReady: true,
        motionAllowed: true,
        visible: true,
        webglReady: false,
      }),
    ).toBe(true);
    expect(
      shouldRenderWorkCardCanvas({
        imageReady: false,
        motionAllowed: true,
        visible: true,
        webglReady: false,
      }),
    ).toBe(false);
    expect(
      shouldRenderWorkCardCanvas({
        imageReady: true,
        motionAllowed: true,
        visible: false,
        webglReady: false,
      }),
    ).toBe(false);
  });

  it("stops the 2D strip renderer when the global WebGL layer owns the cards", () => {
    expect(
      shouldRenderWorkCardCanvas({
        imageReady: true,
        motionAllowed: true,
        visible: true,
        webglReady: true,
      }),
    ).toBe(false);
  });

  it("keeps the authored responsive image on touch-only devices", () => {
    expect(
      shouldRenderWorkCardCanvas({
        imageReady: true,
        motionAllowed: false,
        visible: true,
        webglReady: false,
      }),
    ).toBe(false);
  });

  it("keeps CSS and backing-store dimensions on the same coordinate system", () => {
    expect(resolveWorkCardCanvasMetrics(1600, 1200, 1.25)).toEqual({
      cssHeight: 1200,
      cssWidth: 1600,
      pixelHeight: 1500,
      pixelWidth: 2000,
    });
  });

  it("restores the source image when runtime reduced motion disables the canvas", () => {
    const frame = document.createElement("span");
    const canvas = document.createElement("canvas");
    frame.dataset["canvasActive"] = "true";
    frame.dataset["curlActive"] = "true";
    canvas.style.opacity = "1";

    resetWorkCardCanvas(frame, canvas);

    expect(frame.dataset["canvasActive"]).toBe("false");
    expect(frame.dataset["curlActive"]).toBe("false");
    expect(canvas.style.opacity).toBe("0");
  });
});
