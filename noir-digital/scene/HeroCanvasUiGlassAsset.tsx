"use client";

import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { Color, FrontSide, NormalBlending, Vector2, type WebGLRenderTarget } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { pointerStore } from "@/features/pointer/pointer-store";
import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";
import { createHeroCanvasUiEnvironment } from "@/scene/hero-canvas-ui-environment";
import {
  HERO_CANVAS_UI_GLASS_CONFIG as glassConfig,
  resolveHeroCanvasUiThickness,
} from "@/scene/hero-canvas-ui-glass-config";
import { HERO_CANVAS_UI_RIM_CONFIG as rimConfig } from "@/scene/hero-canvas-ui-rim-config";
import {
  HERO_CANVAS_UI_RIM_FRAGMENT_SHADER,
  HERO_CANVAS_UI_RIM_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-rim-shaders";
import { pointerSnapshotToUv } from "@/scene/hero-effects";
import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { createHeroModelGeometry } from "@/scene/hero-model-geometry";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import { sceneTransitionStore } from "@/scene/scene-transition";

interface HeroCanvasUiGlassAssetProps {
  readonly reducedMotion: boolean;
  readonly sceneScale: number;
}

export function HeroCanvasUiGlassAsset({ reducedMotion, sceneScale }: HeroCanvasUiGlassAssetProps) {
  const source = useLoader(GLTFLoader, HERO_MODEL_SOURCE);
  const gl = useThree((state) => state.gl);
  const { texture } = useHeroRefraction();
  const geometry = useMemo(() => createHeroModelGeometry(source.scene), [source.scene]);
  const environment = useMemo<WebGLRenderTarget>(() => createHeroCanvasUiEnvironment(gl), [gl]);
  const pointerLightTarget = useMemo(() => new Vector2(0.5, 0.5), []);
  const rimUniforms = useMemo(
    () => ({
      uColor: { value: new Color(rimConfig.color) },
      uCoreEnd: { value: rimConfig.coreEnd },
      uCoreOpacity: { value: rimConfig.coreOpacity },
      uCoreStart: { value: rimConfig.coreStart },
      uHaloEnd: { value: rimConfig.haloEnd },
      uHaloOpacity: { value: rimConfig.haloOpacity },
      uHaloStart: { value: rimConfig.haloStart },
      uPointerLightPosition: { value: new Vector2(0.5, 0.5) },
      uPointerLightOpacity: { value: rimConfig.pointerLightOpacity },
      uPointerLightRadius: { value: rimConfig.pointerLightRadius },
    }),
    [],
  );

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => environment.dispose(), [environment]);

  useFrame((_state, delta) => {
    if (sceneTransitionStore.getSnapshot().opticalFrozen) return;
    const frameDelta = resolveSceneFrameDelta(delta);
    const snapshot = pointerStore.getSnapshot();
    const pointer =
      reducedMotion || !snapshot.inside ? { x: 0.5, y: 0.5 } : pointerSnapshotToUv(snapshot);
    pointerLightTarget.set(pointer.x, pointer.y);
    const smoothing = 1 - Math.exp(-6 * frameDelta);
    rimUniforms.uPointerLightPosition.value.lerp(pointerLightTarget, smoothing);
  }, -2);

  return (
    <>
      <mesh
        geometry={geometry}
        onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
        renderOrder={-1}
      >
        <meshBasicMaterial colorWrite={false} depthTest depthWrite />
      </mesh>
      <mesh geometry={geometry} onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}>
        <MeshTransmissionMaterial
          anisotropicBlur={glassConfig.anisotropicBlur}
          backside={glassConfig.backside}
          buffer={texture}
          chromaticAberration={glassConfig.chromaticAberration}
          clearcoat={glassConfig.clearcoat}
          clearcoatRoughness={glassConfig.clearcoatRoughness}
          color="#ffffff"
          envMap={environment.texture}
          envMapIntensity={glassConfig.environmentIntensity}
          ior={glassConfig.ior}
          roughness={glassConfig.roughness}
          samples={glassConfig.samples}
          thickness={resolveHeroCanvasUiThickness(sceneScale)}
          transmission={glassConfig.transmission}
        />
      </mesh>
      <mesh
        geometry={geometry}
        onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
        renderOrder={1}
      >
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
    </>
  );
}
