"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Group, MathUtils } from "three";

import { pointerStore } from "@/features/pointer/pointer-store";
import { POINTER_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { useGraphiteAsset } from "@/scene/GraphiteAsset";
import {
  POINTER_ROTATION_AXIS_TILT_DEGREES,
  resolvePointerExitProgress,
  resolvePointerScrollRotation,
} from "@/scene/pointer-motion";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import type { ModelTransform } from "@/scene/scene-layout";

interface ProgressSource {
  readonly get: () => number;
}

interface PointerModelProps {
  readonly layout: ModelTransform;
  readonly reducedMotion: boolean;
  readonly scrollProgress: ProgressSource;
}

export function PointerModel({ layout, reducedMotion, scrollProgress }: PointerModelProps) {
  const containerRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const activeTimeRef = useRef(0);
  const scene = useGraphiteAsset(POINTER_MODEL_SOURCE, true);

  useFrame((_state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    activeTimeRef.current += frameDelta;
    const container = containerRef.current;
    const spin = spinRef.current;
    if (!container || !spin) return;
    const pointer = pointerStore.getSnapshot();
    const exitProgress = resolvePointerExitProgress(scrollProgress.get());
    if (exitProgress >= 0.995) {
      container.visible = false;
      return;
    }
    container.visible = true;
    const floatOffset = reducedMotion ? 0 : Math.sin(activeTimeRef.current * 0.9) * 0.18;
    const pointerY = reducedMotion ? 0 : pointer.normalizedY * 0.26;
    const targetY = layout.position[1] + floatOffset + pointerY + exitProgress * 7;
    const targetRotationY = MathUtils.degToRad(resolvePointerScrollRotation(exitProgress));

    if (reducedMotion) {
      container.position.y = targetY;
      spin.rotation.y = targetRotationY;
      return;
    }

    container.position.y = MathUtils.damp(container.position.y, targetY, 5, frameDelta);
    spin.rotation.y = MathUtils.damp(spin.rotation.y, targetRotationY, 5, frameDelta);
  });

  const axisTilt = MathUtils.degToRad(POINTER_ROTATION_AXIS_TILT_DEGREES);

  return (
    <group
      ref={containerRef}
      position={layout.position}
      rotation={[
        MathUtils.degToRad(layout.rotation[0]),
        MathUtils.degToRad(layout.rotation[1]),
        MathUtils.degToRad(layout.rotation[2]),
      ]}
      scale={layout.scale}
    >
      <group rotation={[0, 0, axisTilt]}>
        <group ref={spinRef}>
          <group rotation={[0, 0, -axisTilt]}>
            <primitive object={scene} />
          </group>
        </group>
      </group>
    </group>
  );
}
