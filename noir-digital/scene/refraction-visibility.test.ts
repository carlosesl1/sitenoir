import { Group, Object3D, Scene } from "three";
import { describe, expect, it } from "vitest";
import { CONTACT_FLARE_LAYER } from "./contact-flare-layer";
import { createRefractionVisibility } from "./refraction-visibility";

describe("refraction visibility", () => {
  it("restores only originally visible exclusions, including nested objects", () => {
    const scene = new Scene();
    const contact = new Group();
    contact.userData["contactRefractiveObject"] = true;
    const flare = new Object3D();
    flare.layers.enable(CONTACT_FLARE_LAYER);
    const invisible = new Object3D();
    invisible.userData["contactRefractiveObject"] = true;
    invisible.visible = false;
    const ordinary = new Object3D();
    contact.add(flare);
    scene.add(contact, invisible, ordinary);
    const visibility = createRefractionVisibility();
    try {
      visibility.hide(scene);
      expect([contact.visible, flare.visible, invisible.visible, ordinary.visible]).toEqual([
        false,
        false,
        false,
        true,
      ]);
    } finally {
      visibility.restore();
    }
    expect([contact.visible, flare.visible, invisible.visible, ordinary.visible]).toEqual([
      true,
      true,
      false,
      true,
    ]);
    scene.remove(contact);
    contact.visible = false;
    ordinary.userData["contactRefractiveObject"] = true;
    visibility.hide(scene);
    expect(ordinary.visible).toBe(false);
    visibility.restore();
    expect(ordinary.visible).toBe(true);
    expect(contact.visible).toBe(false);
  });
});
