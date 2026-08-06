import type { Camera, Object3D } from "three";

export type SceneCompileMode = "async" | "sync";

export const SCENE_COMPILE_ASYNC_TIMEOUT_MS = 6_000;

interface ParallelShaderContext {
  readonly getExtension: (name: string) => unknown;
}

export interface SceneProgramCompiler {
  readonly compile: (scene: Object3D, camera: Camera) => void;
  readonly compileAsync?: ((scene: Object3D, camera: Camera) => Promise<unknown>) | undefined;
  readonly getContext?: (() => ParallelShaderContext) | undefined;
}

function supportsParallelShaderCompilation(renderer: SceneProgramCompiler): boolean {
  if (typeof renderer.getContext !== "function") return true;

  try {
    return renderer.getContext().getExtension("KHR_parallel_shader_compile") !== null;
  } catch {
    return false;
  }
}

async function compileWithTimeout(
  renderer: SceneProgramCompiler,
  scene: Object3D,
  camera: Camera,
): Promise<void> {
  const compileAsync = renderer.compileAsync;
  if (!compileAsync) return;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      compileAsync.call(renderer, scene, camera),
      new Promise<never>((_resolve, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Parallel scene compilation timed out")),
          SCENE_COMPILE_ASYNC_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

export async function compileScenePrograms(
  renderer: SceneProgramCompiler,
  scene: Object3D,
  camera: Camera,
): Promise<SceneCompileMode> {
  if (typeof renderer.compileAsync === "function" && supportsParallelShaderCompilation(renderer)) {
    try {
      await compileWithTimeout(renderer, scene, camera);
      return "async";
    } catch {
      renderer.compile(scene, camera);
      return "sync";
    }
  }

  renderer.compile(scene, camera);
  return "sync";
}
