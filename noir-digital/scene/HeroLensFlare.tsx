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
import { useTheme } from "@/features/theme/ThemeProvider";
import { resolveFlareSourceLayer } from "@/scene/contact-flare-layer";
import { useHeroFluid } from "@/scene/HeroFluidProvider";
import { HERO_FLUID_CONFIG } from "@/scene/hero-fluid";
import { HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER } from "@/scene/hero-fluid-display-shader";
import {
  HERO_LENS_FLARE_FRAGMENT_SHADER,
  HERO_POST_VERTEX_SHADER,
} from "@/scene/hero-lens-flare-shaders";
import { resolveLensFlareTuning } from "@/scene/hero-lens-flare-tuning";
import { sceneTransitionStore } from "@/scene/scene-transition";

interface HeroLensFlareProps {
  readonly active: boolean;
  readonly resolutionScale: number;
}

const CONTACT_STREAK_MULTIPLIER = 0.38;

function resolveStreakScale(width: number): number {
  const compactViewportMultiplier = width < 768 ? 2 : 1;
  return 8 * (Math.max(1, width) / 1920) * compactViewportMultiplier * CONTACT_STREAK_MULTIPLIER;
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

function readToken(name: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value);
}

export function HeroLensFlare({ active, resolutionScale }: HeroLensFlareProps) {
  const fluid = useHeroFluid();
  const { resolvedTheme } = useTheme();
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const frame = useRef(0);
  const baseTarget = useMemo(createTarget, []);
  const contactFlareSourceTarget = useMemo(createFlareSourceTarget, []);
  const flareTarget = useMemo(() => {
    const target = createTarget();
    target.texture.colorSpace = LinearSRGBColorSpace;
    target.texture.generateMipmaps = false;
    return target;
  }, []);
  const pointerColor = useMemo(() => readToken("--color-pointer-stain"), []);
  const tailColor = useMemo(
    () =>
      readToken(resolvedTheme === "dark" ? "--color-flare-tail-dark" : "--color-flare-tail-light"),
    [resolvedTheme],
  );
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
          uEnabled: { value: 1 },
          uGate: { value: 0.88 },
          uHotspotPower: { value: 32 },
          uIntensity: { value: 0.7 },
          uResolution: { value: resolution },
          uStarRays: { value: 6 },
          uStreakScale: { value: 8 },
          uSpectrumMix: { value: 0 },
          uTailColor: { value: tailColor },
          uThreshold: { value: 0.99 },
        },
        vertexShader: HERO_POST_VERTEX_SHADER,
      }),
    [baseTarget.texture, resolution, tailColor],
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
    [baseTarget.texture, flareTarget.texture, fluid, pointerColor],
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
    contactFlareSourceTarget.setSize(width, height);
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
    contactFlareSourceTarget,
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
      contactFlareSourceTarget.dispose();
      flareTarget.dispose();
    },
    [baseTarget, contactFlareSourceTarget, flareTarget],
  );
  useEffect(() => () => compositeMaterial.dispose(), [compositeMaterial]);
  useEffect(() => () => flareMaterial.dispose(), [flareMaterial]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const transition = sceneTransitionStore.getSnapshot();
    const flareEnabled =
      active && transition.sourceVisible && (!transition.solid || transition.contactVisible);
    const tuning = resolveLensFlareTuning(transition.contactVisible);
    const enabledUniform = flareMaterial.uniforms["uEnabled"];
    if (enabledUniform) enabledUniform.value = flareEnabled ? 1 : 0;
    const gateUniform = flareMaterial.uniforms["uGate"];
    if (gateUniform) gateUniform.value = tuning.gate;
    const hotspotPowerUniform = flareMaterial.uniforms["uHotspotPower"];
    if (hotspotPowerUniform) hotspotPowerUniform.value = tuning.hotspotPower;
    const intensityUniform = flareMaterial.uniforms["uIntensity"];
    if (intensityUniform) intensityUniform.value = tuning.intensity;
    const spectrumUniform = flareMaterial.uniforms["uSpectrumMix"];
    if (spectrumUniform) spectrumUniform.value = 1;
    const thresholdUniform = flareMaterial.uniforms["uThreshold"];
    if (thresholdUniform) thresholdUniform.value = tuning.threshold;
    const streakScaleUniform = flareMaterial.uniforms["uStreakScale"];
    if (streakScaleUniform) {
      streakScaleUniform.value = resolveStreakScale(size.width);
    }
    const flareCompositeUniform = compositeMaterial.uniforms["uFlareEnabled"];
    if (flareCompositeUniform) flareCompositeUniform.value = flareEnabled ? 1 : 0;
    const requiresComposite =
      flareEnabled || fluid.effectEnabled.value >= 0.5 || fluid.overlayEnabled.value >= 0.5;
    if (!requiresComposite) {
      gl.setRenderTarget(null);
      gl.clear();
      gl.render(scene, camera);
      return;
    }

    gl.setRenderTarget(baseTarget);
    gl.clear();
    gl.render(scene, camera);

    if (flareEnabled && frame.current % 2 === 0) {
      const flareSourceLayer = resolveFlareSourceLayer(transition.contactVisible);
      const diffuseUniform = flareMaterial.uniforms["tDiffuse"];
      if (flareSourceLayer !== null) {
        const previousLayerMask = camera.layers.mask;
        camera.layers.set(flareSourceLayer);
        gl.setRenderTarget(contactFlareSourceTarget);
        gl.getClearColor(previousClearColor);
        const previousClearAlpha = gl.getClearAlpha();
        gl.setClearColor(flareClearColor, 1);
        gl.clear();
        gl.render(scene, camera);
        gl.setClearColor(previousClearColor, previousClearAlpha);
        camera.layers.mask = previousLayerMask;
        if (diffuseUniform) diffuseUniform.value = contactFlareSourceTarget.texture;
      } else if (diffuseUniform) {
        diffuseUniform.value = baseTarget.texture;
      }
      quad.material = flareMaterial;
      gl.setRenderTarget(flareTarget);
      gl.getClearColor(previousClearColor);
      const previousClearAlpha = gl.getClearAlpha();
      gl.setClearColor(flareClearColor, 1);
      gl.clear();
      gl.render(postScene, postCamera);
      gl.setClearColor(previousClearColor, previousClearAlpha);
    } else if (!flareEnabled) {
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
  }, 998);

  return null;
}
