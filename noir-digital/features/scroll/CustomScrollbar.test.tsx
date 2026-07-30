import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomScrollbar } from "@/features/scroll/CustomScrollbar";

describe("CustomScrollbar", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("updates on demand instead of keeping a permanent animation loop", () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrame = 0;
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        const frame = ++nextFrame;
        callbacks.set(frame, callback);
        return frame;
      });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frame) => {
      callbacks.delete(frame);
    });

    render(<CustomScrollbar />);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    callbacks.get(1)?.(performance.now());
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    fireEvent.scroll(window);
    fireEvent.scroll(window);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    callbacks.get(2)?.(performance.now());
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
  });
});
