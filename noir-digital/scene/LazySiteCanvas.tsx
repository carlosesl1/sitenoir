"use client";

import { lazy, Suspense, useEffect, useState } from "react";

import { PersistentSiteGrid } from "@/scene/PersistentSiteGrid";
import { resolveSceneQuality, type SceneQuality } from "@/scene/scene-quality";
import { scheduleSiteCanvasBoot } from "@/scene/site-canvas-boot";

import styles from "./LazySiteCanvas.module.css";

const DeferredSiteCanvas = lazy(() =>
  import("@/scene/SiteCanvas").then((module) => ({ default: module.SiteCanvas })),
);

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
  waitForEntryReveal = false,
}: {
  readonly ambientOnly?: boolean;
  readonly waitForEntryReveal?: boolean;
}) {
  const [quality, setQuality] = useState<SceneQuality | null>(null);
  const [canvasEnabled, setCanvasEnabled] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [visualFallbackEnabled, setVisualFallbackEnabled] = useState(true);

  useEffect(() => {
    const effectsParameter = new URLSearchParams(window.location.search).get("effects");
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
    setCanvasReady(false);
    setVisualFallbackEnabled(!explicitlyDisabled);
    document.documentElement.dataset["effects"] = effectsEnabled
      ? "on"
      : explicitlyDisabled
        ? "off"
        : "failed";
    document.documentElement.dataset["effectsQuality"] = resolvedQuality;
    window.__NOIR_READY__ = !effectsEnabled;
    window.__NOIR_DECOR_READY__ = !effectsEnabled;
    window.__NOIR_CONTACT_READY__ = !effectsEnabled;
    window.__NOIR_SCENE_STATUS__ = effectsEnabled
      ? "loading"
      : explicitlyDisabled
        ? "disabled"
        : "failed";
    if (!effectsEnabled) {
      return () => {
        delete document.documentElement.dataset["effects"];
        delete document.documentElement.dataset["effectsQuality"];
      };
    }

    setQuality(resolvedQuality);
    const cancelBoot = scheduleSiteCanvasBoot({
      activate: () => setCanvasEnabled(true),
      root: document.documentElement,
      waitForEntryReveal,
    });
    return () => {
      cancelBoot();
      delete document.documentElement.dataset["effects"];
      delete document.documentElement.dataset["effectsQuality"];
    };
  }, [waitForEntryReveal]);

  return (
    <>
      {visualFallbackEnabled && !ambientOnly ? (
        <div
          aria-hidden="true"
          className={styles["poster"]}
          data-canvas-ready={canvasReady ? "true" : "false"}
          data-hero-poster="true"
        />
      ) : null}
      {quality && canvasEnabled ? (
        <Suspense fallback={null}>
          <DeferredSiteCanvas
            ambientOnly={ambientOnly}
            onReady={() => setCanvasReady(true)}
            quality={quality}
          />
        </Suspense>
      ) : null}
      {visualFallbackEnabled ? (
        <div aria-hidden="true" className={styles["gridShell"]}>
          <PersistentSiteGrid />
        </div>
      ) : null}
    </>
  );
}
