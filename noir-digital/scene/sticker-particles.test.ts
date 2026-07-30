import { describe, expect, it } from "vitest";

import {
  advanceStickerParticle,
  createStickerParticle,
  findAvailableStickerSlot,
  hasStickerCompletedFall,
  resolveStickerAppearance,
  STICKER_PARTICLE_CONFIG,
} from "@/scene/sticker-particles";

describe("sticker particles", () => {
  it("creates a deterministic falling particle inside the source volume", () => {
    const particle = createStickerParticle({ seed: 17, textureIndex: 3 });

    expect(particle.textureIndex).toBe(3);
    expect(Math.abs(particle.x)).toBeLessThanOrEqual(STICKER_PARTICLE_CONFIG.spawnWidth / 2);
    expect(particle.y).toBeGreaterThanOrEqual(STICKER_PARTICLE_CONFIG.positionY);
    expect(particle.y).toBeLessThanOrEqual(
      STICKER_PARTICLE_CONFIG.positionY + STICKER_PARTICLE_CONFIG.spawnHeight,
    );
    expect(particle.scale).toBe(STICKER_PARTICLE_CONFIG.scale);
  });

  it("advances fall, accumulated wind and rotation from elapsed time", () => {
    const particle = createStickerParticle({ seed: 23, textureIndex: 2, origin: [0, 4, -4] });
    const initialX = particle.x;
    const initialY = particle.y;
    const initialRotation = particle.rotation;

    advanceStickerParticle(particle, { delta: 0.5, elapsed: 2 });

    expect(particle.y).toBeLessThan(initialY);
    expect(particle.x).not.toBe(initialX);
    expect(particle.rotation).not.toBe(initialRotation);
  });

  it("scales and fades particles at both edges of their fall", () => {
    const particle = createStickerParticle({ seed: 31, textureIndex: 1, origin: [0, 4, -4] });
    const beginning = resolveStickerAppearance(particle);
    particle.y -= STICKER_PARTICLE_CONFIG.fallDistance * 0.5;
    const middle = resolveStickerAppearance(particle);
    particle.y = particle.spawnY - STICKER_PARTICLE_CONFIG.fallDistance;
    const ending = resolveStickerAppearance(particle);

    expect(beginning.opacity).toBeLessThan(middle.opacity);
    expect(ending.opacity).toBeLessThan(middle.opacity);
    expect(hasStickerCompletedFall(particle)).toBe(true);
  });

  it("reuses an inactive burst slot before growing the particle pool", () => {
    const active = createStickerParticle({ seed: 1, textureIndex: 0 });
    const inactive = createStickerParticle({ seed: 2, textureIndex: 1 });
    inactive.active = false;

    expect(findAvailableStickerSlot([active, inactive], 96)).toBe(1);
    expect(findAvailableStickerSlot([active], 96)).toBe(1);
    expect(findAvailableStickerSlot([active], 1)).toBe(-1);
  });
});
