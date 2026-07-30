import { describe, expect, it } from "vitest";

import { resolvePrincipleOrbit } from "@/components/principles/principle-orbit";

describe("resolvePrincipleOrbit", () => {
  it("returns seven scroll-driven ellipses", () => {
    expect(resolvePrincipleOrbit(0.5)).toHaveLength(7);
  });

  it("uses the copied 300 / 300 / 345 travel phases", () => {
    const entering = resolvePrincipleOrbit(150 / 945);
    const looping = resolvePrincipleOrbit(450 / 945);
    const exiting = resolvePrincipleOrbit(750 / 945);

    expect(entering.some((ellipse) => ellipse.visible)).toBe(true);
    expect(looping.filter((ellipse) => ellipse.visible)).toHaveLength(5);
    expect(exiting.some((ellipse) => !ellipse.visible)).toBe(true);
  });

  it("forms flattened ellipses along the circular path", () => {
    const ellipse = resolvePrincipleOrbit(0.5).find((item) => item.visible);

    expect(ellipse).toBeDefined();
    expect(ellipse?.radiusX).toBeGreaterThan(0);
    expect(ellipse?.radiusY).toBeCloseTo((ellipse?.radiusX ?? 0) * 0.1, 5);
  });
});
