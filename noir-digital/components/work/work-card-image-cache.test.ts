import { afterEach, describe, expect, it, vi } from "vitest";

import { prepareWorkCardImage } from "@/components/work/work-card-image-cache";

describe("prepareWorkCardImage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calculates a reusable source crop without allocating an intermediate canvas", () => {
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
    expect(createElement).not.toHaveBeenCalledWith("canvas");
    expect(first).toMatchObject({
      sourceHeight: 900,
      sourceLeft: 125,
      sourceTop: 0,
      sourceWidth: 1350,
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
