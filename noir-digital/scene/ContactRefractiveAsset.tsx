"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo } from "react";
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  Mesh,
  Plane,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { pointerStore } from "@/features/pointer/pointer-store";
import { useTheme } from "@/features/theme/ThemeProvider";
import { CONTACT_FLARE_LAYER } from "@/scene/contact-flare-layer";
import {
  CONTACT_FLARE_MASK_FRAGMENT_SHADER,
  CONTACT_FLARE_MASK_VERTEX_SHADER,
  CONTACT_REFRACTIVE_FRAGMENT_SHADER,
  CONTACT_REFRACTIVE_VERTEX_SHADER,
} from "@/scene/contact-refractive-shaders";
import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";
import { pointerSnapshotToUv } from "@/scene/hero-effects";
import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import { sceneTransitionStore } from "@/scene/scene-transition";

interface ContactRefractiveAssetProps {
  readonly depthScale: number;
  readonly path: string;
  readonly reducedMotion: boolean;
}

function colorVector(hex: string): Vector4 {
  const color = new Color(hex);
  return new Vector4(color.r, color.g, color.b, 1);
}

interface ContactPoint {
  readonly x: number;
  readonly y: number;
}

interface ContactBoundarySegment {
  readonly end: ContactPoint;
  readonly flareStrength: number;
  readonly start: ContactPoint;
}

function contactPointKey(x: number, y: number): string {
  return `${Math.round(x * 100_000)},${Math.round(y * 100_000)}`;
}

function contactEdgeKey(first: string, second: string): string {
  return first < second ? `${first}|${second}` : `${second}|${first}`;
}

function pointToSegmentDistanceSquared(
  x: number,
  y: number,
  start: ContactPoint,
  end: ContactPoint,
): number {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY || 1;
  const progress = MathUtils.clamp(
    ((x - start.x) * deltaX + (y - start.y) * deltaY) / lengthSquared,
    0,
    1,
  );
  const nearestX = start.x + deltaX * progress;
  const nearestY = start.y + deltaY * progress;
  return (x - nearestX) ** 2 + (y - nearestY) ** 2;
}

