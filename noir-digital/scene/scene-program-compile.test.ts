import { PerspectiveCamera, Scene } from "three";
import { describe, expect, it, vi } from "vitest";

import { compileScenePrograms } from "@/scene/scene-program-compile";

describe("scene program compilation", () => {
  const scene = new Scene();
  const camera = new PerspectiveCamera();

  it("uses parallel shader compilation when the renderer supports it", async () => {
    const compile = vi.fn();
    const compileAsync = vi.fn().mockResolvedValue(undefined);

    await expect(compileScenePrograms({ compile, compileAsync }, scene, camera)).resolves.toBe(
      "async",
    );
    expect(compileAsync).toHaveBeenCalledWith(scene, camera);
    expect(compile).not.toHaveBeenCalled();
  });

  it("falls back to synchronous compilation when compileAsync is unavailable", async () => {
    const compile = vi.fn();

    await expect(compileScenePrograms({ compile }, scene, camera)).resolves.toBe("sync");
    expect(compile).toHaveBeenCalledWith(scene, camera);
  });

  it("falls back to synchronous compilation when compileAsync rejects", async () => {
    const compile = vi.fn();
    const compileAsync = vi.fn().mockRejectedValue(new Error("parallel compile unavailable"));

    await expect(compileScenePrograms({ compile, compileAsync }, scene, camera)).resolves.toBe(
      "sync",
    );
    expect(compile).toHaveBeenCalledWith(scene, camera);
  });
});
