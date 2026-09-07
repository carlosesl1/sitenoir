import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { prepareWorkCardImage } from "@/components/work/work-card-image-cache";

describe("prepareWorkCardImage", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
      setTransform: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes the full responsive image once and reuses the canvas", () => {
    const createElement = vi.spyOn(document, "createElement");
    const image = document.createElement("img");
    Object.defineProperties(image, {
      naturalHeight: { configurable: true, value: 900 },
      naturalWidth: { configurable: true, value: 1600 },
    });

    const first = prepareWorkCardImage({
      dpr: 1.5,
      height: 400,
      image,
      previous: null,
      width: 600,
    });
    const second = prepareWorkCardImage({
      dpr: 1.5,
      height: 400,
      image,
      previous: first,
      width: 600,
    });

    expect(second).toBe(first);
    const context = first?.image.getContext("2d");
    if (!context) throw new Error("Expected the prepared canvas context");
    expect(context?.drawImage).toHaveBeenCalledTimes(1);
    expect(vi.mocked(context.drawImage).mock.calls[0]).toHaveLength(5);
    expect(createElement.mock.calls.filter(([tag]) => tag === "canvas")).toHaveLength(1);
    expect(first).toMatchObject({
      sourceHeight: 600,
      sourceLeft: 0,
      sourceTop: 0,
      sourceWidth: 900,
    });
  });

  it("refreshes the pre-render when the card size changes", () => {
    const image = document.createElement("img");
    Object.defineProperties(image, {
      naturalHeight: { configurable: true, value: 900 },
      naturalWidth: { configurable: true, value: 1600 },
    });

    const first = prepareWorkCardImage({
      dpr: 1,
      height: 400,
      image,
      previous: null,
      width: 600,
    });
    const resized = prepareWorkCardImage({
      dpr: 1,
      height: 420,
      image,
      previous: first,
      width: 620,
    });

    expect(resized).not.toBe(first);
    expect(resized?.sourceWidth).not.toBe(first?.sourceWidth);
  });
});
