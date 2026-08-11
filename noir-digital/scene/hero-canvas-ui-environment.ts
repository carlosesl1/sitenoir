import {
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import {
  HERO_CANVAS_UI_GLASS_CONFIG,
  HERO_CANVAS_UI_REFLECTOR_CONFIG,
} from "@/scene/hero-canvas-ui-glass-config";

function createOpticalMaterial(color: string, intensity: number): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: new Color(color).multiplyScalar(intensity),
    side: DoubleSide,
    toneMapped: false,
  });
}

export function createHeroCanvasUiEnvironmentRoom(): RoomEnvironment {
  const room = new RoomEnvironment();
  for (const reflectorConfig of HERO_CANVAS_UI_REFLECTOR_CONFIG) {
    const reflector = new Mesh(
      new BoxGeometry(1, 1, 1),
      createOpticalMaterial(reflectorConfig.color, reflectorConfig.intensity),
    );
    const [positionX, positionY, positionZ] = reflectorConfig.position;
    const [rotationX, rotationY, rotationZ] = reflectorConfig.rotation;
    const [scaleX, scaleY, scaleZ] = reflectorConfig.scale;
    reflector.position.set(positionX, positionY, positionZ);
    reflector.rotation.set(rotationX, rotationY, rotationZ);
    reflector.scale.set(scaleX, scaleY, scaleZ);
    reflector.userData["canvasUiOptical"] = true;
    reflector.userData["canvasUiRole"] = "reflector";
    room.add(reflector);
  }

  return room;
}

export function createHeroCanvasUiEnvironment(gl: WebGLRenderer): WebGLRenderTarget {
  const room = createHeroCanvasUiEnvironmentRoom();
  const pmrem = new PMREMGenerator(gl);
  try {
    return pmrem.fromScene(room, HERO_CANVAS_UI_GLASS_CONFIG.environmentBlur, 0.1, 1000);
  } finally {
    room.dispose();
    pmrem.dispose();
  }
}
