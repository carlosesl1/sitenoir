import { afterEach, describe, expect, it, vi } from "vitest";

import { scheduleProgressiveSceneBoot } from "@/scene/progressive-scene-boot";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("progressive scene boot", () => {
  it("schedules the lower scene during idle time without a viewport observer", () => {
    let idleCallback: IdleRequestCallback | undefined;
    const requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      idleCallback = callback;
      return 7;
    });
    const cancelIdleCallback = vi.fn();
    vi.stubGlobal("requestIdleCallback", requestIdleCallback);
    vi.stubGlobal("cancelIdleCallback", cancelIdleCallback);
    const activate = vi.fn();

    const cancel = scheduleProgressiveSceneBoot(activate);

    expect(requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 1_500 });
    expect(activate).not.toHaveBeenCalled();

    idleCallback?.({ didTimeout: false, timeRemaining: () => 10 });
    expect(activate).toHaveBeenCalledOnce();

    cancel();
    expect(cancelIdleCallback).toHaveBeenCalledWith(7);
  });
});
