"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useScroll as useMotionScroll, useReducedMotion } from "motion/react";
import { Suspense, useEffect } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

import type { PrincipleProgressStage } from "@/components/principles/principles-progress";
import { usePrincipleScene } from "@/features/principles/PrincipleSceneProvider";
import { ContactModel } from "@/scene/ContactModel";
import { startDemandFrameScheduler } from "@/scene/demand-frame-scheduler";
import { FullscreenDither } from "@/scene/FullscreenDither";
import { HeroFluidProvider } from "@/scene/HeroFluidProvider";
import { HeroLensFlare } from "@/scene/HeroLensFlare";
import { HeroModel } from "@/scene/HeroModel";
import { HeroOpticalBackground } from "@/scene/HeroOpticalBackground";
import { HeroPointerLight } from "@/scene/HeroPointerLight";
import { HeroRefractionBuffer } from "@/scene/HeroRefractionBuffer";
import { PersistentSiteGrid } from "@/scene/PersistentSiteGrid";
import { PointerModel } from "@/scene/PointerModel";
import { PrinciplePointerModel } from "@/scene/PrinciplePointerModel";
import { SceneErrorBoundary } from "@/scene/SceneErrorBoundary";
import { SiteCameraRig } from "@/scene/SiteCameraRig";
import { StickerField } from "@/scene/StickerField";
import {
  principleSceneLayouts,
  resolveHeroSceneLayout,
  resolveViewportFamily,
  sceneLayouts,
} from "@/scene/scene-layout";
import { resolveSceneQualityConfig, type SceneQuality } from "@/scene/scene-quality";

import styles from "./SiteCanvas.module.css";

const VISUAL_TEST_MODE = process.env["NEXT_PUBLIC_VISUAL_TEST_MODE"] === "1";

interface SceneContentProps {
  readonly principleActive: boolean;
  readonly principleStage: PrincipleProgressStage;
  readonly reducedMotion: boolean;
  readonly scrollProgress: ScrollProgressValue;
}

interface ScrollProgressValue {
  readonly get: () => number;
  readonly on: (event: "change", listener: (latest: number) => void) => () => void;
}

function HeroSceneContent({
  reducedMotion,
  scrollProgress,
}: Pick<SceneContentProps, "reducedMotion" | "scrollProgress">) {
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const layout = sceneLayouts[resolveViewportFamily(width)];
  const heroLayout = resolveHeroSceneLayout(width, height);

  return (
    <>
      <HeroModel
        layout={heroLayout}
        reducedMotion={reducedMotion}
        scrollProgress={scrollProgress}
      />
      <PointerModel
        layout={layout.pointer}
        reducedMotion={reducedMotion}
        scrollProgress={scrollProgress}
      />
      <SceneReadyMarker />
    </>
  );
}

function ProgressiveSceneContent({
  principleActive,
  principleStage,
  reducedMotion,
  scrollProgress,
}: SceneContentProps) {
  const width = useThree((state) => state.size.width);
  const family = resolveViewportFamily(width);
  const layout = sceneLayouts[family];
  const stickerVisibility = principleActive
    ? principleSceneLayouts[principleStage].stickerVisibility
    : 0;

  return (
    <>
      <Suspense fallback={null}>
        <StickerField
          layout={layout.stickers}
          reducedMotion={reducedMotion}
          scrollProgress={scrollProgress}
          visibility={stickerVisibility}
        />
        <SceneMilestoneMarker milestone="decor" />
      </Suspense>
      <Suspense fallback={null}>
        <ContactModel
          layout={layout.contact}
          reducedMotion={reducedMotion}
          scrollProgress={scrollProgress}
        />
        <SceneMilestoneMarker milestone="contact" />
      </Suspense>
    </>
  );
}

function SceneReadyMarker() {
  useEffect(() => {
    window.__NOIR_READY__ = true;
    window.__NOIR_SCENE_STATUS__ = "ready";
    return () => {
      window.__NOIR_READY__ = false;
      window.__NOIR_SCENE_STATUS__ = "loading";
    };
  }, []);

  return null;
}

function SceneMilestoneMarker({ milestone }: { readonly milestone: "contact" | "decor" }) {
  useEffect(() => {
    if (milestone === "contact") window.__NOIR_CONTACT_READY__ = true;
    else window.__NOIR_DECOR_READY__ = true;

    return () => {
      if (milestone === "contact") window.__NOIR_CONTACT_READY__ = false;
      else window.__NOIR_DECOR_READY__ = false;
    };
  }, [milestone]);

  return null;
}

