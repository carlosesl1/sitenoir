export const HERO_BACKGROUND_PASS_ORDER = [
  "vignette",
  "swirl",
  "sine",
  "shatter",
  "bokeh",
] as const;

export const HERO_BACKGROUND_CONFIG = {
  resolutionScale: 0.3,
  dark: { edgeIntensity: -0.06, outputMix: 0.86 },
  light: { edgeIntensity: -0.16, outputMix: 0.65 },
  vignette: {
    radius: 0.354,
    falloff: 1,
    skew: 0.54,
    angle: 0,
    edgeIntensity: -0.06,
  },
  swirl: { radius: 0.25, angle: 0.1, phase: 0, mix: 0.5 },
  sine: { mixRadius: 1, frequency: 0.35, amplitude: 1.18, rotation: 0 },
  shatter: {
    amount: 1,
    angle: -0.125,
    mixRadius: 1,
    mixRadiusInvert: 0,
    roundness: 0.02,
    skew: 0.9,
    spread: 0.9,
  },
  bokeh: { radius: 0.754, tilt: 0.5 },
  smoothing: 0.1,
  leaveSmoothing: 0.05,
} as const;

export interface HeroPointerUv {
  readonly x: number;
  readonly y: number;
}

interface NormalizedPointer {
  readonly normalizedX: number;
  readonly normalizedY: number;
}

export function pointerSnapshotToUv(pointer: NormalizedPointer): HeroPointerUv {
  return {
    x: Math.min(1, Math.max(0, (pointer.normalizedX + 1) / 2)),
    y: Math.min(1, Math.max(0, (pointer.normalizedY + 1) / 2)),
  };
}
