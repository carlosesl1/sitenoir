export type SceneQuality = "full" | "low" | "off";

export interface SceneQualityInput {
  readonly deviceMemory?: number | undefined;
  readonly effectiveType?: string | undefined;
  readonly effectsParameter: string | null;
  readonly hardwareConcurrency?: number;
  readonly saveData?: boolean | undefined;
  readonly supportsWebGl: boolean;
}

export interface SceneQualityConfig {
  readonly effectsEnabled: boolean;
  readonly flareResolutionScale: number;
  readonly idleWindowMs: number;
  readonly maximumDpr: number;
  readonly opticalFrameStride: number;
  readonly opticalResolutionScale: number;
  readonly refractionResolutionScale: number;
}

const QUALITY_CONFIG = {
  full: {
    effectsEnabled: true,
    flareResolutionScale: 1,
    idleWindowMs: 1_800,
    maximumDpr: 1.5,
    opticalFrameStride: 1,
    opticalResolutionScale: 0.3,
    refractionResolutionScale: 0.5,
  },
  low: {
    effectsEnabled: true,
    flareResolutionScale: 0.75,
    idleWindowMs: 1_200,
    maximumDpr: 1,
    opticalFrameStride: 2,
    opticalResolutionScale: 0.24,
    refractionResolutionScale: 0.375,
  },
  off: {
    effectsEnabled: false,
    flareResolutionScale: 0,
    idleWindowMs: 0,
    maximumDpr: 1,
    opticalFrameStride: 1,
    opticalResolutionScale: 0,
    refractionResolutionScale: 0,
  },
} as const satisfies Record<SceneQuality, SceneQualityConfig>;

const SLOW_CONNECTIONS = new Set(["slow-2g", "2g"]);

export function resolveSceneQuality(input: SceneQualityInput): SceneQuality {
  if (!input.supportsWebGl || input.effectsParameter === "off") return "off";
  if (input.effectsParameter === "full") return "full";
  if (input.effectsParameter === "low") return "low";

  const constrained =
    input.saveData === true ||
    (input.effectiveType ? SLOW_CONNECTIONS.has(input.effectiveType) : false) ||
    (input.deviceMemory !== undefined && input.deviceMemory <= 4) ||
    (input.hardwareConcurrency !== undefined && input.hardwareConcurrency <= 4);

  return constrained ? "low" : "full";
}

export function resolveSceneQualityConfig(quality: SceneQuality): SceneQualityConfig {
  return QUALITY_CONFIG[quality];
}
