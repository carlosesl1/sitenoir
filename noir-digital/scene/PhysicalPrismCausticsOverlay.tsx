"use client";

import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { type BufferGeometry, NormalBlending, Vector2 } from "three";

import {
  PHYSICAL_PRISM_CAUSTICS_CONFIG as config,
  resolvePhysicalPrismCausticsIntensity,
} from "@/scene/physical-prism-caustics-config";
import {
  PHYSICAL_PRISM_CAUSTICS_FRAGMENT_SHADER,
  PHYSICAL_PRISM_CAUSTICS_VERTEX_SHADER,
} from "@/scene/physical-prism-caustics-shaders";

interface PhysicalPrismCausticsOverlayProps {
  readonly geometry: BufferGeometry;
}

export function PhysicalPrismCausticsOverlay({ geometry }: PhysicalPrismCausticsOverlayProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const uniforms = useMemo(() => {
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;

    if (!bounds) {
      throw new Error("Physical prism geometry requires a bounding box");
    }

    return {
      uIntensity: { value: Number(config.desktopIntensity) },
      uLightDirection: {
        value: new Vector2(Math.cos(config.lightAngle), Math.sin(config.lightAngle)),
      },
      uPlanarMin: { value: new Vector2(bounds.min.x, bounds.min.y) },
      uPlanarSize: {
        value: new Vector2(
          Math.max(bounds.max.x - bounds.min.x, 0.0001),
          Math.max(bounds.max.y - bounds.min.y, 0.0001),
        ),
      },
      uSeparation: { value: config.separation },
      uSurfaceOpacity: { value: config.surfaceOpacity },
      uTime: { value: 0 },
    };
  }, [geometry]);

  useFrame(({ clock, size }) => {
    uniforms.uIntensity.value = resolvePhysicalPrismCausticsIntensity(size.width);
    uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime * config.driftSpeed;
  });

  return (
    <mesh geometry={geometry} renderOrder={2}>
      <shaderMaterial
        blending={NormalBlending}
        depthTest
        depthWrite={false}
        fragmentShader={PHYSICAL_PRISM_CAUSTICS_FRAGMENT_SHADER}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        vertexShader={PHYSICAL_PRISM_CAUSTICS_VERTEX_SHADER}
      />
    </mesh>
  );
}
