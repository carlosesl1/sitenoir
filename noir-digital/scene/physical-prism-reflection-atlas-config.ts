export const PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG = {
  assetUrl: "/assets/v1/textures/noir-prism-reflections-mapped-v3.webp",
  desktopOpacity: 0.76,
  leftAnchorFadeStart: 0.052,
  leftAnchorShift: 0.026,
  leftAnchorWindowEnd: 0.11,
  luminanceEnd: 0.22,
  luminanceStart: 0.045,
  mobileBreakpoint: 768,
  mobileOpacity: 0.6,
  rightAnchorFadeEnd: 0.955,
  rightAnchorShift: 0.027,
  rightAnchorWindowStart: 0.9,
  saturationEnd: 0.16,
  saturationStart: 0.025,
} as const;

export function resolvePhysicalPrismReflectionAtlasOpacity(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileBreakpoint
    ? PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.mobileOpacity
    : PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG.desktopOpacity;
}
