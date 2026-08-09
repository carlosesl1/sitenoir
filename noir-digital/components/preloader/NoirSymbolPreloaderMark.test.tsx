import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NoirSymbolPreloaderMark } from "@/components/preloader/NoirSymbolPreloaderMark";

describe("NoirSymbolPreloaderMark", () => {
  let frames: FrameRequestCallback[];
  let getTotalLength: ReturnType<typeof vi.fn<() => number>>;

  beforeEach(() => {
    frames = [];
    getTotalLength = vi.fn(() => 800);
    Object.defineProperties(SVGElement.prototype, {
      getTotalLength: { configurable: true, value: getTotalLength },
      getPointAtLength: {
        configurable: true,
        value: vi.fn((at: number) => ({ x: at / 8, y: at / 10 }) as DOMPoint),
      },
    });
    vi.spyOn(performance, "now").mockReturnValue(100);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(SVGElement.prototype, "getTotalLength");
    Reflect.deleteProperty(SVGElement.prototype, "getPointAtLength");
    vi.restoreAllMocks();
  });

  it("renders the canonical artwork and six active fronts", () => {
    const view = render(<NoirSymbolPreloaderMark reducedMotion={false} onComplete={vi.fn()} />);

    expect(view.container.querySelectorAll("[data-symbol-source]")).toHaveLength(2);
    expect(view.container.querySelectorAll("[data-symbol-emissary]")).toHaveLength(6);
    expect(view.container.querySelectorAll("[data-symbol-tip]")).toHaveLength(6);
    expect(view.getByTestId("noir-symbol-preloader")).toHaveAttribute("viewBox", "0 0 164 186");
  });

  it("finishes immediately for reduced motion", () => {
    const onComplete = vi.fn();
    const view = render(<NoirSymbolPreloaderMark reducedMotion onComplete={onComplete} />);

    expect(view.getByTestId("noir-symbol-preloader")).toHaveAttribute(
      "data-symbol-phase",
      "complete",
    );
    expect(view.getByTestId("noir-symbol-preloader")).toHaveAttribute(
      "data-symbol-complete",
      "true",
    );
    expect(onComplete).toHaveBeenCalledOnce();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("completes once and leaves the solid mark visible", () => {
    const onComplete = vi.fn();
    const view = render(<NoirSymbolPreloaderMark reducedMotion={false} onComplete={onComplete} />);

    act(() => frames.shift()?.(2_700));

    expect(view.getByTestId("noir-symbol-preloader")).toHaveAttribute(
      "data-symbol-phase",
      "complete",
    );
    expect(view.getByTestId("noir-symbol-preloader")).toHaveAttribute(
      "data-symbol-complete",
      "true",
    );
    expect(view.container.querySelector('[data-symbol-layer="fill"]')).toHaveStyle({
      opacity: "1",
    });
    expect(onComplete).toHaveBeenCalledOnce();
    expect(frames).toHaveLength(0);
  });

  it("falls back to the completed mark when SVG measurement fails", () => {
    getTotalLength.mockImplementation(() => {
      throw new Error("measurement unavailable");
    });
    const onComplete = vi.fn();
    const view = render(<NoirSymbolPreloaderMark reducedMotion={false} onComplete={onComplete} />);

    expect(view.getByTestId("noir-symbol-preloader")).toHaveAttribute(
      "data-symbol-fallback",
      "true",
    );
    expect(view.container.querySelector('[data-symbol-layer="fill"]')).toHaveStyle({
      opacity: "1",
    });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("cancels its pending frame when unmounted", () => {
    const view = render(<NoirSymbolPreloaderMark reducedMotion={false} onComplete={vi.fn()} />);

    view.unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });
});
