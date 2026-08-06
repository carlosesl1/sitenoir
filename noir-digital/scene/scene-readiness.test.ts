import { afterEach, describe, expect, it, vi } from "vitest";

import {
  NOIR_SCENE_SETTLED_EVENT,
  resetSceneReadiness,
  signalSceneSettled,
} from "@/scene/scene-readiness";

describe("scene readiness", () => {
  afterEach(() => {
    delete document.documentElement.dataset["sceneReady"];
    delete window.__NOIR_READY__;
    delete window.__NOIR_SCENE_STATUS__;
    vi.restoreAllMocks();
  });

  it("signals a terminal scene state to the preloader", () => {
    const listener = vi.fn();
    window.addEventListener(NOIR_SCENE_SETTLED_EVENT, listener, { once: true });

    signalSceneSettled("ready");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(window.__NOIR_READY__).toBe(true);
    expect(window.__NOIR_SCENE_STATUS__).toBe("ready");
    expect(document.documentElement.dataset["sceneReady"]).toBe("true");
  });

  it("resets readiness while a new scene is loading", () => {
    signalSceneSettled("ready");

    resetSceneReadiness();

    expect(window.__NOIR_READY__).toBe(false);
    expect(window.__NOIR_SCENE_STATUS__).toBe("loading");
    expect(document.documentElement.dataset["sceneReady"]).toBeUndefined();
  });
});
