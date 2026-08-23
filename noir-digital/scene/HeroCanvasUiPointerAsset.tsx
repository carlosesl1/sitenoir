"use client";

import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import {
  type BufferGeometry,
  Color,
  FrontSide,
  NormalBlending,
  type WebGLRenderTarget,
} from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { POINTER_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";
import { createHeroCanvasUiEnvironment } from "@/scene/hero-canvas-ui-environment";
import {
  HERO_CANVAS_UI_GLASS_CONFIG as glassConfig,
  resolveHeroCanvasUiSamples,
  resolveHeroCanvasUiThickness,
} from "@/scene/hero-canvas-ui-glass-config";
import { HERO_CANVAS_UI_RIM_CONFIG as rimConfig } from "@/scene/hero-canvas-ui-rim-config";
import {
  HERO_CANVAS_UI_RIM_FRAGMENT_SHADER,
  HERO_CANVAS_UI_RIM_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-rim-shaders";
import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { createHeroModelGeometry } from "@/scene/hero-model-geometry";

interface HeroCanvasUiPointerAssetProps {
  readonly sceneScale: number;
}

interface HeroCanvasUiPointerMeshProps {
  readonly geometry: BufferGeometry;
  readonly renderOrder?: number;
  readonly sceneScale: number;
}

export function HeroCanvasUiPointerAsset({ sceneScale }: HeroCanvasUiPointerAssetProps) {
  const source = useLoader(GLTFLoader, POINTER_MODEL_SOURCE, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const geometry = useMemo(() => createHeroModelGeometry(source.scene), [source.scene]);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  return <HeroCanvasUiPointerMesh geometry={geometry} sceneScale={sceneScale} />;
}

export function HeroCanvasUiPointerMesh({
  geometry,
  renderOrder = 1,
  sceneScale,
}: HeroCanvasUiPointerMeshProps) {
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const { texture } = useHeroRefraction();
  const environment = useMemo<WebGLRenderTarget>(() => createHeroCanvasUiEnvironment(gl), [gl]);
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

  useLayoutEffect(() => () => environment.dispose(), [environment]);

  return (
    <>
      <mesh
        geometry={geometry}
        onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
        renderOrder={renderOrder}
      >
        <MeshTransmissionMaterial
          anisotropicBlur={glassConfig.anisotropicBlur}
          backside={glassConfig.backside}
          buffer={texture}
          chromaticAberration={glassConfig.chromaticAberration}
          clearcoat={glassConfig.clearcoat}
          clearcoatRoughness={glassConfig.clearcoatRoughness}
          color="#ffffff"
          depthWrite
          envMap={environment.texture}
          envMapIntensity={glassConfig.environmentIntensity}
          ior={glassConfig.ior}
          roughness={glassConfig.roughness}
          samples={resolveHeroCanvasUiSamples(width)}
          thickness={resolveHeroCanvasUiThickness(sceneScale) * 0.1}
          transmission={glassConfig.transmission}
          transparent
        />
      </mesh>
      <mesh
        geometry={geometry}
        onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
        renderOrder={renderOrder + 1}
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
