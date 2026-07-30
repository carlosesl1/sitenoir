"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import {
  type BufferGeometry,
  Color,
  type Group,
  MathUtils,
  Mesh,
  Plane,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { pointerStore } from "@/features/pointer/pointer-store";
import type { PrincipleSectionRect } from "@/features/principles/PrincipleSceneProvider";
import { useTheme } from "@/features/theme/ThemeProvider";
import {
  principleCursorFragmentShader,
  principleCursorVertexShader,
} from "@/scene/principle-hyperspace-shaders";
import {
  resolveFullscreenCursorScale,
  resolvePrinciplePointerRectMotion,
  resolvePrinciplePointerRotation,
} from "@/scene/principle-pointer-motion";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";

const REST_SCALE = 0.1;
const AXIS_TILT = MathUtils.degToRad(45);
const LIGHT_X = 4;
const LIGHT_Y = 9;
const LIGHT_RADIUS = Math.hypot(LIGHT_X, LIGHT_Y);
const DEFAULT_LIGHT_ANGLE = Math.atan2(LIGHT_Y, LIGHT_X);

interface PrinciplePointerModelProps {
  readonly reducedMotion: boolean;
  readonly sectionRef: MutableRefObject<HTMLElement | null>;
  readonly sectionRectRef: MutableRefObject<PrincipleSectionRect | null>;
  readonly setFullscreen: (fullscreen: boolean) => void;
}

function mergeCursorGeometry(root: Group): BufferGeometry {
  root.updateMatrixWorld(true);
  const geometries: BufferGeometry[] = [];
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const geometry = object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    geometries.push(geometry);
  });

  if (geometries.length === 0) {
    throw new Error("The principle cursor model has no mesh geometry.");
  }

  const merged = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, true);
  if (!merged) {
    for (const geometry of geometries) geometry.dispose();
    throw new Error("The principle cursor geometry could not be merged.");
  }
  for (const geometry of geometries) {
    if (geometry !== merged) geometry.dispose();
  }
  merged.center();
  merged.computeBoundingSphere();
  return merged;
}

