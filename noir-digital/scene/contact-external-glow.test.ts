import { describe, expect, it } from "vitest";

import {
  closeMaskChannels,
  createExteriorGlowPixels,
  fillEnclosedHoles,
} from "@/scene/contact-external-glow";

describe("contact external glow", () => {
  it("fills transparent holes that are not connected to the texture edge", () => {
    const mask = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    ]);

    expect(fillEnclosedHoles(mask, 5, 5)[12]).toBe(1);
  });

  it("writes alpha outside the contour but not inside the solid or enclosed hole", () => {
    const mask = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    ]);
    const pixels = createExteriorGlowPixels(mask, 5, 5, 2);

    expect(pixels[3]).toBeGreaterThan(0);
    expect(pixels[6 * 4 + 3]).toBe(0);
    expect(pixels[12 * 4 + 3]).toBe(0);
  });

  it("seals narrow channels that connect an internal opening to the exterior", () => {
    const mask = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1,
      1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    ]);

    const closed = closeMaskChannels(mask, 7, 6, 1);
    expect(closed[10]).toBe(1);
    expect(fillEnclosedHoles(closed, 7, 6)[24]).toBe(1);
  });
});
