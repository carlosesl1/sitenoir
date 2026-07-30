import { describe, expect, it } from "vitest";

import {
  principleSceneLayouts,
  resolveHeroSceneLayout,
  resolveViewportFamily,
  sceneLayouts,
} from "@/scene/scene-layout";

describe("resolveViewportFamily", () => {
  it.each([
    [320, "mobile"],
    [767, "mobile"],
    [768, "tablet"],
    [1023, "tablet"],
    [1024, "tablet"],
    [1279, "tablet"],
    [1280, "desktop"],
    [1920, "desktop"],
  ] as const)("maps %spx to %s", (width, family) => {
    expect(resolveViewportFamily(width)).toBe(family);
  });
});

describe("sceneLayouts", () => {
  it("locks source-informed transforms for every viewport family", () => {
    expect(sceneLayouts.mobile.hero).toEqual({
      position: [-0.1, 0, 2],
      rotation: [0, 4, 0],
      scale: 8.1,
    });
    expect(sceneLayouts.tablet.hero).toEqual({
      position: [-0.1, 1.65, 2],
      rotation: [0, 4, 0],
      scale: 15.1,
    });
    expect(sceneLayouts.desktop.hero).toEqual({
      position: [-0.1, 1.9, 2],
      rotation: [0, 4, 0],
      scale: 20.7,
    });
    expect(sceneLayouts.mobile.pointer).toEqual({
      position: [3.25, -1, -3],
      rotation: [0, 0, 0],
      scale: 0.032,
    });
    expect(sceneLayouts.tablet.pointer).toEqual({
      position: [5.8, -2.2, -3],
      rotation: [0, 0, 0],
      scale: 0.069,
    });
    expect(sceneLayouts.desktop.pointer).toEqual({
      position: [9.2, -2.2, -3],
      rotation: [0, 0, 0],
      scale: 0.078,
    });
    expect(sceneLayouts.mobile.contact).toEqual({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 10,
    });
    expect(sceneLayouts.tablet.contact).toEqual({
      position: [0, -1, 0],
      rotation: [0, 0, 0],
      scale: 17,
    });
    expect(sceneLayouts.desktop.contact).toEqual({
      position: [0, -0.1, 0],
      rotation: [0, 0, 0],
      scale: 19,
    });
  });

  it.each([
    "mobile",
    "tablet",
    "desktop",
  ] as const)("defines twelve unique stickers for %s", (family) => {
    const stickers = sceneLayouts[family].stickers;
    expect(stickers).toHaveLength(12);
    expect(new Set(stickers.map((sticker) => sticker.id)).size).toBe(12);
    expect(new Set(stickers.map((sticker) => sticker.atlasTile)).size).toBe(12);
    expect(new Set(stickers.map((sticker) => sticker.position.join(","))).size).toBe(12);
    expect(new Set(stickers.map((sticker) => sticker.rotation.join(","))).size).toBe(12);
    expect(new Set(stickers.map((sticker) => sticker.scale)).size).toBe(12);
  });
});

describe("resolveHeroSceneLayout", () => {
  it("preserves the base transform at regular desktop heights", () => {
    expect(resolveHeroSceneLayout(1308, 720)).toEqual(sceneLayouts.desktop.hero);
  });

  it("enlarges and lifts the hero on wide, short viewports", () => {
    const layout = resolveHeroSceneLayout(1308, 515);

    expect(layout.scale).toBeCloseTo(42.4, 1);
    expect(layout.position[0]).toBeCloseTo(6.3, 1);
    expect(layout.position[1]).toBeCloseTo(10.4, 1);
    expect(layout.rotation).toEqual(sceneLayouts.desktop.hero.rotation);
  });

  it("keeps the full compact composition on ultra-wide desktop viewports", () => {
    const layout = resolveHeroSceneLayout(2048, 686);

    expect(layout.scale).toBeCloseTo(42.4, 1);
    expect(layout.position[0]).toBeCloseTo(6.3, 1);
    expect(layout.position[1]).toBeCloseTo(10.4, 1);
  });

  it("does not alter the mobile hero", () => {
    expect(resolveHeroSceneLayout(390, 515)).toEqual(sceneLayouts.mobile.hero);
  });
});

describe("principleSceneLayouts", () => {
  it("defines all four deterministic scene states", () => {
    expect(principleSceneLayouts).toEqual({
      positioning: { stickerVisibility: 0 },
      design: { stickerVisibility: 0 },
      principles: { stickerVisibility: 0.9 },
      technology: { stickerVisibility: 0.35 },
    });
  });
});
