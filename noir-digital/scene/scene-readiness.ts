export const NOIR_SCENE_SETTLED_EVENT = "noir:scene-settled";

export type NoirSceneStatus = "disabled" | "failed" | "loading" | "ready";

declare global {
  interface Window {
    __NOIR_CONTACT_READY__?: boolean;
    __NOIR_COMPILE_MODE__?: "async" | "failed" | "sync";
    __NOIR_DECOR_READY__?: boolean;
    __NOIR_READY__?: boolean;
    __NOIR_SCENE_STATUS__?: NoirSceneStatus;
  }
}

export function resetSceneReadiness(): void {
  delete document.documentElement.dataset["sceneReady"];
  window.__NOIR_READY__ = false;
  window.__NOIR_SCENE_STATUS__ = "loading";
}

export function signalSceneSettled(status: Exclude<NoirSceneStatus, "loading">): void {
  document.documentElement.dataset["sceneReady"] = "true";
  window.__NOIR_READY__ = true;
  window.__NOIR_SCENE_STATUS__ = status;
  window.dispatchEvent(new Event(NOIR_SCENE_SETTLED_EVENT));
}
