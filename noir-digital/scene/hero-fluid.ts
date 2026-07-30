export const HERO_FLUID_CONFIG = {
  chromaticStrength: 0.002,
  curlStrength: 0,
  idleTimeout: 600,
  pressureIterations: 4,
  radius: 1.5,
  resolution: 160,
  strength: 0.3,
  velocityDissipation: 3,
  velocityScale: 1,
} as const;

interface FluidPushInput {
  readonly compactViewport: boolean;
  readonly idleMilliseconds: number;
  readonly pointerInside: boolean;
  readonly reducedMotion: boolean;
  readonly solid: boolean;
}

export function shouldRunFluidPush(input: FluidPushInput): boolean {
  return (
    !input.compactViewport &&
    !input.reducedMotion &&
    !input.solid &&
    input.pointerInside &&
    input.idleMilliseconds < HERO_FLUID_CONFIG.idleTimeout
  );
}

export function shouldRenderFluidFrame(active: boolean, strength: number): boolean {
  return active || strength >= 0.0001;
}

export function shouldCompositeHeroEffects(flareEnabled: boolean, fluidStrength: number): boolean {
  return flareEnabled || fluidStrength >= 0.0001;
}
