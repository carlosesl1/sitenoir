export interface PhysicalPrismReflectionLayerConfig {
  readonly assetUrl: string;
  readonly id: "n" | "o" | "ir";
  readonly planarMax: readonly [number, number];
  readonly planarMin: readonly [number, number];
}

export const PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG = {
  desktopOpacity: 0.76,
  luminanceEnd: 0.22,
  luminanceStart: 0.045,
  mobileBreakpoint: 768,
  mobileOpacity: 0.6,
  saturationEnd: 0.16,
  saturationStart: 0.025,
} as const;

// Each region is normalized to the complete NOIR wordmark: [0, 0] is its
// bottom-left corner and [1, 1] its top-right corner. These are the values
// to tune when fitting a reflection to a letter without moving the others.
export const PHYSICAL_PRISM_REFLECTION_LAYERS = [
  {
    assetUrl: "/assets/v1/textures/noir-prism-reflection-n-v1.webp",
    id: "n",
    planarMax: [0.305, 1],
    planarMin: [0, 0],
  },
  {
    assetUrl: "/assets/v1/textures/noir-prism-reflection-o-v1.webp",
    id: "o",
    planarMax: [0.595, 1],
    planarMin: [0.315, 0],
  },
  {
    assetUrl: "/assets/v1/textures/noir-prism-reflection-ir-v1.webp",
    id: "ir",
    planarMax: [1, 1],
    planarMin: [0.61, 0],
  },
] as const satisfies readonly PhysicalPrismReflectionLayerConfig[];

export function resolvePhysicalPrismReflectionAtlasOpacity(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileBreakpoint
    ? PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileOpacity
    : PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.desktopOpacity;
}
