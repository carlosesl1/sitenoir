import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createImageCanvasGate,
  createWorkCardTexture,
  initializeWorkCardTexture,
  resolveWorkCardTextureSize,
  setDataFlag,
  setWebGlCardVisibility,
} from "@/scene/work-card-runtime";

describe("work card runtime", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("creates a texture from an already prepared source", () => {
    const image = document.createElement("img");

    const texture = createWorkCardTexture(image);

    expect(texture.image).toBe(image);
    expect(texture.generateMipmaps).toBe(false);
    texture.dispose();
  });

  it("uploads a prepared texture before its first draw", () => {
    const texture = createWorkCardTexture(document.createElement("img"));
    const initTexture = vi.fn();

    expect(initializeWorkCardTexture({ initTexture }, texture)).toBe(true);
    expect(initTexture).toHaveBeenCalledWith(texture);
    texture.dispose();
  });

  it("disposes a texture when an explicit upload fails", () => {
    const texture = createWorkCardTexture(document.createElement("img"));
    const dispose = vi.spyOn(texture, "dispose");

    expect(
      initializeWorkCardTexture(
        {
          initTexture() {
            throw new Error("context unavailable");
          },
        },
        texture,
      ),
    ).toBe(false);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("decodes and copies each image during idle time instead of the render frame", async () => {
    let finishDecode: (() => void) | undefined;
    const image = document.createElement("img");
    const decode = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishDecode = resolve;
        }),
    );
    Object.defineProperty(image, "decode", { configurable: true, value: decode });
    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 320 });
    Object.defineProperty(image, "naturalHeight", { configurable: true, value: 180 });
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    let idleCallback: IdleRequestCallback | undefined;
    vi.stubGlobal("requestIdleCallback", (callback: IdleRequestCallback) => {
      idleCallback = callback;
      return 1;
    });
    const invalidate = vi.fn();
    const prepareImage = createImageCanvasGate(invalidate);

    expect(prepareImage(image, 160, 90, 1)).toBeNull();
    expect(prepareImage(image, 160, 90, 1)).toBeNull();
    expect(decode).toHaveBeenCalledTimes(1);
    expect(drawImage).not.toHaveBeenCalled();

    finishDecode?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(drawImage).not.toHaveBeenCalled();
    idleCallback?.({ didTimeout: false, timeRemaining: () => 10 });

    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 160, 90);
    expect(prepareImage(image, 160, 90, 1)).toBeInstanceOf(HTMLCanvasElement);
    prepareImage.dispose();
  });

  it("creates a flipped ImageBitmap and closes it during disposal", async () => {
    const image = document.createElement("img");
    Object.defineProperty(image, "decode", {
      configurable: true,
      value: vi.fn(() => Promise.resolve()),
    });
    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 320 });
    Object.defineProperty(image, "naturalHeight", { configurable: true, value: 180 });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    let idleCallback: IdleRequestCallback | undefined;
    vi.stubGlobal("requestIdleCallback", (callback: IdleRequestCallback) => {
      idleCallback = callback;
      return 1;
    });
    const close = vi.fn();
    class FakeImageBitmap {
      readonly width = 160;
      readonly height = 90;
      close = close;
    }
    const bitmap = new FakeImageBitmap();
    const createImageBitmap = vi.fn(() => Promise.resolve(bitmap));
    vi.stubGlobal("ImageBitmap", FakeImageBitmap);
    vi.stubGlobal("createImageBitmap", createImageBitmap);
    const prepareImage = createImageCanvasGate(vi.fn());

    expect(prepareImage(image, 160, 90, 1)).toBeNull();
    await Promise.resolve();
    await Promise.resolve();
    idleCallback?.({ didTimeout: false, timeRemaining: () => 10 });
    await Promise.resolve();
    await Promise.resolve();

    expect(createImageBitmap).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), {
      colorSpaceConversion: "none",
      imageOrientation: "flipY",
      premultiplyAlpha: "none",
    });
    expect(prepareImage(image, 160, 90, 1)).toBe(bitmap);
    prepareImage.dispose();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("falls back to the prepared canvas when ImageBitmap creation fails", async () => {
    const image = document.createElement("img");
    Object.defineProperty(image, "decode", {
      configurable: true,
      value: vi.fn(() => Promise.resolve()),
    });
    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 320 });
    Object.defineProperty(image, "naturalHeight", { configurable: true, value: 180 });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    let idleCallback: IdleRequestCallback | undefined;
    vi.stubGlobal("requestIdleCallback", (callback: IdleRequestCallback) => {
      idleCallback = callback;
      return 1;
    });
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(() => Promise.reject(new Error("unsupported"))),
    );
    const prepareImage = createImageCanvasGate(vi.fn());

    expect(prepareImage(image, 160, 90, 1)).toBeNull();
    await Promise.resolve();
    await Promise.resolve();
    idleCallback?.({ didTimeout: false, timeRemaining: () => 10 });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(prepareImage(image, 160, 90, 1)).toBeInstanceOf(HTMLCanvasElement);
    prepareImage.dispose();
  });

  it("bounds large source images to the physical cover resolution", () => {
    expect(resolveWorkCardTextureSize(3840, 2160, 430, 430, 1.5)).toEqual({
      height: 645,
      width: 1147,
    });
    expect(resolveWorkCardTextureSize(320, 180, 430, 430, 1.5)).toEqual({
      height: 180,
      width: 320,
    });
  });

  it("reactivates safely after a Strict Effects cleanup", () => {
    const image = document.createElement("img");
    const decode = vi.fn(() => Promise.resolve());
    Object.defineProperty(image, "decode", { configurable: true, value: decode });
    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 320 });
    Object.defineProperty(image, "naturalHeight", { configurable: true, value: 180 });
    const prepareImage = createImageCanvasGate(vi.fn());

    prepareImage.dispose();
    expect(prepareImage(image, 160, 90, 1)).toBeNull();
    expect(decode).not.toHaveBeenCalled();

    prepareImage.activate();
    expect(prepareImage(image, 160, 90, 1)).toBeNull();
    expect(decode).toHaveBeenCalledTimes(1);
    prepareImage.dispose();
  });

  it("does not rewrite an unchanged data flag", () => {
    const element = document.createElement("span");

    expect(setDataFlag(element, "canvasActive", "true")).toBe(true);
    expect(setDataFlag(element, "canvasActive", "true")).toBe(false);
    expect(element.dataset["canvasActive"]).toBe("true");
  });

  it("does not disable the fallback surface before WebGL owns the card", () => {
    const element = document.createElement("span");
    element.dataset["canvasActive"] = "true";
    element.dataset["curlActive"] = "true";

    setWebGlCardVisibility(element, false, false);
    expect(element.dataset["canvasActive"]).toBe("true");
    expect(element.dataset["curlActive"]).toBe("true");

    element.dataset["webglReady"] = "true";
    setWebGlCardVisibility(element, false, false);
    expect(element.dataset["canvasActive"]).toBe("false");
    expect(element.dataset["curlActive"]).toBe("false");
  });
});
