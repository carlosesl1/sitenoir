import { describe, expect, it } from "vitest";

import { resolveEntryLoadProgress } from "@/components/preloader/entry-preloader-state";

describe("entry preloader", () => {
  it("combines document and font readiness without waiting for WebGL", () => {
    expect(resolveEntryLoadProgress({ documentReady: false, fontsReady: false })).toBe(0);
    expect(resolveEntryLoadProgress({ documentReady: false, fontsReady: true })).toBe(50);
    expect(resolveEntryLoadProgress({ documentReady: true, fontsReady: true })).toBe(100);
  });
});
