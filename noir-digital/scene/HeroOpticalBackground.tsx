"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector2,
  WebGLRenderTarget,
} from "three";

import { pointerStore } from "@/features/pointer/pointer-store";
import { useTheme } from "@/features/theme/ThemeProvider";
import {
  BOKEH_FRAGMENT_SHADER,
  OUTPUT_FRAGMENT_SHADER,
  SINE_FRAGMENT_SHADER,
  SWIRL_FRAGMENT_SHADER,
  VIGNETTE_FRAGMENT_SHADER,
} from "@/scene/hero-background-shaders";
import { HERO_BACKGROUND_CONFIG, pointerSnapshotToUv } from "@/scene/hero-effects";
import {
  createBlueNoise,
  createOpticalMaterial,
  readOpticalToken,
} from "@/scene/hero-optical-resources";
import { SHATTER_FRAGMENT_SHADER } from "@/scene/hero-shatter-shader";
import { sceneTransitionStore, shouldRenderOpticalFrame } from "@/scene/scene-transition";

interface HeroOpticalBackgroundProps {
  readonly active: boolean;
  readonly frameStride: number;
  readonly forceDark: boolean;
  readonly reducedMotion: boolean;
  readonly resolutionScale: number;
}

interface RenderTargets {
  read: WebGLRenderTarget;
  write: WebGLRenderTarget;
}

