import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EntryPreloader } from "@/components/preloader/EntryPreloader";

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock("motion/react", () => ({
  useReducedMotion: () => motionPreference.reduced,
}));

describe("EntryPreloader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    motionPreference.reduced = false;
    window.__NOIR_READY__ = true;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete window.__NOIR_READY__;
    delete document.documentElement.dataset["entryLoading"];
    delete document.documentElement.dataset["entryTextReady"];
    delete document.documentElement.dataset["entryReady"];
    delete document.documentElement.dataset["routeTransition"];
  });

  it("starts the hero text 500ms before the opening reveal finishes", async () => {
    render(<EntryPreloader />);
    window.dispatchEvent(new Event("load"));

    await act(async () => vi.advanceTimersByTimeAsync(20));
    await act(async () => vi.advanceTimersByTimeAsync(250));
    await act(async () => vi.advanceTimersByTimeAsync(299));

    expect(document.documentElement.dataset["entryTextReady"]).toBeUndefined();
    expect(document.documentElement.dataset["entryReady"]).toBeUndefined();

    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(document.documentElement.dataset["entryTextReady"]).toBe("true");
    expect(document.documentElement.dataset["entryReady"]).toBeUndefined();

    await act(async () => vi.advanceTimersByTimeAsync(500));
    expect(document.documentElement.dataset["entryReady"]).toBe("true");
  });

  it("unlocks document overflow after the reveal finishes", async () => {
    const view = render(<EntryPreloader />);
    window.dispatchEvent(new Event("load"));

    expect(document.documentElement.dataset["entryLoading"]).toBe("true");

    await act(async () => vi.advanceTimersByTimeAsync(20));
    await act(async () => vi.advanceTimersByTimeAsync(250));
    await act(async () => vi.advanceTimersByTimeAsync(800));

    expect(view.container.firstChild).toBeNull();
    expect(document.documentElement.dataset["entryLoading"]).toBeUndefined();
  });

  it("reveals the site when scene readiness exceeds the hard timeout", async () => {
    window.__NOIR_READY__ = false;
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
    const view = render(<EntryPreloader />);
    window.dispatchEvent(new Event("load"));

    await act(async () => vi.advanceTimersByTimeAsync(4_000));
    expect(cancelAnimationFrame).toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTimeAsync(250));
    await act(async () => vi.advanceTimersByTimeAsync(800));

    expect(view.container.firstChild).toBeNull();
    expect(document.documentElement.dataset["entryLoading"]).toBeUndefined();
  });

  it("skips the wait and WebGL reveal when reduced motion is preferred", () => {
    motionPreference.reduced = true;
    const setTimeout = vi.spyOn(window, "setTimeout");

    const view = render(<EntryPreloader />);

    expect(view.container.firstChild).toBeNull();
    expect(document.documentElement.dataset["entryLoading"]).toBeUndefined();
    expect(setTimeout).not.toHaveBeenCalled();
  });

  it("does not replay the loading sequence during a route transition", () => {
    document.documentElement.dataset["routeTransition"] = "true";
    const setTimeout = vi.spyOn(window, "setTimeout");

    const view = render(<EntryPreloader />);

    expect(view.container.firstChild).toBeNull();
    expect(document.documentElement.dataset["entryLoading"]).toBeUndefined();
    expect(setTimeout).not.toHaveBeenCalled();
  });
});
