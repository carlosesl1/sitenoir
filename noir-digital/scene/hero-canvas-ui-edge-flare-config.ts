export const HERO_CANVAS_UI_EDGE_FLARE_LAYER = 12;
export const HERO_CANVAS_UI_CURSOR_NO_FLARE_LAYER = 13;

export const HERO_CANVAS_UI_EDGE_FLARE_CONFIG = {
  edgeFeather: 0.004,
  fresnelEnd: 0.84,
  fresnelStart: 0.6,
  // Upper outer tip of the I dot.
  iPatchXEnd: 0.145,
  iPatchXStart: 0.108,
  iPatchYEnd: 0.103,
  iPatchYStart: 0.075,
  // Small diagonal segment that follows the upper-right chamfer of R.
  rContourEnd: 0.352,
  rContourFeather: 0.001,
  rContourIntercept: 0.3803,
  rContourSlope: 0.895,
  rContourStart: 0.343,
  rContourWidth: 0.0015,
  // Lens extraction is intentionally strict; this keeps the R source visible
  // while making its RGB flare materially softer than the I highlight.
  rSourceLuminance: 0.99972,
} as const;
