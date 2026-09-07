export interface PreparedWorkCardImage {
  readonly dpr: number;
  readonly height: number;
  readonly image: HTMLCanvasElement;
  readonly source: HTMLImageElement;
  readonly currentSrc: string;
  readonly naturalHeight: number;
  readonly naturalWidth: number;
  readonly sourceHeight: number;
  readonly sourceLeft: number;
  readonly sourceTop: number;
  readonly sourceWidth: number;
  readonly width: number;
}

interface PrepareWorkCardImageInput {
  readonly dpr: number;
  readonly height: number;
  readonly image: HTMLImageElement;
  readonly previous: PreparedWorkCardImage | null;
  readonly width: number;
}

export function prepareWorkCardImage({
  dpr,
  height,
  image,
  previous,
  width,
}: PrepareWorkCardImageInput): PreparedWorkCardImage | null {
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  if (naturalWidth <= 0 || naturalHeight <= 0) return null;
  if (
    previous?.source === image &&
    previous.currentSrc === image.currentSrc &&
    previous.width === width &&
    previous.height === height &&
    previous.dpr === dpr &&
    previous.naturalWidth === naturalWidth &&
    previous.naturalHeight === naturalHeight
  ) {
    return previous;
  }

  const coverScale = Math.max(width / naturalWidth, height / naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  // The five-argument overload draws the entire decoded source. Source rectangles on
  // responsive images otherwise mix density-corrected natural sizes with raw pixels.
  const drawnWidth = naturalWidth * coverScale;
  const drawnHeight = naturalHeight * coverScale;
  context.drawImage(
    image,
    (width - drawnWidth) / 2,
    (height - drawnHeight) / 2,
    drawnWidth,
    drawnHeight,
  );

  return {
    dpr,
    height,
    image: canvas,
    source: image,
    currentSrc: image.currentSrc,
    naturalHeight,
    naturalWidth,
    sourceHeight: canvas.height,
    sourceLeft: 0,
    sourceTop: 0,
    sourceWidth: canvas.width,
    width,
  };
}
