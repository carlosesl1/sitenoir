export const HERO_CANVAS_UI_GLASS_CONFIG = {
  anisotropicBlur: 0.04,
  backside: false,
  chromaticAberration: 0.055,
  clearcoat: 0.5,
  clearcoatRoughness: 0.06,
  dispersion: 1.5,
  environmentBlur: 0.04,
  environmentIntensity: 1,
  highlight: "#066aff",
  ior: 1.58,
  roughness: 0.08,
  samples: 6,
  thickness: 4,
  transmission: 1,
} as const;

export function resolveHeroCanvasUiThickness(sceneScale: number): number {
  return HERO_CANVAS_UI_GLASS_CONFIG.thickness / Math.max(Math.abs(sceneScale), 0.0001);
}
