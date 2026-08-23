"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Group, MathUtils, Vector3 } from "three";

import { pointerStore } from "@/features/pointer/pointer-store";
import { ContactCanvasUiGlassAsset } from "@/scene/ContactCanvasUiGlassAsset";
import { BEFORE_ROTATION_X, resolveContactModelMotion } from "@/scene/contact-model-motion";
import {
  CONTACT_ASSET_PATH,
  resolveContactCanvasUiAssetScale,
  resolveContactCanvasUiDepthScale,
} from "@/scene/contact-model-scale";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import type { ModelTransform } from "@/scene/scene-layout";

const CONTACT_ASSET_SCALE = resolveContactCanvasUiAssetScale();
const CONTACT_DEPTH_SCALE = resolveContactCanvasUiDepthScale();
const POINTER_ROTATION_X = MathUtils.degToRad(16);
const POINTER_ROTATION_Y = MathUtils.degToRad(24);
const POINTER_RESPONSE = 16;

interface ContactModelProps {
  readonly layout: ModelTransform;
  readonly reducedMotion: boolean;
  readonly scrollProgress: { readonly get: () => number };
}

export function ContactModel({ layout, reducedMotion, scrollProgress }: ContactModelProps) {
  const groupRef = useRef<Group>(null);
  const contactRef = useRef<HTMLElement | null>(null);
  const viewportTargetRef = useRef(new Vector3());

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
      group.rotation.y = MathUtils.degToRad(layout.rotation[1]);
      return;
    }

    const pointer = pointerStore.getSnapshot();
    const pointerX = pointer.inside ? pointer.normalizedX : 0;
    const pointerY = pointer.inside ? pointer.normalizedY : 0;
    const targetRotationX = motion.rotationX - pointerY * POINTER_ROTATION_X;
    const targetRotationY = MathUtils.degToRad(layout.rotation[1]) + pointerX * POINTER_ROTATION_Y;

    group.position.y = MathUtils.damp(group.position.y, motion.targetY, 12, frameDelta);
    group.rotation.x = MathUtils.damp(
      group.rotation.x,
      targetRotationX,
      POINTER_RESPONSE,
      frameDelta,
    );
    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      targetRotationY,
      POINTER_RESPONSE,
      frameDelta,
    );
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
      <group scale={[CONTACT_ASSET_SCALE, CONTACT_ASSET_SCALE, CONTACT_ASSET_SCALE]}>
        <ContactCanvasUiGlassAsset
          depthScale={CONTACT_DEPTH_SCALE}
          path={CONTACT_ASSET_PATH}
          sceneScale={layout.scale}
        />
      </group>
    </group>
  );
}
