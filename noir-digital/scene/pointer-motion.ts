const POINTER_SCROLL_SPIN_DEGREES = 720;
const POINTER_EXIT_END_PROGRESS = 0.09;
export const POINTER_ROTATION_AXIS_TILT_DEGREES = 45;

export function resolvePointerExitProgress(scrollProgress: number): number {
  return Math.min(1, Math.max(0, scrollProgress / POINTER_EXIT_END_PROGRESS));
}

export function resolvePointerScrollRotation(progress: number): number {
  return Math.min(1, Math.max(0, progress)) * POINTER_SCROLL_SPIN_DEGREES;
}
