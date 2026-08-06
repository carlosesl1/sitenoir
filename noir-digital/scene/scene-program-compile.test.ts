import { PerspectiveCamera, Scene } from "three";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  compileScenePrograms,
  SCENE_COMPILE_ASYNC_TIMEOUT_MS,
} from "@/scene/scene-program-compile";

describe("scene program compilation", () => {
  const scene = new Scene();
  const camera = new PerspectiveCamera();

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("avoids compileAsync when parallel shader compilation is unsupported", async () => {
    const compile = vi.fn();
    const compileAsync = vi.fn().mockResolvedValue(undefined);
    const getExtension = vi.fn().mockReturnValue(null);

    await expect(
      compileScenePrograms(
        { compile, compileAsync, getContext: () => ({ getExtension }) },
        scene,
        camera,
      ),
    ).resolves.toBe("sync");
    expect(getExtension).toHaveBeenCalledWith("KHR_parallel_shader_compile");
    expect(compileAsync).not.toHaveBeenCalled();
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

  it("falls back when parallel compilation does not settle", async () => {
    vi.useFakeTimers();
    const compile = vi.fn();
    const compileAsync = vi.fn(() => new Promise(() => undefined));
    const result = compileScenePrograms({ compile, compileAsync }, scene, camera);

    await vi.advanceTimersByTimeAsync(SCENE_COMPILE_ASYNC_TIMEOUT_MS);

    await expect(result).resolves.toBe("sync");
    expect(compile).toHaveBeenCalledWith(scene, camera);
  });
});
