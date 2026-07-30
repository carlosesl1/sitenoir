export type PrincipleProgressStage = "positioning" | "design" | "principles" | "technology";

export interface PrincipleProgress {
  readonly stage: PrincipleProgressStage;
  readonly localProgress: number;
}

export interface PrincipleViewportProgressInput {
  readonly sectionTop: number;
  readonly viewportHeight: number;
  readonly storyViewports?: number;
}

function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

function stageFromIndex(index: number): PrincipleProgressStage {
  switch (index) {
    case 0:
      return "positioning";
    case 1:
      return "design";
    case 2:
      return "principles";
    default:
      return "technology";
  }
}

export function resolvePrincipleProgress(progress: number): PrincipleProgress {
  const normalizedProgress = clampProgress(progress);
  const stageIndex = Math.min(3, Math.floor(normalizedProgress * 4));
  const stageStart = stageIndex * 0.25;

  return {
    stage: stageFromIndex(stageIndex),
    localProgress: Math.min(1, (normalizedProgress - stageStart) / 0.25),
  };
}

export function resolvePrincipleStage(progress: number): PrincipleProgressStage {
  return resolvePrincipleProgress(progress).stage;
}

export function resolvePrincipleViewportProgress({
  sectionTop,
  viewportHeight,
  storyViewports = 8,
}: PrincipleViewportProgressInput): number {
  const travel = Math.max(1, viewportHeight) * Math.max(1, storyViewports);
  return clampProgress(-sectionTop / travel);
}
