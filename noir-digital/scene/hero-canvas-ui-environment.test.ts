import { existsSync } from "node:fs";
import { join } from "node:path";
import { Mesh, MeshBasicMaterial } from "three";
import type { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { describe, expect, it } from "vitest";

import { HERO_CANVAS_UI_REFLECTOR_CONFIG } from "@/scene/hero-canvas-ui-glass-config";

const environmentPath = join(process.cwd(), "scene/hero-canvas-ui-environment.ts");
const environmentModulePath = "@/scene/" + "hero-canvas-ui-environment";

describe("Canvas UI optical environment", () => {
  it("contains three angled white reflector cards without a circular emitter", async () => {
    expect(existsSync(environmentPath)).toBe(true);
    if (!existsSync(environmentPath)) return;

    const { createHeroCanvasUiEnvironmentRoom } = await import(environmentModulePath);
    const room = createHeroCanvasUiEnvironmentRoom() as RoomEnvironment;
    const opticalMeshes = room.children.filter(
      (child): child is Mesh => child instanceof Mesh && child.userData["canvasUiOptical"] === true,
    );
    const rings = opticalMeshes.filter((mesh) => mesh.userData["canvasUiRole"] === "ring");
    const reflectors = opticalMeshes.filter(
      (mesh) => mesh.userData["canvasUiRole"] === "reflector",
    );

    expect(opticalMeshes).toHaveLength(3);
    expect(rings).toHaveLength(0);
    expect(reflectors).toHaveLength(3);
    for (const mesh of opticalMeshes) {
      expect(mesh.material).toBeInstanceOf(MeshBasicMaterial);
      expect((mesh.material as MeshBasicMaterial).toneMapped).toBe(false);
    }
    expect(new Set(reflectors.map((mesh) => mesh.rotation.toArray().join(","))).size).toBe(3);
    expect(HERO_CANVAS_UI_REFLECTOR_CONFIG.map(({ intensity }) => intensity)).toEqual([
      50.7, 40.6, 58.5,
    ]);

    room.dispose();
  });
});
