import { describe, expect, it } from "vitest";

import { resolveHeroGlassVariant } from "@/scene/hero-glass-variant";

describe("hero glass variant", () => {
  it("uses the clean Canvas UI glass by default", () => {
    expect(resolveHeroGlassVariant("")).toBe("canvas-ui");
    expect(resolveHeroGlassVariant("?glass=canvas-ui")).toBe("canvas-ui");
    expect(resolveHeroGlassVariant("?glass=physical")).toBe("canvas-ui");
    expect(resolveHeroGlassVariant("?glass=CANVAS-UI")).toBe("canvas-ui");
  });

  it("keeps the older shader accessible only as an explicit comparison", () => {
    expect(resolveHeroGlassVariant("?glass=current")).toBe("current");
  });
});
