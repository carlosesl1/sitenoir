export type PhysicalPrismReflectionLayerId = "n" | "o" | "ir";

export interface PhysicalPrismReflectionLayerAdjustment {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

export type PhysicalPrismReflectionLayerAdjustments = Readonly<
  Record<PhysicalPrismReflectionLayerId, PhysicalPrismReflectionLayerAdjustment>
>;

export interface PhysicalPrismReflectionLayerConfig {
  readonly assetUrl: string;
  readonly id: PhysicalPrismReflectionLayerId;
  readonly planarMax: readonly [number, number];
  readonly planarMin: readonly [number, number];
  readonly adjustment: PhysicalPrismReflectionLayerAdjustment;
}

export const PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG = {
  desktopOpacity: 0.76,
  luminanceEnd: 0.22,
  luminanceStart: 0.045,
  mobileBreakpoint: 768,
  mobileOpacity: 0.6,
  opticalBloom: 0.12,
  opticalSoftness: 0.24,
  opticalSoftnessRadius: 0.0024,
  opticalDispersion: 0.0015,
  opticalDispersionMix: 0.18,
  saturationEnd: 0.16,
  saturationStart: 0.025,
} as const;

// Each region is normalized to the complete NOIR wordmark: [0, 0] is its
// bottom-left corner and [1, 1] its top-right corner. These are the values
// to tune when fitting a reflection to a letter without moving the others.
export const PHYSICAL_PRISM_REFLECTION_LAYERS = [
  {
    adjustment: { offsetX: -0.015, offsetY: -0.07, scaleX: 0.995, scaleY: 1 },
    assetUrl: "/assets/v1/textures/noir-prism-reflection-n-v1.webp",
    id: "n",
    planarMax: [0.305, 1],
    planarMin: [0, 0],
  },
  {
    adjustment: { offsetX: 0.006, offsetY: -0.039, scaleX: 1.01, scaleY: 0.995 },
    assetUrl: "/assets/v1/textures/noir-prism-reflection-o-v1.webp",
    id: "o",
    planarMax: [0.595, 1],
    planarMin: [0.315, 0],
  },
  {
    adjustment: { offsetX: 0.009, offsetY: 0.12, scaleX: 1.045, scaleY: 1.18 },
    assetUrl: "/assets/v1/textures/noir-prism-reflection-ir-v1.webp",
    id: "ir",
    planarMax: [1, 1],
    planarMin: [0.61, 0],
  },
] as const satisfies readonly PhysicalPrismReflectionLayerConfig[];

export function createPhysicalPrismReflectionLayerAdjustments(): PhysicalPrismReflectionLayerAdjustments {
  return {
    ir: { ...PHYSICAL_PRISM_REFLECTION_LAYERS[2].adjustment },
    n: { ...PHYSICAL_PRISM_REFLECTION_LAYERS[0].adjustment },
    o: { ...PHYSICAL_PRISM_REFLECTION_LAYERS[1].adjustment },
  };
}

export function resolvePhysicalPrismReflectionLayerRegion(
  layer: PhysicalPrismReflectionLayerConfig,
  adjustment: PhysicalPrismReflectionLayerAdjustment = layer.adjustment,
): Pick<PhysicalPrismReflectionLayerConfig, "planarMax" | "planarMin"> {
  const baseWidth = layer.planarMax[0] - layer.planarMin[0];
  const baseHeight = layer.planarMax[1] - layer.planarMin[1];
  const centerX = (layer.planarMax[0] + layer.planarMin[0]) / 2 + adjustment.offsetX;
  const centerY = (layer.planarMax[1] + layer.planarMin[1]) / 2 + adjustment.offsetY;
  const width = baseWidth * Math.max(adjustment.scaleX, 0.0001);
  const height = baseHeight * Math.max(adjustment.scaleY, 0.0001);

  return {
    planarMax: [centerX + width / 2, centerY + height / 2],
    planarMin: [centerX - width / 2, centerY - height / 2],
  };
}

export function resolvePhysicalPrismReflectionAtlasOpacity(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileBreakpoint
    ? PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileOpacity
    : PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.desktopOpacity;
}
