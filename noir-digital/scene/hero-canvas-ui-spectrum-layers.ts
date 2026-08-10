import type { BufferGeometry, Material } from "three";

interface HeroCanvasUiSpectrumLayerOptions {
  readonly geometry: BufferGeometry;
  readonly physicalMaterial: Material;
  readonly spectrumMaterial: Material;
}

export function createHeroCanvasUiSpectrumLayers({
  geometry,
  physicalMaterial,
  spectrumMaterial,
}: HeroCanvasUiSpectrumLayerOptions) {
  return [
    { geometry, id: "physical", material: physicalMaterial, renderOrder: 0 },
    { geometry, id: "spectrum", material: spectrumMaterial, renderOrder: 1 },
  ] as const;
}
