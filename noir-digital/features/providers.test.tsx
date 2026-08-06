import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AudioProvider, useAudio } from "@/features/audio/AudioProvider";
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

class FakeAudio extends EventTarget {
  static instances: FakeAudio[] = [];
  static rejectPlayback = false;
  static deferPlayback = false;
  static resolvePlayback: (() => void) | null = null;
  static rejectDeferredPlayback: (() => void) | null = null;

  readonly src: string;
  loop = false;
  paused = true;
  preload = "auto";
  volume = 1;

  constructor(src: string) {
    super();
    this.src = src;
    FakeAudio.instances.push(this);
  }

  pause = vi.fn(() => {
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  });

  play = vi.fn(async () => {
    if (FakeAudio.deferPlayback) {
      await new Promise<void>((resolve, reject) => {
        FakeAudio.resolvePlayback = resolve;
        FakeAudio.rejectDeferredPlayback = () => reject(new Error("Playback interrupted"));
      });
    }

    if (FakeAudio.rejectPlayback) {
      throw new Error("Autoplay denied");
    }

    this.paused = false;
    this.dispatchEvent(new Event("playing"));
  });
}

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
  const { resolvedTheme, setTheme, theme } = useTheme();

  return (
    <div>
      <output>{`${theme}:${resolvedTheme}`}</output>
      <button type="button" onClick={() => setTheme("light")}>
        Set light
      </button>
    </div>
  );
}

