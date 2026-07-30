"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type PointLight } from "three";

import { pointerStore } from "@/features/pointer/pointer-store";
import { computeHeroLightTarget, pointerSnapshotToUv } from "@/scene/hero-effects";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import { sceneTransitionStore } from "@/scene/scene-transition";

interface HeroPointerLightProps {
  readonly reducedMotion: boolean;
}

const CONTACT_LIGHT_DISTANCE = 14;
const HERO_LIGHT_DISTANCE = 42;

function readToken(name: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value);
}

export function HeroPointerLight({ reducedMotion }: HeroPointerLightProps) {
  const lightRef = useRef<PointLight>(null);
  const currentAngle = useRef(Math.atan2(9, 4));
  const color = useMemo(() => readToken("--color-noir-warm-white"), []);

  useEffect(() => {
    const light = lightRef.current;
    if (light) light.color.copy(color);
  }, [color]);

  useFrame((_state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    const light = lightRef.current;
    if (!light) return;
    const transition = sceneTransitionStore.getSnapshot();
    light.distance = transition.contactVisible ? CONTACT_LIGHT_DISTANCE : HERO_LIGHT_DISTANCE;
    if (transition.opticalFrozen) return;
    const snapshot = pointerStore.getSnapshot();
    const pointer =
      reducedMotion || !snapshot.inside ? { x: 0.5, y: 0.5 } : pointerSnapshotToUv(snapshot);
    const target = computeHeroLightTarget(pointer);
    const targetAngle = Math.atan2(target.y, target.x);
    const difference = Math.atan2(
      Math.sin(targetAngle - currentAngle.current),
      Math.cos(targetAngle - currentAngle.current),
    );
    currentAngle.current += difference * (1 - Math.exp(-6 * frameDelta));
    const radius = Math.hypot(4, 9);
    light.position.set(
      radius * Math.cos(currentAngle.current),
      radius * Math.sin(currentAngle.current),
      8,
    );
  }, -1);

  return (
    <pointLight
      ref={lightRef}
      position={[4, 9, 8]}
      intensity={900}
      distance={HERO_LIGHT_DISTANCE}
      decay={1.5}
    />
  );
}
