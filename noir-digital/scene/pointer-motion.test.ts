import { describe, expect, it } from "vitest";

import {
  POINTER_ROTATION_AXIS_TILT_DEGREES,
  resolvePointerExitProgress,
  resolvePointerScrollRotation,
} from "@/scene/pointer-motion";

describe("pointer scroll motion", () => {
  it("copies the source two-turn Y rotation across the exit progress", () => {
    expect(resolvePointerScrollRotation(-1)).toBe(0);
    expect(resolvePointerScrollRotation(0)).toBe(0);
    expect(resolvePointerScrollRotation(0.25)).toBe(180);
    expect(resolvePointerScrollRotation(0.5)).toBe(360);
    expect(resolvePointerScrollRotation(1)).toBe(720);
    expect(resolvePointerScrollRotation(2)).toBe(720);
  });

  it("tilts the rotation axis without changing the cursor rest pose", () => {
    expect(POINTER_ROTATION_AXIS_TILT_DEGREES).toBe(45);
  });

  it("responds from the first positive scroll delta and preserves its exit point", () => {
    expect(resolvePointerExitProgress(-1)).toBe(0);
    expect(resolvePointerExitProgress(0)).toBe(0);
    expect(resolvePointerExitProgress(0.001)).toBeGreaterThan(0);
    expect(resolvePointerExitProgress(0.045)).toBe(0.5);
    expect(resolvePointerExitProgress(0.09)).toBe(1);
    expect(resolvePointerExitProgress(1)).toBe(1);
  });
});
