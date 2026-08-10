import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  CRITICAL_HERO_MODEL_SOURCES,
  HERO_MODEL_SOURCE,
  preloadCriticalHeroModels,
} from "@/scene/critical-hero-preload";

describe("critical hero preloads", () => {
  it("preloads only the two models required by the first hero frame", () => {
    expect(HERO_MODEL_SOURCE).toMatch(/^\/assets\/v1\/model\/noir-adjusted-[a-f0-9]{12}\.glb$/);
    expect(CRITICAL_HERO_MODEL_SOURCES).toEqual([
      HERO_MODEL_SOURCE,
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

  it("ships the optimized reference model as a valid compact GLB", () => {
    const assetPath = join(process.cwd(), "public", HERO_MODEL_SOURCE.slice(1));
    const bytes = readFileSync(assetPath);

    expect(bytes.subarray(0, 4).toString("ascii")).toBe("glTF");
    expect(statSync(assetPath).size).toBeLessThan(800_000);
  });
});
