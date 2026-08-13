"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { createContext, type ReactNode, useContext, useEffect, useMemo } from "react";
import { HalfFloatType, LinearFilter, type Texture, Vector2, WebGLRenderTarget } from "three";

import { CONTACT_FLARE_LAYER } from "@/scene/contact-flare-layer";
import { resolveHeroCanvasUiRefractionScale } from "@/scene/hero-canvas-ui-glass-config";
import { createHeroCanvasUiSpectralSource } from "@/scene/hero-canvas-ui-spectral-source";
import { resolveHeroCanvasUiSpectralIntensity } from "@/scene/hero-canvas-ui-spectral-source-config";
import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { sceneTransitionStore } from "@/scene/scene-transition";

interface HeroRefractionContextValue {
  readonly screenResolution: Vector2;
  readonly texture: Texture;
}

interface HeroRefractionBufferProps {
  readonly active: boolean;
  readonly children: ReactNode;
  readonly resolutionScale: number;
  readonly spectralSourceActive?: boolean;
}

const HeroRefractionContext = createContext<HeroRefractionContextValue | null>(null);

export function useHeroRefraction(): HeroRefractionContextValue {
  const value = useContext(HeroRefractionContext);
  if (!value) throw new Error("useHeroRefraction must be used inside HeroRefractionBuffer");
  return value;
}

export function HeroRefractionBuffer({
  active,
  children,
  resolutionScale,
  spectralSourceActive = false,
}: HeroRefractionBufferProps) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const screenResolution = useMemo(() => new Vector2(1, 1), []);
  const target = useMemo(
    () =>
      new WebGLRenderTarget(1, 1, {
        depthBuffer: true,
        magFilter: LinearFilter,
        minFilter: LinearFilter,
        samples: 0,
        stencilBuffer: false,
        type: HalfFloatType,
      }),
    [],
  );
  const spectralSource = useMemo(
    () => (spectralSourceActive ? createHeroCanvasUiSpectralSource() : null),
    [spectralSourceActive],
  );

  useEffect(() => {
    camera.layers.enable(HERO_GLASS_CONFIG.renderLayer);
  }, [camera]);

  useEffect(() => {
    const pixelRatio = gl.getPixelRatio();
    const maximumTextureSize = gl.capabilities.maxTextureSize;
    const effectiveResolutionScale = spectralSourceActive
      ? resolveHeroCanvasUiRefractionScale(resolutionScale, size.width)
      : resolutionScale;
    screenResolution.set(
      Math.min(maximumTextureSize, size.width * pixelRatio),
      Math.min(maximumTextureSize, size.height * pixelRatio),
    );
    target.setSize(
      Math.max(1, Math.floor(screenResolution.x * effectiveResolutionScale)),
      Math.max(1, Math.floor(screenResolution.y * effectiveResolutionScale)),
    );
  }, [
    gl,
    resolutionScale,
    screenResolution,
    size.height,
    size.width,
    spectralSourceActive,
    target,
  ]);

  useEffect(() => () => target.dispose(), [target]);
  useEffect(() => () => spectralSource?.dispose(), [spectralSource]);

  useFrame(() => {
    const transition = sceneTransitionStore.getSnapshot();
    if (!active || !transition.sourceVisible || transition.refractive) return;
    const previousLayerMask = camera.layers.mask;
    const previousTarget = gl.getRenderTarget();
    const previousAutoClear = gl.autoClear;
    const hiddenContactObjects: { object: { visible: boolean }; visible: boolean }[] = [];
    try {
      scene.traverse((object) => {
        const isContactObject =
          object.userData["contactRefractiveObject"] === true ||
          object.layers.isEnabled(CONTACT_FLARE_LAYER);
        if (!isContactObject || !object.visible) return;
        hiddenContactObjects.push({ object, visible: object.visible });
        object.visible = false;
      });
      camera.layers.mask = 1;
      gl.setRenderTarget(target);
      gl.clear();
      gl.render(scene, camera);

      if (spectralSource) {
        const spectralIntensity = resolveHeroCanvasUiSpectralIntensity(size.width);
        gl.autoClear = false;
        spectralSource.render(gl, spectralIntensity);
      }
    } finally {
      for (const entry of hiddenContactObjects) entry.object.visible = entry.visible;
      camera.layers.mask = previousLayerMask;
      gl.setRenderTarget(previousTarget);
      gl.autoClear = previousAutoClear;
    }
  }, 1);

  const value = useMemo(
    () => ({ screenResolution, texture: target.texture }),
    [screenResolution, target.texture],
  );

  return <HeroRefractionContext.Provider value={value}>{children}</HeroRefractionContext.Provider>;
}
