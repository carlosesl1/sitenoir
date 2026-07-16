"use client";

import { useEffect, useMemo } from "react";
import { AdditiveBlending, DoubleSide, type Object3D } from "three";

import { createContactExternalGlow } from "@/scene/contact-external-glow";

interface ContactExternalGlowProps {
  readonly source: Object3D;
}

export function ContactExternalGlow({ source }: ContactExternalGlowProps) {
  const glow = useMemo(() => createContactExternalGlow(source), [source]);

  useEffect(() => () => glow.texture.dispose(), [glow]);

  return (
    <mesh
      frustumCulled={false}
      position={[glow.centerX, glow.centerY, glow.behindZ]}
      renderOrder={-1}
    >
      <planeGeometry args={[glow.width, glow.height]} />
      <meshBasicMaterial
        blending={AdditiveBlending}
        depthTest
        depthWrite={false}
        map={glow.texture}
        opacity={0.82}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}
