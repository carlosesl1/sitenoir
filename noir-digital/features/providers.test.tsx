import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createPointerStore,
  type PointerStore,
  usePointerSnapshot,
} from "@/features/pointer/pointer-store";
import { ScrollProvider, useScroll } from "@/features/scroll/ScrollProvider";
import { ThemeProvider, useTheme } from "@/features/theme/ThemeProvider";

const lenisMock = vi.hoisted(() => ({
  construct: vi.fn(),
  destroy: vi.fn(),
  isScrolling: false as boolean | "native" | "smooth",
  raf: vi.fn(),
  scrollTo: vi.fn(),
  unsubscribe: vi.fn(),
  virtualScrollListener: null as (() => void) | null,
}));

vi.mock("lenis", () => ({
  default: class LenisMock {
    constructor(options?: unknown) {
      lenisMock.construct(options);
    }

    destroy() {
      lenisMock.destroy();
    }

    get isScrolling() {
      return lenisMock.isScrolling;
    }

    on(event: string, listener: () => void) {
      if (event === "virtual-scroll") lenisMock.virtualScrollListener = listener;
      return lenisMock.unsubscribe;
    }

    raf(time: number) {
      lenisMock.raf(time);
    }

    scrollTo(target: unknown) {
      lenisMock.scrollTo(target);
    }
  },
}));

function installMatchMedia({ dark = false, reducedMotion = false } = {}) {
  const records = new Map<string, { matches: boolean; readonly listeners: Set<() => void> }>();
  const matchMedia = vi.fn((query: string) => {
    let record = records.get(query);
    if (!record) {
      record = {
        matches: query.includes("prefers-color-scheme") ? dark : reducedMotion,
        listeners: new Set(),
      };
      records.set(query, record);
    }

    return {
      get matches() {
        return record.matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_eventName: string, listener: () => void) =>
        record.listeners.add(listener),
      removeEventListener: (_eventName: string, listener: () => void) =>
        record.listeners.delete(listener),
      addListener: (listener: () => void) => record.listeners.add(listener),
      removeListener: (listener: () => void) => record.listeners.delete(listener),
      dispatchEvent: vi.fn(() => true),
    };
  });

  vi.stubGlobal("matchMedia", matchMedia);
  return {
    matchMedia,
    setMatches(query: string, matches: boolean) {
      matchMedia(query);
      const record = records.get(query);
      if (!record) return;
      record.matches = matches;
      for (const listener of record.listeners) listener();
    },
  };
}

function ThemeHarness() {
  const { resolvedTheme } = useTheme();

  return <output>{resolvedTheme}</output>;
}

function ScrollHarness() {
  const { scrollTo } = useScroll();
  return (
    <button type="button" onClick={() => scrollTo("contact")}>
      Contact
    </button>
  );
}

function PointerHarness({ store }: { readonly store: PointerStore }) {
  const pointer = usePointerSnapshot(store);
  return <output>{`${pointer.normalizedX}:${pointer.normalizedY}`}</output>;
}

function MissingProviderHarness({ hook }: { readonly hook: () => unknown }) {
  hook();
  return null;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  delete document.documentElement.dataset["theme"];
  document.documentElement.dataset["entryReady"] = "true";
  lenisMock.construct.mockClear();
  lenisMock.destroy.mockClear();
  lenisMock.isScrolling = false;
  lenisMock.raf.mockClear();
  lenisMock.scrollTo.mockClear();
  lenisMock.unsubscribe.mockClear();
  lenisMock.virtualScrollListener = null;
  installMatchMedia();
});

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset["entryReady"];
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ThemeProvider", () => {
  it("always resolves to the single black appearance", () => {
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    expect(screen.getByText("dark")).toBeInTheDocument();
  });
});

