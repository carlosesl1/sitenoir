import { describe, expect, it } from "vitest";

import { resolveEntryLoadProgress } from "@/components/preloader/entry-preloader-state";

describe("entry preloader", () => {
  it("combines fonts, document and scene readiness into source thirds", () => {
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
});
