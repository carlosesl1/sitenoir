import { describe, expect, it } from "vitest";

import { canRevealEntry } from "@/components/preloader/entry-preloader-state";

const ready = {
  documentReady: true,
  fontsReady: true,
  sceneReady: true,
  symbolReady: true,
  revealReady: true,
  reducedMotion: false,
};

describe("entry preloader gates", () => {
  it("requires every normal-motion gate", () => {
    expect(canRevealEntry(ready)).toBe(true);

    for (const key of [
      "documentReady",
      "fontsReady",
      "sceneReady",
      "symbolReady",
      "revealReady",
    ] as const) {
      expect(canRevealEntry({ ...ready, [key]: false })).toBe(false);
    }
  });

  it("skips animated gates, but not loading gates, for reduced motion", () => {
    expect(
      canRevealEntry({
        ...ready,
        symbolReady: false,
        revealReady: false,
        reducedMotion: true,
      }),
    ).toBe(true);
    expect(
      canRevealEntry({
        ...ready,
        sceneReady: false,
        symbolReady: false,
        revealReady: false,
        reducedMotion: true,
      }),
    ).toBe(false);
  });
});
