import type { Camera, Object3D } from "three";

export type SceneCompileMode = "async" | "sync";

export interface SceneProgramCompiler {
  readonly compile: (scene: Object3D, camera: Camera) => void;
  readonly compileAsync?: ((scene: Object3D, camera: Camera) => Promise<unknown>) | undefined;
}

export async function compileScenePrograms(
  renderer: SceneProgramCompiler,
  scene: Object3D,
  camera: Camera,
): Promise<SceneCompileMode> {
  if (typeof renderer.compileAsync === "function") {
    try {
      await renderer.compileAsync(scene, camera);
      return "async";
    } catch {
      renderer.compile(scene, camera);
      return "sync";
    }
  }

  renderer.compile(scene, camera);
  return "sync";
}
