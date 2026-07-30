export interface SceneTransitionState {
  readonly contactVisible: boolean;
  readonly opticalFrozen: boolean;
  readonly progress: number;
  readonly refractive: boolean;
  readonly solid: boolean;
  readonly sourceVisible: boolean;
  readonly stickersActive: boolean;
}

export interface SceneTransitionInput {
  readonly contactVisible: boolean;
  readonly progress: number;
  readonly sourceVisible: boolean;
  readonly stickersActive: boolean;
}

interface SceneTransitionStore {
  readonly getSnapshot: () => SceneTransitionState;
  readonly update: (input: SceneTransitionInput) => void;
}

const SOLID_ENTER = 0.9;
const SOLID_EXIT = 0.82;
const REFRACTIVE_ENTER = 0.985;
const REFRACTIVE_EXIT = 0.965;
const OPTICAL_FREEZE = 0.98;

export const INITIAL_SCENE_TRANSITION: SceneTransitionState = Object.freeze({
  contactVisible: false,
  opticalFrozen: false,
  progress: 0,
  refractive: false,
  solid: false,
  sourceVisible: true,
  stickersActive: false,
});

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function resolveSceneTransition(
  previous: SceneTransitionState,
  input: SceneTransitionInput,
): SceneTransitionState {
  const progress = clamp01(input.progress);
  const solid = previous.solid ? progress >= SOLID_EXIT : progress >= SOLID_ENTER;
  const refractive = previous.refractive
    ? progress >= REFRACTIVE_EXIT
    : progress >= REFRACTIVE_ENTER;

  return {
    contactVisible: input.contactVisible,
    opticalFrozen: progress >= OPTICAL_FREEZE,
    progress,
    refractive,
    solid,
    sourceVisible: input.sourceVisible,
    stickersActive: input.stickersActive,
  };
}

export function shouldRenderOpticalFrame(
  frame: number,
  progress: number,
  compactViewport: boolean,
  sourceVisible = true,
): boolean {
  if (!sourceVisible) return false;
  if (compactViewport) return frame % 3 === 0;
  if (progress > 0.75) return frame % 4 === 0;
  if (progress > 0.5) return frame % 2 === 0;
  return true;
}

export function resolveSceneCameraZ(progress: number, entranceProgress: number): number {
  const transitionZ = 24 + 8 * clamp01(progress);
  const entrance = clamp01(entranceProgress);
  const easedEntrance = 1 - (1 - entrance) ** 3;
  return 32 + (transitionZ - 32) * easedEntrance;
}

export function createSceneTransitionStore(): SceneTransitionStore {
  let snapshot = INITIAL_SCENE_TRANSITION;

  return {
    getSnapshot: () => snapshot,
    update(input) {
      snapshot = resolveSceneTransition(snapshot, input);
    },
  };
}

export const sceneTransitionStore = createSceneTransitionStore();