function createContactBoundarySegments(geometry: BufferGeometry): ContactBoundarySegment[] {
  const position = geometry.getAttribute("position");
  const bounds = geometry.boundingBox;
  if (!position || !bounds) return [];

  const points = new Map<string, ContactPoint>();
  const edges = new Map<string, { first: string; second: string; uses: number }>();
  const maximumZ = bounds.max.z;
  const capTolerance = Math.max(0.00001, Math.abs(bounds.max.z - bounds.min.z) * 0.00001);
  const addEdge = (firstIndex: number, secondIndex: number) => {
    const first = contactPointKey(position.getX(firstIndex), position.getY(firstIndex));
    const second = contactPointKey(position.getX(secondIndex), position.getY(secondIndex));
    const key = contactEdgeKey(first, second);
    points.set(first, { x: position.getX(firstIndex), y: position.getY(firstIndex) });
    points.set(second, { x: position.getX(secondIndex), y: position.getY(secondIndex) });
    const edge = edges.get(key) ?? { first, second, uses: 0 };
    edge.uses += 1;
    edges.set(key, edge);
  };

  for (let offset = 0; offset < position.count; offset += 3) {
    const isFrontCap = [offset, offset + 1, offset + 2].every(
      (index) => Math.abs(position.getZ(index) - maximumZ) <= capTolerance,
    );
    if (!isFrontCap) continue;
    addEdge(offset, offset + 1);
    addEdge(offset + 1, offset + 2);
    addEdge(offset + 2, offset);
  }

  const boundaryEdges = [...edges.values()].filter((edge) => edge.uses === 1);
  const adjacency = new Map<string, string[]>();
  for (const edge of boundaryEdges) {
    adjacency.set(edge.first, [...(adjacency.get(edge.first) ?? []), edge.second]);
    adjacency.set(edge.second, [...(adjacency.get(edge.second) ?? []), edge.first]);
  }

  const unusedEdges = new Set(boundaryEdges.map((edge) => contactEdgeKey(edge.first, edge.second)));
  const loops: string[][] = [];
  while (unusedEdges.size > 0) {
    const firstEdge = unusedEdges.values().next().value as string | undefined;
    if (!firstEdge) break;
    const [start, firstNeighbor] = firstEdge.split("|");
    if (!start || !firstNeighbor) break;
    const loop = [start];
    let previous = start;
    let current = firstNeighbor;
    unusedEdges.delete(firstEdge);

    while (current !== start && loop.length <= boundaryEdges.length) {
      loop.push(current);
      const neighbors = adjacency.get(current) ?? [];
      const next =
        neighbors.find(
          (neighbor) => neighbor !== previous && unusedEdges.has(contactEdgeKey(current, neighbor)),
        ) ??
        neighbors.find(
          (neighbor) => neighbor === start && unusedEdges.has(contactEdgeKey(current, neighbor)),
        );
      if (!next) break;
      unusedEdges.delete(contactEdgeKey(current, next));
      previous = current;
      current = next;
    }

    let signedArea = 0;
    for (let index = 0; index < loop.length; index += 1) {
      const first = points.get(loop[index] ?? "");
      const second = points.get(loop[(index + 1) % loop.length] ?? "");
      if (first && second) signedArea += first.x * second.y - second.x * first.y;
    }
    if (signedArea < 0) loop.reverse();
    loops.push(loop);
  }

  const segments: ContactBoundarySegment[] = [];
  const boundaryPoints = [...points.values()];
  const iconSpan = Math.max(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y) || 1;
  loops.forEach((loop) => {
    for (let index = 0; index < loop.length; index += 1) {
      const start = points.get(loop[index] ?? "");
      const end = points.get(loop[(index + 1) % loop.length] ?? "");
      if (!start || !end) continue;
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const length = Math.hypot(deltaX, deltaY) || 1;
      const outwardX = deltaY / length;
      const outwardY = -deltaX / length;
      const middleX = (start.x + end.x) / 2;
      const middleY = (start.y + end.y) / 2;
      const middleProjection = middleX * outwardX + middleY * outwardY;
      const supportProjection = boundaryPoints.reduce(
        (maximum, point) => Math.max(maximum, point.x * outwardX + point.y * outwardY),
        Number.NEGATIVE_INFINITY,
      );
      const supportGap = Math.max(0, supportProjection - middleProjection) / iconSpan;
      segments.push({
        end,
        flareStrength: 1 - MathUtils.smoothstep(supportGap, 0.015, 0.075),
        start,
      });
    }
  });
  return segments;
}

function addContactSurfaceKinds(geometry: BufferGeometry): void {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const bounds = geometry.boundingBox;
  if (!position || !normal || !bounds) return;

  const boundarySegments = createContactBoundarySegments(geometry);
  const surfaceKinds = new Float32Array(position.count);
  const flareMask = new Float32Array(position.count);
  for (let offset = 0; offset < position.count; offset += 3) {
    const centerX =
      (position.getX(offset) + position.getX(offset + 1) + position.getX(offset + 2)) / 3;
    const centerY =
      (position.getY(offset) + position.getY(offset + 1) + position.getY(offset + 2)) / 3;
    let nearestSegment: ContactBoundarySegment | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const segment of boundarySegments) {
      const distance = pointToSegmentDistanceSquared(centerX, centerY, segment.start, segment.end);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestSegment = segment;
      }
    }
    const sideDirection = (nearestSegment?.flareStrength ?? 0) >= 0.5 ? 1 : -1;
    for (let vertex = offset; vertex < offset + 3; vertex += 1) {
      const sideFacing = 1 - Math.abs(normal.getZ(vertex));
      const roundedTransition = MathUtils.smoothstep(sideFacing, 0.08, 0.92);
      surfaceKinds[vertex] = sideDirection * roundedTransition;
      flareMask[vertex] = (nearestSegment?.flareStrength ?? 0) * roundedTransition;
    }
  }
  geometry.setAttribute("contactSurfaceKind", new BufferAttribute(surfaceKinds, 1));
  geometry.setAttribute("contactFlareMask", new BufferAttribute(flareMask, 1));
}

