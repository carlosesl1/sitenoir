"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { createContext, type ReactNode, useContext, useEffect, useMemo } from "react";
import { MathUtils, type Texture, Vector2 } from "three";

import { pointerStore } from "@/features/pointer/pointer-store";
import { pointerSnapshotToUv } from "@/scene/hero-effects";
import { shouldRunFluidPush } from "@/scene/hero-fluid";
import { HeroFluidSimulation } from "@/scene/hero-fluid-simulation";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import { sceneTransitionStore } from "@/scene/scene-transition";

interface FluidUniform<T> {
  value: T;
}

interface HeroFluidContextValue {
  readonly devicePixelRatio: FluidUniform<number>;
  readonly effectEnabled: FluidUniform<number>;
  readonly overlayEnabled: FluidUniform<number>;
  readonly resolution: FluidUniform<Vector2>;
  readonly simSize: FluidUniform<Vector2>;
  readonly trail: FluidUniform<readonly Vector2[]>;
  readonly trailStrength: FluidUniform<readonly number[]>;
  readonly velocity: FluidUniform<Texture>;
}

interface HeroFluidProviderProps {
  readonly children: ReactNode;
  readonly reducedMotion: boolean;
}

const TRAIL_COUNT = 14;
const TRAIL_CAPACITY = 16;
const POINTER_PIXEL_SIZE = 16;
const HeroFluidContext = createContext<HeroFluidContextValue | null>(null);

export function useHeroFluid(): HeroFluidContextValue {
  const value = useContext(HeroFluidContext);
  if (!value) throw new Error("useHeroFluid must be used inside HeroFluidProvider");
  return value;
}

export function HeroFluidProvider({ children, reducedMotion }: HeroFluidProviderProps) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const simulation = useMemo(() => new HeroFluidSimulation(), []);
  const currentPointer = useMemo(() => new Vector2(-1, -1), []);
  const previousPointer = useMemo(() => new Vector2(-1, -1), []);
  const lastPointerCell = useMemo(() => new Vector2(-1, -1), []);
  const trail = useMemo(
    () => Array.from({ length: TRAIL_CAPACITY }, () => new Vector2(0.5, 0.5)),
    [],
  );
  const trailStrength = useMemo(() => Array.from({ length: TRAIL_CAPACITY }, () => 0), []);
  const devicePixelRatio = useMemo<FluidUniform<number>>(() => ({ value: 1 }), []);
  const effectEnabled = useMemo<FluidUniform<number>>(() => ({ value: 0 }), []);
  const overlayEnabled = useMemo<FluidUniform<number>>(() => ({ value: 0 }), []);
  const resolution = useMemo<FluidUniform<Vector2>>(() => ({ value: new Vector2(1, 1) }), []);
  const simSize = useMemo<FluidUniform<Vector2>>(
    () => ({ value: simulation.simSize }),
    [simulation],
  );
  const trailUniform = useMemo<FluidUniform<readonly Vector2[]>>(() => ({ value: trail }), [trail]);
  const trailStrengthUniform = useMemo<FluidUniform<readonly number[]>>(
    () => ({ value: trailStrength }),
    [trailStrength],
  );
  const velocity = useMemo<FluidUniform<Texture>>(
    () => ({ value: simulation.texture }),
    [simulation],
  );
  useEffect(() => {
    const pixelRatio = Math.min(gl.getPixelRatio(), 2);
    const width = Math.max(1, Math.floor(size.width * pixelRatio));
    const height = Math.max(1, Math.floor(size.height * pixelRatio));
    devicePixelRatio.value = pixelRatio;
    resolution.value.set(width, height);
    simulation.setSize(width, height);
  }, [devicePixelRatio, gl, resolution, simulation, size.height, size.width]);

  useEffect(() => () => simulation.dispose(), [simulation]);

  useFrame((_state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    const pointer = pointerStore.getSnapshot();
    const transition = sceneTransitionStore.getSnapshot();
    const active = shouldRunFluidPush({
      compactViewport: size.width < 768,
      idleMilliseconds: performance.now() - pointer.lastMovedAt,
      pointerInside: pointer.inside,
      reducedMotion,
      solid: transition.solid,
    });
    effectEnabled.value = active ? 1 : 0;
    overlayEnabled.value = transition.solid ? 1 : 0;
    const uv = pointerSnapshotToUv(pointer);
    const pixelRatio = devicePixelRatio.value;
    currentPointer.set(uv.x * size.width * pixelRatio, uv.y * size.height * pixelRatio);
    if (pointer.inside) {
      if (previousPointer.x >= 0 && previousPointer.y >= 0) {
        simulation.pointerDelta.copy(currentPointer).sub(previousPointer);
      } else {
        simulation.pointerDelta.set(0, 0);
      }
      simulation.pointer.copy(currentPointer);
      previousPointer.copy(currentPointer);
    } else {
      simulation.pointerDelta.multiplyScalar(0.9);
      previousPointer.set(-1, -1);
    }
    updateTrail({
      active: pointer.inside && transition.solid,
      delta: frameDelta,
      lastPointerCell,
      size,
      trail,
      trailStrength,
      uv,
    });
    if (active) {
      simulation.step(gl);
      velocity.value = simulation.texture;
    }
  }, 997);

  const value = useMemo(
    () => ({
      devicePixelRatio,
      effectEnabled,
      overlayEnabled,
      resolution,
      simSize,
      trail: trailUniform,
      trailStrength: trailStrengthUniform,
      velocity,
    }),
    [
      devicePixelRatio,
      effectEnabled,
      overlayEnabled,
      resolution,
      simSize,
      trailStrengthUniform,
      trailUniform,
      velocity,
    ],
  );

  return <HeroFluidContext.Provider value={value}>{children}</HeroFluidContext.Provider>;
}

interface TrailUpdateInput {
  readonly active: boolean;
  readonly delta: number;
  readonly lastPointerCell: Vector2;
  readonly size: { readonly height: number; readonly width: number };
  readonly trail: Vector2[];
  readonly trailStrength: number[];
  readonly uv: { readonly x: number; readonly y: number };
}

function updateTrail(input: TrailUpdateInput) {
  const cellWidth = POINTER_PIXEL_SIZE / Math.max(input.size.width, 1);
  const cellHeight = POINTER_PIXEL_SIZE / Math.max(input.size.height, 1);
  const decayStart = input.active ? 1 : 0;
  for (let index = decayStart; index < TRAIL_COUNT; index += 1) {
    input.trailStrength[index] = MathUtils.damp(input.trailStrength[index] ?? 0, 0, 2, input.delta);
  }
  if (!input.active) {
    input.lastPointerCell.set(-1, -1);
    return;
  }
  const cellX = Math.floor(input.uv.x / cellWidth);
  const cellY = Math.floor(input.uv.y / cellHeight);
  if (cellX !== input.lastPointerCell.x || cellY !== input.lastPointerCell.y) {
    for (let index = TRAIL_COUNT - 1; index > 0; index -= 1) {
      const target = input.trail[index];
      const source = input.trail[index - 1];
      if (target && source) target.copy(source);
      input.trailStrength[index] = input.trailStrength[index - 1] ?? 0;
    }
    input.lastPointerCell.set(cellX, cellY);
  }
  input.trail[0]?.set(input.uv.x, input.uv.y);
  input.trailStrength[0] = 1;
}
