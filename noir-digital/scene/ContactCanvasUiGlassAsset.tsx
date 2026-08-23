"use client";

import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  FrontSide,
  MathUtils,
  Mesh,
  NormalBlending,
  type Object3D,
  type WebGLRenderTarget,
} from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeGeometries, toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { CONTACT_FLARE_LAYER } from "@/scene/contact-flare-layer";
import { resolveContactCanvasUiGeometryScale } from "@/scene/contact-model-scale";
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

interface ContactCanvasUiGlassAssetProps {
  readonly depthScale: number;
  readonly path: string;
  readonly sceneScale: number;
}

const CONTACT_CURSOR_DARK = "#242a30";
const CONTACT_GLASS_CONFIG = {
  anisotropicBlur: 0.12,
  clearcoat: 0.32,
  clearcoatRoughness: 0.24,
  environmentIntensity: 0.16,
  roughness: 0.22,
  transmission: 0.58,
} as const;

function writeFloat32Positions(geometry: BufferGeometry): void {
  const sourcePosition = geometry.getAttribute("position");
  if (!sourcePosition) return;

  const positions = new Float32Array(sourcePosition.count * 3);
  for (let index = 0; index < sourcePosition.count; index += 1) {
    const offset = index * 3;
    positions[offset] = sourcePosition.getX(index);
    positions[offset + 1] = sourcePosition.getY(index);
    positions[offset + 2] = sourcePosition.getZ(index);
  }
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
}

function reverseIndexedWinding(geometry: BufferGeometry): void {
  const index = geometry.getIndex();
  if (!index) return;

  for (let offset = 0; offset < index.count; offset += 3) {
    const second = index.getX(offset + 1);
    index.setX(offset + 1, index.getX(offset + 2));
    index.setX(offset + 2, second);
  }
  index.needsUpdate = true;
}

function createContactCanvasUiGeometry(source: Object3D): BufferGeometry {
  source.updateMatrixWorld(true);
  const parts: BufferGeometry[] = [];
  source.traverse((object) => {
    if (!(object instanceof Mesh) || !(object.geometry instanceof BufferGeometry)) return;

    const part = object.geometry.clone();
    part.deleteAttribute("normal");
    writeFloat32Positions(part);
    part.applyMatrix4(object.matrixWorld);
    if (object.matrixWorld.determinant() < 0) reverseIndexedWinding(part);
    parts.push(part);
  });

  const combined = mergeGeometries(parts, false) ?? parts[0] ?? new BufferGeometry();
  for (const part of parts) {
    if (part !== combined) part.dispose();
  }
  combined.center();
  combined.computeBoundingBox();
  combined.computeVertexNormals();
  return combined;
}

export function ContactCanvasUiGlassAsset({
  depthScale,
  path,
  sceneScale,
}: ContactCanvasUiGlassAssetProps) {
  const source = useLoader(GLTFLoader, path, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const { texture } = useHeroRefraction();
  const geometry = useMemo(() => {
    const scaledGeometry = createContactCanvasUiGeometry(source.scene);
    const geometryScale = resolveContactCanvasUiGeometryScale();
    scaledGeometry.scale(geometryScale, geometryScale, geometryScale * depthScale);
    const creasedGeometry = toCreasedNormals(scaledGeometry, MathUtils.degToRad(40));
    if (creasedGeometry !== scaledGeometry) scaledGeometry.dispose();
    creasedGeometry.computeBoundingBox();
    creasedGeometry.computeBoundingSphere();
    return creasedGeometry;
  }, [depthScale, source.scene]);
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

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => environment.dispose(), [environment]);

  return (
    <group userData={{ contactRefractiveObject: true }}>
      <mesh
        geometry={geometry}
        onUpdate={(mesh) => mesh.layers.set(HERO_GLASS_CONFIG.renderLayer)}
        renderOrder={1}
      >
        <MeshTransmissionMaterial
          anisotropicBlur={CONTACT_GLASS_CONFIG.anisotropicBlur}
          backside={glassConfig.backside}
          buffer={texture}
          chromaticAberration={glassConfig.chromaticAberration}
          clearcoat={CONTACT_GLASS_CONFIG.clearcoat}
          clearcoatRoughness={CONTACT_GLASS_CONFIG.clearcoatRoughness}
          color={CONTACT_CURSOR_DARK}
          depthWrite
          envMap={environment.texture}
          envMapIntensity={CONTACT_GLASS_CONFIG.environmentIntensity}
          ior={glassConfig.ior}
          roughness={CONTACT_GLASS_CONFIG.roughness}
          samples={resolveHeroCanvasUiSamples(width)}
          thickness={resolveHeroCanvasUiThickness(sceneScale)}
          transmission={CONTACT_GLASS_CONFIG.transmission}
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
        onUpdate={(mesh) => mesh.layers.set(CONTACT_FLARE_LAYER)}
        renderOrder={3}
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
    </group>
  );
}
