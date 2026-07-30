import { Color, DataTexture, NoBlending, RepeatWrapping, RGBAFormat, ShaderMaterial } from "three";

import { FULLSCREEN_VERTEX_SHADER } from "@/scene/hero-background-shaders";

export function createOpticalMaterial(
  fragmentShader: string,
  uniforms: ShaderMaterial["uniforms"],
): ShaderMaterial {
  return new ShaderMaterial({
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
    fragmentShader,
    toneMapped: false,
    uniforms,
    vertexShader: FULLSCREEN_VERTEX_SHADER,
  });
}

export function createBlueNoise(size: number): DataTexture {
  const pixels = new Uint8Array(size * size * 4);
  let seed = 0x9e37_79b9;
  for (let index = 0; index < pixels.length; index += 4) {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    const value = seed >>> 24;
    pixels[index] = value;
    pixels[index + 1] = value;
    pixels[index + 2] = value;
    pixels[index + 3] = 255;
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function readOpticalToken(name: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value);
}
