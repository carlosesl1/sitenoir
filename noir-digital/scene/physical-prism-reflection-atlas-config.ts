export const PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG = {
  assetUrl: "/assets/v1/textures/noir-prism-reflections-mapped-v3.webp",
  desktopOpacity: 0.76,
  luminanceEnd: 0.22,
  luminanceStart: 0.045,
  mobileBreakpoint: 768,
  mobileOpacity: 0.6,
  saturationEnd: 0.16,
  saturationStart: 0.025,
} as const;

export function resolvePhysicalPrismReflectionAtlasOpacity(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileBreakpoint
    ? PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileOpacity
    : PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.desktopOpacity;
}
