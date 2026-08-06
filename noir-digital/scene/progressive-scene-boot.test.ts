import { afterEach, describe, expect, it, vi } from "vitest";

import { scheduleProgressiveSceneBoot } from "@/scene/progressive-scene-boot";

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset["entryReady"];
});

describe("progressive scene boot", () => {
  it("waits for the entry reveal and every headline line before scheduling idle work", async () => {
    document.documentElement.dataset["entryReady"] = "false";
    const heading = document.createElement("h1");
    const firstLine = document.createElement("span");
    const secondLine = document.createElement("span");
    firstLine.dataset["heroScramble"] = "true";
    firstLine.dataset["scrambleState"] = "running";
    secondLine.dataset["heroScramble"] = "true";
    secondLine.dataset["scrambleState"] = "waiting";
    heading.append(firstLine, secondLine);

    let idleCallback: IdleRequestCallback | undefined;
    const requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      idleCallback = callback;
      return 7;
    });
    const cancelIdleCallback = vi.fn();
    vi.stubGlobal("requestIdleCallback", requestIdleCallback);
    vi.stubGlobal("cancelIdleCallback", cancelIdleCallback);
    const activate = vi.fn();

    const cancel = scheduleProgressiveSceneBoot({
      activate,
      heading,
      root: document.documentElement,
    });

    expect(requestIdleCallback).not.toHaveBeenCalled();

    document.documentElement.dataset["entryReady"] = "true";
    firstLine.dataset["scrambleState"] = "settled";
    await Promise.resolve();
    expect(requestIdleCallback).not.toHaveBeenCalled();

    secondLine.dataset["scrambleState"] = "settled";
    await Promise.resolve();

    expect(requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 1_500 });
    expect(activate).not.toHaveBeenCalled();

    idleCallback?.({ didTimeout: false, timeRemaining: () => 10 });
    expect(activate).toHaveBeenCalledOnce();

    cancel();
    expect(cancelIdleCallback).toHaveBeenCalledWith(7);
  });

  it("cancels observers before the deferred scene becomes eligible", async () => {
    document.documentElement.dataset["entryReady"] = "false";
    const heading = document.createElement("h1");
    const line = document.createElement("span");
    line.dataset["heroScramble"] = "true";
    line.dataset["scrambleState"] = "running";
    heading.append(line);
    const requestIdleCallback = vi.fn();
    vi.stubGlobal("requestIdleCallback", requestIdleCallback);
    vi.stubGlobal("cancelIdleCallback", vi.fn());

    const cancel = scheduleProgressiveSceneBoot({
      activate: vi.fn(),
      heading,
      root: document.documentElement,
    });
    cancel();

    document.documentElement.dataset["entryReady"] = "true";
    line.dataset["scrambleState"] = "settled";
    await Promise.resolve();

    expect(requestIdleCallback).not.toHaveBeenCalled();
  });
});
