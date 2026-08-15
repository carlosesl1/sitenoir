"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, FrontSide, type Group, NormalBlending, type WebGLRenderTarget } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { createHeroCanvasUiEnvironment } from "@/scene/hero-canvas-ui-environment";
import { HERO_CANVAS_UI_RIM_CONFIG as rimConfig } from "@/scene/hero-canvas-ui-rim-config";
import {
  HERO_CANVAS_UI_RIM_FRAGMENT_SHADER,
  HERO_CANVAS_UI_RIM_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-rim-shaders";
import { createHeroModelGeometry } from "@/scene/hero-model-geometry";
import { PhysicalPrismReflectionAtlas } from "@/scene/PhysicalPrismReflectionAtlas";
import {
  PHYSICAL_PRISM_TEST_CONFIG as config,
  resolvePhysicalPrismSceneScale,
} from "@/scene/physical-prism-test-config";

export function PhysicalPrismGlassAsset() {
  const groupRef = useRef<Group>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const source = useLoader(GLTFLoader, HERO_MODEL_SOURCE);
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const geometry = useMemo(() => createHeroModelGeometry(source.scene), [source.scene]);
  const environment = useMemo<WebGLRenderTarget>(() => createHeroCanvasUiEnvironment(gl), [gl]);
  const sceneScale = resolvePhysicalPrismSceneScale(width);
  const rimUniforms = useMemo(
    () => ({
      uColor: { value: new Color(rimConfig.color) },
      uCoreEnd: { value: rimConfig.coreEnd },
      uCoreOpacity: { value: rimConfig.coreOpacity },
      uCoreStart: { value: rimConfig.coreStart },
      uHaloEnd: { value: rimConfig.haloEnd },
      uHaloOpacity: { value: rimConfig.haloOpacity },
      uHaloStart: { value: rimConfig.haloStart },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || reducedMotion) return;
    group.rotation.y = Math.sin(clock.elapsedTime * 0.28) * 0.035;
    group.rotation.x = -0.025 + Math.cos(clock.elapsedTime * 0.22) * 0.012;
  });

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => environment.dispose(), [environment]);

  return (
    <group ref={groupRef} rotation={[-0.025, 0, 0]} scale={sceneScale}>
      <mesh geometry={geometry} renderOrder={1}>
        <meshPhysicalMaterial
          clearcoat={config.clearcoat}
          clearcoatRoughness={config.clearcoatRoughness}
          color={config.glassColor}
          envMap={environment.texture}
          envMapIntensity={config.environmentIntensity}
          ior={config.ior}
          metalness={0}
          opacity={1}
          roughness={config.roughness}
          thickness={config.thickness / Math.max(sceneScale, 0.0001)}
          transmission={config.transmission}
          transparent
        />
      </mesh>
      <PhysicalPrismReflectionAtlas geometry={geometry} />
      <mesh geometry={geometry} renderOrder={3}>
        <shaderMaterial
          blending={NormalBlending}
          depthTest
          depthWrite={false}
          fragmentShader={HERO_CANVAS_UI_RIM_FRAGMENT_SHADER}
          polygonOffset
          polygonOffsetFactor={rimConfig.polygonOffsetFactor}
          polygonOffsetUnits={rimConfig.polygonOffsetUnits}
          side={FrontSide}
          toneMapped={false}
          transparent
          uniforms={rimUniforms}
          vertexShader={HERO_CANVAS_UI_RIM_VERTEX_SHADER}
        />
      </mesh>
    </group>
  );
}
