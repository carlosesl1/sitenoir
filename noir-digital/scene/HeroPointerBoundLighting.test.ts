import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSceneSource(fileName: string): string {
  return readFileSync(join(process.cwd(), "scene", fileName), "utf8");
}

describe("hero 3D pointer-bound lighting", () => {
  it("keeps the Canvas UI rim fixed instead of illuminating beneath the pointer", () => {
    const asset = readSceneSource("HeroCanvasUiGlassAsset.tsx");
    const shader = readSceneSource("hero-canvas-ui-rim-shaders.ts");

    expect(asset).not.toContain("pointerStore");
    expect(asset).not.toContain("uPointerLight");
    expect(shader).not.toContain("uPointerLight");
    expect(shader).not.toContain("pointerLight");
    expect(shader).toContain("core * uCoreOpacity + halo * uHaloOpacity");
  });

  it("keeps the legacy glass light fixed instead of orbiting it toward the pointer", () => {
    const asset = readSceneSource("HeroGlassAsset.tsx");

    expect(asset).not.toContain("pointerStore");
    expect(asset).not.toContain("lightTracker");
    expect(asset).toContain("uLight: { value: new Vector3(4, 9, HERO_GLASS_CONFIG.lightZ) }");
  });
});
