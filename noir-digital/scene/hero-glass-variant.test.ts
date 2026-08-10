import { describe, expect, it } from "vitest";

import { resolveHeroGlassVariant } from "@/scene/hero-glass-variant";

describe("hero glass variant", () => {
  it("selects Canvas UI only for the exact opt-in value", () => {
    expect(resolveHeroGlassVariant("?glass=canvas-ui")).toBe("canvas-ui");
  });

  it("preserves the current shader for missing or unknown values", () => {
    expect(resolveHeroGlassVariant("")).toBe("current");
    expect(resolveHeroGlassVariant("?glass=physical")).toBe("current");
    expect(resolveHeroGlassVariant("?glass=CANVAS-UI")).toBe("current");
  });
});