function AudioHarness() {
  const { isPlaying, sound, toggle } = useAudio();

  return (
    <button type="button" aria-pressed={sound === "on"} onClick={toggle}>
      {`${sound}:${isPlaying ? "playing" : "paused"}`}
    </button>
  );
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
  FakeAudio.instances = [];
  FakeAudio.rejectPlayback = false;
  FakeAudio.deferPlayback = false;
  FakeAudio.resolvePlayback = null;
  FakeAudio.rejectDeferredPlayback = null;
  lenisMock.construct.mockClear();
  lenisMock.destroy.mockClear();
  lenisMock.isScrolling = false;
  lenisMock.raf.mockClear();
  lenisMock.scrollTo.mockClear();
  lenisMock.unsubscribe.mockClear();
  lenisMock.virtualScrollListener = null;
  installMatchMedia();
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset["entryReady"];
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ThemeProvider", () => {
  it("continues in memory when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    expect(screen.getByText("system:light")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Set light" }));
    expect(screen.getByText("light:light")).toBeInTheDocument();
  });

  it("keeps its server snapshot deterministic when browser storage differs", () => {
    localStorage.setItem("theme", "light");

    expect(
      renderToString(
        <ThemeProvider>
          <ThemeHarness />
        </ThemeProvider>,
      ),
    ).toContain("system:dark");
  });

  it("resolves the stored mode and synchronizes the document root", () => {
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    expect(screen.getByText("dark:dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    fireEvent.click(screen.getByRole("button", { name: "Set light" }));

    expect(screen.getByText("light:light")).toBeInTheDocument();
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).toHaveClass("light");
  });

  it("does not overwrite the bootstrapped theme with the server default during hydration", () => {
    localStorage.setItem("theme", "light");
    document.documentElement.dataset["theme"] = "light";
    document.documentElement.className = "light";
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    expect(screen.getByText("light:light")).toBeInTheDocument();
    expect(setItem).not.toHaveBeenCalledWith("theme", "system");
  });

  it("resolves system mode through the color-scheme preference", () => {
    installMatchMedia({ dark: true });
    localStorage.setItem("theme", "system");

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    expect(screen.getByText("system:dark")).toBeInTheDocument();
  });

  it("observes color-scheme changes while system mode is active", () => {
    const media = installMatchMedia();
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    act(() => media.setMatches("(prefers-color-scheme: dark)", true));

    expect(screen.getByText("system:dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});

describe("AudioProvider", () => {
  it("continues in memory when browser storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });

    render(
      <AudioProvider>
        <AudioHarness />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("on:playing"));
  });

  it("keeps its server snapshot paused when sound is persisted on", () => {
    localStorage.setItem("sound", "on");

    expect(
      renderToString(
        <AudioProvider>
          <AudioHarness />
        </AudioProvider>,
      ),
    ).toContain("off:paused");
  });

  it("creates one configured track only after user input", async () => {
    localStorage.setItem("theme", "dark");
    render(
      <AudioProvider>
        <AudioHarness />
      </AudioProvider>,
    );

    expect(FakeAudio.instances).toHaveLength(0);
    expect(screen.getByRole("button")).toHaveTextContent("off:paused");

    fireEvent.click(screen.getByRole("button"));
    const audio = FakeAudio.instances.at(0);
    expect(audio).toBeDefined();
    if (!audio) return;

    expect(audio.src).toContain("/assets/v1/audio/bgm.mp3");
    expect(audio.loop).toBe(true);
    expect(audio.preload).toBe("none");
    expect(audio.volume).toBe(0.35);
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("on:playing"));

    expect(localStorage.getItem("sound")).toBe("on");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("returns to off when playback is rejected", async () => {
    FakeAudio.rejectPlayback = true;
    render(
      <AudioProvider>
        <AudioHarness />
      </AudioProvider>,
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("off:paused"));
    expect(localStorage.getItem("sound")).toBe("off");
  });

  it("resumes a persisted preference only after a permitted interaction", async () => {
    localStorage.setItem("sound", "on");
    render(
      <AudioProvider>
        <AudioHarness />
      </AudioProvider>,
    );
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("on:paused"));
    expect(FakeAudio.instances).toHaveLength(0);

    fireEvent.pointerDown(window);
    const audio = FakeAudio.instances.at(0);
    expect(audio).toBeDefined();
    if (!audio) return;
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("on:playing"));
  });

  it("deduplicates simultaneous persisted-audio unlock gestures", async () => {
    FakeAudio.deferPlayback = true;
    localStorage.setItem("sound", "on");
    render(
      <AudioProvider>
        <AudioHarness />
      </AudioProvider>,
    );
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("on:paused"));

    fireEvent.pointerDown(window);
    fireEvent.keyDown(window, { key: "Enter" });
    const audio = FakeAudio.instances.at(0);
    expect(audio).toBeDefined();
    if (!audio) return;

    expect(audio.play).toHaveBeenCalledTimes(1);
    await act(async () => FakeAudio.resolvePlayback?.());
    expect(audio.pause).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toHaveTextContent("on:playing");
  });

  it("tracks native pause and error events", async () => {
    render(
      <AudioProvider>
        <AudioHarness />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    const audio = FakeAudio.instances.at(0);
    expect(audio).toBeDefined();
    if (!audio) return;
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("on:playing"));

    act(() => audio.pause());
    expect(screen.getByRole("button")).toHaveTextContent("on:paused");

    act(() => audio.dispatchEvent(new Event("error")));
    expect(screen.getByRole("button")).toHaveTextContent("off:paused");
    expect(localStorage.getItem("sound")).toBe("off");
  });

  it("ignores a pending playback rejection after unmount", async () => {
    FakeAudio.deferPlayback = true;
    const view = render(
      <AudioProvider>
        <AudioHarness />
      </AudioProvider>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(localStorage.getItem("sound")).toBe("on");
    view.unmount();

    await act(async () => FakeAudio.rejectDeferredPlayback?.());
    expect(localStorage.getItem("sound")).toBe("on");
  });

  it("keeps a superseded pending playback paused after it resolves", async () => {
    FakeAudio.deferPlayback = true;
    render(
      <AudioProvider>
        <AudioHarness />
      </AudioProvider>,
    );

    fireEvent.click(screen.getByRole("button"));
    const audio = FakeAudio.instances.at(0);
    expect(audio).toBeDefined();
    if (!audio) return;

    fireEvent.click(screen.getByRole("button"));
    await act(async () => FakeAudio.resolvePlayback?.());

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.paused).toBe(true);
    expect(screen.getByRole("button")).toHaveTextContent("off:paused");
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
    ["AudioProvider", useAudio],
    ["ScrollProvider", useScroll],
  ] as const)("throws a named error outside %s", (providerName, hook) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<MissingProviderHarness hook={hook} />)).toThrow(providerName);
  });
});
