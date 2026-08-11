"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type RectAreaLight } from "three";

import { pointerStore } from "@/features/pointer/pointer-store";
import { computeHeroLightTarget, pointerSnapshotToUv } from "@/scene/hero-effects";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import { sceneTransitionStore } from "@/scene/scene-transition";

interface HeroPointerLightProps {
  readonly reducedMotion: boolean;
}

const CONTACT_LIGHT_INTENSITY = 3.5;
const HERO_LIGHT_INTENSITY = 28;

function readToken(name: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value);
}

export function HeroPointerLight({ reducedMotion }: HeroPointerLightProps) {
  const lightRef = useRef<RectAreaLight>(null);
  const currentAngle = useRef(Math.atan2(9, 4));
  const color = useMemo(() => readToken("--color-noir-warm-white"), []);

  useEffect(() => {
    const light = lightRef.current;
    if (light) {
      light.color.copy(color);
      light.lookAt(0, 0, 0);
    }
  }, [color]);

  useFrame((_state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    const light = lightRef.current;
    if (!light) return;
    const transition = sceneTransitionStore.getSnapshot();
    light.intensity = transition.contactVisible ? CONTACT_LIGHT_INTENSITY : HERO_LIGHT_INTENSITY;
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
    light.lookAt(0, 0, 0);
  }, -1);

  return (
    <rectAreaLight
      ref={lightRef}
      position={[4, 9, 8]}
      intensity={HERO_LIGHT_INTENSITY}
      width={14}
      height={6}
    />
  );
}
