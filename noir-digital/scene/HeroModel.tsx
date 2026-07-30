"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Group, MathUtils } from "three";

import { HeroGlassAsset } from "@/scene/HeroGlassAsset";
import { resolveHeroExitProgress } from "@/scene/hero-motion";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import type { ModelTransform } from "@/scene/scene-layout";

interface ProgressSource {
  readonly get: () => number;
}

interface HeroModelProps {
  readonly layout: ModelTransform;
  readonly reducedMotion: boolean;
  readonly scrollProgress: ProgressSource;
}

function degrees(value: number): number {
  return MathUtils.degToRad(value);
}

export function HeroModel({ layout, reducedMotion, scrollProgress }: HeroModelProps) {
  const groupRef = useRef<Group>(null);
  useFrame((_state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    const group = groupRef.current;
    if (!group) return;
    const exitProgress = resolveHeroExitProgress(scrollProgress.get());
    if (exitProgress >= 0.995) {
      group.visible = false;
      return;
    }
    group.visible = true;
    const targetX = degrees(layout.rotation[0]);
    const targetY = degrees(layout.rotation[1]) + exitProgress * Math.PI * 0.75;

    const targetPositionY = layout.position[1] + exitProgress * 9;
    const scale = layout.scale * (1 - exitProgress * 0.36);
    if (reducedMotion) {
      group.rotation.x = targetX;
      group.rotation.y = targetY;
      group.position.y = targetPositionY;
      group.scale.setScalar(scale);
      return;
    }

    group.rotation.x = MathUtils.damp(group.rotation.x, targetX, 5, frameDelta);
    group.rotation.y = MathUtils.damp(group.rotation.y, targetY, 5, frameDelta);
    group.position.y = MathUtils.damp(group.position.y, targetPositionY, 4, frameDelta);
    group.scale.setScalar(scale);
  });

  return (
    <group
      ref={groupRef}
      position={layout.position}
      rotation={[
        degrees(layout.rotation[0]),
        degrees(layout.rotation[1]),
        degrees(layout.rotation[2]),
      ]}
      scale={layout.scale}
    >
      <HeroGlassAsset reducedMotion={reducedMotion} />
    </group>
  );
}
