"use client";

import { useLoader } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, type Mesh, ShaderMaterial, Vector2, Vector3, Vector4 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { useTheme } from "@/features/theme/ThemeProvider";
import { HERO_MODEL_SOURCE } from "@/scene/critical-hero-preload";
import { useHeroRefraction } from "@/scene/HeroRefractionBuffer";
import { HERO_GLASS_CONFIG } from "@/scene/hero-glass-config";
import { HERO_GLASS_FRAGMENT_SHADER, HERO_GLASS_VERTEX_SHADER } from "@/scene/hero-glass-shaders";
import { createHeroModelGeometry } from "@/scene/hero-model-geometry";

function colorVector(hex: string): Vector4 {
  const color = new Color(hex);
  return new Vector4(color.r, color.g, color.b, 1);
}

export function HeroGlassAsset() {
  const source = useLoader(GLTFLoader, HERO_MODEL_SOURCE);
  const { resolvedTheme } = useTheme();
  const { screenResolution, texture } = useHeroRefraction();
  const meshRef = useRef<Mesh>(null);

  const geometry = useMemo(() => createHeroModelGeometry(source.scene), [source.scene]);

  const localYRange = useMemo(() => {
    const bounds = geometry.boundingBox;
    if (!bounds) return new Vector2(0, 1);
    const minimum = bounds.min.y;
    const maximum = bounds.max.y;
    return new Vector2(minimum, Math.abs(maximum - minimum) < 0.000001 ? minimum + 1 : maximum);
  }, [geometry]);

  const material = useMemo(() => {
    const dark = resolvedTheme === "dark";
    const theme = dark ? HERO_GLASS_CONFIG.dark : HERO_GLASS_CONFIG.light;
    return new ShaderMaterial({
      fragmentShader: HERO_GLASS_FRAGMENT_SHADER,
      toneMapped: false,
      transparent: true,
      uniforms: {
        uBrightness: { value: theme.brightness },
        uChromaticAberration: { value: HERO_GLASS_CONFIG.chromaticAberration },
        uContrast: { value: theme.contrast },
        uDark: { value: dark ? 1 : 0 },
        uDiffuseness: { value: theme.diffuseness },
        uFresnelPower: { value: theme.fresnelPower },
        uFresnelSideDir: { value: new Vector3(...HERO_GLASS_CONFIG.fresnelSideDirection) },
        uFresnelStrength: { value: theme.fresnelStrength },
        uFaceTransmission: { value: theme.faceTransmission },
        uGamma: { value: theme.gamma },
        uGlassBaseColor: { value: new Color("#000000") },
        uGlassBaseStrength: { value: 0 },
        uIorB: { value: HERO_GLASS_CONFIG.ior.blue },
        uIorC: { value: HERO_GLASS_CONFIG.ior.cyan },
        uIorG: { value: HERO_GLASS_CONFIG.ior.green },
        uIorP: { value: HERO_GLASS_CONFIG.ior.purple },
        uIorR: { value: HERO_GLASS_CONFIG.ior.red },
        uIorY: { value: HERO_GLASS_CONFIG.ior.yellow },
        uLight: { value: new Vector3(4, 9, HERO_GLASS_CONFIG.lightZ) },
        uLoop: { value: HERO_GLASS_CONFIG.loopCount },
        uNeutralRimPower: { value: theme.neutralRimPower },
        uNeutralRimStrength: { value: theme.neutralRimStrength },
        uRefractPower: { value: HERO_GLASS_CONFIG.refractPower },
        uRgbRefraction: { value: 1 },
        uSaturation: { value: theme.saturation },
        uSceneRefractionEnabled: { value: 1 },
        uScreenResolutionPx: { value: screenResolution },
        uShininess: { value: theme.shininess },
        uSpecularStrength: { value: HERO_GLASS_CONFIG.specularStrength },
        uSpectralRimPower: { value: theme.spectralRimPower },
        uSpectralRimStrength: { value: theme.spectralRimStrength },
        uSpectralEdgeFloor: { value: theme.spectralEdgeFloor },
        uSpectralSaturation: { value: HERO_GLASS_CONFIG.spectralSaturation },
        uTexture: { value: texture },
        uTintColorA: { value: colorVector(theme.tintColorA) },
        uTintColorB: { value: colorVector(theme.tintColorB) },
        uTintEnabled: { value: 1 },
        uTintLocalYRange: { value: localYRange },
        uTintMix: { value: HERO_GLASS_CONFIG.tintMix },
        uTintThicknessMaxAlpha: { value: theme.tintMaximumAlpha },
        uTintThicknessMinAlpha: { value: theme.tintMinimumAlpha },
      },
      vertexShader: HERO_GLASS_VERTEX_SHADER,
    });
  }, [localYRange, resolvedTheme, screenResolution, texture]);

  useLayoutEffect(() => {
    meshRef.current?.layers.set(HERO_GLASS_CONFIG.renderLayer);
  }, []);
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => material.dispose(), [material]);

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