describe("ScrollProvider", () => {
  it("defers Lenis until the entry reveal has unlocked the page", async () => {
    delete document.documentElement.dataset["entryReady"];

    render(
      <ScrollProvider>
        <ScrollHarness />
      </ScrollProvider>,
    );

    await act(async () => Promise.resolve());
    expect(lenisMock.construct).not.toHaveBeenCalled();

    act(() => {
      document.documentElement.dataset["entryReady"] = "true";
    });
    await waitFor(() => expect(lenisMock.construct).toHaveBeenCalledTimes(1));
  });

  it("owns, uses, and disposes one Lenis instance", async () => {
    const view = render(
      <ScrollProvider>
        <ScrollHarness />
      </ScrollProvider>,
    );

    await waitFor(() => expect(lenisMock.construct).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Contact" }));
    expect(lenisMock.scrollTo).toHaveBeenCalledWith("#contact");

    view.unmount();
    expect(lenisMock.destroy).toHaveBeenCalledTimes(1);
  });

  it("does not initialize Lenis when reduced motion is preferred", async () => {
    installMatchMedia({ reducedMotion: true });

    render(
      <ScrollProvider>
        <ScrollHarness />
      </ScrollProvider>,
    );

    await act(async () => Promise.resolve());
    expect(lenisMock.construct).not.toHaveBeenCalled();
  });

  it("reacts to reduced-motion preference changes", async () => {
    const media = installMatchMedia();
    const view = render(
      <ScrollProvider>
        <ScrollHarness />
      </ScrollProvider>,
    );
    await waitFor(() => expect(lenisMock.construct).toHaveBeenCalledTimes(1));

    act(() => media.setMatches("(prefers-reduced-motion: reduce)", true));
    expect(lenisMock.destroy).toHaveBeenCalledTimes(1);

    act(() => media.setMatches("(prefers-reduced-motion: reduce)", false));
    await waitFor(() => expect(lenisMock.construct).toHaveBeenCalledTimes(2));

    view.unmount();
    expect(lenisMock.destroy).toHaveBeenCalledTimes(2);
  });

  it("runs Lenis frames only while smooth scrolling is active", async () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrame = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      const frame = ++nextFrame;
      callbacks.set(frame, callback);
      return frame;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frame) => {
      callbacks.delete(frame);
    });

    render(
      <ScrollProvider>
        <ScrollHarness />
      </ScrollProvider>,
    );
    await waitFor(() => expect(lenisMock.construct).toHaveBeenCalledTimes(1));
    expect(nextFrame).toBe(1);

    callbacks.get(1)?.(100);
    lenisMock.isScrolling = true;
    act(() => lenisMock.virtualScrollListener?.());
    callbacks.get(2)?.(200);
    expect(lenisMock.raf).toHaveBeenCalledTimes(1);

    lenisMock.isScrolling = false;
    callbacks.get(3)?.(300);
    expect(lenisMock.raf).toHaveBeenCalledTimes(2);
    expect(nextFrame).toBe(3);
  });
});

describe("pointer store", () => {
  it("publishes immutable normalized pointer snapshots", () => {
    let scheduledFrame: FrameRequestCallback | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      scheduledFrame = callback;
      return 1;
    });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1000 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 500 });
    const store = createPointerStore();
    const initial = store.getSnapshot();

    render(<PointerHarness store={store} />);
    act(() => window.dispatchEvent(new MouseEvent("pointermove", { clientX: 750, clientY: 125 })));
    act(() => scheduledFrame?.(performance.now()));

    expect(screen.getByText("0.5:0.5")).toBeInTheDocument();
    expect(store.getSnapshot()).not.toBe(initial);
    expect(store.getSnapshot()).toEqual({
      clientX: 750,
      clientY: 125,
      inside: true,
      lastMovedAt: expect.any(Number),
      normalizedX: 0.5,
      normalizedY: 0.5,
    });

    act(() => window.dispatchEvent(new MouseEvent("pointerout")));
    expect(store.getSnapshot().inside).toBe(false);
  });

  it("coalesces rapid pointer samples into one notification per display frame", () => {
    let scheduledFrame: FrameRequestCallback | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      scheduledFrame = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {
      scheduledFrame = undefined;
    });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1000 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 500 });
    const store = createPointerStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 100, clientY: 100 }));
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 800, clientY: 200 }));

    expect(listener).not.toHaveBeenCalled();
    scheduledFrame?.(performance.now());
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toMatchObject({ clientX: 800, clientY: 200 });

    unsubscribe();
  });
});

describe("provider hooks", () => {
  it.each([
    ["ThemeProvider", useTheme],
    ["ScrollProvider", useScroll],
  ] as const)("throws a named error outside %s", (providerName, hook) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<MissingProviderHarness hook={hook} />)).toThrow(providerName);
  });
});
