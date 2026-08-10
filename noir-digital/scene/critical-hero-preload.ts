export const HERO_MODEL_SOURCE = "/assets/v1/model/noir-adjusted-afd7a8873be5.glb";
export const POINTER_MODEL_SOURCE = "/assets/v1/model/cursor-a69d5b3f772e.glb";

export const CRITICAL_HERO_MODEL_SOURCES = [HERO_MODEL_SOURCE, POINTER_MODEL_SOURCE] as const;

interface CriticalHeroPreloadOptions {
  readonly as: "fetch";
  readonly crossOrigin: "anonymous";
  readonly type: "model/gltf-binary";
}

type PreloadResource = (source: string, options: CriticalHeroPreloadOptions) => void;

const CRITICAL_HERO_PRELOAD_OPTIONS: CriticalHeroPreloadOptions = {
  as: "fetch",
  crossOrigin: "anonymous",
  type: "model/gltf-binary",
};

export function preloadCriticalHeroModels(preloadResource: PreloadResource): void {
  for (const source of CRITICAL_HERO_MODEL_SOURCES) {
    preloadResource(source, CRITICAL_HERO_PRELOAD_OPTIONS);
  }
}