export function HeroOpticalBackground({
  active,
  frameStride,
  forceDark,
  reducedMotion,
  resolutionScale,
}: HeroOpticalBackgroundProps) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const { resolvedTheme } = useTheme();
  const pointer = useMemo(() => new Vector2(0.5, 0.5), []);
  const shatterOrigin = useMemo(() => new Vector2(0.5, 0.5), []);
  const bokehOrigin = useMemo(() => new Vector2(0.5, -0.1), []);
  const targetPointer = useMemo(() => new Vector2(0.5, 0.5), []);
  const resolution = useMemo(() => new Vector2(1, 1), []);
  const time = useMemo(() => ({ value: 0 }), []);
  const noise = useMemo(() => createBlueNoise(128), []);
  const frame = useRef(0);
  const activeTime = useRef(0);
  const previousElapsed = useRef<number | null>(null);

  const colors = useMemo(() => {
    const dark = forceDark || resolvedTheme === "dark";
    return {
      background: readOpticalToken(
        dark ? "--color-optical-dark-background" : "--color-optical-light-background",
      ),
      edgeIntensity: dark
        ? HERO_BACKGROUND_CONFIG.dark.edgeIntensity
        : HERO_BACKGROUND_CONFIG.light.edgeIntensity,
      output: readOpticalToken(
        dark ? "--color-optical-dark-output" : "--color-optical-light-output",
      ),
      outputMix: dark
        ? HERO_BACKGROUND_CONFIG.dark.outputMix
        : HERO_BACKGROUND_CONFIG.light.outputMix,
      vignette: readOpticalToken(
        dark ? "--color-optical-dark-vignette" : "--color-optical-light-vignette",
      ),
    };
  }, [forceDark, resolvedTheme]);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  const pipeline = useMemo(() => {
    const common = {
      uResolution: { value: resolution },
      uTime: time,
      uPos: { value: pointer },
    };
    const vignette = createOpticalMaterial(VIGNETTE_FRAGMENT_SHADER, {
      ...common,
      uRadius: { value: HERO_BACKGROUND_CONFIG.vignette.radius },
      uFalloff: { value: HERO_BACKGROUND_CONFIG.vignette.falloff },
      uSkew: { value: HERO_BACKGROUND_CONFIG.vignette.skew },
      uAngle: { value: HERO_BACKGROUND_CONFIG.vignette.angle },
      uEdgeIntensity: { value: 0 },
      uVignetteColor: { value: new Color() },
      uClearColor: { value: new Color() },
    });
    const swirl = createOpticalMaterial(SWIRL_FRAGMENT_SHADER, {
      ...common,
      tInput: { value: null },
      uRadius: { value: HERO_BACKGROUND_CONFIG.swirl.radius },
      uAngle: { value: HERO_BACKGROUND_CONFIG.swirl.angle },
      uPhase: { value: HERO_BACKGROUND_CONFIG.swirl.phase },
      uMix: { value: HERO_BACKGROUND_CONFIG.swirl.mix },
    });
    const sine = createOpticalMaterial(SINE_FRAGMENT_SHADER, {
      ...common,
      tInput: { value: null },
      uMousePos: { value: pointer },
      uTrackMouse: { value: 1 },
      uMixRadius: { value: HERO_BACKGROUND_CONFIG.sine.mixRadius },
      uFrequency: { value: HERO_BACKGROUND_CONFIG.sine.frequency },
      uAmplitude: { value: HERO_BACKGROUND_CONFIG.sine.amplitude },
      uRotation: { value: HERO_BACKGROUND_CONFIG.sine.rotation },
    });
    const bokeh = createOpticalMaterial(BOKEH_FRAGMENT_SHADER, {
      ...common,
      tInput: { value: null },
      tBlueNoise: { value: noise },
      uBlueNoiseResolution: { value: new Vector2(128, 128) },
      uMousePos: { value: pointer },
      uTrackMouse: { value: 1 },
      uPos: { value: bokehOrigin },
      uAmount: { value: 3.125 * HERO_BACKGROUND_CONFIG.bokeh.radius },
      uTilt: { value: HERO_BACKGROUND_CONFIG.bokeh.tilt },
    });
    const shatter = createOpticalMaterial(SHATTER_FRAGMENT_SHADER, {
      ...common,
      tInput: { value: null },
      uAmount: { value: HERO_BACKGROUND_CONFIG.shatter.amount },
      uAngle: { value: HERO_BACKGROUND_CONFIG.shatter.angle },
      uCellScale: { value: 16 },
      uMixRadius: { value: HERO_BACKGROUND_CONFIG.shatter.mixRadius },
      uMixRadiusInvert: { value: HERO_BACKGROUND_CONFIG.shatter.mixRadiusInvert },
      uMousePos: { value: pointer },
      uPos: { value: shatterOrigin },
      uRoundness: { value: HERO_BACKGROUND_CONFIG.shatter.roundness },
      uSkew: { value: HERO_BACKGROUND_CONFIG.shatter.skew },
      uSpread: { value: HERO_BACKGROUND_CONFIG.shatter.spread },
      uTrackMouse: { value: 0 },
    });
    const output = createOpticalMaterial(OUTPUT_FRAGMENT_SHADER, {
      tInput: { value: null },
      uBgColor: { value: new Color() },
      uOutputColor: { value: new Color() },
      uOutputMix: { value: 0 },
    });
    return { output, passes: [vignette, swirl, sine, shatter, bokeh] as const };
  }, [bokehOrigin, noise, pointer, resolution, shatterOrigin, time]);

  const renderScene = useMemo(() => new Scene(), []);
  const renderCamera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);
  const renderMesh = useMemo(() => new Mesh(geometry, pipeline.passes[0]), [geometry, pipeline]);
  const initialTargets = useMemo<RenderTargets>(
    () => ({
      read: new WebGLRenderTarget(1, 1, { depthBuffer: false }),
      write: new WebGLRenderTarget(1, 1, { depthBuffer: false }),
    }),
    [],
  );
  const targetsRef = useRef<RenderTargets>(initialTargets);

  useEffect(() => {
    renderScene.add(renderMesh);
    return () => {
      renderScene.remove(renderMesh);
    };
  }, [renderMesh, renderScene]);

  useEffect(() => {
    const width = Math.max(1, Math.floor(size.width * resolutionScale));
    const height = Math.max(1, Math.floor(size.height * resolutionScale));
    const previous = targetsRef.current;
    previous.read.dispose();
    previous.write.dispose();
    targetsRef.current = {
      read: new WebGLRenderTarget(width, height, { depthBuffer: false }),
      write: new WebGLRenderTarget(width, height, { depthBuffer: false }),
    };
    resolution.set(width, height);
    const previousClearColor = gl.getClearColor(new Color());
    const previousClearAlpha = gl.getClearAlpha();
    const previousRenderTarget = gl.getRenderTarget();
    for (const target of [targetsRef.current.read, targetsRef.current.write]) {
      gl.setRenderTarget(target);
      gl.setClearColor(colorsRef.current.background, 1);
      gl.clear();
    }
    gl.setRenderTarget(previousRenderTarget);
    gl.setClearColor(previousClearColor, previousClearAlpha);
    const input = pipeline.output.uniforms["tInput"];
    if (input) input.value = targetsRef.current.read.texture;
  }, [gl, pipeline.output, resolution, resolutionScale, size.height, size.width]);

  useEffect(() => {
    const vignette = pipeline.passes[0];
    const edgeIntensity = vignette.uniforms["uEdgeIntensity"];
    const vignetteColor = vignette.uniforms["uVignetteColor"];
    const clearColor = vignette.uniforms["uClearColor"];
    const background = pipeline.output.uniforms["uBgColor"];
    const outputColor = pipeline.output.uniforms["uOutputColor"];
    const outputMix = pipeline.output.uniforms["uOutputMix"];
    if (edgeIntensity) edgeIntensity.value = colors.edgeIntensity;
    if (vignetteColor) vignetteColor.value.copy(colors.vignette);
    if (clearColor) clearColor.value.copy(colors.background);
    if (background) background.value.copy(colors.background);
    if (outputColor) outputColor.value.copy(colors.output);
    if (outputMix) outputMix.value = colors.outputMix;

    const previousClearColor = gl.getClearColor(new Color());
    const previousClearAlpha = gl.getClearAlpha();
    const previousRenderTarget = gl.getRenderTarget();
    for (const target of [targetsRef.current.read, targetsRef.current.write]) {
      gl.setRenderTarget(target);
      gl.setClearColor(colors.background, 1);
      gl.clear();
    }
    gl.setRenderTarget(previousRenderTarget);
    gl.setClearColor(previousClearColor, previousClearAlpha);
  }, [colors, gl, pipeline]);

  useEffect(
    () => () => {
      geometry.dispose();
      noise.dispose();
      for (const material of pipeline.passes) material.dispose();
      pipeline.output.dispose();
    },
    [geometry, noise, pipeline],
  );

  useEffect(
    () => () => {
      targetsRef.current.read.dispose();
      targetsRef.current.write.dispose();
    },
    [],
  );

  useFrame((state) => {
    if (!active) return;
    const transition = sceneTransitionStore.getSnapshot();
    if (transition.opticalFrozen) return;
    frame.current += 1;
    if (frame.current % frameStride !== 0) return;
    if (
      !shouldRenderOpticalFrame(
        frame.current,
        transition.progress,
        size.width < 768,
        transition.sourceVisible,
      )
    )
      return;
    const elapsed = state.clock.getElapsedTime();
    const previous = previousElapsed.current ?? elapsed;
    activeTime.current += Math.max(0, Math.min(elapsed - previous, 1 / 15));
    previousElapsed.current = elapsed;
    time.value = reducedMotion ? 0 : activeTime.current;
    const pointerSnapshot = pointerStore.getSnapshot();
    const uv =
      reducedMotion || size.width < 768
        ? { x: 0.5, y: -0.1 }
        : pointerSnapshot.inside
          ? pointerSnapshotToUv(pointerSnapshot)
          : { x: 0.5, y: 0.5 };
    const trackMouse = reducedMotion || size.width < 768 ? 0 : 1;
    for (const material of pipeline.passes) {
      const uniform = material.uniforms["uTrackMouse"];
      if (uniform) uniform.value = trackMouse;
    }
    targetPointer.set(uv.x, uv.y);
    pointer.lerp(
      targetPointer,
      pointerSnapshot.inside
        ? HERO_BACKGROUND_CONFIG.smoothing
        : HERO_BACKGROUND_CONFIG.leaveSmoothing,
    );

    const targets = targetsRef.current;
    for (const material of pipeline.passes) {
      const input = material.uniforms["tInput"];
      if (input) input.value = targets.read.texture;
      renderMesh.material = material;
      gl.setRenderTarget(targets.write);
      gl.render(renderScene, renderCamera);
      const previousRead = targets.read;
      targets.read = targets.write;
      targets.write = previousRead;
    }
    gl.setRenderTarget(null);
    const outputInput = pipeline.output.uniforms["tInput"];
    if (outputInput) outputInput.value = targets.read.texture;
  }, -2);

  return (
    <mesh visible={active} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={pipeline.output} attach="material" />
    </mesh>
  );
}
