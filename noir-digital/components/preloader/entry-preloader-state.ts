export interface EntryReadiness {
  readonly documentReady: boolean;
  readonly fontsReady: boolean;
}

export function resolveEntryLoadProgress(readiness: EntryReadiness): number {
  const readySources = [readiness.documentReady, readiness.fontsReady].filter(Boolean).length;

  return (readySources / 2) * 100;
}
