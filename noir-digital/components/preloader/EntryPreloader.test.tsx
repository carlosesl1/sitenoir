import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EntryPreloader } from "@/components/preloader/EntryPreloader";

const motionPreference = vi.hoisted(() => ({ reduced: false }));
const symbolControl = vi.hoisted(() => ({ complete: null as (() => void) | null }));

vi.mock("motion/react", () => ({
  useReducedMotion: () => motionPreference.reduced,
}));

vi.mock("@/components/preloader/NoirSymbolPreloaderMark", () => ({
  NoirSymbolPreloaderMark: ({ onComplete }: { onComplete: () => void }) => {
    symbolControl.complete = onComplete;
    return <svg data-testid="mock-symbol-preloader" />;
  },
}));

describe("EntryPreloader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    motionPreference.reduced = false;
    symbolControl.complete = null;
    window.__NOIR_READY__ = true;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    delete window.__NOIR_READY__;
    delete document.documentElement.dataset["entryLoading"];
    delete document.documentElement.dataset["entryTextReady"];
    delete document.documentElement.dataset["entryReady"];
    delete document.documentElement.dataset["routeTransition"];
    delete document.documentElement.dataset["sceneReady"];
  });

  it("starts the hero text 360ms before the faster opening reveal finishes", async () => {
    render(<EntryPreloader />);
    act(() => symbolControl.complete?.());
    window.dispatchEvent(new Event("load"));

    await act(async () => vi.advanceTimersByTimeAsync(20));
    await act(async () => vi.advanceTimersByTimeAsync(80));
    await act(async () => vi.advanceTimersByTimeAsync(159));

    expect(document.documentElement.dataset["entryTextReady"]).toBeUndefined();
    expect(document.documentElement.dataset["entryReady"]).toBeUndefined();

    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(document.documentElement.dataset["entryTextReady"]).toBe("true");
    expect(document.documentElement.dataset["entryReady"]).toBeUndefined();

    await act(async () => vi.advanceTimersByTimeAsync(360));
    expect(document.documentElement.dataset["entryReady"]).toBe("true");
  });

  it("unlocks document overflow after the reveal finishes", async () => {
    const view = render(<EntryPreloader />);
    act(() => symbolControl.complete?.());
    window.dispatchEvent(new Event("load"));

    expect(document.documentElement.dataset["entryLoading"]).toBe("true");

    await act(async () => vi.advanceTimersByTimeAsync(20));
    await act(async () => vi.advanceTimersByTimeAsync(80));
    await act(async () => vi.advanceTimersByTimeAsync(520));

    expect(view.container.firstChild).toBeNull();
    expect(document.documentElement.dataset["entryLoading"]).toBeUndefined();
  });

  it("does not keep usable HTML covered while the WebGL scene is pending", async () => {
    window.__NOIR_READY__ = false;
    const view = render(<EntryPreloader />);
    act(() => symbolControl.complete?.());
    window.dispatchEvent(new Event("load"));

    await act(async () => vi.advanceTimersByTimeAsync(20));
    await act(async () => vi.advanceTimersByTimeAsync(80));
    await act(async () => vi.advanceTimersByTimeAsync(520));

    expect(view.container.firstChild).toBeNull();
    expect(document.documentElement.dataset["entryLoading"]).toBeUndefined();
  });

  it("keeps the site covered until the symbol is ready", async () => {
    const view = render(<EntryPreloader />);

    await act(async () => vi.advanceTimersByTimeAsync(4_000));

    expect(view.getByTestId("mock-symbol-preloader")).toBeInTheDocument();
    expect(view.container.firstChild).not.toBeNull();
    expect(document.documentElement.dataset["entryReady"]).toBeUndefined();

    act(() => symbolControl.complete?.());
    await act(async () => vi.advanceTimersByTimeAsync(80));
    await act(async () => vi.advanceTimersByTimeAsync(520));

    expect(view.container.firstChild).toBeNull();
  });

  it("does not begin the transition until the reveal shader warmup is ready", async () => {
    let idleCallback: IdleRequestCallback | undefined;
    vi.stubGlobal(
      "requestIdleCallback",
      vi.fn((callback: IdleRequestCallback) => {
        idleCallback = callback;
        return 23;
      }),
    );
    vi.stubGlobal("cancelIdleCallback", vi.fn());

    const view = render(<EntryPreloader />);
    act(() => symbolControl.complete?.());
    await act(async () => vi.advanceTimersByTimeAsync(2_000));

    expect(view.container.firstChild).not.toBeNull();
    expect(document.documentElement.dataset["entryReady"]).toBeUndefined();

    act(() => idleCallback?.({ didTimeout: false, timeRemaining: () => 10 }));
    await act(async () => vi.advanceTimersByTimeAsync(80));
    await act(async () => vi.advanceTimersByTimeAsync(520));

    expect(view.container.firstChild).toBeNull();
    expect(document.documentElement.dataset["entryReady"]).toBe("true");
  });

  it("does not wait for the scene and skips the reveal animation with reduced motion", async () => {
    motionPreference.reduced = true;
    window.__NOIR_READY__ = false;
    const setTimeout = vi.spyOn(window, "setTimeout");

    const view = render(<EntryPreloader />);

    await act(async () => Promise.resolve());

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
