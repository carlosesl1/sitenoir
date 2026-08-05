export const PROGRESSIVE_SCENE_IDLE_TIMEOUT_MS = 1_500;

const PROGRESSIVE_SCENE_FALLBACK_DELAY_MS = 350;

export function scheduleProgressiveSceneBoot(activate: () => void): () => void {
  let active = true;
  const run = () => {
    if (active) activate();
  };

  if (typeof window.requestIdleCallback === "function") {
    const callback = window.requestIdleCallback(run, {
      timeout: PROGRESSIVE_SCENE_IDLE_TIMEOUT_MS,
    });
    return () => {
      active = false;
      window.cancelIdleCallback(callback);
    };
  }

  const timeout = window.setTimeout(run, PROGRESSIVE_SCENE_FALLBACK_DELAY_MS);
  return () => {
    active = false;
    window.clearTimeout(timeout);
  };
}
