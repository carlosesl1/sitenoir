import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ENTRY_SYMBOL_WAIT_TIMEOUT_MS,
  SITE_CANVAS_BOOT_DELAY_MS,
  scheduleSiteCanvasBoot,
  waitForEntrySymbol,
} from "@/scene/site-canvas-boot";

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

  it("mounts the entry scene only after the preloader symbol finishes", async () => {
    const activate = vi.fn();
    const cleanup = waitForEntrySymbol({ activate, root: document.documentElement });

    await vi.advanceTimersByTimeAsync(ENTRY_SYMBOL_WAIT_TIMEOUT_MS - 1);
    expect(activate).not.toHaveBeenCalled();

    document.documentElement.dataset["entrySymbolComplete"] = "true";
    await vi.advanceTimersByTimeAsync(0);
    expect(activate).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(ENTRY_SYMBOL_WAIT_TIMEOUT_MS);
    expect(activate).toHaveBeenCalledTimes(1);
    cleanup();
    delete document.documentElement.dataset["entrySymbolComplete"];
  });

  it("falls back to a timeout so the entry scene never stays blocked", async () => {
    const activate = vi.fn();
    waitForEntrySymbol({ activate, root: document.documentElement });

    await vi.advanceTimersByTimeAsync(ENTRY_SYMBOL_WAIT_TIMEOUT_MS);
    expect(activate).toHaveBeenCalledTimes(1);
  });
});
