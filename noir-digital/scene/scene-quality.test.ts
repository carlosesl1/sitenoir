import { describe, expect, it } from "vitest";

import { resolveSceneQuality, resolveSceneQualityConfig } from "@/scene/scene-quality";

describe("scene quality", () => {
  it("keeps the full visual pipeline on capable hardware", () => {
    expect(
      resolveSceneQuality({
        deviceMemory: 8,
        effectiveType: "4g",
        effectsParameter: null,
        hardwareConcurrency: 8,
        saveData: false,
        supportsWebGl: true,
      }),
    ).toBe("full");
  });

  it("keeps every effect but selects lower internal resolution on constrained hardware", () => {
    const quality = resolveSceneQuality({
      deviceMemory: 2,
      effectiveType: "3g",
      effectsParameter: null,
      hardwareConcurrency: 4,
      saveData: false,
      supportsWebGl: true,
    });

    expect(quality).toBe("low");
    expect(resolveSceneQualityConfig(quality)).toMatchObject({
      effectsEnabled: true,
      maximumDpr: 1,
    });
  });

  it("uses off only for an explicit request or missing WebGL", () => {
    expect(
      resolveSceneQuality({
        effectsParameter: "off",
        supportsWebGl: true,
      }),
    ).toBe("off");
    expect(
      resolveSceneQuality({
        effectsParameter: "full",
        supportsWebGl: false,
      }),
    ).toBe("off");
  });

  it("honors explicit full and low overrides", () => {
    const constrained = {
      deviceMemory: 1,
      effectiveType: "slow-2g",
      hardwareConcurrency: 2,
      saveData: true,
      supportsWebGl: true,
    } as const;

    expect(resolveSceneQuality({ ...constrained, effectsParameter: "full" })).toBe("full");
    expect(resolveSceneQuality({ ...constrained, effectsParameter: "low" })).toBe("low");
  });
});
