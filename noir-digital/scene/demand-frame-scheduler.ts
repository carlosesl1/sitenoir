export interface DemandFrameScrollProgress {
  readonly on: (event: "change", listener: () => void) => () => void;
}

interface DemandFrameSchedulerOptions {
  readonly idleWindowMs: number;
  readonly invalidate: () => void;
  readonly reducedMotion: boolean;
  readonly scrollProgress: DemandFrameScrollProgress;
}

const ACTIVITY_EVENTS = [
  "keydown",
  "pointerdown",
  "pointermove",
  "pointerout",
  "resize",
  "scroll",
  "wheel",
] as const;
const POINTER_IDLE_WINDOW_MS = 600;

export function startDemandFrameScheduler({
  idleWindowMs,
  invalidate,
  reducedMotion,
  scrollProgress,
}: DemandFrameSchedulerOptions): () => void {
  let animationFrame = 0;
  let activeUntil = performance.now() + (reducedMotion ? 0 : 5_000);

  const pump = () => {
    animationFrame = 0;
    if (document.hidden) return;
    invalidate();
    if (!reducedMotion && performance.now() < activeUntil) {
      animationFrame = window.requestAnimationFrame(pump);
    }
  };
  const wake = (event?: Event) => {
    if (event?.type === "pointerout" && "relatedTarget" in event && event.relatedTarget !== null)
      return;
    const activityWindowMs =
      event?.type === "pointermove" ? Math.min(idleWindowMs, POINTER_IDLE_WINDOW_MS) : idleWindowMs;
    activeUntil = Math.max(activeUntil, performance.now() + activityWindowMs);
    if (animationFrame === 0 && !document.hidden) {
      animationFrame = window.requestAnimationFrame(pump);
    }
  };
  const handleVisibility = () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else {
      wake();
    }
  };

  for (const eventName of ACTIVITY_EVENTS)
    window.addEventListener(eventName, wake, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  const unsubscribe = scrollProgress.on("change", wake);
  wake();

  return () => {
    unsubscribe();
    window.cancelAnimationFrame(animationFrame);
    for (const eventName of ACTIVITY_EVENTS) window.removeEventListener(eventName, wake);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}
