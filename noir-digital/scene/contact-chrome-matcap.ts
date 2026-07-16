import { DataTexture, LinearFilter, RGBAFormat, SRGBColorSpace, UnsignedByteType } from "three";

const MATCAP_SIZE = 256;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const progress = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

export function sampleContactChromeMatcap(nx: number, ny: number): number {
  const radius = Math.min(1, Math.hypot(nx, ny));
  const brightFace = 0.9 - radius * 0.16;
  const darkBand = smoothstep(0.12, 0.25, radius) * (1 - smoothstep(0.55, 0.78, radius)) * 0.82;
  const rim = smoothstep(0.78, 0.98, radius) * 0.76;
  const diagonalDistance = (ny + nx * 0.28 - 0.06) / 0.055;
  const diagonal = Math.exp(-(diagonalDistance ** 2)) * 0.24;

  return clamp(brightFace - darkBand + rim + diagonal, 0.015, 1);
}

export function createContactChromeMatcap(): DataTexture {
  const data = new Uint8Array(MATCAP_SIZE * MATCAP_SIZE * 4);

  for (let y = 0; y < MATCAP_SIZE; y += 1) {
    for (let x = 0; x < MATCAP_SIZE; x += 1) {
      const nx = ((x + 0.5) / MATCAP_SIZE) * 2 - 1;
      const ny = 1 - ((y + 0.5) / MATCAP_SIZE) * 2;
      const intensity = sampleContactChromeMatcap(nx, ny);
      const channel = Math.round(intensity * 255);
      const index = (y * MATCAP_SIZE + x) * 4;
      data[index] = channel;
      data[index + 1] = channel;
      data[index + 2] = channel;
      data[index + 3] = 255;
    }
  }

  const texture = new DataTexture(data, MATCAP_SIZE, MATCAP_SIZE, RGBAFormat, UnsignedByteType);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
