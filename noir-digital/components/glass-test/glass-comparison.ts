export const COMPARISON_VIEWPORT = { width: 1440, height: 900 } as const;

export function comparisonFrameScale(availableWidth: number): number {
  return Math.min(1, Math.max(0, availableWidth) / COMPARISON_VIEWPORT.width);
}
