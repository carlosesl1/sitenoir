import { describe, expect, it } from "vitest";

import {
  INITIAL_SCENE_TRANSITION,
  resolveSceneCameraZ,
  resolveSceneTransition,
  shouldRenderOpticalFrame,
} from "@/scene/scene-transition";

describe("scene transition", () => {
  it("enters and exits the solid state with the source hysteresis", () => {
    const entering = resolveSceneTransition(INITIAL_SCENE_TRANSITION, {
      contactVisible: false,
      progress: 0.9,
      sourceVisible: true,
      stickersActive: false,
    });
    const retained = resolveSceneTransition(entering, {
      contactVisible: false,
      progress: 0.84,
      sourceVisible: true,
      stickersActive: false,
    });

    expect(entering.solid).toBe(true);
    expect(retained.solid).toBe(true);
    expect(
      resolveSceneTransition(retained, {
        contactVisible: false,
        progress: 0.81,
        sourceVisible: true,
        stickersActive: false,
      }).solid,
    ).toBe(false);
  });

  it("freezes refractive scene updates at the source threshold", () => {
    const state = resolveSceneTransition(INITIAL_SCENE_TRANSITION, {
      contactVisible: true,
      progress: 0.985,
      sourceVisible: true,
      stickersActive: false,
    });

    expect(state.refractive).toBe(true);
    expect(state.opticalFrozen).toBe(true);
    expect(state.contactVisible).toBe(true);
  });

  it("slows optical rendering while the dither closes", () => {
    expect(shouldRenderOpticalFrame(1, 0.4, false)).toBe(true);
    expect(shouldRenderOpticalFrame(1, 0.6, false)).toBe(false);
    expect(shouldRenderOpticalFrame(2, 0.6, false)).toBe(true);
    expect(shouldRenderOpticalFrame(2, 0.8, false)).toBe(false);
    expect(shouldRenderOpticalFrame(4, 0.8, false)).toBe(true);
    expect(shouldRenderOpticalFrame(3, 0.2, true)).toBe(true);
    expect(shouldRenderOpticalFrame(4, 0.6, false, false)).toBe(false);
  });

  it("enters from the far camera and follows the 24 to 32 transition range", () => {
    expect(resolveSceneCameraZ(0, 0)).toBe(32);
    expect(resolveSceneCameraZ(0, 1)).toBe(24);
    expect(resolveSceneCameraZ(1, 1)).toBe(32);
  });
});
