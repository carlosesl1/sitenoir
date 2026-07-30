"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { NoToneMapping, SRGBColorSpace } from "three";

import { WorkCardLayer } from "@/scene/WorkCardLayer";

function WorkCardFrameInvalidator() {
  const invalidate = useThree((state) => state.invalidate);
  const sectionActiveRef = useRef(false);

  useEffect(() => {
    const section = document.querySelector("#selected-work");
    const sectionObserver = section
      ? new IntersectionObserver(
          ([entry]) => {
            sectionActiveRef.current = entry?.isIntersecting ?? false;
            if (sectionActiveRef.current) invalidate();
          },
          { rootMargin: "25% 0px" },
        )
      : null;
    if (section) sectionObserver?.observe(section);
    let hoverTimer = 0;
    let hoverStopTimer = 0;
    let settleTimer = 0;
    const wake = (event?: Event) => {
      if (document.hidden || !sectionActiveRef.current) return;
      if (
        (event?.type === "pointermove" || event?.type === "focusin") &&
        (!(event.target instanceof Element) || !event.target.closest("[data-work-card]"))
      )
        return;
      invalidate();
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        document.documentElement.dataset["workCardSettle"] = "true";
        invalidate();
      }, 140);
      if (event?.type === "pointermove" || event?.type === "focusin") {
        window.clearInterval(hoverTimer);
        window.clearTimeout(hoverStopTimer);
        hoverTimer = window.setInterval(invalidate, 1000 / 30);
        hoverStopTimer = window.setTimeout(() => window.clearInterval(hoverTimer), 500);
      }
    };
    const events = [
      "focusin",
      "noir:work-card-visibility",
      "pointermove",
      "resize",
      "scroll",
      "wheel",
    ] as const;
    for (const eventName of events) window.addEventListener(eventName, wake, { passive: true });
    wake();
    return () => {
      window.clearInterval(hoverTimer);
      window.clearTimeout(hoverStopTimer);
      window.clearTimeout(settleTimer);
      sectionObserver?.disconnect();
      delete document.documentElement.dataset["workCardSettle"];
      for (const eventName of events) window.removeEventListener(eventName, wake);
    };
  }, [invalidate]);

  return null;
}

export function WorkCardCanvas({ className }: { readonly className: string | undefined }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [runtimeEnabled, setRuntimeEnabled] = useState(false);
  useEffect(() => {
    const effectsDisabled = new URLSearchParams(window.location.search).get("effects") === "off";
    setRuntimeEnabled(!effectsDisabled && typeof window.ResizeObserver !== "undefined");
  }, []);
  if (reducedMotion || !runtimeEnabled) return null;

  return (
    <div className={className} aria-hidden="true" data-work-card-canvas="true">
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
        gl={{
          alpha: true,
          antialias: false,
          depth: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = NoToneMapping;
          gl.setClearColor(0x000000, 0);
          gl.setClearAlpha(0);
        }}
      >
        <WorkCardFrameInvalidator />
        <Suspense fallback={null}>
          <WorkCardLayer />
        </Suspense>
      </Canvas>
    </div>
  );
}
