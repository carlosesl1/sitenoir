"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useScroll as useMotionScroll, useReducedMotion } from "motion/react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

import { usePrincipleScene } from "@/features/principles/PrincipleSceneProvider";
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
import { scheduleProgressiveSceneBoot } from "@/scene/progressive-scene-boot";
import { SceneErrorBoundary } from "@/scene/SceneErrorBoundary";
import { SiteCameraRig } from "@/scene/SiteCameraRig";
import { resolveHeroSceneLayout, resolveViewportFamily, sceneLayouts } from "@/scene/scene-layout";
import { compileScenePrograms } from "@/scene/scene-program-compile";
import { resolveSceneQualityConfig, type SceneQuality } from "@/scene/scene-quality";
import { resetSceneReadiness, signalSceneSettled } from "@/scene/scene-readiness";

import styles from "./SiteCanvas.module.css";

const VISUAL_TEST_MODE = process.env["NEXT_PUBLIC_VISUAL_TEST_MODE"] === "1";
const ProgressiveSceneContent = lazy(() =>
  import("@/scene/ProgressiveSceneContent").then((module) => ({
    default: module.ProgressiveSceneContent,
  })),
);

interface HeroSceneContentProps {
  readonly onReady: () => void;
  readonly reducedMotion: boolean;
  readonly scrollProgress: ScrollProgressValue;
}

interface ScrollProgressValue {
  readonly get: () => number;
  readonly on: (event: "change", listener: (latest: number) => void) => () => void;
}

function HeroSceneContent({ onReady, reducedMotion, scrollProgress }: HeroSceneContentProps) {
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
      <SceneReadyMarker onReady={onReady} />
    </>
  );
}

function SceneReadyMarker({ onReady }: { readonly onReady: () => void }) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    let active = true;
    let firstFrame = 0;
    let secondFrame = 0;

    void compileScenePrograms(gl, scene, camera).then(
      (compileMode) => {
        if (!active) return;
        window.__NOIR_COMPILE_MODE__ = compileMode;
        invalidate();
        firstFrame = window.requestAnimationFrame(() => {
          secondFrame = window.requestAnimationFrame(() => {
            if (!active) return;
            onReady();
            signalSceneSettled("ready");
          });
        });
      },
      () => {
        if (!active) return;
        document.documentElement.dataset["effects"] = "failed";
        window.__NOIR_COMPILE_MODE__ = "failed";
        window.__NOIR_CONTACT_READY__ = true;
        window.__NOIR_DECOR_READY__ = true;
        signalSceneSettled("failed");
      },
    );

    return () => {
      active = false;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      delete window.__NOIR_COMPILE_MODE__;
      resetSceneReadiness();
    };
  }, [camera, gl, invalidate, onReady, scene]);

  return null;
}

function AmbientSceneReadyMarker() {
  useEffect(() => {
    window.__NOIR_DECOR_READY__ = true;
    window.__NOIR_CONTACT_READY__ = true;
    signalSceneSettled("ready");
    return () => {
      window.__NOIR_DECOR_READY__ = false;
      window.__NOIR_CONTACT_READY__ = false;
      resetSceneReadiness();
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
  const [heroSceneReady, setHeroSceneReady] = useState(false);
  const [progressiveSceneEnabled, setProgressiveSceneEnabled] = useState(false);
  const markHeroSceneReady = useCallback(() => {
    setHeroSceneReady(true);
  }, []);

  useEffect(() => {
    if (ambientOnly || !heroSceneReady || progressiveSceneEnabled) return;
    return scheduleProgressiveSceneBoot(() => setProgressiveSceneEnabled(true));
  }, [ambientOnly, heroSceneReady, progressiveSceneEnabled]);

  return (
    <div
      className={styles["canvasShell"]}
      data-site-canvas="true"
      data-canvas-ready={ambientOnly || heroSceneReady ? "true" : "false"}
      data-background-runtime="persistent"
      data-canvas-mode={ambientOnly ? "ambient" : "full"}
      data-background-tone={principleScene.fullscreen ? "dark" : "theme"}
      data-optical-active="true"
      data-frameloop="demand"
      data-quality={quality}
      data-principle-active={principleScene.active}
      data-principle-stage={principleScene.stage}
      data-progressive-scene={
        progressiveSceneEnabled ? "enabled" : heroSceneReady ? "scheduled" : "waiting"
      }
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
                    onReady={markHeroSceneReady}
                    reducedMotion={deterministicMotion}
                    scrollProgress={scrollYProgress}
                  />
                </Suspense>
                {progressiveSceneEnabled ? (
                  <Suspense fallback={null}>
                    <ProgressiveSceneContent
                      reducedMotion={deterministicMotion}
                      scrollProgress={scrollYProgress}
                    />
                  </Suspense>
                ) : null}
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
