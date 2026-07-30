import { describe, expect, it } from "vitest";

import { resolveHeroExitProgress } from "@/scene/hero-motion";

describe("hero model scroll motion", () => {
  it("responds from the first positive scroll delta and preserves its exit point", () => {
    expect(resolveHeroExitProgress(-1)).toBe(0);
    expect(resolveHeroExitProgress(0)).toBe(0);
    expect(resolveHeroExitProgress(0.001)).toBeGreaterThan(0);
    expect(resolveHeroExitProgress(0.0475)).toBe(0.5);
    expect(resolveHeroExitProgress(0.095)).toBe(1);
    expect(resolveHeroExitProgress(1)).toBe(1);
  });
});
