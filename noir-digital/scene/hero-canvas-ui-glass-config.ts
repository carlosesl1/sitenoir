export const HERO_CANVAS_UI_GLASS_CONFIG = {
  anisotropicBlur: 0.02,
  backside: false,
  chromaticAberration: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.035,
  environmentBlur: 0.18,
  environmentIntensity: 0.42,
  highlight: "#ffffff",
  ior: 1.58,
  roughness: 0.075,
  samples: 3,
  thickness: 3.6,
  transmission: 1,
} as const;

export const HERO_CANVAS_UI_REFLECTOR_CONFIG = [
  {
    color: "#ffffff",
    intensity: 78,
    position: [-14, 10, 5],
    rotation: [0, -0.35, 0.2],
    scale: [0.08, 5.5, 1.2],
  },
  {
    color: "#ffffff",
    intensity: 62.4,
    position: [14, 8, -3],
    rotation: [0, 0.45, -0.25],
    scale: [0.08, 4.2, 1],
  },
  {
    color: "#ffffff",
    intensity: 90,
    position: [0, 16, -10],
    rotation: [0.45, 0, 0.1],
    scale: [5, 0.08, 1.1],
  },
] as const;

export function resolveHeroCanvasUiSamples(viewportWidth: number): number {
  if (viewportWidth < 768) return 2;
  if (viewportWidth < 1024) return 3;
  return HERO_CANVAS_UI_GLASS_CONFIG.samples;
}

export function resolveHeroCanvasUiThickness(sceneScale: number): number {
  return HERO_CANVAS_UI_GLASS_CONFIG.thickness / Math.max(Math.abs(sceneScale), 0.0001);
}
