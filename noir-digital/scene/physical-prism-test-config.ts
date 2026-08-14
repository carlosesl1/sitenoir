export interface PhysicalPrismLightRegion {
  readonly center: readonly [number, number];
  readonly intensity: number;
  readonly radius: readonly [number, number];
  readonly rotation: number;
  readonly softness: number;
}

export const PHYSICAL_PRISM_TEST_CONFIG = {
  anisotropicBlur: 0.02,
  animated: false,
  backgroundColor: "#000000",
  chromaticAberration: 0.05,
  clearcoat: 1,
  clearcoatRoughness: 0.025,
  environmentIntensity: 0.42,
  ior: 1.58,
  lightColor: "#ffffff",
  lightRegions: [
    {
      center: [0.17, 0.64],
      intensity: 0.82,
      radius: [0.13, 0.07],
      rotation: 0.42,
      softness: 0.72,
    },
    {
      center: [0.34, 0.43],
      intensity: 0.58,
      radius: [0.1, 0.045],
      rotation: 0.56,
      softness: 0.82,
    },
    {
      center: [0.46, 0.69],
      intensity: 0.74,
      radius: [0.12, 0.055],
      rotation: 0.48,
      softness: 0.76,
    },
    {
      center: [0.59, 0.36],
      intensity: 0.9,
      radius: [0.15, 0.06],
      rotation: 0.53,
      softness: 0.7,
    },
    {
      center: [0.73, 0.6],
      intensity: 0.64,
      radius: [0.1, 0.05],
      rotation: 0.45,
      softness: 0.8,
    },
    {
      center: [0.86, 0.46],
      intensity: 0.78,
      radius: [0.12, 0.052],
      rotation: 0.57,
      softness: 0.74,
    },
  ] satisfies readonly PhysicalPrismLightRegion[],
  mobileBreakpoint: 768,
  roughness: 0.045,
  surfaceCount: 1,
  thickness: 4,
  transmission: 1,
} as const;

export function resolvePhysicalPrismSamples(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_TEST_CONFIG.mobileBreakpoint ? 2 : 4;
}

export function resolvePhysicalPrismCardResolution(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_TEST_CONFIG.mobileBreakpoint ? 384 : 512;
}
