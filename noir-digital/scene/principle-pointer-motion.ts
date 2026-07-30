const REFERENCE_MARGIN = 120;
const PRELOAD_RANGE = 480;

export interface PrinciplePointerRect {
  readonly bottom: number;
  readonly exitPadding?: number;
  readonly height: number;
  readonly top: number;
  readonly viewportHeight: number;
  readonly margin?: number;
}

export interface PrinciplePointerRectMotion {
  readonly beforeShrink: boolean;
  readonly entryProgress: number;
  readonly shrinking: boolean;
  readonly shrinkProgress: number;
  readonly targetViewportY: number;
  readonly timeProgress: number;
  readonly visible: boolean;
}

export function resolveFullscreenCursorScale(
  viewportWidth: number,
  viewportHeight: number,
  modelRadius: number,
): number {
  const viewportDiagonal = Math.hypot(viewportWidth, viewportHeight);
  return (viewportDiagonal * 1.64) / Math.max(0.001, modelRadius);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number): number {
  const normalized = clamp01(value);
  return normalized * normalized * (3 - 2 * normalized);
}

export function resolvePrinciplePointerRectMotion({
  bottom,
  height,
  top,
  viewportHeight,
  margin = REFERENCE_MARGIN,
  exitPadding = viewportHeight * 0.045,
}: PrinciplePointerRect): PrinciplePointerRectMotion {
  const center = viewportHeight / 2;
  const canvasBottom = viewportHeight;
  const shrinkEnd = center + margin - height;
  const shrinkStart = Math.min(canvasBottom, shrinkEnd + viewportHeight);
  const shrinkProgress =
    top <= shrinkEnd
      ? 1
      : top >= shrinkStart
        ? 0
        : 1 - smoothstep((top - shrinkEnd) / Math.max(1, shrinkStart - shrinkEnd));
  const beforeShrink = top > shrinkStart;
  const shrinking = top <= shrinkStart && top > shrinkEnd;
  const entryProgress = smoothstep((center - (top + margin)) / Math.max(1, viewportHeight));
  const topEdge = top + margin;
  const bottomEdge = bottom - margin;
  const targetViewportY = beforeShrink
    ? Math.max(center, topEdge)
    : shrinking
      ? center
      : Math.min(center, bottomEdge);
  const timeProgress = 2 * clamp01((canvasBottom - top) / Math.max(1, canvasBottom + height));
  return {
    beforeShrink,
    entryProgress,
    shrinking,
    shrinkProgress,
    targetViewportY,
    timeProgress,
    visible:
      top < canvasBottom + Math.max(2 * margin, PRELOAD_RANGE) &&
      bottom > -(6 * margin) &&
      bottom >= -Math.min(viewportHeight * 0.35, exitPadding),
  };
}

export function resolvePrinciplePointerRotation(
  motion: Pick<PrinciplePointerRectMotion, "beforeShrink" | "shrinking" | "shrinkProgress">,
  revealProgress: number,
): number {
  if (motion.shrinking) {
    return 180 + clamp01((motion.shrinkProgress - 0.6) / 0.4) * 180;
  }
  if (motion.beforeShrink) {
    return clamp01(revealProgress / 0.4) * 180;
  }
  return motion.shrinkProgress >= 1 ? 360 : 180;
}
