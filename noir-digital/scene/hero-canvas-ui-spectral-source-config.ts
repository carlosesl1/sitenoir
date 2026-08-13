export type HeroCanvasUiSpectralFragmentKind = "lens" | "wedge" | "glint";

export interface HeroCanvasUiSpectralFragment {
  readonly center: readonly [number, number];
  readonly colorEnd: number;
  readonly colorStart: number;
  readonly kind: HeroCanvasUiSpectralFragmentKind;
  readonly phase: number;
  readonly size: readonly [number, number];
  readonly skew: number;
  readonly softness: number;
  readonly strength: number;
}

export const HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE = 0.58;

export const HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG = {
  fragments: [
    {
      center: [0.16, 0.63],
      colorEnd: 1,
      colorStart: 0,
      kind: "lens",
      phase: 0,
      size: [0.105, 0.038],
      skew: 0.12,
      softness: 0.7,
      strength: 0.9,
    },
    {
      center: [0.27, 0.49],
      colorEnd: 0.48,
      colorStart: 0,
      kind: "wedge",
      phase: 0.03,
      size: [0.08, 0.026],
      skew: -0.18,
      softness: 0.65,
      strength: 0.62,
    },
    {
      center: [0.34, 0.67],
      colorEnd: 1,
      colorStart: 0.48,
      kind: "glint",
      phase: 0.1,
      size: [0.052, 0.016],
      skew: 0.2,
      softness: 0.82,
      strength: 0.52,
    },
    {
      center: [0.44, 0.58],
      colorEnd: 1,
      colorStart: 0,
      kind: "lens",
      phase: 0.05,
      size: [0.12, 0.044],
      skew: -0.12,
      softness: 0.74,
      strength: 0.96,
    },
    {
      center: [0.53, 0.42],
      colorEnd: 0.42,
      colorStart: 0,
      kind: "glint",
      phase: 0.08,
      size: [0.055, 0.014],
      skew: 0.16,
      softness: 0.86,
      strength: 0.42,
    },
    {
      center: [0.58, 0.69],
      colorEnd: 1,
      colorStart: 0.45,
      kind: "wedge",
      phase: 0.14,
      size: [0.078, 0.03],
      skew: -0.2,
      softness: 0.68,
      strength: 0.72,
    },
    {
      center: [0.66, 0.5],
      colorEnd: 1,
      colorStart: 0.38,
      kind: "lens",
      phase: 0.16,
      size: [0.09, 0.036],
      skew: 0.1,
      softness: 0.72,
      strength: 0.74,
    },
    {
      center: [0.73, 0.62],
      colorEnd: 1,
      colorStart: 0,
      kind: "wedge",
      phase: 0.21,
      size: [0.1, 0.034],
      skew: -0.15,
      softness: 0.65,
      strength: 0.84,
    },
    {
      center: [0.81, 0.43],
      colorEnd: 1,
      colorStart: 0.52,
      kind: "glint",
      phase: 0.24,
      size: [0.048, 0.013],
      skew: 0.22,
      softness: 0.88,
      strength: 0.44,
    },
    {
      center: [0.86, 0.58],
      colorEnd: 0.46,
      colorStart: 0,
      kind: "lens",
      phase: 0.28,
      size: [0.072, 0.028],
      skew: -0.08,
      softness: 0.76,
      strength: 0.58,
    },
  ] satisfies readonly HeroCanvasUiSpectralFragment[],
  desktopIntensity: 0.52,
  mobileBreakpoint: 768,
  mobileIntensity: 0.4,
} as const;

export function resolveHeroCanvasUiSpectralIntensity(viewportWidth: number): number {
  return viewportWidth < HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileBreakpoint
    ? HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileIntensity
    : HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.desktopIntensity;
}
