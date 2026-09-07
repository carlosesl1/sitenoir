import type { Object3D } from "three";
import { CONTACT_FLARE_LAYER } from "./contact-flare-layer";

/** Reuse scratch storage without caching membership: scene contents can change between frames. */
export function createRefractionVisibility() {
  const hidden: Object3D[] = [];
  const hideObject = (object: Object3D) => {
    if (
      !object.visible ||
      (object.userData["contactRefractiveObject"] !== true &&
        !object.layers.isEnabled(CONTACT_FLARE_LAYER))
    )
      return;
    hidden.push(object);
    object.visible = false;
  };
  return {
    hide(scene: Object3D) {
      scene.traverse(hideObject);
    },
    restore() {
      for (const object of hidden) object.visible = true;
      hidden.length = 0;
    },
  };
}