function AmbientSceneReadyMarker() {
  useEffect(() => {
    window.__NOIR_READY__ = true;
    window.__NOIR_DECOR_READY__ = true;
    window.__NOIR_CONTACT_READY__ = true;
    window.__NOIR_SCENE_STATUS__ = "ready";
    return () => {
      window.__NOIR_READY__ = false;
      window.__NOIR_DECOR_READY__ = false;
      window.__NOIR_CONTACT_READY__ = false;
      window.__NOIR_SCENE_STATUS__ = "loading";
    };
  }, []);

  return null;
}

function DemandFrameInvalidator({
  idleWindowMs,
  reducedMotion,
  scrollProgress,
}: {
  readonly idleWindowMs: number;
  readonly reducedMotion: boolean;
  readonly scrollProgress: ScrollProgressValue;
}) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(
    () => startDemandFrameScheduler({ idleWindowMs, invalidate, reducedMotion, scrollProgress }),
    [idleWindowMs, invalidate, reducedMotion, scrollProgress],
  );

  return null;
}

export function SiteCanvas({
  ambientOnly = false,
  quality,
}: {
  readonly ambientOnly?: boolean;
  readonly quality: SceneQuality;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const deterministicMotion = reducedMotion || VISUAL_TEST_MODE;
  const qualityConfig = resolveSceneQualityConfig(quality);
  const { scrollYProgress } = useMotionScroll();
  const principleScene = usePrincipleScene();

  return (
    <div
      className={styles["canvasShell"]}
      data-site-canvas="true"
      data-background-runtime="persistent"
      data-canvas-mode={ambientOnly ? "ambient" : "full"}
      data-background-tone={principleScene.fullscreen ? "dark" : "theme"}
      data-optical-active="true"
      data-frameloop="demand"
      data-quality={quality}
      data-principle-active={principleScene.active}
      data-principle-stage={principleScene.stage}
      aria-hidden="true"
    >
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 32], fov: 38, near: 0.1, far: 120 }}
          dpr={[1, qualityConfig.maximumDpr]}
          frameloop="demand"
          gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = SRGBColorSpace;
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <DemandFrameInvalidator
            idleWindowMs={qualityConfig.idleWindowMs}
            reducedMotion={deterministicMotion}
            scrollProgress={scrollYProgress}
          />
          <SiteCameraRig centerLocked={principleScene.active} reducedMotion={deterministicMotion} />
          <HeroOpticalBackground
            active
            frameStride={qualityConfig.opticalFrameStride}
            forceDark={principleScene.fullscreen}
            reducedMotion={deterministicMotion}
            resolutionScale={qualityConfig.opticalResolutionScale}
          />
          <ambientLight intensity={0.38} />
          <directionalLight position={[-8, -4, 6]} intensity={0.72} />
          {ambientOnly ? (
            <AmbientSceneReadyMarker />
          ) : (
            <>
              <HeroPointerLight reducedMotion={deterministicMotion} />
              <HeroRefractionBuffer
                active={!principleScene.active}
                resolutionScale={qualityConfig.refractionResolutionScale}
              >
                <Suspense fallback={null}>
                  <HeroSceneContent
                    reducedMotion={deterministicMotion}
                    scrollProgress={scrollYProgress}
                  />
                </Suspense>
                <ProgressiveSceneContent
                  principleActive={principleScene.active}
                  principleStage={principleScene.stage}
                  reducedMotion={deterministicMotion}
                  scrollProgress={scrollYProgress}
                />
              </HeroRefractionBuffer>
              <Suspense fallback={null}>
                <PrinciplePointerModel
                  reducedMotion={deterministicMotion}
                  sectionRef={principleScene.sectionRef}
                  sectionRectRef={principleScene.sectionRectRef}
                  setFullscreen={principleScene.setFullscreen}
                />
              </Suspense>
            </>
          )}
          <FullscreenDither />
          <HeroFluidProvider reducedMotion={deterministicMotion}>
            <HeroLensFlare active resolutionScale={qualityConfig.flareResolutionScale} />
          </HeroFluidProvider>
        </Canvas>
      </SceneErrorBoundary>
      <PersistentSiteGrid />
    </div>
  );
}
