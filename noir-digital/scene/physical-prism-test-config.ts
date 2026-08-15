export const PHYSICAL_PRISM_TEST_CONFIG = {
  animated: true,
  backgroundColor: "#000000",
  clearcoat: 1,
  clearcoatRoughness: 0.035,
  environmentIntensity: 0.42,
  glassColor: "#0a0c10",
  ior: 1.58,
  mobileBreakpoint: 768,
  roughness: 0.075,
  surfaceCount: 3,
  thickness: 3.6,
  transmission: 0.82,
} as const;

export function resolvePhysicalPrismSceneScale(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_TEST_CONFIG.mobileBreakpoint ? 3.4 : 8.8;
}
