"use client";

import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import {
  type BufferGeometry,
  NormalBlending,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector2,
} from "three";

import {
  PHYSICAL_PRISM_REFLECTION_ATLAS_CONFIG as config,
  resolvePhysicalPrismReflectionAtlasOpacity,
} from "@/scene/physical-prism-reflection-atlas-config";
import {
  PHYSICAL_PRISM_REFLECTION_ATLAS_FRAGMENT_SHADER,
  PHYSICAL_PRISM_REFLECTION_ATLAS_VERTEX_SHADER,
} from "@/scene/physical-prism-reflection-atlas-shaders";

interface PhysicalPrismReflectionAtlasProps {
  readonly geometry: BufferGeometry;
}

function createReflectionAtlasUniforms(geometry: BufferGeometry, texture: Texture) {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;

  if (!bounds) {
    throw new Error("Physical prism geometry requires a bounding box");
  }

  return {
    uLeftAnchorFadeStart: { value: config.leftAnchorFadeStart },
    uLeftAnchorShift: { value: config.leftAnchorShift },
    uLeftAnchorWindowEnd: { value: config.leftAnchorWindowEnd },
    uLuminanceEnd: { value: config.luminanceEnd },
    uLuminanceStart: { value: config.luminanceStart },
    uOpacity: { value: Number(config.desktopOpacity) },
    uPlanarMin: { value: new Vector2(bounds.min.x, bounds.min.y) },
    uPlanarSize: {
      value: new Vector2(
        Math.max(bounds.max.x - bounds.min.x, 0.0001),
        Math.max(bounds.max.y - bounds.min.y, 0.0001),
      ),
    },
    uReflectionMap: { value: texture },
    uRightAnchorFadeEnd: { value: config.rightAnchorFadeEnd },
    uRightAnchorShift: { value: config.rightAnchorShift },
    uRightAnchorWindowStart: { value: config.rightAnchorWindowStart },
    uSaturationEnd: { value: config.saturationEnd },
    uSaturationStart: { value: config.saturationStart },
  };
}

export function PhysicalPrismReflectionAtlas({ geometry }: PhysicalPrismReflectionAtlasProps) {
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const texture = useLoader(TextureLoader, config.assetUrl);
  const uniforms = useMemo(
    () => createReflectionAtlasUniforms(geometry, texture),
    [geometry, texture],
  );

  useLayoutEffect(() => {
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;

    return () => texture.dispose();
  }, [gl, texture]);

  useLayoutEffect(() => {
    uniforms.uOpacity.value = resolvePhysicalPrismReflectionAtlasOpacity(width);
  }, [uniforms, width]);

  return (
    <mesh geometry={geometry} renderOrder={2}>
      <shaderMaterial
        blending={NormalBlending}
        depthTest
        depthWrite={false}
        fragmentShader={PHYSICAL_PRISM_REFLECTION_ATLAS_FRAGMENT_SHADER}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        vertexShader={PHYSICAL_PRISM_REFLECTION_ATLAS_VERTEX_SHADER}
      />
    </mesh>
  );
}
