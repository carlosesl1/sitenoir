import { LinearFilter, SRGBColorSpace, Texture, type WebGLRenderer } from "three";

export function createWorkCardTexture(
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
): Texture {
  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function initializeWorkCardTexture(
  renderer: Pick<WebGLRenderer, "initTexture">,
  texture: Texture,
): boolean {
  try {
    renderer.initTexture(texture);
    return true;
  } catch {
    texture.dispose();
    return false;
  }
}

export interface ImageCanvasGate {
  (
    image: HTMLImageElement,
    renderedWidth: number,
    renderedHeight: number,
    pixelRatio: number,
  ): HTMLCanvasElement | ImageBitmap | null;
  activate: () => void;
  dispose: () => void;
}

export function createImageCanvasGate(invalidate: () => void): ImageCanvasGate {
  let disposed = false;
  let generation = 0;
  let prepared = new WeakMap<HTMLImageElement, HTMLCanvasElement | ImageBitmap>();
  let pending = new WeakSet<HTMLImageElement>();
  const imageBitmaps = new Set<ImageBitmap>();
  const idleCallbacks = new Set<number>();
  const timeouts = new Set<number>();

  const prepareImage: ImageCanvasGate = (image, renderedWidth, renderedHeight, pixelRatio) => {
    if (disposed) return null;
    const target = resolveWorkCardTextureSize(
      image.naturalWidth,
      image.naturalHeight,
      renderedWidth,
      renderedHeight,
      pixelRatio,
    );
    const existing = prepared.get(image);
    if (existing && existing.width >= target.width && existing.height >= target.height) {
      return existing;
    }
    if (pending.has(image)) return null;
    pending.add(image);
    const requestGeneration = generation;
    void image
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (disposed || requestGeneration !== generation) return;
        const prepare = () => {
          if (disposed || requestGeneration !== generation) return;
          const canvas = document.createElement("canvas");
          canvas.width = target.width;
          canvas.height = target.height;
          const context = canvas.getContext("2d", { alpha: true });
          const publish = (source: HTMLCanvasElement | ImageBitmap) => {
            const sourceIsBitmap =
              typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap;
            if (disposed || requestGeneration !== generation) {
              if (sourceIsBitmap) (source as ImageBitmap).close();
              return;
            }
            const previous = prepared.get(image);
            if (typeof ImageBitmap !== "undefined" && previous instanceof ImageBitmap) {
              previous.close();
              imageBitmaps.delete(previous);
            }
            if (sourceIsBitmap) imageBitmaps.add(source as ImageBitmap);
            prepared.set(image, source);
            pending.delete(image);
            invalidate();
          };
          if (!context || canvas.width <= 0 || canvas.height <= 0) {
            pending.delete(image);
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          if (typeof window.createImageBitmap !== "function") {
            publish(canvas);
            return;
          }
          void window
            .createImageBitmap(canvas, {
              colorSpaceConversion: "none",
              imageOrientation: "flipY",
              premultiplyAlpha: "none",
            })
            .then(publish)
            .catch(() => publish(canvas));
        };
        if (typeof window.requestIdleCallback === "function") {
          const callback = window.requestIdleCallback(
            () => {
              idleCallbacks.delete(callback);
              prepare();
            },
            { timeout: 1_000 },
          );
          idleCallbacks.add(callback);
        } else {
          const timeout = window.setTimeout(() => {
            timeouts.delete(timeout);
            prepare();
          }, 0);
          timeouts.add(timeout);
        }
      });
    return null;
  };
  prepareImage.activate = () => {
    disposed = false;
  };
  prepareImage.dispose = () => {
    disposed = true;
    generation += 1;
    if (typeof window.cancelIdleCallback === "function") {
      for (const callback of idleCallbacks) window.cancelIdleCallback(callback);
    }
    for (const timeout of timeouts) window.clearTimeout(timeout);
    idleCallbacks.clear();
    timeouts.clear();
    for (const bitmap of imageBitmaps) bitmap.close();
    imageBitmaps.clear();
    prepared = new WeakMap<HTMLImageElement, HTMLCanvasElement | ImageBitmap>();
    pending = new WeakSet<HTMLImageElement>();
  };
  return prepareImage;
}

export function resolveWorkCardTextureSize(
  naturalWidth: number,
  naturalHeight: number,
  renderedWidth: number,
  renderedHeight: number,
  pixelRatio: number,
): { readonly height: number; readonly width: number } {
  const safeNaturalWidth = Math.max(1, naturalWidth);
  const safeNaturalHeight = Math.max(1, naturalHeight);
  const requestedWidth = Math.max(1, renderedWidth * pixelRatio);
  const requestedHeight = Math.max(1, renderedHeight * pixelRatio);
  const coverScale = Math.max(
    requestedWidth / safeNaturalWidth,
    requestedHeight / safeNaturalHeight,
  );
  const scale = Math.min(1, coverScale);
  return {
    height: Math.max(1, Math.ceil(safeNaturalHeight * scale)),
    width: Math.max(1, Math.ceil(safeNaturalWidth * scale)),
  };
}

export function setDataFlag(element: HTMLElement, key: string, value: string): boolean {
  if (element.dataset[key] === value) return false;
  element.dataset[key] = value;
  return true;
}

export function setWebGlCardVisibility(
  element: HTMLElement,
  visible: boolean,
  curlActive: boolean,
): void {
  if (!visible && element.dataset["webglReady"] !== "true") return;
  setDataFlag(element, "canvasActive", visible ? "true" : "false");
  setDataFlag(element, "curlActive", visible && curlActive ? "true" : "false");
}
