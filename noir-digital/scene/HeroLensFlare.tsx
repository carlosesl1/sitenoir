"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  LinearFilter,
  LinearSRGBColorSpace,
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  WebGLRenderTarget,
} from "three";
import { pointerStore } from "@/features/pointer/pointer-store";
import { useHeroFluid } from "@/scene/HeroFluidProvider";
import { useHeroOpticalFlareSources } from "@/scene/HeroOpticalFlareSources";
import {
  HERO_CANVAS_UI_CURSOR_NO_FLARE_LAYER,
  HERO_CANVAS_UI_EDGE_FLARE_LAYER,
} from "@/scene/hero-canvas-ui-edge-flare-config";
import { HERO_FLUID_CONFIG } from "@/scene/hero-fluid";
import { HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER } from "@/scene/hero-fluid-display-shader";
import {
  HERO_LENS_FLARE_FRAGMENT_SHADER,
  HERO_POST_VERTEX_SHADER,
} from "@/scene/hero-lens-flare-shaders";
import { HERO_FLARE_TUNING as flareTuning } from "@/scene/hero-lens-flare-tuning";
import {
  createHeroOpticalFlarePass,
  isOpticalSourceVisible,
} from "@/scene/hero-optical-flare-pass";
import { sceneTransitionStore } from "@/scene/scene-transition";

interface HeroLensFlareProps {
  readonly active: boolean;
  readonly reducedMotion: boolean;
  readonly resolutionScale: number;
}

const CONTACT_STREAK_MULTIPLIER = 0.38;

function resolveStreakScale(width: number, tuningMultiplier = 1): number {
  const compactViewportMultiplier = width < 768 ? 2 : 1;
  return (
    8 *
    (Math.max(1, width) / 1920) *
    compactViewportMultiplier *
    CONTACT_STREAK_MULTIPLIER *
    tuningMultiplier
  );
}

function createTarget(): WebGLRenderTarget {
  return new WebGLRenderTarget(1, 1, {
    depthBuffer: false,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
    stencilBuffer: false,
    type: UnsignedByteType,
  });
}

function createFlareSourceTarget(): WebGLRenderTarget {
  return new WebGLRenderTarget(1, 1, {
    depthBuffer: true,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
    stencilBuffer: false,
    type: UnsignedByteType,
  });
}

const POINTER_SPECTRUM_TOKENS = [
  "--color-spectral-red",
  "--color-spectral-orange",
  "--color-spectral-yellow",
  "--color-spectral-green",
  "--color-spectral-blue",
  "--color-spectral-violet",
] as const;

function readToken(name: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value);
}

