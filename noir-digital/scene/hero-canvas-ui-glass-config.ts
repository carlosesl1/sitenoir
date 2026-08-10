export const HERO_CANVAS_UI_GLASS_CONFIG = {
  anisotropicBlur: 0.03,
  backside: false,
  chromaticAberration: 0.07,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  environmentBlur: 0.02,
  environmentIntensity: 1.9,
  highlight: "#ffffff",
  ior: 1.58,
  roughness: 0.05,
  samples: 6,
  thickness: 4,
  transmission: 1,
} as const;

export const HERO_CANVAS_UI_RING_CONFIG = {
  color: "#ffffff",
  intensity: 34,
  position: [2, 3, -2],
  scale: [10, 10, 10],
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

export function resolveHeroCanvasUiThickness(sceneScale: number): number {
  return HERO_CANVAS_UI_GLASS_CONFIG.thickness / Math.max(Math.abs(sceneScale), 0.0001);
}
