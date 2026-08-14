"use client";

import { MeshRefractionMaterial } from "@react-three/drei/core/MeshRefractionMaterial";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, type CubeTexture, FrontSide, type Group, NormalBlending } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { HERO_CANVAS_UI_RIM_CONFIG as rimConfig } from "@/scene/hero-canvas-ui-rim-config";
import {
  HERO_CANVAS_UI_RIM_FRAGMENT_SHADER,
  HERO_CANVAS_UI_RIM_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-rim-shaders";
import { createHeroModelGeometry } from "@/scene/hero-model-geometry";
import { createPhysicalPrismEnvironment } from "@/scene/physical-prism-environment";
import {
  PHYSICAL_PRISM_TEST_CONFIG as config,
  resolvePhysicalPrismSceneScale,
} from "@/scene/physical-prism-test-config";

export function PhysicalPrismGlassAsset() {
  const groupRef = useRef<Group>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const source = useLoader(GLTFLoader, HERO_MODEL_SOURCE);
  const width = useThree((state) => state.size.width);
  const geometry = useMemo(() => createHeroModelGeometry(source.scene), [source.scene]);
  const environment = useMemo<CubeTexture>(() => createPhysicalPrismEnvironment(), []);
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
        <MeshRefractionMaterial
          aberrationStrength={config.aberrationStrength}
          bounces={config.bounces}
          color="#ffffff"
          envMap={environment}
          fastChroma={false}
          fresnel={config.fresnel}
          ior={config.ior}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={geometry} renderOrder={2}>
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
