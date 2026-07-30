import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  resolveFullscreenDitherOpacity,
  resolveStickerFieldActivation,
} from "@/scene/FullscreenDither";

describe("resolveFullscreenDitherOpacity", () => {
  it("keeps the overlay transparent while the hero still fills the viewport", () => {
    const opacity = resolveFullscreenDitherOpacity({
      scrollTop: 0,
      viewportHeight: 720,
      heroTop: 0,
      heroHeight: 720,
      ditherEndTop: 6000,
    });

    expect(opacity).toBe(0);
  });

  it("fills the viewport progressively while the hero bottom crosses the final 75 percent", () => {
    const opacity = resolveFullscreenDitherOpacity({
      scrollTop: 270,
      viewportHeight: 720,
      heroTop: 0,
      heroHeight: 720,
      ditherEndTop: 6000,
    });

    expect(opacity).toBeCloseTo(0.5);
  });

  it("reaches full opacity when the hero bottom reaches one quarter of the viewport", () => {
    const opacity = resolveFullscreenDitherOpacity({
      scrollTop: 540,
      viewportHeight: 720,
      heroTop: 0,
      heroHeight: 720,
      ditherEndTop: 6000,
    });

    expect(opacity).toBe(1);
  });

  it("fades the overlay within the final viewport of the services section", () => {
    const opacity = resolveFullscreenDitherOpacity({
      scrollTop: 5640,
      viewportHeight: 720,
      heroTop: 0,
      heroHeight: 720,
      ditherEndTop: 6000,
    });

    expect(opacity).toBeCloseTo(0.5);
  });

  it("removes the overlay when the services section has ended", () => {
    const opacity = resolveFullscreenDitherOpacity({
      scrollTop: 6000,
      viewportHeight: 720,
      heroTop: 0,
      heroHeight: 720,
      ditherEndTop: 6000,
    });

    expect(opacity).toBe(0);
  });

  it("starts stickers from the measured midpoint of the hero", () => {
    const metrics = { heroHeight: 2160, heroTop: 0, viewportHeight: 720 };

    expect(resolveStickerFieldActivation({ ...metrics, scrollTop: 359 })).toBe(false);
    expect(resolveStickerFieldActivation({ ...metrics, scrollTop: 360 })).toBe(true);
  });
});

describe("FullscreenDither section boundary", () => {
  it("measures the AI services section as the final dark-dither boundary", () => {
    const source = readFileSync(join(process.cwd(), "scene/FullscreenDither.tsx"), "utf8");

    expect(source).toContain('document.getElementById("ai-services")');
    expect(source).toContain("observer.observe(aiServices)");
    expect(source).toContain("ditherEndTop: aiServicesRect.bottom + scrollTop");
    expect(source).not.toContain('document.getElementById("selected-work")');
  });
});
