"use client";

import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PMREMGenerator,
  RingGeometry,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { HERO_CANVAS_UI_GLASS_CONFIG as config } from "@/scene/hero-canvas-ui-glass-config";
import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { createHeroModelGeometry } from "@/scene/hero-model-geometry";

interface HeroCanvasUiGlassAssetProps {
  readonly reducedMotion: boolean;
  readonly sceneScale: number;
}

export function HeroCanvasUiGlassAsset({ sceneScale }: HeroCanvasUiGlassAssetProps) {
  const source = useLoader(GLTFLoader, HERO_MODEL_SOURCE);
  const gl = useThree((state) => state.gl);
  const meshRef = useRef<Mesh>(null);
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
    const target = pmrem.fromScene(room, 0.6, 0.1, 1000);
    room.dispose();
    pmrem.dispose();
    return target;
  }, [gl]);
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        clearcoat: config.clearcoat,
        clearcoatRoughness: config.clearcoatRoughness,
        color: 0xffffff,
        dispersion: config.dispersion,
        envMap: environment.texture,
        envMapIntensity: config.environmentIntensity,
        ior: config.ior,
        metalness: 0,
        roughness: config.roughness,
        thickness: config.thickness / Math.max(sceneScale, 0.0001),
        transmission: config.transmission,
      }),
    [environment.texture, sceneScale],
  );

  useLayoutEffect(() => {
    meshRef.current?.layers.set(HERO_GLASS_CONFIG.renderLayer);
  }, []);
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => material.dispose(), [material]);
  useLayoutEffect(() => () => environment.dispose(), [environment]);

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
