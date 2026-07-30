export interface PreparedWorkCardImage {
  readonly dpr: number;
  readonly height: number;
  readonly image: HTMLImageElement;
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
    previous?.image === image &&
    previous.width === width &&
    previous.height === height &&
    previous.dpr === dpr &&
    previous.naturalWidth === naturalWidth &&
    previous.naturalHeight === naturalHeight
  ) {
    return previous;
  }

  const coverScale = Math.max(width / naturalWidth, height / naturalHeight);
  const sourceWidth = width / coverScale;
  const sourceHeight = height / coverScale;
  const sourceLeft = (naturalWidth - sourceWidth) / 2;
  const sourceTop = (naturalHeight - sourceHeight) / 2;

  return {
    dpr,
    height,
    image,
    naturalHeight,
    naturalWidth,
    sourceHeight,
    sourceLeft,
    sourceTop,
    sourceWidth,
    width,
  };
}
