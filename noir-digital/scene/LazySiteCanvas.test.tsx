import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LazySiteCanvas } from "@/scene/LazySiteCanvas";

describe("LazySiteCanvas", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
    delete document.documentElement.dataset["sceneReady"];
    delete window.__NOIR_READY__;
    delete window.__NOIR_SCENE_STATUS__;
  });

  it("settles the preloader safely when WebGL is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const view = render(<LazySiteCanvas preloadDuringEntry />);

    expect(view.container.querySelector('[data-site-canvas="true"]')).not.toBeInTheDocument();
    expect(window.__NOIR_READY__).toBe(true);
    expect(window.__NOIR_SCENE_STATUS__).toBe("failed");
    expect(document.documentElement.dataset["sceneReady"]).toBe("true");
  });

  it("marks an explicitly disabled scene as settled", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    window.history.replaceState({}, "", "/?effects=off");

    render(<LazySiteCanvas />);

    expect(window.__NOIR_READY__).toBe(true);
    expect(window.__NOIR_SCENE_STATUS__).toBe("disabled");
  });
});
