import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { BEFORE_ROTATION_X, resolveContactModelMotion } from "@/scene/contact-model-motion";

describe("resolveContactModelMotion", () => {
  it("anchors the model to the section while rotating it into place", () => {
    const entering = resolveContactModelMotion({
      finalRotationX: 0,
      layoutY: 0,
      sectionHeight: 1000,
      sectionTop: 500,
      viewportHeight: 1000,
      viewportWorldHeight: 20,
    });

    expect(entering.visible).toBe(true);
    expect(entering.entryProgress).toBe(0.5);
    expect(entering.rotationX).toBeCloseTo(-Math.PI / 2);
    expect(entering.targetY).toBe(-10);

    const settled = resolveContactModelMotion({
      finalRotationX: 0,
      layoutY: 0,
      sectionHeight: 1000,
      sectionTop: 0,
      viewportHeight: 1000,
      viewportWorldHeight: 20,
    });

    expect(settled.entryProgress).toBe(1);
    expect(settled.rotationX).toBe(0);
    expect(settled.targetY).toBe(0);
  });

  it("keeps the model hidden and flipped before the footer enters", () => {
    const beforeEntry = resolveContactModelMotion({
      finalRotationX: 0,
      layoutY: 0,
      sectionHeight: 1000,
      sectionTop: 1000,
      viewportHeight: 1000,
      viewportWorldHeight: 20,
    });

    expect(beforeEntry.visible).toBe(false);
    expect(beforeEntry.entryProgress).toBe(0);
    expect(beforeEntry.rotationX).toBe(BEFORE_ROTATION_X);
  });

  it("uses a slightly stronger and faster pointer response only for the contact model", () => {
    const source = readFileSync(join(process.cwd(), "scene/ContactModel.tsx"), "utf8");

    expect(source).toMatch(/POINTER_ROTATION_X\s*=\s*MathUtils\.degToRad\(16\)/);
    expect(source).toMatch(/POINTER_ROTATION_Y\s*=\s*MathUtils\.degToRad\(24\)/);
    expect(source).toMatch(/POINTER_RESPONSE\s*=\s*16/);
  });
});