export function PrinciplePointerModel({
  reducedMotion,
  sectionRef,
  sectionRectRef,
  setFullscreen,
}: PrinciplePointerModelProps) {
  const containerRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const fullscreenRef = useRef(false);
  const lightAngleRef = useRef(DEFAULT_LIGHT_ANGLE);
  const { resolvedTheme } = useTheme();
  const source = useLoader(GLTFLoader, "/model/cursor.glb");
  const geometry = useMemo(() => mergeCursorGeometry(source.scene), [source.scene]);
  const modelRadius = geometry.boundingSphere?.radius ?? 1;
  const lightController = useMemo(
    () => ({
      intersection: new Vector3(),
      ndc: new Vector2(),
      plane: new Plane(new Vector3(0, 0, 1), 0),
      raycaster: new Raycaster(),
      viewportTarget: new Vector3(),
    }),
    [],
  );
  const uniforms = useMemo(
    () => ({
      uDiffuseness: { value: 0.1 },
      uFresnelPower: { value: 6 },
      uFresnelSideDir: { value: new Vector3(-1, 0.3, 1) },
      uFresnelStrength: { value: 1 },
      uAccentColor: { value: new Color("#009dff") },
      uLight: { value: new Vector3(4, 9, 0.5) },
      uOpacity: { value: 1 },
      uProgress: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uScaleReveal: { value: 0 },
      uShininess: { value: 40 },
      uSpecularStrength: { value: 1.2 },
      uStripeColorA: { value: new Color("#009dff") },
      uStripeColorB: { value: new Color("#64c3ff") },
    }),
    [],
  );
  const material = useMemo(
    () =>
      new ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        fragmentShader: principleCursorFragmentShader,
        toneMapped: false,
        transparent: true,
        uniforms,
        vertexShader: principleCursorVertexShader,
      }),
    [uniforms],
  );

  useEffect(() => {
    const dark = resolvedTheme === "dark";
    uniforms.uDiffuseness.value = dark ? 0.05 : 0.1;
    uniforms.uShininess.value = dark ? 100 : 120;
    uniforms.uFresnelPower.value = dark ? 3 : 1;
    uniforms.uFresnelStrength.value = dark ? 0.72 : 0.24;
    uniforms.uFresnelSideDir.value.set(-1, 1, -1);
  }, [resolvedTheme, uniforms]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      setFullscreen(false);
    },
    [geometry, material, setFullscreen],
  );

  useFrame((state, delta) => {
    const frameDelta = resolveSceneFrameDelta(delta);
    const container = containerRef.current;
    const spin = spinRef.current;
    const section = sectionRef.current;
    if (!container || !spin || !section) return;

    const rect = sectionRectRef.current ?? section.getBoundingClientRect();
    const worldViewport = state.viewport.getCurrentViewport(
      state.camera,
      lightController.viewportTarget.set(0, 0, 0),
    );
    const exitPadding =
      (modelRadius * REST_SCALE * state.size.height * 0.45) / Math.max(0.001, worldViewport.height);
    const motion = resolvePrinciplePointerRectMotion({
      bottom: rect.bottom,
      exitPadding,
      height: rect.height,
      top: rect.top,
      viewportHeight: state.size.height,
    });
    container.visible = motion.visible && !reducedMotion;

    if (!container.visible) {
      if (fullscreenRef.current) {
        fullscreenRef.current = false;
        setFullscreen(false);
      }
      return;
    }

    const pointer = pointerStore.getSnapshot();
    const fullscreenScale = resolveFullscreenCursorScale(
      worldViewport.width,
      worldViewport.height,
      modelRadius,
    );
    const entryScale = MathUtils.lerp(REST_SCALE, fullscreenScale, motion.entryProgress);
    const targetScale = motion.beforeShrink
      ? entryScale
      : motion.shrinking
        ? MathUtils.lerp(entryScale, REST_SCALE, motion.shrinkProgress)
        : REST_SCALE;
    const targetY =
      (0.5 - motion.targetViewportY / Math.max(1, state.size.height)) * worldViewport.height;

    container.scale.setScalar(MathUtils.damp(container.scale.x, targetScale, 32, frameDelta));
    container.position.y = targetY;
    const actualReveal = MathUtils.clamp(
      (container.scale.x - REST_SCALE) / Math.max(0.001, fullscreenScale - REST_SCALE),
      0,
      1,
    );
    const targetRotation = MathUtils.degToRad(
      resolvePrinciplePointerRotation(motion, actualReveal),
    );
    spin.rotation.y = targetRotation;

    let targetLightAngle = DEFAULT_LIGHT_ANGLE;
    if (state.size.width >= 768 && pointer.inside) {
      lightController.ndc.set(pointer.normalizedX, pointer.normalizedY);
      lightController.raycaster.setFromCamera(lightController.ndc, state.camera);
      const intersection = lightController.raycaster.ray.intersectPlane(
        lightController.plane,
        lightController.intersection,
      );
      if (intersection) {
        const lightX = -intersection.x;
        const lightY = -intersection.y;
        if (lightX * lightX + lightY * lightY > 0.000001) {
          targetLightAngle = Math.atan2(lightY, lightX);
        }
      }
    }
    const lightAngleDelta = Math.atan2(
      Math.sin(targetLightAngle - lightAngleRef.current),
      Math.cos(targetLightAngle - lightAngleRef.current),
    );
    lightAngleRef.current += lightAngleDelta * (1 - Math.exp(-6 * frameDelta));
    uniforms.uProgress.value = motion.timeProgress;
    uniforms.uLight.value.set(
      LIGHT_RADIUS * Math.cos(lightAngleRef.current),
      LIGHT_RADIUS * Math.sin(lightAngleRef.current),
      0.5,
    );
    state.gl.getDrawingBufferSize(uniforms.uResolution.value);
    uniforms.uScaleReveal.value = actualReveal;
    const fullscreen = actualReveal >= 0.5;
    if (fullscreen !== fullscreenRef.current) {
      fullscreenRef.current = fullscreen;
      setFullscreen(fullscreen);
    }
  });

  return (
    <group ref={containerRef} visible={false} position={[0, 0, 0]} scale={REST_SCALE}>
      <group rotation={[0, 0, AXIS_TILT]}>
        <group ref={spinRef}>
          <group rotation={[0, 0, -AXIS_TILT]}>
            <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={12} />
          </group>
        </group>
      </group>
    </group>
  );
}
