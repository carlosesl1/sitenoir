"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, type Mesh, type ShaderMaterial, Vector2 } from "three";

import { useTheme } from "@/features/theme/ThemeProvider";
import { sceneTransitionStore } from "@/scene/scene-transition";

const DARK_OVERLAY = "#0F1111";
const LIGHT_OVERLAY = "#FBFAF4";
const PIXEL_SIZE = 4;
const RADIUS_SCALE = 0.9;

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;

  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPixelSize;
  uniform float uRadiusScale;
  uniform vec2 uResolution;

  void main() {
    float opacity = clamp(uOpacity, 0.0, 1.0);
    vec2 normalizedPixelSize = vec2(
      uPixelSize / max(uResolution.x, 1.0),
      uPixelSize / max(uResolution.y, 1.0)
    );
    vec2 safePixelSize = max(normalizedPixelSize, vec2(1e-6));
    vec2 cellUv = fract(vUv / safePixelSize);
    float radius = uRadiusScale * opacity;
    float distanceFromCenter = distance(cellUv, vec2(0.5));
    float antialias = fwidth(distanceFromCenter) * 1.5;
    float circleMask = smoothstep(radius, radius - antialias, distanceFromCenter);

    gl_FragColor = vec4(uColor, circleMask);
    #include <colorspace_fragment>
  }
`;

interface DitherMetrics {
  readonly contactHeight: number;
  readonly contactTop: number;
  readonly ditherEndTop: number;
  readonly heroHeight: number;
  readonly heroTop: number;
}

interface DitherOpacityInput {
  readonly ditherEndTop: number;
  readonly heroHeight: number;
  readonly heroTop: number;
  readonly scrollTop: number;
  readonly viewportHeight: number;
}

interface StickerFieldActivationInput {
  readonly heroHeight: number;
  readonly heroTop: number;
  readonly scrollTop: number;
  readonly viewportHeight: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function resolveFullscreenDitherOpacity({
  scrollTop,
  viewportHeight,
  heroTop,
  heroHeight,
  ditherEndTop,
}: DitherOpacityInput): number {
  const safeViewportHeight = Math.max(1, viewportHeight);
  const heroBottomInViewport = heroTop - scrollTop + heroHeight;
  const entryDistance = Math.max(1, safeViewportHeight * 0.75);
  const entryProgress = clamp01((safeViewportHeight - heroBottomInViewport) / entryDistance);
  const exitProgress = clamp01((ditherEndTop - scrollTop) / safeViewportHeight);
  return entryProgress * exitProgress;
}

export function resolveStickerFieldActivation(input: StickerFieldActivationInput): boolean {
  const start = input.heroTop + input.heroHeight * 0.5 - input.viewportHeight;
  return input.scrollTop >= start;
}

export function FullscreenDither() {
  const { resolvedTheme } = useTheme();
  const size = useThree((state) => state.size);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const meshRef = useRef<Mesh>(null);
  const metricsRef = useRef<DitherMetrics>({
    contactHeight: 1,
    contactTop: Number.POSITIVE_INFINITY,
    ditherEndTop: 1,
    heroHeight: 1,
    heroTop: 0,
  });
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(DARK_OVERLAY) },
      uOpacity: { value: 0 },
      uPixelSize: { value: PIXEL_SIZE },
      uRadiusScale: { value: RADIUS_SCALE },
      uResolution: { value: new Vector2(1, 1) },
    }),
    [],
  );

  useLayoutEffect(() => {
    materialRef.current?.uniforms["uColor"]?.value.set(
      resolvedTheme === "dark" ? DARK_OVERLAY : LIGHT_OVERLAY,
    );
  }, [resolvedTheme]);

  useLayoutEffect(() => {
    materialRef.current?.uniforms["uResolution"]?.value.set(
      Math.max(1, size.width),
      Math.max(1, size.height),
    );
  }, [size.height, size.width]);

  useLayoutEffect(() => {
    const hero = document.getElementById("home");
    const aiServices = document.getElementById("ai-services");
    const contact = document.getElementById("contact");
    if (!hero || !aiServices || !contact) return;

    const measure = () => {
      const scrollTop = window.scrollY;
      const heroRect = hero.getBoundingClientRect();
      const aiServicesRect = aiServices.getBoundingClientRect();
      const contactRect = contact.getBoundingClientRect();
      metricsRef.current = {
        contactHeight: contactRect.height,
        contactTop: contactRect.top + scrollTop,
        ditherEndTop: aiServicesRect.bottom + scrollTop,
        heroTop: heroRect.top + scrollTop,
        heroHeight: heroRect.height,
      };
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    observer.observe(aiServices);
    observer.observe(contact);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useFrame(() => {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const metrics = metricsRef.current;
    const opacity = resolveFullscreenDitherOpacity({
      ...metrics,
      scrollTop,
      viewportHeight,
    });
    const heroViewportTop = metrics.heroTop - scrollTop;
    const contactViewportTop = metrics.contactTop - scrollTop;
    const contactVisible =
      contactViewportTop < viewportHeight && contactViewportTop + metrics.contactHeight > 0;
    const sourceVisible =
      (heroViewportTop < viewportHeight && heroViewportTop + metrics.heroHeight > 0) ||
      contactVisible;
    sceneTransitionStore.update({
      contactVisible,
      progress: opacity,
      sourceVisible,
      stickersActive: resolveStickerFieldActivation({
        heroHeight: metrics.heroHeight,
        heroTop: metrics.heroTop,
        scrollTop,
        viewportHeight,
      }),
    });
    const mesh = meshRef.current;
    if (mesh) mesh.visible = opacity > 0;
    const opacityUniform = materialRef.current?.uniforms["uOpacity"];
    if (opacityUniform) opacityUniform.value = opacity;
  }, -4);

  return (
    <mesh ref={meshRef} renderOrder={10} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
      />
    </mesh>
  );
}
