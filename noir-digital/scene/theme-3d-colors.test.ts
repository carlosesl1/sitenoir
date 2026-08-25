import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LIGHT_THREE_DIMENSIONAL_COLOR,
  resolveThreeDimensionalColor,
} from "@/scene/theme-3d-colors";

describe("resolveThreeDimensionalColor", () => {
  it("uses the approved blue only in the light theme", () => {
    expect(LIGHT_THREE_DIMENSIONAL_COLOR).toBe("#0074e8");
    expect(resolveThreeDimensionalColor("light", "#ffffff")).toBe("#0074e8");
  });

  it("preserves each object's existing dark-theme color", () => {
    expect(resolveThreeDimensionalColor("dark", "#ffffff")).toBe("#ffffff");
    expect(resolveThreeDimensionalColor("dark", "#242a30")).toBe("#242a30");
  });

  it("drives every approved 3D material from the shared theme resolver", () => {
    const consumers = [
      "HeroCanvasUiGlassAsset.tsx",
      "HeroCanvasUiPointerAsset.tsx",
      "ContactCanvasUiGlassAsset.tsx",
      "PrinciplePointerModel.tsx",
    ];

    for (const fileName of consumers) {
      const source = readFileSync(join(process.cwd(), "scene", fileName), "utf8");
      expect(source, fileName).toContain('from "@/scene/theme-3d-colors"');
      expect(source, fileName).toContain("resolveThreeDimensionalColor(");
      expect(source, fileName).toContain("resolvedTheme");
    }
  });

  it("recreates transmission materials when the theme changes", () => {
    const transmissionConsumers = [
      "HeroCanvasUiGlassAsset.tsx",
      "HeroCanvasUiPointerAsset.tsx",
      "ContactCanvasUiGlassAsset.tsx",
    ];

    for (const fileName of transmissionConsumers) {
      const source = readFileSync(join(process.cwd(), "scene", fileName), "utf8");
      expect(source, fileName).toContain("key={resolvedTheme}");
    }
  });

  it("keeps the expanded principle cursor blue instead of fading it to black in light mode", () => {
    const component = readFileSync(
      join(process.cwd(), "scene", "PrinciplePointerModel.tsx"),
      "utf8",
    );
    const shader = readFileSync(
      join(process.cwd(), "scene", "principle-hyperspace-shaders.ts"),
      "utf8",
    );

    expect(component).toContain("uBaseDarkening");
    expect(shader).toContain("uniform float uBaseDarkening;");
    expect(shader).toContain("darken * uBaseDarkening");
  });
});
