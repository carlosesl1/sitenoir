import { describe, expect, it, vi } from "vitest";

import { waitForRenderedFrame } from "@/scene/scene-first-frame";

describe("first rendered scene frame", () => {
  it("signals readiness only after the renderer frame advances", () => {
    let renderedFrame = 7;
    let nextFrameId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    const invalidate = vi.fn();
    const onRendered = vi.fn();
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      nextFrameId += 1;
      callbacks.set(nextFrameId, callback);
      return nextFrameId;
    });
    const cancelFrame = vi.fn((frameId: number) => callbacks.delete(frameId));

    waitForRenderedFrame({
      cancelFrame,
      invalidate,
      onRendered,
      readRenderedFrame: () => renderedFrame,
      requestFrame,
    });

    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(onRendered).not.toHaveBeenCalled();

    callbacks.get(1)?.(0);
    expect(onRendered).not.toHaveBeenCalled();
    expect(requestFrame).toHaveBeenCalledTimes(2);

    renderedFrame = 8;
    callbacks.get(2)?.(16);
    expect(onRendered).toHaveBeenCalledTimes(1);
    expect(requestFrame).toHaveBeenCalledTimes(2);
  });

  it("can be cancelled before the rendered frame arrives", () => {
    const callback = vi.fn<FrameRequestCallback>();
    const cancelFrame = vi.fn();
    const onRendered = vi.fn();
    const cancel = waitForRenderedFrame({
      cancelFrame,
      invalidate: vi.fn(),
      onRendered,
      readRenderedFrame: () => 3,
      requestFrame: (next) => {
        callback.mockImplementation(next);
        return 42;
      },
    });

    cancel();
    callback(16);

    expect(cancelFrame).toHaveBeenCalledWith(42);
    expect(onRendered).not.toHaveBeenCalled();
  });
});
