"use client";

import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  RingGeometry,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";
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
  const environment = useMemo<WebGLRenderTarget>(() => {
    const room = new RoomEnvironment();
    const ringMaterial = new MeshBasicMaterial({
      color: new Color(config.highlight).multiplyScalar(15),
      side: DoubleSide,
      toneMapped: false,
    });
    const ring = new Mesh(new RingGeometry(0.5, 1, 64), ringMaterial);
    ring.position.set(2, 3, -2);
    ring.scale.setScalar(10);
    ring.lookAt(0, 0, 0);
    room.add(ring);
    const pmrem = new PMREMGenerator(gl);
    const target = pmrem.fromScene(room, config.environmentBlur, 0.1, 1000);
    room.dispose();
    pmrem.dispose();
    return target;
  }, [gl]);

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
