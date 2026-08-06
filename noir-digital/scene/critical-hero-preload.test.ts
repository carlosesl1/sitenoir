import { describe, expect, it, vi } from "vitest";

import {
  CRITICAL_HERO_MODEL_SOURCES,
  preloadCriticalHeroModels,
} from "@/scene/critical-hero-preload";

describe("critical hero preloads", () => {
  it("preloads only the two models required by the first hero frame", () => {
    expect(CRITICAL_HERO_MODEL_SOURCES).toEqual([
      "/assets/v1/model/hello-6991848c1d51.glb",
      "/assets/v1/model/cursor-a69d5b3f772e.glb",
    ]);

    const preloadResource = vi.fn();
    preloadCriticalHeroModels(preloadResource);

    expect(preloadResource.mock.calls).toEqual(
      CRITICAL_HERO_MODEL_SOURCES.map((source) => [
        source,
        {
          as: "fetch",
          crossOrigin: "anonymous",
          type: "model/gltf-binary",
        },
      ]),
    );
  });
});
