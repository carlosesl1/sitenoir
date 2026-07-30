import { MathUtils } from "three";

export interface ContactModelMotionInput {
  readonly finalRotationX: number;
  readonly layoutY: number;
  readonly sectionHeight: number;
  readonly sectionTop: number;
  readonly viewportHeight: number;
  readonly viewportWorldHeight: number;
}

export interface ContactModelMotion {
  readonly entryProgress: number;
  readonly rotationX: number;
  readonly targetY: number;
  readonly visible: boolean;
}

const BEFORE_ROTATION_X = -Math.PI;

export function resolveContactModelMotion({
  finalRotationX,
  layoutY,
  sectionHeight,
  sectionTop,
  viewportHeight,
  viewportWorldHeight,
}: ContactModelMotionInput): ContactModelMotion {
  const safeViewportHeight = Math.max(1, viewportHeight);
  const entryProgress = MathUtils.clamp(
    (safeViewportHeight - sectionTop) / safeViewportHeight,
    0,
    1,
  );
  const sectionCenterY = sectionTop + sectionHeight / 2;

  return {
    entryProgress,
    rotationX: MathUtils.lerp(BEFORE_ROTATION_X, finalRotationX, entryProgress),
    targetY: layoutY + (0.5 - sectionCenterY / safeViewportHeight) * viewportWorldHeight,
    visible: sectionTop < safeViewportHeight && sectionTop + sectionHeight > 0,
  };
}

export { BEFORE_ROTATION_X };
