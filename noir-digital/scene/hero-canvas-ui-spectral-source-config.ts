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
      center: [0.205, 0.61],
      colorEnd: 1,
      colorStart: 0,
      kind: "lens",
      phase: 0,
      size: [0.066, 0.032],
      skew: 0.1,
      softness: 0.74,
      strength: 0.82,
    },
    {
      center: [0.275, 0.725],
      colorEnd: 0.48,
      colorStart: 0,
      kind: "wedge",
      phase: 0.03,
      size: [0.06, 0.025],
      skew: -0.16,
      softness: 0.68,
      strength: 0.68,
    },
    {
      center: [0.345, 0.56],
      colorEnd: 1,
      colorStart: 0.48,
      kind: "glint",
      phase: 0.1,
      size: [0.045, 0.013],
      skew: 0.18,
      softness: 0.84,
      strength: 0.5,
    },
    {
      center: [0.395, 0.54],
      colorEnd: 1,
      colorStart: 0,
      kind: "lens",
      phase: 0.05,
      size: [0.075, 0.034],
      skew: -0.1,
      softness: 0.76,
      strength: 0.86,
    },
    {
      center: [0.505, 0.72],
      colorEnd: 0.45,
      colorStart: 0,
      kind: "glint",
      phase: 0.08,
      size: [0.048, 0.014],
      skew: 0.16,
      softness: 0.86,
      strength: 0.48,
    },
    {
      center: [0.54, 0.52],
      colorEnd: 1,
      colorStart: 0.42,
      kind: "wedge",
      phase: 0.14,
      size: [0.07, 0.028],
      skew: -0.18,
      softness: 0.7,
      strength: 0.72,
    },
    {
      center: [0.585, 0.715],
      colorEnd: 1,
      colorStart: 0.35,
      kind: "glint",
      phase: 0.16,
      size: [0.038, 0.012],
      skew: 0.2,
      softness: 0.88,
      strength: 0.45,
    },
    {
      center: [0.595, 0.565],
      colorEnd: 1,
      colorStart: 0,
      kind: "lens",
      phase: 0.21,
      size: [0.06, 0.029],
      skew: -0.12,
      softness: 0.75,
      strength: 0.74,
    },
    {
      center: [0.655, 0.59],
      colorEnd: 0.46,
      colorStart: 0,
      kind: "lens",
      phase: 0.24,
      size: [0.055, 0.027],
      skew: 0.08,
      softness: 0.78,
      strength: 0.6,
    },
    {
      center: [0.745, 0.635],
      colorEnd: 1,
      colorStart: 0,
      kind: "wedge",
      phase: 0.28,
      size: [0.07, 0.026],
      skew: -0.14,
      softness: 0.7,
      strength: 0.76,
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
