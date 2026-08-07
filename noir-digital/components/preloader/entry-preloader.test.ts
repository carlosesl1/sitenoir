import { describe, expect, it } from "vitest";

import {
  advanceEntryDisplayProgress,
  ENTRY_PROGRESS_SCENE_CEILING,
  resolveEntryLoadProgress,
} from "@/components/preloader/entry-preloader-state";

describe("entry preloader", () => {
  it("reaches 100 only after the document, fonts, and 3D scene are ready", () => {
    expect(
      resolveEntryLoadProgress({ documentReady: false, fontsReady: false, sceneReady: false }),
    ).toBe(0);
    expect(
      resolveEntryLoadProgress({ documentReady: false, fontsReady: true, sceneReady: false }),
    ).toBeCloseTo(100 / 3);
    expect(
      resolveEntryLoadProgress({ documentReady: true, fontsReady: true, sceneReady: false }),
    ).toBeCloseTo(200 / 3);
    expect(
      resolveEntryLoadProgress({ documentReady: true, fontsReady: true, sceneReady: true }),
    ).toBe(100);
  });

  it("keeps the visible bar moving while the rendered 3D frame is pending", () => {
    const loadProgress = resolveEntryLoadProgress({
      documentReady: true,
      fontsReady: true,
      sceneReady: false,
    });

    const catchingUp = advanceEntryDisplayProgress({
      currentProgress: 40,
      elapsedMs: 100,
      loadProgress,
      sceneReady: false,
    });
    const waitingForScene = advanceEntryDisplayProgress({
      currentProgress: loadProgress,
      elapsedMs: 500,
      loadProgress,
      sceneReady: false,
    });

    expect(catchingUp).toBeGreaterThan(40);
    expect(waitingForScene).toBeGreaterThan(loadProgress);
    expect(waitingForScene).toBeLessThanOrEqual(ENTRY_PROGRESS_SCENE_CEILING);
  });

  it("completes the visible bar within the existing 250ms reveal delay", () => {
    expect(
      advanceEntryDisplayProgress({
        currentProgress: 66,
        elapsedMs: 250,
        loadProgress: 100,
        sceneReady: true,
      }),
    ).toBe(100);
  });
});
