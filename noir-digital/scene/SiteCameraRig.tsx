"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { MathUtils, Vector3 } from "three";

import { pointerStore } from "@/features/pointer/pointer-store";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import { resolveSceneCameraZ, sceneTransitionStore } from "@/scene/scene-transition";
import { resolveCameraParallax } from "@/scene/site-camera-parallax";

interface SiteCameraRigProps {
  readonly reducedMotion: boolean;
}

const PARALLAX_ROTATION = 0.12;
const PARALLAX_LAG = 12;
const PARALLAX_LEAVE_LAG = 3.1;
const CAMERA_ENTRY_DURATION = 1.2;

export function SiteCameraRig({ reducedMotion }: SiteCameraRigProps) {
  const camera = useThree((state) => state.camera);
  const basePosition = useMemo(() => camera.position.clone(), [camera]);
  const targetPosition = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    const pointer = pointerStore.getSnapshot();
    const transition = sceneTransitionStore.getSnapshot();
    const pointerX = pointer.inside ? pointer.normalizedX : 0;
    const pointerY = pointer.inside ? pointer.normalizedY : 0;
    const parallax = resolveCameraParallax(
      pointerX,
      pointerY,
      reducedMotion,
      transition.contactVisible,
    );
    const targetX = parallax.x;
    const targetY = parallax.y;
    const entryProgress = reducedMotion
      ? 1
      : MathUtils.clamp(state.clock.getElapsedTime() / CAMERA_ENTRY_DURATION, 0, 1);
    const targetZ = resolveSceneCameraZ(transition.progress, entryProgress);
    const lag = pointer.inside ? PARALLAX_LAG : PARALLAX_LEAVE_LAG;

    targetPosition.set(basePosition.x + targetX, basePosition.y + targetY, targetZ);
    camera.position.x = MathUtils.damp(camera.position.x, targetPosition.x, lag, frameDelta);
    camera.position.y = MathUtils.damp(camera.position.y, targetPosition.y, lag, frameDelta);
    camera.position.z = targetZ;
    lookTarget.set(-targetX * PARALLAX_ROTATION, -targetY * PARALLAX_ROTATION, 0);
    camera.lookAt(lookTarget);
  }, -3);

  return null;
}
