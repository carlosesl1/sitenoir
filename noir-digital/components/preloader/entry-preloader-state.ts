export interface EntryReadiness {
  readonly documentReady: boolean;
  readonly fontsReady: boolean;
  readonly sceneReady: boolean;
}

export function resolveEntryLoadProgress(readiness: EntryReadiness): number {
  const readySources = [readiness.documentReady, readiness.fontsReady, readiness.sceneReady].filter(
    Boolean,
  ).length;

  return (readySources / 3) * 100;
}
