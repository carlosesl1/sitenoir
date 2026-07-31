"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { resolveSceneQuality, type SceneQuality } from "@/scene/scene-quality";

const SiteCanvas = dynamic(() => import("@/scene/SiteCanvas").then((module) => module.SiteCanvas), {
  loading: () => null,
  ssr: false,
});

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

export function LazySiteCanvas({ ambientOnly = false }: { readonly ambientOnly?: boolean }) {
  const [quality, setQuality] = useState<SceneQuality | null>(null);

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

    const timerId = window.setTimeout(() => setQuality(resolvedQuality), 250);
    return () => {
      window.clearTimeout(timerId);
      delete document.documentElement.dataset["effects"];
      delete document.documentElement.dataset["effectsQuality"];
    };
  }, []);

  return quality ? <SiteCanvas ambientOnly={ambientOnly} quality={quality} /> : null;
}
