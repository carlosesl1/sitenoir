export const PHYSICAL_PRISM_TEST_CONFIG = {
  aberrationStrength: 0.08,
  animated: false,
  backgroundColor: "#000000",
  bounces: 2,
  fresnel: 0.2,
  ior: 1.5,
  mobileBreakpoint: 768,
  surfaceCount: 1,
} as const;

export function resolvePhysicalPrismSceneScale(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_TEST_CONFIG.mobileBreakpoint ? 3.4 : 8.8;
}
