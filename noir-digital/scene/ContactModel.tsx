"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Group, MathUtils, Vector3 } from "three";

import { ContactExternalGlow } from "@/scene/ContactExternalGlow";
import { BEFORE_ROTATION_X, resolveContactModelMotion } from "@/scene/contact-model-motion";
import { CONTACT_ASSET_PATH, resolveContactAssetScale } from "@/scene/contact-model-scale";
import { useGraphiteAsset } from "@/scene/GraphiteAsset";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import type { ModelTransform } from "@/scene/scene-layout";

const CONTACT_ASSET_SCALE = resolveContactAssetScale();
const CONTACT_DEPTH_SCALE = 3.98001451217401;

interface ContactModelProps {
  readonly layout: ModelTransform;
  readonly reducedMotion: boolean;
  readonly scrollProgress: { readonly get: () => number };
}

export function ContactModel({ layout, reducedMotion, scrollProgress }: ContactModelProps) {
  const groupRef = useRef<Group>(null);
  const contactRef = useRef<HTMLElement | null>(null);
  const viewportTargetRef = useRef(new Vector3());
  const scene = useGraphiteAsset(CONTACT_ASSET_PATH);

  useFrame((state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    const group = groupRef.current;
    if (!group) return;
    if (scrollProgress.get() < 0.75) {
      group.visible = false;
      return;
    }

    contactRef.current ??= document.getElementById("contact");
    const contact = contactRef.current;
    if (!contact) return;

    const rect = contact.getBoundingClientRect();
    const viewportHeight = Math.max(1, state.size.height);
    const worldViewport = state.viewport.getCurrentViewport(
      state.camera,
      viewportTargetRef.current.set(0, 0, layout.position[2]),
    );
    const motion = resolveContactModelMotion({
      finalRotationX: MathUtils.degToRad(layout.rotation[0]),
      layoutY: layout.position[1],
      sectionHeight: rect.height,
      sectionTop: rect.top,
      viewportHeight,
      viewportWorldHeight: worldViewport.height,
    });
    group.visible = motion.visible;
    if (!motion.visible) return;

    if (reducedMotion) {
      group.position.y = motion.targetY;
      group.rotation.x = MathUtils.degToRad(layout.rotation[0]);
      return;
    }

    group.position.y = MathUtils.damp(group.position.y, motion.targetY, 12, frameDelta);
    group.rotation.x = MathUtils.damp(group.rotation.x, motion.rotationX, 6, frameDelta);
  });

  return (
    <group
      ref={groupRef}
      position={layout.position}
      rotation={[
        BEFORE_ROTATION_X,
        MathUtils.degToRad(layout.rotation[1]),
        MathUtils.degToRad(layout.rotation[2]),
      ]}
      scale={layout.scale}
      visible={false}
    >
      <group
        scale={[
          CONTACT_ASSET_SCALE,
          CONTACT_ASSET_SCALE,
          CONTACT_ASSET_SCALE * CONTACT_DEPTH_SCALE,
        ]}
      >
        <ContactExternalGlow source={scene} />
        <primitive object={scene} />
      </group>
    </group>
  );
}
