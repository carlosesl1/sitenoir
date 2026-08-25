"use client";

import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { Color, FrontSide, NormalBlending, type WebGLRenderTarget } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { useTheme } from "@/features/theme/ThemeProvider";
import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";
import {
  HERO_CANVAS_UI_EDGE_FLARE_CONFIG as edgeFlareConfig,
  HERO_CANVAS_UI_EDGE_FLARE_LAYER,
} from "@/scene/hero-canvas-ui-edge-flare-config";
import {
  HERO_CANVAS_UI_EDGE_FLARE_FRAGMENT_SHADER,
  HERO_CANVAS_UI_EDGE_FLARE_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-edge-flare-shaders";
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
import { resolveThreeDimensionalColor } from "@/scene/theme-3d-colors";

interface HeroCanvasUiGlassAssetProps {
  readonly sceneScale: number;
}

export function HeroCanvasUiGlassAsset({ sceneScale }: HeroCanvasUiGlassAssetProps) {
  const { resolvedTheme } = useTheme();
  const source = useLoader(GLTFLoader, HERO_MODEL_SOURCE);
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const { texture } = useHeroRefraction();
  const geometry = useMemo(() => createHeroModelGeometry(source.scene), [source.scene]);
  const materialColor = resolveThreeDimensionalColor(resolvedTheme, "#ffffff");
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
  const edgeFlareUniforms = useMemo(
    () => ({
      uEdgeFeather: { value: edgeFlareConfig.edgeFeather },
      uFresnelEnd: { value: edgeFlareConfig.fresnelEnd },
      uFresnelStart: { value: edgeFlareConfig.fresnelStart },
      uIPatchXEnd: { value: edgeFlareConfig.iPatchXEnd },
      uIPatchXStart: { value: edgeFlareConfig.iPatchXStart },
      uIPatchYEnd: { value: edgeFlareConfig.iPatchYEnd },
      uIPatchYStart: { value: edgeFlareConfig.iPatchYStart },
      uRContourEnd: { value: edgeFlareConfig.rContourEnd },
      uRContourFeather: { value: edgeFlareConfig.rContourFeather },
      uRContourIntercept: { value: edgeFlareConfig.rContourIntercept },
      uRContourSlope: { value: edgeFlareConfig.rContourSlope },
      uRContourStart: { value: edgeFlareConfig.rContourStart },
      uRContourWidth: { value: edgeFlareConfig.rContourWidth },
      uRSourceLuminance: { value: edgeFlareConfig.rSourceLuminance },
    }),
    [],
  );

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => environment.dispose(), [environment]);

  return (
    <>
      <mesh
        geometry={geometry}
        onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
        renderOrder={1}
      >
        <MeshTransmissionMaterial
          key={resolvedTheme}
          anisotropicBlur={glassConfig.anisotropicBlur}
          backside={glassConfig.backside}
          buffer={texture}
          chromaticAberration={glassConfig.chromaticAberration}
          clearcoat={glassConfig.clearcoat}
          clearcoatRoughness={glassConfig.clearcoatRoughness}
          color={materialColor}
          depthWrite
          envMap={environment.texture}
          envMapIntensity={glassConfig.environmentIntensity}
          ior={glassConfig.ior}
          roughness={glassConfig.roughness}
          samples={resolveHeroCanvasUiSamples(width)}
          thickness={resolveHeroCanvasUiThickness(sceneScale)}
          transmission={glassConfig.transmission}
          transparent
        />
      </mesh>
      <mesh
        geometry={geometry}
        onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
        renderOrder={2}
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
      <mesh
        geometry={geometry}
        onUpdate={(mesh) => mesh.layers.set(HERO_CANVAS_UI_EDGE_FLARE_LAYER)}
        renderOrder={3}
      >
        <shaderMaterial
          depthTest
          depthWrite
          fragmentShader={HERO_CANVAS_UI_EDGE_FLARE_FRAGMENT_SHADER}
          toneMapped={false}
          uniforms={edgeFlareUniforms}
          vertexShader={HERO_CANVAS_UI_EDGE_FLARE_VERTEX_SHADER}
        />
      </mesh>
    </>
  );
}
