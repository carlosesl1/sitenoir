import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LazyWorkCardCanvas } from "@/components/work/LazyWorkCardCanvas";

vi.mock("next/dynamic", () => ({
  default: () =>
    function WorkCardCanvasMock({ className }: { readonly className: string | undefined }) {
      return <div className={className} data-testid="work-card-canvas" />;
    },
}));

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

  emit(isIntersecting: boolean) {
    const target = document.getElementById("selected-work");
    if (!target) return;
    this.callback(
      [
        {
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: {} as DOMRectReadOnly,
          isIntersecting,
          rootBounds: null,
          target,
          time: 0,
        },
      ],
      this,
    );
  }
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
      matches: true,
      media: "(hover: hover) and (pointer: fine)",
      onchange: null,
      removeEventListener: vi.fn(),
    })),
  );
  TestIntersectionObserver.current = null;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  TestIntersectionObserver.current = null;
});

describe("LazyWorkCardCanvas", () => {
  it("loads the WebGL runtime only when selected work approaches the viewport", () => {
    render(
      <section id="selected-work">
        <LazyWorkCardCanvas className="canvas" />
      </section>,
    );

    expect(screen.queryByTestId("work-card-canvas")).not.toBeInTheDocument();
    expect(TestIntersectionObserver.current?.rootMargin).toBe("10% 0px");
    expect(TestIntersectionObserver.current?.observe).toHaveBeenCalledWith(
      document.getElementById("selected-work"),
    );

    act(() => TestIntersectionObserver.current?.emit(true));

    expect(screen.getByTestId("work-card-canvas")).toHaveClass("canvas");
    expect(TestIntersectionObserver.current?.disconnect).toHaveBeenCalled();
  });

  it("loads immediately when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    render(
      <section id="selected-work">
        <LazyWorkCardCanvas className="canvas" />
      </section>,
    );

    expect(screen.getByTestId("work-card-canvas")).toBeInTheDocument();
  });

  it("keeps the native image path and skips WebGL on touch-only devices", () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
      matches: false,
      media: "(hover: hover) and (pointer: fine)",
      onchange: null,
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    render(
      <section id="selected-work">
        <LazyWorkCardCanvas className="canvas" />
      </section>,
    );

    expect(TestIntersectionObserver.current).toBeNull();
    expect(screen.queryByTestId("work-card-canvas")).not.toBeInTheDocument();
  });
});
