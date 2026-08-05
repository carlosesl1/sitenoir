"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  type InstancedMesh,
  Object3D,
  Plane,
  Raycaster,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import type { StickerTransform } from "@/scene/scene-layout";
import { sceneTransitionStore } from "@/scene/scene-transition";
import {
  advanceStickerParticle,
  createStickerParticle,
  findAvailableStickerSlot,
  hasStickerCompletedFall,
  resolveStickerAppearance,
  type StickerParticle,
} from "@/scene/sticker-particles";
import {
  createStickerGeometry,
  createStickerMaterial,
  MAX_STICKER_PARTICLES,
  resolveStickerAtlasSource,
} from "@/scene/sticker-rendering";

interface StickerFieldProps {
  readonly layout: readonly StickerTransform[];
  readonly reducedMotion: boolean;
  readonly scrollProgress: { readonly get: () => number };
  readonly visibility: number;
}

interface PointerGesture {
  readonly startedAt: number;
  readonly x: number;
  readonly y: number;
}

interface StickerBurst {
  nextSpawnAt: number;
  readonly position: Vector3;
  remaining: number;
}

const BURST_PARTICLES = 12;
const BURST_INTERVAL = 40;
const MAX_QUEUED_BURSTS = 8;

export function StickerField({ layout, reducedMotion, visibility }: StickerFieldProps) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const atlas = useLoader(TextureLoader, resolveStickerAtlasSource(size.width));
  const geometry = useMemo(createStickerGeometry, []);
  const material = useMemo(() => createStickerMaterial(atlas), [atlas]);
  const meshRef = useRef<InstancedMesh>(null);
  const particlesRef = useRef<StickerParticle[]>(
    layout.map((sticker, index) =>
      createStickerParticle({ seed: index + 1, textureIndex: sticker.atlasTile }),
    ),
  );
  const burstsRef = useRef<StickerBurst[]>([]);
  const gestureRef = useRef<PointerGesture | null>(null);
  const seedRef = useRef(layout.length + 1);
  const startedRef = useRef(false);
  const activeElapsedRef = useRef(0);
  const transform = useMemo(() => new Object3D(), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const pointer = useMemo(() => new Vector2(), []);
  const interactionPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 4), []);
  const intersection = useMemo(() => new Vector3(), []);

  useEffect(() => {
    atlas.colorSpace = SRGBColorSpace;
    atlas.needsUpdate = true;
  }, [atlas]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      gestureRef.current = { startedAt: performance.now(), x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      const gesture = gestureRef.current;
      gestureRef.current = null;
      if (!gesture || event.button !== 0 || reducedMotion || size.width < 768) return;
      const elapsed = performance.now() - gesture.startedAt;
      const distance = Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y);
      const selection = window.getSelection();
      if (elapsed > 600 || distance > 8 || selection?.isCollapsed === false) return;
      if (sceneTransitionStore.getSnapshot().solid) return;
      pointer.set((event.clientX / size.width) * 2 - 1, 1 - (event.clientY / size.height) * 2);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.ray.intersectPlane(interactionPlane, intersection);
      if (!hit) return;
      if (burstsRef.current.length >= MAX_QUEUED_BURSTS) return;
      burstsRef.current.push({
        nextSpawnAt: performance.now(),
        position: hit.clone(),
        remaining: BURST_PARTICLES,
      });
    };
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    camera,
    interactionPlane,
    intersection,
    pointer,
    raycaster,
    reducedMotion,
    size.height,
    size.width,
  ]);

  useEffect(
    () => () => {
      material.dispose();
    },
    [material],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    activeElapsedRef.current += frameDelta;
    const transition = sceneTransitionStore.getSnapshot();
    if (transition.refractive) return;
    if (!startedRef.current) {
      startedRef.current = visibility > 0 || transition.stickersActive;
    }
    if (!startedRef.current) return;
    const mesh = meshRef.current;
    if (!mesh) return;

    const now = performance.now();
    const burst = burstsRef.current[0];
    const availableSlot = findAvailableStickerSlot(particlesRef.current, MAX_STICKER_PARTICLES);
    if (burst && burst.nextSpawnAt <= now && availableSlot >= 0) {
      const angle = (burst.remaining / BURST_PARTICLES) * Math.PI * 4;
      const radius = (burst.remaining / BURST_PARTICLES) * 1.8;
      const origin: readonly [number, number, number] = [
        burst.position.x + Math.cos(angle) * radius,
        burst.position.y + Math.sin(angle) * radius,
        burst.position.z,
      ];
      const particle = createStickerParticle({
        origin,
        recycle: false,
        seed: seedRef.current,
        textureIndex: layout[seedRef.current % layout.length]?.atlasTile ?? 0,
      });
      const reusable = particlesRef.current[availableSlot];
      if (reusable) Object.assign(reusable, particle);
      else particlesRef.current.push(particle);
      seedRef.current += 1;
      burst.remaining -= 1;
      burst.nextSpawnAt += BURST_INTERVAL;
      if (burst.remaining === 0) burstsRef.current.shift();
    }

    let count = 0;
    for (const particle of particlesRef.current) {
      if (!particle.active) continue;
      advanceStickerParticle(particle, {
        delta: reducedMotion ? 0 : frameDelta,
        elapsed: activeElapsedRef.current,
      });
      if (hasStickerCompletedFall(particle)) {
        if (!particle.recycle) {
          particle.active = false;
          continue;
        }
        const replacement = createStickerParticle({
          seed: seedRef.current,
          textureIndex: particle.textureIndex,
        });
        seedRef.current += 1;
        Object.assign(particle, replacement);
      }
      const appearance = resolveStickerAppearance(particle);
      transform.position.set(particle.x, particle.y, particle.z);
      transform.rotation.set(0, 0, particle.rotation);
      transform.scale.setScalar(appearance.scale);
      transform.updateMatrix();
      mesh.setMatrixAt(count, transform.matrix);
      geometry.getAttribute("instanceOpacity").setX(count, appearance.opacity);
      geometry.getAttribute("instanceTile").setX(count, particle.textureIndex);
      count += 1;
    }

    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    geometry.getAttribute("instanceOpacity").needsUpdate = true;
    geometry.getAttribute("instanceTile").needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={(mesh) => {
        if (mesh) mesh.count = 0;
        meshRef.current = mesh;
      }}
      args={[geometry, material, MAX_STICKER_PARTICLES]}
      frustumCulled={false}
    />
  );
}
