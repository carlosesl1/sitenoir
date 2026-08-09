export interface EntryGateState {
  readonly documentReady: boolean;
  readonly fontsReady: boolean;
  readonly sceneReady: boolean;
  readonly symbolReady: boolean;
  readonly revealReady: boolean;
  readonly reducedMotion: boolean;
}

export function canRevealEntry(state: EntryGateState): boolean {
  return (
    state.documentReady &&
    state.fontsReady &&
    state.sceneReady &&
    (state.reducedMotion || state.symbolReady) &&
    (state.reducedMotion || state.revealReady)
  );
}
