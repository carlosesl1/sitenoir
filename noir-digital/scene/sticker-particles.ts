export const STICKER_PARTICLE_CONFIG = {
  clickSpawnHeight: 24,
  clickSpawnWidth: 24,
  fallDistance: 48,
  fallSpeed: 1.8,
  particleCount: 12,
  positionY: 24,
  rotationSpeed: 0.8,
  scale: 1.4,
  spawnHeight: 24,
  spawnWidth: 32,
  windFrequency: 0.3,
  windStrength: 1.8,
  zDepth: 4,
  zOffset: -6,
} as const;

export interface StickerParticle {
  active: boolean;
  fallSpeed: number;
  recycle: boolean;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  spawnY: number;
  textureIndex: number;
  windPhase: number;
  windScale: number;
  x: number;
  y: number;
  z: number;
}

interface StickerParticleInput {
  readonly origin?: readonly [number, number, number];
  readonly recycle?: boolean;
  readonly seed: number;
  readonly textureIndex: number;
}

interface StickerAdvanceInput {
  readonly delta: number;
  readonly elapsed: number;
}

interface StickerAppearance {
  readonly opacity: number;
  readonly scale: number;
}

function randomUnit(seed: number, salt: number): number {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function createStickerParticle(input: StickerParticleInput): StickerParticle {
  const randomX = randomUnit(input.seed, 1);
  const randomY = randomUnit(input.seed, 2);
  const randomZ = randomUnit(input.seed, 3);
  const origin = input.origin;
  const x = origin?.[0] ?? (randomX - 0.5) * STICKER_PARTICLE_CONFIG.spawnWidth;
  const y =
    origin?.[1] ??
    STICKER_PARTICLE_CONFIG.positionY + randomY * STICKER_PARTICLE_CONFIG.spawnHeight;
  const z =
    origin?.[2] ?? STICKER_PARTICLE_CONFIG.zOffset - randomZ * STICKER_PARTICLE_CONFIG.zDepth;

  return {
    active: true,
    fallSpeed: STICKER_PARTICLE_CONFIG.fallSpeed * (0.6 + randomUnit(input.seed, 4) * 0.8),
    recycle: input.recycle ?? true,
    rotation: randomUnit(input.seed, 5) * Math.PI * 2,
    rotationSpeed: STICKER_PARTICLE_CONFIG.rotationSpeed * (randomUnit(input.seed, 6) * 2 - 1),
    scale: STICKER_PARTICLE_CONFIG.scale,
    spawnY: y,
    textureIndex: input.textureIndex,
    windPhase: randomUnit(input.seed, 8) * Math.PI * 2,
    windScale: 0.3 + randomUnit(input.seed, 9) * STICKER_PARTICLE_CONFIG.windStrength,
    x,
    y,
    z,
  };
}

export function advanceStickerParticle(
  particle: StickerParticle,
  input: StickerAdvanceInput,
): void {
  particle.y -= particle.fallSpeed * input.delta;
  particle.rotation += particle.rotationSpeed * input.delta;
  particle.x +=
    Math.sin(input.elapsed * STICKER_PARTICLE_CONFIG.windFrequency + particle.windPhase) *
    particle.windScale *
    input.delta;
}

export function resolveStickerAppearance(particle: StickerParticle): StickerAppearance {
  const progress = clamp01((particle.spawnY - particle.y) / STICKER_PARTICLE_CONFIG.fallDistance);
  const entrance = clamp01(progress / 0.05);
  const exit = clamp01((1 - progress) / 0.1);
  const edge = Math.min(entrance, exit);
  return { opacity: edge, scale: particle.scale * edge };
}

export function hasStickerCompletedFall(particle: StickerParticle): boolean {
  return particle.spawnY - particle.y >= STICKER_PARTICLE_CONFIG.fallDistance;
}

export function findAvailableStickerSlot(
  particles: readonly StickerParticle[],
  capacity: number,
): number {
  const inactiveIndex = particles.findIndex((particle) => !particle.active);
  if (inactiveIndex >= 0) return inactiveIndex;
  return particles.length < capacity ? particles.length : -1;
}