export function HeroLensFlare({ active, reducedMotion, resolutionScale }: HeroLensFlareProps) {
  const fluid = useHeroFluid();
  const opticalSources = useHeroOpticalFlareSources();
  const opticalPass = useMemo(createHeroOpticalFlarePass, []);
  useEffect(() => () => opticalPass.dispose(), [opticalPass]);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const frame = useRef(0);
  const baseTarget = useMemo(createTarget, []);
  const cursorNoFlareSourceTarget = useMemo(createFlareSourceTarget, []);
  const edgeFlareSourceTarget = useMemo(createFlareSourceTarget, []);
  const flareTarget = useMemo(() => {
    const target = createTarget();
    target.texture.colorSpace = LinearSRGBColorSpace;
    target.texture.generateMipmaps = false;
    return target;
  }, []);
  const pointerColor = useMemo(() => readToken("--color-noir-warm-white"), []);
  const pointerSpectrum = useMemo(() => POINTER_SPECTRUM_TOKENS.map(readToken), []);
  const tailColor = useMemo(() => readToken("--color-flare-tail-dark"), []);
  const flareClearColor = useMemo(() => new Color().setScalar(0), []);
  const previousClearColor = useMemo(() => new Color(), []);
  const resolution = useMemo(() => new Vector2(1, 1), []);
  const postCamera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const postScene = useMemo(() => new Scene(), []);
  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);
  const flareMaterial = useMemo(
    () =>
      new ShaderMaterial({
        blending: NoBlending,
        depthTest: false,
        depthWrite: false,
        fragmentShader: HERO_LENS_FLARE_FRAGMENT_SHADER,
        toneMapped: false,
        uniforms: {
          tDiffuse: { value: baseTarget.texture },
          tEdgeSource: { value: edgeFlareSourceTarget.texture },
          tNoFlareMask: { value: cursorNoFlareSourceTarget.texture },
          uEnabled: { value: 1 },
          uEdgeSourceEnabled: { value: 0 },
          uGate: { value: 0.88 },
          uHotspotPower: { value: 32 },
          uIntensity: { value: 0.7 },
          uResolution: { value: resolution },
          uStreakJitter: { value: 1 },
          uStarRays: { value: 6 },
          uStreakScale: { value: 8 },
          uSpectrumMix: { value: 0 },
          uTailColor: { value: tailColor },
          uThreshold: { value: 0.99 },
        },
        vertexShader: HERO_POST_VERTEX_SHADER,
      }),
    [
      baseTarget.texture,
      cursorNoFlareSourceTarget.texture,
      edgeFlareSourceTarget.texture,
      resolution,
      tailColor,
    ],
  );
  const compositeMaterial = useMemo(
    () =>
      new ShaderMaterial({
        blending: NoBlending,
        depthTest: false,
        depthWrite: false,
        fragmentShader: HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER,
        toneMapped: false,
        uniforms: {
          tBase: { value: baseTarget.texture },
          tFlare: { value: flareTarget.texture },
          uChromaticBoost: { value: HERO_FLUID_CONFIG.chromaticStrength / 0.004 },
          uDevicePixelRatio: fluid.devicePixelRatio,
          uDisplacementStrength: { value: HERO_FLUID_CONFIG.strength / 0.3 },
          uEffectEnabled: fluid.effectEnabled,
          uFlareEnabled: { value: 0 },
          uPointerColor: { value: pointerColor },
          uPointerSpectrum: { value: pointerSpectrum },
          uPointerDotRadius: { value: 0.8 },
          uPointerOpacity: fluid.overlayEnabled,
          uPointerPixelSize: { value: 16 },
          uResolution: fluid.resolution,
          uSimSize: fluid.simSize,
          uTrail: fluid.trail,
          uTrailCount: { value: 14 },
          uTrailStrength: fluid.trailStrength,
          uVelocity: fluid.velocity,
        },
        vertexShader: HERO_POST_VERTEX_SHADER,
      }),
    [baseTarget.texture, flareTarget.texture, fluid, pointerColor, pointerSpectrum],
  );
  const quad = useMemo(() => new Mesh(geometry, flareMaterial), [flareMaterial, geometry]);

  useEffect(() => {
    postScene.add(quad);
    return () => {
      postScene.remove(quad);
    };
  }, [postScene, quad]);

  useEffect(() => {
    const pixelRatio = Math.min(gl.getPixelRatio(), 2);
    const maximumTextureSize = gl.capabilities.maxTextureSize;
    const width = Math.min(
      maximumTextureSize,
      Math.max(1, Math.floor(size.width * pixelRatio * resolutionScale)),
    );
    const height = Math.min(
      maximumTextureSize,
      Math.max(1, Math.floor(size.height * pixelRatio * resolutionScale)),
    );
    resolution.set(width, height);
    baseTarget.setSize(width, height);
    cursorNoFlareSourceTarget.setSize(width, height);
    edgeFlareSourceTarget.setSize(width, height);
    flareTarget.setSize(
      Math.max(1, Math.floor(width * 0.5)),
      Math.max(1, Math.floor(height * 0.5)),
    );
    const streakScale = flareMaterial.uniforms["uStreakScale"];
    if (streakScale) {
      streakScale.value = resolveStreakScale(size.width);
    }
    frame.current = 0;
  }, [
    baseTarget,
    cursorNoFlareSourceTarget,
    edgeFlareSourceTarget,
    flareMaterial,
    flareTarget,
    gl,
    resolution,
    resolutionScale,
    size.height,
    size.width,
  ]);

  useEffect(
    () => () => {
      baseTarget.dispose();
      cursorNoFlareSourceTarget.dispose();
      edgeFlareSourceTarget.dispose();
      flareTarget.dispose();
    },
    [baseTarget, cursorNoFlareSourceTarget, edgeFlareSourceTarget, flareTarget],
  );
  useEffect(() => () => compositeMaterial.dispose(), [compositeMaterial]);
  useEffect(() => () => flareMaterial.dispose(), [flareMaterial]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const transition = sceneTransitionStore.getSnapshot();
    const flareEnabled =
      active &&
      ((transition.sourceVisible && (!transition.solid || transition.contactVisible)) ||
        isOpticalSourceVisible(opticalSources?.principlePointer.current ?? null));
    const opticalEnabled = flareEnabled && !!opticalSources?.wordmark.current;
    // The legacy glass preview retains its isolated extraction.
    const legacyFlareEnabled = flareEnabled && !opticalEnabled;
    const renderOpticalFlares = () => {
      if (opticalEnabled && opticalSources) {
        opticalPass.render(
          gl,
          camera,
          opticalSources,
          size.width,
          size.height,
          delta,
          reducedMotion || size.width < 768 ? null : pointerStore.getSnapshot(),
        );
      }
    };
    const edgeSourceEnabled = legacyFlareEnabled;
    const enabledUniform = flareMaterial.uniforms["uEnabled"];
    if (enabledUniform) enabledUniform.value = legacyFlareEnabled ? 1 : 0;
    const gateUniform = flareMaterial.uniforms["uGate"];
    if (gateUniform) gateUniform.value = flareTuning.gate;
    const hotspotPowerUniform = flareMaterial.uniforms["uHotspotPower"];
    if (hotspotPowerUniform) hotspotPowerUniform.value = flareTuning.hotspotPower;
    const intensityUniform = flareMaterial.uniforms["uIntensity"];
    if (intensityUniform) intensityUniform.value = flareTuning.intensity;
    const spectrumUniform = flareMaterial.uniforms["uSpectrumMix"];
    if (spectrumUniform) spectrumUniform.value = flareTuning.spectrumMix;
    const streakJitterUniform = flareMaterial.uniforms["uStreakJitter"];
    if (streakJitterUniform) streakJitterUniform.value = flareTuning.streakJitter;
    const edgeSourceEnabledUniform = flareMaterial.uniforms["uEdgeSourceEnabled"];
    if (edgeSourceEnabledUniform) edgeSourceEnabledUniform.value = edgeSourceEnabled ? 1 : 0;
    const thresholdUniform = flareMaterial.uniforms["uThreshold"];
    if (thresholdUniform) thresholdUniform.value = flareTuning.threshold;
    const streakScaleUniform = flareMaterial.uniforms["uStreakScale"];
    if (streakScaleUniform) {
      streakScaleUniform.value = resolveStreakScale(size.width, flareTuning.streakScale);
    }
    const flareCompositeUniform = compositeMaterial.uniforms["uFlareEnabled"];
    if (flareCompositeUniform) flareCompositeUniform.value = legacyFlareEnabled ? 1 : 0;
    const requiresComposite =
      flareEnabled || fluid.effectEnabled.value >= 0.5 || fluid.overlayEnabled.value >= 0.5;
    if (!requiresComposite) {
      gl.setRenderTarget(null);
      gl.clear();
      gl.render(scene, camera);
      renderOpticalFlares();
      return;
    }

    gl.setRenderTarget(baseTarget);
    gl.clear();
    gl.render(scene, camera);

    if (legacyFlareEnabled && frame.current % 2 === 0) {
      const diffuseUniform = flareMaterial.uniforms["tDiffuse"];
      const previousLayerMask = camera.layers.mask;
      camera.layers.set(HERO_CANVAS_UI_CURSOR_NO_FLARE_LAYER);
      gl.setRenderTarget(cursorNoFlareSourceTarget);
      gl.getClearColor(previousClearColor);
      const cursorMaskClearAlpha = gl.getClearAlpha();
      gl.setClearColor(flareClearColor, 1);
      gl.clear();
      gl.render(scene, camera);
      gl.setClearColor(previousClearColor, cursorMaskClearAlpha);
      camera.layers.mask = previousLayerMask;
      if (diffuseUniform) diffuseUniform.value = baseTarget.texture;
      camera.layers.set(HERO_CANVAS_UI_EDGE_FLARE_LAYER);
      gl.setRenderTarget(edgeFlareSourceTarget);
      gl.getClearColor(previousClearColor);
      const edgeClearAlpha = gl.getClearAlpha();
      gl.setClearColor(flareClearColor, 1);
      gl.clear();
      gl.render(scene, camera);
      gl.setClearColor(previousClearColor, edgeClearAlpha);
      camera.layers.mask = previousLayerMask;
      quad.material = flareMaterial;
      gl.setRenderTarget(flareTarget);
      gl.getClearColor(previousClearColor);
      const previousClearAlpha = gl.getClearAlpha();
      gl.setClearColor(flareClearColor, 1);
      gl.clear();
      gl.render(postScene, postCamera);
      gl.setClearColor(previousClearColor, previousClearAlpha);
    } else if (!legacyFlareEnabled && !opticalEnabled) {
      gl.setRenderTarget(flareTarget);
      gl.getClearColor(previousClearColor);
      const previousClearAlpha = gl.getClearAlpha();
      gl.setClearColor(flareClearColor, 1);
      gl.clear();
      gl.setClearColor(previousClearColor, previousClearAlpha);
    }
    frame.current += 1;

    quad.material = compositeMaterial;
    gl.setRenderTarget(null);
    gl.clear();
    gl.render(postScene, postCamera);
    renderOpticalFlares();
  }, 998);

  return null;
}
