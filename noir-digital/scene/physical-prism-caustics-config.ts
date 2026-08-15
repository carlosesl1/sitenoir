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
      center: [0.06, 0.64],
      radius: [0.06, 0.032],
      seed: 0.11,
      softness: 0.53,
      strength: 0.78,
    },
    {
      angleOffset: 0.01,
      center: [0.17, 0.34],
      radius: [0.04, 0.026],
      seed: 0.23,
      softness: 0.61,
      strength: 0.42,
    },
    {
      angleOffset: -0.02,
      center: [0.27, 0.73],
      radius: [0.05, 0.028],
      seed: 0.37,
      softness: 0.56,
      strength: 0.72,
    },
    {
      angleOffset: 0.03,
      center: [0.38, 0.45],
      radius: [0.052, 0.034],
      seed: 0.43,
      softness: 0.68,
      strength: 0.52,
    },
    {
      angleOffset: 0,
      center: [0.5, 0.72],
      radius: [0.062, 0.031],
      seed: 0.58,
      softness: 0.51,
      strength: 0.84,
    },
    {
      angleOffset: -0.04,
      center: [0.6, 0.31],
      radius: [0.036, 0.024],
      seed: 0.67,
      softness: 0.64,
      strength: 0.38,
    },
    {
      angleOffset: 0.02,
      center: [0.68, 0.66],
      radius: [0.052, 0.028],
      seed: 0.74,
      softness: 0.57,
      strength: 0.68,
    },
    {
      angleOffset: -0.01,
      center: [0.77, 0.43],
      radius: [0.046, 0.03],
      seed: 0.86,
      softness: 0.66,
      strength: 0.46,
    },
    {
      angleOffset: 0.04,
      center: [0.93, 0.58],
      radius: [0.054, 0.026],
      seed: 0.97,
      softness: 0.58,
      strength: 0.62,
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
