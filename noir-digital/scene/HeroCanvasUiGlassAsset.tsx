"use client";

import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import type { WebGLRenderTarget } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";
import { createHeroCanvasUiEnvironment } from "@/scene/hero-canvas-ui-environment";
import {
  HERO_CANVAS_UI_GLASS_CONFIG as config,
  resolveHeroCanvasUiThickness,
} from "@/scene/hero-canvas-ui-glass-config";
import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { createHeroModelGeometry } from "@/scene/hero-model-geometry";

interface HeroCanvasUiGlassAssetProps {
  readonly reducedMotion: boolean;
  readonly sceneScale: number;
}

export function HeroCanvasUiGlassAsset({ sceneScale }: HeroCanvasUiGlassAssetProps) {
  const source = useLoader(GLTFLoader, HERO_MODEL_SOURCE);
  const gl = useThree((state) => state.gl);
  const { texture } = useHeroRefraction();
  const geometry = useMemo(() => createHeroModelGeometry(source.scene), [source.scene]);
  const environment = useMemo<WebGLRenderTarget>(() => createHeroCanvasUiEnvironment(gl), [gl]);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => environment.dispose(), [environment]);

  return (
    <mesh geometry={geometry} onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}>
      <MeshTransmissionMaterial
        anisotropicBlur={config.anisotropicBlur}
        backside={config.backside}
        buffer={texture}
        chromaticAberration={config.chromaticAberration}
        clearcoat={config.clearcoat}
        clearcoatRoughness={config.clearcoatRoughness}
        color="#ffffff"
        envMap={environment.texture}
        envMapIntensity={config.environmentIntensity}
        ior={config.ior}
        roughness={config.roughness}
        samples={config.samples}
        thickness={resolveHeroCanvasUiThickness(sceneScale)}
        transmission={config.transmission}
      />
    </mesh>
  );
}
