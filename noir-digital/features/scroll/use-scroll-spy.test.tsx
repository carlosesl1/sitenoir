import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollSpy } from "@/features/scroll/use-scroll-spy";

class TestIntersectionObserver implements IntersectionObserver {
  static current: TestIntersectionObserver | null = null;

  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds = [0];
  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly takeRecords = vi.fn(() => []);
  readonly unobserve = vi.fn();

  constructor(
    readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.rootMargin = options?.rootMargin ?? "0px";
    TestIntersectionObserver.current = this;
  }

  emit(items: readonly { id: string; isIntersecting: boolean }[]) {
    this.callback(
      items.map(({ id, isIntersecting }) => ({
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: {} as DOMRectReadOnly,
        isIntersecting,
        rootBounds: null,
        target: document.getElementById(id) as Element,
        time: 0,
      })),
      this,
    );
  }
}

const ids = ["sites", "videos", "google", "social"] as const;

beforeEach(() => {
  document.body.innerHTML = ids.map((id) => `<section id="${id}"></section>`).join("");
  vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  TestIntersectionObserver.current = null;
});

describe("useScrollSpy", () => {
  it("starts with the requested id and observes every existing target", () => {
    const { result } = renderHook(() => useScrollSpy({ ids, initialId: "sites" }));

    expect(result.current).toBe("sites");
    expect(TestIntersectionObserver.current?.rootMargin).toBe("-18% 0px -72% 0px");
    expect(TestIntersectionObserver.current?.observe).toHaveBeenCalledTimes(4);
  });

  it("selects the last intersecting id in document order", () => {
    const { result } = renderHook(() => useScrollSpy({ ids, initialId: "sites" }));

    act(() => {
      TestIntersectionObserver.current?.emit([
        { id: "videos", isIntersecting: true },
        { id: "google", isIntersecting: true },
      ]);
    });

    expect(result.current).toBe("google");
  });

  it("disconnects on cleanup and falls back without IntersectionObserver", () => {
    const { unmount } = renderHook(() => useScrollSpy({ ids, initialId: "sites" }));
    const observer = TestIntersectionObserver.current;
    unmount();
    expect(observer?.disconnect).toHaveBeenCalledOnce();

    vi.stubGlobal("IntersectionObserver", undefined);
    const fallback = renderHook(() => useScrollSpy({ ids, initialId: "sites" }));
    expect(fallback.result.current).toBe("sites");
  });
});
