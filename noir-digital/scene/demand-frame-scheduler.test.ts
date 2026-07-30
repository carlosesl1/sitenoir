import { afterEach, describe, expect, it, vi } from "vitest";

import { startDemandFrameScheduler } from "@/scene/demand-frame-scheduler";

describe("demand frame scheduler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("idles, wakes on activity, pauses while hidden, and cleans up", () => {
    let hidden = false;
    let now = 0;
    let nextFrame = 0;
    const frames = new Map<number, FrameRequestCallback>();
    const scrollListeners = new Set<() => void>();
    const unsubscribe = vi.fn();
    const invalidate = vi.fn();
    const setAttribute = vi.spyOn(document.documentElement, "setAttribute");
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      const frame = ++nextFrame;
      frames.set(frame, callback);
      return frame;
    });
    const cancelAnimationFrame = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation((frame) => {
        frames.delete(frame);
      });

    const cleanup = startDemandFrameScheduler({
      idleWindowMs: 100,
      invalidate,
      reducedMotion: false,
      scrollProgress: {
        on: (_event, listener) => {
          scrollListeners.add(listener);
          return unsubscribe;
        },
      },
    });

    now = 5_001;
    const initialFrame = frames.get(1);
    expect(initialFrame).toBeDefined();
    initialFrame?.(now);
    expect(invalidate).toHaveBeenCalledTimes(1);

    now = 6_000;
    window.dispatchEvent(new Event("pointermove"));
    const activeFrameId = nextFrame;
    frames.get(activeFrameId)?.(now);

    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(cancelAnimationFrame).toHaveBeenCalled();

    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(frames.size).toBeGreaterThan(0);

    cleanup();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(setAttribute).not.toHaveBeenCalledWith("data-scene-active", expect.anything());
  });

  it("keeps pointer settling bounded while preserving the longer scroll settling window", () => {
    let now = 10_000;
    let nextFrame = 0;
    const frames = new Map<number, FrameRequestCallback>();
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      const frame = ++nextFrame;
      frames.set(frame, callback);
      return frame;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frame) => {
      frames.delete(frame);
    });

    const cleanup = startDemandFrameScheduler({
      idleWindowMs: 1_800,
      invalidate: vi.fn(),
      reducedMotion: false,
      scrollProgress: { on: () => vi.fn() },
    });

    now = 20_000;
    frames.get(1)?.(now);
    window.dispatchEvent(new Event("pointermove"));
    frames.get(nextFrame)?.(now);
    now += 601;
    const pointerSettleFrame = nextFrame;
    frames.get(nextFrame)?.(now);
    expect(nextFrame).toBe(pointerSettleFrame);

    window.dispatchEvent(new MouseEvent("pointerout", { relatedTarget: null }));
    frames.get(nextFrame)?.(now);
    now += 601;
    const scrollSettleFrame = nextFrame;
    frames.get(nextFrame)?.(now);
    expect(nextFrame).toBeGreaterThan(scrollSettleFrame);

    cleanup();
  });
});
