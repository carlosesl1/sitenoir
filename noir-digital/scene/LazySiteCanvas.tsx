"use client";

import { lazy, Suspense, useEffect, useState } from "react";

import { type HeroGlassVariant, resolveHeroGlassVariant } from "@/scene/hero-glass-variant";
import { resolveSceneQuality, type SceneQuality } from "@/scene/scene-quality";
import { resetSceneReadiness, signalSceneSettled } from "@/scene/scene-readiness";
import { scheduleSiteCanvasBoot } from "@/scene/site-canvas-boot";

let siteCanvasModulePromise: ReturnType<typeof loadSiteCanvasModule> | undefined;

function loadSiteCanvasModule() {
  return import("@/scene/SiteCanvas").then((module) => ({ default: module.SiteCanvas }));
}

function preloadSiteCanvasModule() {
  siteCanvasModulePromise ??= loadSiteCanvasModule();
  return siteCanvasModulePromise;
}

const DeferredSiteCanvas = lazy(preloadSiteCanvasModule);

function supportsWebGl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function LazySiteCanvas({
  ambientOnly = false,
  preloadDuringEntry = false,
}: {
  readonly ambientOnly?: boolean;
  readonly preloadDuringEntry?: boolean;
}) {
  const [quality, setQuality] = useState<SceneQuality | null>(null);
  const [canvasEnabled, setCanvasEnabled] = useState(false);
  const [heroGlassVariant, setHeroGlassVariant] = useState<HeroGlassVariant>("canvas-ui");

  if (preloadDuringEntry && typeof window !== "undefined") {
    void preloadSiteCanvasModule();
  }

  useEffect(() => {
    resetSceneReadiness();
    const search = window.location.search;
    const effectsParameter = new URLSearchParams(search).get("effects");
    setHeroGlassVariant(resolveHeroGlassVariant(search));
    const connection: unknown = Reflect.get(navigator, "connection");
    const deviceMemory: unknown = Reflect.get(navigator, "deviceMemory");
    const effectiveType: unknown =
      typeof connection === "object" && connection !== null
        ? Reflect.get(connection, "effectiveType")
        : undefined;
    const saveData: unknown =
      typeof connection === "object" && connection !== null
        ? Reflect.get(connection, "saveData")
        : undefined;
    const resolvedQuality = resolveSceneQuality({
      deviceMemory: typeof deviceMemory === "number" ? deviceMemory : undefined,
      effectiveType: typeof effectiveType === "string" ? effectiveType : undefined,
      effectsParameter,
      hardwareConcurrency: navigator.hardwareConcurrency,
      saveData: typeof saveData === "boolean" ? saveData : undefined,
      supportsWebGl: supportsWebGl(),
    });
    const effectsEnabled = resolvedQuality !== "off";
    const explicitlyDisabled = effectsParameter === "off";
    document.documentElement.dataset["effects"] = effectsEnabled
      ? "on"
      : explicitlyDisabled
        ? "off"
        : "failed";
    document.documentElement.dataset["effectsQuality"] = resolvedQuality;
    window.__NOIR_DECOR_READY__ = !effectsEnabled;
    window.__NOIR_CONTACT_READY__ = !effectsEnabled;
    if (!effectsEnabled) {
      signalSceneSettled(explicitlyDisabled ? "disabled" : "failed");
      return () => {
        delete document.documentElement.dataset["effects"];
        delete document.documentElement.dataset["effectsQuality"];
      };
    }

    setQuality(resolvedQuality);
    let cancelBoot: () => void = () => undefined;
    if (preloadDuringEntry) {
      setCanvasEnabled(true);
    } else {
      cancelBoot = scheduleSiteCanvasBoot({
        activate: () => setCanvasEnabled(true),
        root: document.documentElement,
        waitForEntryReveal: false,
      });
    }
    return () => {
      cancelBoot();
      delete document.documentElement.dataset["effects"];
      delete document.documentElement.dataset["effectsQuality"];
    };
  }, [preloadDuringEntry]);

  return quality && canvasEnabled ? (
    <Suspense fallback={null}>
      <DeferredSiteCanvas
        ambientOnly={ambientOnly}
        heroGlassVariant={heroGlassVariant}
        quality={quality}
      />
    </Suspense>
  ) : null;
}
