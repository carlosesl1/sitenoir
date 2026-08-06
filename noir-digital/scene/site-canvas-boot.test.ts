import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SITE_CANVAS_BOOT_DELAY_MS, scheduleSiteCanvasBoot } from "@/scene/site-canvas-boot";

describe("site canvas boot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete document.documentElement.dataset["entryTextReady"];
    delete document.documentElement.dataset["entryReady"];
  });

  afterEach(() => {
    vi.useRealTimers();
    delete document.documentElement.dataset["entryTextReady"];
    delete document.documentElement.dataset["entryReady"];
  });

  it("keeps the WebGL bundle behind the completed entry reveal", async () => {
    const activate = vi.fn();
    const cleanup = scheduleSiteCanvasBoot({
      activate,
      root: document.documentElement,
      waitForEntryReveal: true,
    });

    vi.advanceTimersByTime(SITE_CANVAS_BOOT_DELAY_MS * 2);
    expect(activate).not.toHaveBeenCalled();

    document.documentElement.dataset["entryTextReady"] = "true";
    await vi.advanceTimersByTimeAsync(SITE_CANVAS_BOOT_DELAY_MS * 2);
    expect(activate).not.toHaveBeenCalled();

    document.documentElement.dataset["entryReady"] = "true";
    await vi.advanceTimersByTimeAsync(SITE_CANVAS_BOOT_DELAY_MS - 1);
    expect(activate).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(activate).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it("boots automatically without viewport observation on routes without the entry reveal", () => {
    const activate = vi.fn();

    scheduleSiteCanvasBoot({
      activate,
      root: document.documentElement,
      waitForEntryReveal: false,
    });

    vi.advanceTimersByTime(SITE_CANVAS_BOOT_DELAY_MS);
    expect(activate).toHaveBeenCalledTimes(1);
  });
});
