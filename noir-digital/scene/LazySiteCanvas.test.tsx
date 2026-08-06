import { cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LazySiteCanvas } from "@/scene/LazySiteCanvas";

const siteCanvasModuleProbe = vi.hoisted(() => ({ loaded: vi.fn() }));

vi.mock("@/scene/SiteCanvas", () => {
  siteCanvasModuleProbe.loaded();
  return { SiteCanvas: () => null };
});

describe("LazySiteCanvas", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
    delete document.documentElement.dataset["sceneReady"];
    delete window.__NOIR_READY__;
    delete window.__NOIR_SCENE_STATUS__;
  });

  it("starts loading the critical scene module during render", async () => {
    renderToString(<LazySiteCanvas preloadDuringEntry />);

    await vi.waitFor(() => expect(siteCanvasModuleProbe.loaded).toHaveBeenCalledTimes(1));
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
