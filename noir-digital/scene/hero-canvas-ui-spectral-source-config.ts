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
    { angle: -0.55, center: [0.22, 0.48], length: 0.3, phase: 0, strength: 1, width: 0.065 },
    { angle: 0.38, center: [0.43, 0.55], length: 0.34, phase: 0.08, strength: 0.88, width: 0.08 },
    { angle: -0.32, center: [0.65, 0.46], length: 0.28, phase: 0.16, strength: 0.78, width: 0.06 },
    { angle: 0.5, center: [0.82, 0.56], length: 0.24, phase: 0.22, strength: 0.62, width: 0.05 },
  ] satisfies readonly HeroCanvasUiSpectralBeam[],
  desktopIntensity: 0.62,
  mobileBreakpoint: 768,
  mobileIntensity: 0.48,
} as const;

export function resolveHeroCanvasUiSpectralIntensity(viewportWidth: number): number {
  return viewportWidth < HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileBreakpoint
    ? HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.mobileIntensity
    : HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.desktopIntensity;
}
