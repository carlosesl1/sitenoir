export interface ViewportBasis {
  readonly height: number;
  readonly width: number;
}

/**
 * Mobile browsers resize the viewport when their address bar slides in or out.
 * Anything taller than that is a real resize: a rotation, a split screen, a window drag.
 */
export const BROWSER_BAR_MAX_HEIGHT_PX = 150;

/**
 * Keeps the height that pinned sections were sized with while only the browser
 * bar moved, so the page below them does not jump mid-scroll.
 */
export function resolveViewportBasis(
  previous: ViewportBasis | null,
  next: ViewportBasis,
): ViewportBasis {
  if (
    previous &&
    previous.width === next.width &&
    Math.abs(previous.height - next.height) <= BROWSER_BAR_MAX_HEIGHT_PX
  ) {
    return previous;
  }
  return next;
}
