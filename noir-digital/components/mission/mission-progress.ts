export const MISSION_STORY_VIEWPORTS = 4;

export interface MissionProgress {
  /** Horizontal track offset in viewport widths: 1 = off-screen right, -1 = second panel. */
  readonly trackX: number;
  readonly fillStatement: number;
  readonly fillDetail: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smooth(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function segment(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

const ENTER_END = 0.25;
const STATEMENT_FILL_END = 0.45;
const SHIFT_END = 0.6;
const DETAIL_FILL_END = 0.92;

/**
 * Progress starts when the section top reaches the bottom of the viewport, so
 * the first panel slides in from the right while the section rises and is
 * centered by the time the frame pins.
 */
export function resolveMissionViewportProgress({
  sectionTop,
  storyHeight,
  viewportHeight,
  storyViewports = MISSION_STORY_VIEWPORTS,
}: {
  readonly sectionTop: number;
  /** Rendered section height, when it no longer equals viewport x storyViewports. */
  readonly storyHeight?: number;
  readonly viewportHeight: number;
  readonly storyViewports?: number;
}): number {
  const height = Math.max(1, viewportHeight);
  const travel = storyHeight ?? height * Math.max(1, storyViewports);
  return clamp01((height - sectionTop) / Math.max(1, travel));
}

export function resolveMissionProgress(progress: number): MissionProgress {
  const p = clamp01(progress);
  const enter = smooth(segment(p, 0, ENTER_END));
  const shift = smooth(segment(p, STATEMENT_FILL_END, SHIFT_END));

  return {
    trackX: 1 - enter - shift,
    fillStatement: segment(p, ENTER_END * 0.6, STATEMENT_FILL_END),
    fillDetail: segment(p, SHIFT_END - 0.04, DETAIL_FILL_END),
  };
}
