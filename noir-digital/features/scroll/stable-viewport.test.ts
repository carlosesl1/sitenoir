import { describe, expect, it } from "vitest";

import { resolveViewportBasis } from "@/features/scroll/stable-viewport";

describe("resolveViewportBasis", () => {
  it("takes the first measurement", () => {
    expect(resolveViewportBasis(null, { height: 760, width: 390 })).toEqual({
      height: 760,
      width: 390,
    });
  });

  it("keeps the basis while only the browser bar slides in or out", () => {
    const basis = { height: 760, width: 390 };

    expect(resolveViewportBasis(basis, { height: 816, width: 390 })).toBe(basis);
    expect(resolveViewportBasis(basis, { height: 664, width: 390 })).toBe(basis);
  });

  it("follows a rotation or a real window resize", () => {
    const basis = { height: 760, width: 390 };

    expect(resolveViewportBasis(basis, { height: 390, width: 760 }).height).toBe(390);
    expect(resolveViewportBasis(basis, { height: 1000, width: 390 }).height).toBe(1000);
  });
});
