export interface EntryReadiness {
  readonly documentReady: boolean;
  readonly fontsReady: boolean;
  readonly sceneReady: boolean;
}

interface EntryDisplayProgressOptions {
  readonly currentProgress: number;
  readonly elapsedMs: number;
  readonly loadProgress: number;
  readonly sceneReady: boolean;
}

const ENTRY_PROGRESS_CATCH_UP_RATE_PER_SECOND = 96;
const ENTRY_PROGRESS_COMPLETION_RATE_PER_SECOND = 160;
const ENTRY_PROGRESS_SCENE_WAIT_RATE_PER_SECOND = 18;
const ENTRY_PROGRESS_SCENE_GATE = (2 / 3) * 100;

export const ENTRY_PROGRESS_SCENE_CEILING = 94;

export function resolveEntryLoadProgress(readiness: EntryReadiness): number {
  const readySources = [readiness.documentReady, readiness.fontsReady, readiness.sceneReady].filter(
    Boolean,
  ).length;

  return (readySources / 3) * 100;
}

export function resolveEntryDisplayProgressTarget(
  loadProgress: number,
  sceneReady: boolean,
): number {
  if (sceneReady) return 100;
  if (loadProgress >= ENTRY_PROGRESS_SCENE_GATE) return ENTRY_PROGRESS_SCENE_CEILING;
  return loadProgress;
}

export function advanceEntryDisplayProgress({
  currentProgress,
  elapsedMs,
  loadProgress,
  sceneReady,
}: EntryDisplayProgressOptions): number {
  const targetProgress = resolveEntryDisplayProgressTarget(loadProgress, sceneReady);
  if (currentProgress >= targetProgress) return targetProgress;

  const ratePerSecond = sceneReady
    ? ENTRY_PROGRESS_COMPLETION_RATE_PER_SECOND
    : currentProgress < loadProgress
      ? ENTRY_PROGRESS_CATCH_UP_RATE_PER_SECOND
      : ENTRY_PROGRESS_SCENE_WAIT_RATE_PER_SECOND;
  const progressDelta = ratePerSecond * (Math.max(0, elapsedMs) / 1_000);

  return Math.min(targetProgress, currentProgress + progressDelta);
}
