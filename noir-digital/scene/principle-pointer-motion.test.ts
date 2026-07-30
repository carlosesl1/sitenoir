import { describe, expect, it } from "vitest";

import {
  resolveFullscreenCursorScale,
  resolvePrinciplePointerRectMotion,
  resolvePrinciplePointerRotation,
} from "@/scene/principle-pointer-motion";

const viewportHeight = 1000;
const sectionHeight = 8000;

function motionAt(top: number) {
  return resolvePrinciplePointerRectMotion({
    bottom: top + sectionHeight,
    height: sectionHeight,
    top,
    viewportHeight,
  });
}

describe("resolvePrinciplePointerRectMotion", () => {
  it("preloads the cursor just before the story reaches the viewport", () => {
    expect(motionAt(1479).visible).toBe(true);
    expect(motionAt(1481).visible).toBe(false);
  });

  it("derives entry and exit from the live section rectangle", () => {
    expect(motionAt(380).entryProgress).toBe(0);
    expect(motionAt(-120).entryProgress).toBe(0.5);
    expect(motionAt(-620).entryProgress).toBe(1);

    const beforeExit = motionAt(-6379);
    expect(beforeExit.beforeShrink).toBe(true);
    expect(beforeExit.shrinking).toBe(false);

    const duringExit = motionAt(-6880);
    expect(duringExit.beforeShrink).toBe(false);
    expect(duringExit.shrinking).toBe(true);
    expect(duringExit.shrinkProgress).toBeCloseTo(0.5, 8);

    expect(motionAt(-7500).shrinkProgress).toBe(1);
  });

  it("pins the cursor to the viewport center, then releases it through the top", () => {
    expect(motionAt(800).targetViewportY).toBe(920);
    expect(motionAt(0).targetViewportY).toBe(500);
    expect(motionAt(-7600).targetViewportY).toBe(280);
  });

  it("maps shader time across the complete story travel", () => {
    expect(motionAt(1000).timeProgress).toBe(0);
    expect(motionAt(-3500).timeProgress).toBe(1);
    expect(motionAt(-8000).timeProgress).toBe(2);
  });
});

describe("resolvePrinciplePointerRotation", () => {
  it("spins a half turn during entry and another half turn late in the exit", () => {
    const entering = motionAt(0);
    expect(resolvePrinciplePointerRotation(entering, 0)).toBe(0);
    expect(resolvePrinciplePointerRotation(entering, 0.2)).toBe(90);
    expect(resolvePrinciplePointerRotation(entering, 0.4)).toBe(180);

    expect(resolvePrinciplePointerRotation(motionAt(-6880), 1)).toBe(180);
    expect(
      resolvePrinciplePointerRotation(
        { beforeShrink: false, shrinking: true, shrinkProgress: 0.8 },
        1,
      ),
    ).toBeCloseTo(270, 8);
    expect(resolvePrinciplePointerRotation(motionAt(-7500), 0)).toBe(360);
  });
});

describe("resolveFullscreenCursorScale", () => {
  it("calibrates the cursor against its bounding-sphere radius", () => {
    expect(resolveFullscreenCursorScale(40, 20, 16.509)).toBeCloseTo(
      (Math.hypot(40, 20) * 1.64) / 16.509,
      8,
    );
  });

  it("protects the scale calculation from an empty model radius", () => {
    expect(Number.isFinite(resolveFullscreenCursorScale(40, 20, 0))).toBe(true);
  });
});
