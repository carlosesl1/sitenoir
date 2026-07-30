import { act, cleanup, render } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  useWorkCardAnimation,
  type WorkCardAnimationFrame,
  WorkCardAnimationProvider,
} from "@/components/work/work-card-animation-controller";

class TestIntersectionObserver implements IntersectionObserver {
  static current: TestIntersectionObserver | null = null;

  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[];
  readonly callback: IntersectionObserverCallback;
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold ?? 0];
    TestIntersectionObserver.current = this;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  emit(target: Element, isIntersecting: boolean) {
    const bounds = target.getBoundingClientRect();
    this.callback(
      [
        {
          boundingClientRect: bounds,
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: isIntersecting ? bounds : new DOMRectReadOnly(),
          isIntersecting,
          rootBounds: null,
          target,
          time: performance.now(),
        },
      ],
      this,
    );
  }
}

function RegisteredCard({
  callback,
}: {
  readonly callback: (frame: WorkCardAnimationFrame) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { registerCard } = useWorkCardAnimation();

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    return registerCard(card, callback);
  }, [callback, registerCard]);

  return <div ref={cardRef} data-testid="card" />;
}

describe("WorkCardAnimationProvider", () => {
  let hidden = false;
  let nextFrame = 0;
  let frames: Map<number, FrameRequestCallback>;

  beforeEach(() => {
    hidden = false;
    nextFrame = 0;
    frames = new Map();
    TestIntersectionObserver.current = null;
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      const frame = ++nextFrame;
      frames.set(frame, callback);
      return frame;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frame) => {
      frames.delete(frame);
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("observes nearby cards, shares frames, pauses while hidden, and resets offscreen cards", () => {
    const callback = vi.fn<(frame: WorkCardAnimationFrame) => void>();
    const view = render(
      <WorkCardAnimationProvider>
        <RegisteredCard callback={callback} />
      </WorkCardAnimationProvider>,
    );
    const card = view.getByTestId("card");
    const observer = TestIntersectionObserver.current;
    expect(observer).not.toBeNull();
    if (!observer) return;

    expect(observer.rootMargin).toBe("25% 0px");
    expect(observer.observe).toHaveBeenCalledWith(card);

    act(() => observer.emit(card, true));
    const firstFrameId = nextFrame;
    const firstFrame = frames.get(firstFrameId);
    expect(firstFrame).toBeDefined();
    frames.delete(firstFrameId);
    act(() => firstFrame?.(16));
    expect(callback).toHaveBeenCalledWith({ scrollSpeed: 0, time: 16 });

    act(() => window.dispatchEvent(new Event("scroll")));
    hidden = true;
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    expect(frames.size).toBe(0);

    hidden = false;
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(frames.size).toBe(1);

    act(() => observer.emit(card, false));
    expect(callback).toHaveBeenLastCalledWith({ scrollSpeed: 0, time: expect.any(Number) });

    view.unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(frames.size).toBe(0);
  });
});
