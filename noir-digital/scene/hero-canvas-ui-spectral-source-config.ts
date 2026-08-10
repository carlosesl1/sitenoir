export interface HeroCanvasUiSpectralBeam {
  readonly angle: number;
  readonly center: readonly [number, number];
  readonly length: number;
  readonly phase: number;
  readonly strength: number;
  readonly width: number;
}

export const HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG = {
  beams: [
    { angle: -0.65, center: [0.24, 0.64], length: 0.15, phase: 0, strength: 1, width: 0.04 },
    { angle: 0.48, center: [0.44, 0.46], length: 0.18, phase: 0.08, strength: 0.88, width: 0.048 },
    { angle: -0.42, center: [0.63, 0.65], length: 0.13, phase: 0.16, strength: 0.78, width: 0.035 },
    { angle: 0.62, center: [0.78, 0.53], length: 0.14, phase: 0.22, strength: 0.62, width: 0.032 },
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
