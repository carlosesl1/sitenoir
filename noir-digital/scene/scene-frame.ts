const MAX_SCENE_DELTA_SECONDS = 1 / 30;

export function resolveSceneFrameDelta(delta: number): number {
  return Math.max(0, Math.min(delta, MAX_SCENE_DELTA_SECONDS));
}
