export interface PhysicalPrismCausticLobe {
  readonly angleOffset: number;
  readonly center: readonly [number, number];
  readonly radius: readonly [number, number];
  readonly seed: number;
  readonly softness: number;
  readonly strength: number;
}

export const PHYSICAL_PRISM_CAUSTICS_CONFIG = {
  desktopIntensity: 0.88,
  driftSpeed: 0.014,
  lightAngle: 0.61,
  lobes: [
    {
      angleOffset: -0.03,
      center: [0.09, 0.62],
      radius: [0.11, 0.055],
      seed: 0.11,
      softness: 0.78,
      strength: 0.78,
    },
    {
      angleOffset: 0.01,
      center: [0.21, 0.39],
      radius: [0.08, 0.035],
      seed: 0.23,
      softness: 0.83,
      strength: 0.46,
    },
    {
      angleOffset: -0.02,
      center: [0.34, 0.59],
      radius: [0.13, 0.062],
      seed: 0.37,
      softness: 0.72,
      strength: 0.86,
    },
    {
      angleOffset: 0.03,
      center: [0.46, 0.32],
      radius: [0.09, 0.04],
      seed: 0.43,
      softness: 0.86,
      strength: 0.48,
    },
    {
      angleOffset: 0,
      center: [0.5, 0.73],
      radius: [0.14, 0.058],
      seed: 0.58,
      softness: 0.75,
      strength: 0.82,
    },
    {
      angleOffset: -0.04,
      center: [0.62, 0.49],
      radius: [0.1, 0.046],
      seed: 0.67,
      softness: 0.81,
      strength: 0.62,
    },
    {
      angleOffset: 0.02,
      center: [0.71, 0.68],
      radius: [0.12, 0.052],
      seed: 0.74,
      softness: 0.74,
      strength: 0.76,
    },
    {
      angleOffset: -0.01,
      center: [0.82, 0.42],
      radius: [0.08, 0.036],
      seed: 0.86,
      softness: 0.88,
      strength: 0.43,
    },
    {
      angleOffset: 0.04,
      center: [0.93, 0.62],
      radius: [0.1, 0.044],
      seed: 0.97,
      softness: 0.8,
      strength: 0.66,
    },
  ] satisfies readonly PhysicalPrismCausticLobe[],
  mobileBreakpoint: 768,
  mobileIntensity: 0.68,
  palette: {
    blue: "#03357C",
    green: "#21D344",
    red: "#d23012",
    yellow: "#FCE609",
  },
  separation: 0.022,
  surfaceOpacity: 0.92,
  whiteCoreStrength: 0.06,
} as const;

export function resolvePhysicalPrismCausticsIntensity(viewportWidth: number): number {
  return viewportWidth < PHYSICAL_PRISM_CAUSTICS_CONFIG.mobileBreakpoint
    ? PHYSICAL_PRISM_CAUSTICS_CONFIG.mobileIntensity
    : PHYSICAL_PRISM_CAUSTICS_CONFIG.desktopIntensity;
}