export function ContactRefractiveAsset({
  depthScale,
  path,
  reducedMotion,
}: ContactRefractiveAssetProps) {
  const source = useLoader(GLTFLoader, path, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const { resolvedTheme } = useTheme();
  const { screenResolution, texture } = useHeroRefraction();
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const asset = useMemo(() => {
    const scene = source.scene.clone(true);
    const geometries: BufferGeometry[] = [];
    let minimum = Number.POSITIVE_INFINITY;
    let maximum = Number.NEGATIVE_INFINITY;
    scene.traverse((object) => {
      if (!(object instanceof Mesh) || !(object.geometry instanceof BufferGeometry)) return;
      const scaledGeometry = object.geometry.clone();
      scaledGeometry.scale(1, 1, depthScale);
      const geometry = toCreasedNormals(scaledGeometry, MathUtils.degToRad(40));
      if (geometry !== scaledGeometry) scaledGeometry.dispose();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      addContactSurfaceKinds(geometry);
      object.geometry = geometry;
      geometries.push(geometry);
      const bounds = geometry.boundingBox;
      if (!bounds) return;
      minimum = Math.min(minimum, bounds.min.y);
      maximum = Math.max(maximum, bounds.max.y);
    });
    scene.updateMatrixWorld(true);
    const center = new Box3().setFromObject(scene).getCenter(new Vector3());
    scene.position.sub(center);
    scene.updateMatrixWorld(true);
    const flareScene = scene.clone(true);
    const localYRange =
      Number.isFinite(minimum) && Number.isFinite(maximum)
        ? new Vector2(minimum, Math.abs(maximum - minimum) < 0.000001 ? minimum + 1 : maximum)
        : new Vector2(0, 1);
    return { flareScene, geometries, localYRange, scene };
  }, [depthScale, source.scene]);

  const material = useMemo(() => {
    const dark = resolvedTheme === "dark";
    const theme = dark ? HERO_GLASS_CONFIG.dark : HERO_GLASS_CONFIG.light;
    return new ShaderMaterial({
      fragmentShader: CONTACT_REFRACTIVE_FRAGMENT_SHADER,
      toneMapped: false,
      transparent: true,
      uniforms: {
        uBrightness: { value: theme.brightness },
        uChromaticAberration: { value: HERO_GLASS_CONFIG.chromaticAberration },
        uContrast: { value: theme.contrast },
        uContactInnerColor: { value: new Color(dark ? "#565d66" : "#656b72") },
        uContactInnerDarkening: { value: 0.52 },
        uContactOuterColor: { value: new Color("#f7f8f5") },
        uContactOuterBrightness: { value: 0.55 },
        uContactOuterWhiteMix: { value: 1 },
        uContactSurfaceRouting: { value: 1 },
        uDark: { value: dark ? 1 : 0 },
        uDiffuseness: { value: theme.diffuseness },
        uFresnelPower: { value: theme.fresnelPower },
        uFresnelSideDir: { value: new Vector3(...HERO_GLASS_CONFIG.fresnelSideDirection) },
        uFresnelStrength: { value: theme.fresnelStrength },
        uGamma: { value: theme.gamma },
        uGlassBaseColor: { value: new Color(dark ? "#858b92" : "#737980") },
        uGlassBaseStrength: { value: dark ? 0.58 : 0.48 },
        uIorB: { value: HERO_GLASS_CONFIG.ior.blue },
        uIorC: { value: HERO_GLASS_CONFIG.ior.cyan },
        uIorG: { value: HERO_GLASS_CONFIG.ior.green },
        uIorP: { value: HERO_GLASS_CONFIG.ior.purple },
        uIorR: { value: HERO_GLASS_CONFIG.ior.red },
        uIorY: { value: HERO_GLASS_CONFIG.ior.yellow },
        uLight: { value: new Vector3(4, 9, HERO_GLASS_CONFIG.lightZ) },
        uLoop: { value: HERO_GLASS_CONFIG.loopCount },
        uRefractPower: { value: HERO_GLASS_CONFIG.refractPower },
        uRgbRefraction: { value: 1 },
        uSaturation: { value: theme.saturation },
        uSceneRefractionEnabled: { value: 1 },
        uScreenResolutionPx: { value: screenResolution },
        uShininess: { value: theme.shininess },
        uSpecularStrength: { value: HERO_GLASS_CONFIG.specularStrength },
        uTexture: { value: texture },
        uTintColorA: { value: colorVector(theme.tintColorA) },
        uTintColorB: { value: colorVector(theme.tintColorB) },
        uTintEnabled: { value: 1 },
        uTintLocalYRange: { value: asset.localYRange },
        uTintMix: { value: HERO_GLASS_CONFIG.tintMix },
        uTintThicknessMaxAlpha: { value: theme.tintMaximumAlpha },
        uTintThicknessMinAlpha: { value: theme.tintMinimumAlpha },
      },
      vertexShader: CONTACT_REFRACTIVE_VERTEX_SHADER,
    });
  }, [asset.localYRange, resolvedTheme, screenResolution, texture]);

  const flareMaskMaterial = useMemo(
    () =>
      new ShaderMaterial({
        depthTest: true,
        depthWrite: true,
        fragmentShader: CONTACT_FLARE_MASK_FRAGMENT_SHADER,
        toneMapped: false,
        transparent: false,
        vertexShader: CONTACT_FLARE_MASK_VERTEX_SHADER,
      }),
    [],
  );

  const lightTracker = useMemo(
    () => ({
      angle: Math.atan2(9, 4),
      intersection: new Vector3(),
      ndc: new Vector2(),
      plane: new Plane(new Vector3(0, 0, 1), 0),
      raycaster: new Raycaster(),
    }),
    [],
  );

  useLayoutEffect(() => {
    asset.scene.userData["contactRefractiveObject"] = true;
    asset.scene.traverse((object) => {
      object.layers.set(0);
      if (!(object instanceof Mesh)) return;
      object.material = material;
      object.castShadow = false;
      object.receiveShadow = false;
    });
    asset.flareScene.userData["contactRefractiveObject"] = true;
    asset.flareScene.traverse((object) => {
      object.layers.set(CONTACT_FLARE_LAYER);
      if (!(object instanceof Mesh)) return;
      object.material = flareMaskMaterial;
      object.castShadow = false;
      object.receiveShadow = false;
    });
  }, [asset.flareScene, asset.scene, flareMaskMaterial, material]);

  useEffect(
    () => () => {
      for (const geometry of asset.geometries) geometry.dispose();
    },
    [asset.geometries],
  );
  useEffect(() => () => flareMaskMaterial.dispose(), [flareMaskMaterial]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    if (sceneTransitionStore.getSnapshot().opticalFrozen) return;
    const snapshot = pointerStore.getSnapshot();
    let targetAngle = Math.atan2(9, 4);
    if (!reducedMotion && size.width >= 768 && snapshot.inside) {
      const uv = pointerSnapshotToUv(snapshot);
      lightTracker.ndc.set(uv.x * 2 - 1, uv.y * 2 - 1);
      lightTracker.raycaster.setFromCamera(lightTracker.ndc, camera);
      const hit = lightTracker.raycaster.ray.intersectPlane(
        lightTracker.plane,
        lightTracker.intersection,
      );
      if (hit) {
        targetAngle = Math.atan2(-lightTracker.intersection.y, -lightTracker.intersection.x);
      }
    }
    const difference = Math.atan2(
      Math.sin(targetAngle - lightTracker.angle),
      Math.cos(targetAngle - lightTracker.angle),
    );
    lightTracker.angle += difference * (1 - Math.exp(-6 * frameDelta));
    const radius = Math.hypot(4, 9);
    material.uniforms["uLight"]?.value.set(
      radius * Math.cos(lightTracker.angle),
      radius * Math.sin(lightTracker.angle),
      HERO_GLASS_CONFIG.lightZ,
    );
  }, -2);

  return (
    <>
      <primitive object={asset.scene} />
      <primitive object={asset.flareScene} />
    </>
  );
}
