const PARALLAX_STRENGTH = 1.4;

export interface CameraParallaxTarget {
  readonly x: number;
  readonly y: number;
}

export function resolveCameraParallax(
  pointerX: number,
  pointerY: number,
  reducedMotion: boolean,
  contactVisible: boolean,
  centerLocked = false,
): CameraParallaxTarget {
  if (reducedMotion || contactVisible || centerLocked) return { x: 0, y: 0 };

  return {
    x: -pointerX * PARALLAX_STRENGTH,
    y: -pointerY * PARALLAX_STRENGTH * 0.6,
  };
}
