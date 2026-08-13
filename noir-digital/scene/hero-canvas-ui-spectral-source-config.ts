export interface HeroCanvasUiSpectralBeam {
  readonly angle: number;
  readonly breakup: number;
  readonly center: readonly [number, number];
  readonly curve: number;
  readonly length: number;
  readonly phase: number;
  readonly strength: number;
  readonly widthEnd: number;
  readonly widthMid: number;
  readonly widthStart: number;
}

export const HERO_CANVAS_UI_SPECTRAL_STREAK_ANGLE = 0.58;

export const HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG = {
  beams: [
    {
      angle: HERO_CANVAS_UI_SPECTRAL_STREAK_ANGLE,
      breakup: 0.12,
      center: [0.24, 0.64],
      curve: 0.012,
      length: 0.15,
      phase: 0,
      strength: 1,
      widthEnd: 0.024,
      widthMid: 0.0396,
      widthStart: 0.018,
    },
    {
      angle: HERO_CANVAS_UI_SPECTRAL_STREAK_ANGLE,
      breakup: 0.16,
      center: [0.44, 0.46],
      curve: -0.01,
      length: 0.18,
      phase: 0.08,
      strength: 0.88,
      widthEnd: 0.018,
      widthMid: 0.045,
      widthStart: 0.02,
    },
    {
      angle: HERO_CANVAS_UI_SPECTRAL_STREAK_ANGLE,
      breakup: 0.2,
      center: [0.63, 0.65],
      curve: 0.009,
      length: 0.13,
      phase: 0.16,
      strength: 0.78,
      widthEnd: 0.021,
      widthMid: 0.0342,
      widthStart: 0.014,
    },
    {
      angle: HERO_CANVAS_UI_SPECTRAL_STREAK_ANGLE,
      breakup: 0.22,
      center: [0.78, 0.53],
      curve: -0.008,
      length: 0.14,
      phase: 0.22,
      strength: 0.62,
      widthEnd: 0.016,
      widthMid: 0.0306,
      widthStart: 0.012,
    },
  ] satisfies readonly HeroCanvasUiSpectralBeam[],
  desktopIntensity: 0.52,
  mobileBreakpoint: 768,
  mobileIntensity: 0.4,
} as const;

export function resolveHeroCanvasUiSpectralIntensity(viewportWidth: number): number {
  return viewportWidth < HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileBreakpoint
    ? HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileIntensity
    : HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.desktopIntensity;
}
