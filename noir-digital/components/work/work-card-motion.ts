import { setDataFlag } from "@/scene/work-card-dom";

export { resolveWorkCardCurl } from "@/scene/work-card-framing";

export function shouldRenderWorkCardCanvas({
  imageReady,
  motionAllowed,
  visible,
  webglReady,
}: {
  imageReady: boolean;
  motionAllowed: boolean;
  visible: boolean;
  webglReady: boolean;
}): boolean {
  return imageReady && motionAllowed && visible && !webglReady;
}

export function resetWorkCardCanvas(frame: HTMLElement, canvas: HTMLCanvasElement): void {
  setDataFlag(frame, "canvasActive", "false");
  setDataFlag(frame, "curlActive", "false");
  canvas.style.opacity = "0";
}

export function resolveWorkCardCanvasMetrics(width: number, height: number, dpr: number) {
  const cssWidth = Math.max(1, width);
  const cssHeight = Math.max(1, height);
  const pixelRatio = Math.max(1, dpr);

  return {
    cssHeight,
    cssWidth,
    pixelHeight: Math.round(cssHeight * pixelRatio),
    pixelWidth: Math.round(cssWidth * pixelRatio),
  };
}

export function resolveScreenCurlProfile(screenY: number, viewportHeight: number): number {
  const screenUvY = 1 - screenY / Math.max(1, viewportHeight);
  const centered = 2 * screenUvY - 1;
  return 1 - Math.sqrt(Math.max(0, 1 - centered * centered));
}
