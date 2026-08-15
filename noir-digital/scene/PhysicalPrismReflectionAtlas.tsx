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
  PHYSICAL_PRISM_REFLECTION_LAYERS,
  type PhysicalPrismReflectionLayerConfig,
  resolvePhysicalPrismReflectionAtlasOpacity,
} from "@/scene/physical-prism-reflection-atlas-config";
import {
  PHYSICAL_PRISM_REFLECTION_ATLAS_FRAGMENT_SHADER,
  PHYSICAL_PRISM_REFLECTION_ATLAS_VERTEX_SHADER,
} from "@/scene/physical-prism-reflection-atlas-shaders";

interface PhysicalPrismReflectionAtlasProps {
  readonly geometry: BufferGeometry;
}

interface PhysicalPrismReflectionLayerProps {
  readonly geometry: BufferGeometry;
  readonly layer: PhysicalPrismReflectionLayerConfig;
  readonly texture: Texture;
}

function createReflectionLayerUniforms(
  geometry: BufferGeometry,
  layer: PhysicalPrismReflectionLayerConfig,
  texture: Texture,
) {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;

  if (!bounds) {
    throw new Error("Physical prism geometry requires a bounding box");
  }

  return {
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
    uRegionMin: { value: new Vector2(...layer.planarMin) },
    uRegionSize: {
      value: new Vector2(
        Math.max(layer.planarMax[0] - layer.planarMin[0], 0.0001),
        Math.max(layer.planarMax[1] - layer.planarMin[1], 0.0001),
      ),
    },
    uSaturationEnd: { value: config.saturationEnd },
    uSaturationStart: { value: config.saturationStart },
  };
}

function PhysicalPrismReflectionLayer({
  geometry,
  layer,
  texture,
}: PhysicalPrismReflectionLayerProps) {
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const uniforms = useMemo(
    () => createReflectionLayerUniforms(geometry, layer, texture),
    [geometry, layer, texture],
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

export function PhysicalPrismReflectionAtlas({ geometry }: PhysicalPrismReflectionAtlasProps) {
  const textures = useLoader(
    TextureLoader,
    PHYSICAL_PRISM_REFLECTION_LAYERS.map((layer) => layer.assetUrl),
  );

  return PHYSICAL_PRISM_REFLECTION_LAYERS.map((layer, index) => {
    const texture = textures[index];
    if (!texture) {
      throw new Error(`Missing physical prism reflection texture for ${layer.id}`);
    }

    return (
      <PhysicalPrismReflectionLayer
        geometry={geometry}
        key={layer.id}
        layer={layer}
        texture={texture}
      />
    );
  });
}
