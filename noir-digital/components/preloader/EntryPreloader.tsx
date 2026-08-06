"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EntryRevealCanvas } from "@/components/preloader/EntryRevealCanvas";
import { resolveEntryLoadProgress } from "@/components/preloader/entry-preloader-state";
import { NOIR_SCENE_SETTLED_EVENT } from "@/scene/scene-readiness";

import styles from "./EntryPreloader.module.css";

const REVEAL_DELAY_MS = 250;
const REVEAL_DURATION_MS = 800;
const TEXT_REVEAL_LEAD_MS = 500;

export function EntryPreloader() {
  const reducedMotion = useReducedMotion() ?? false;
  const [documentReady, setDocumentReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");
  const markRevealReady = useCallback(() => setRevealReady(true), []);
  const skipRevealInitialization =
    reducedMotion ||
    (typeof document !== "undefined" &&
      document.documentElement.dataset["routeTransition"] === "true");

  const progress = useMemo(
    () => resolveEntryLoadProgress({ documentReady, fontsReady, sceneReady }),
    [documentReady, fontsReady, sceneReady],
  );

  useEffect(() => {
    if (document.documentElement.dataset["routeTransition"] === "true") return;

    const synchronizeSceneReadiness = () => setSceneReady(window.__NOIR_READY__ === true);
    synchronizeSceneReadiness();
    window.addEventListener(NOIR_SCENE_SETTLED_EVENT, synchronizeSceneReadiness);
    return () => window.removeEventListener(NOIR_SCENE_SETTLED_EVENT, synchronizeSceneReadiness);
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset["routeTransition"] === "true") {
      setDocumentReady(true);
      setFontsReady(true);
      setPhase("done");
      delete document.documentElement.dataset["entryLoading"];
      document.documentElement.dataset["entryTextReady"] = "true";
      document.documentElement.dataset["entryReady"] = "true";
      return;
    }

    let cancelled = false;
    document.documentElement.dataset["entryLoading"] = "true";
    delete document.documentElement.dataset["entryTextReady"];
    delete document.documentElement.dataset["entryReady"];

    setDocumentReady(true);

    if (document.fonts) {
      const criticalFonts = [
        document.fonts.load('700 1em "TikTok Sans"', "NOIR DIGITAL"),
        document.fonts.load('400 1em "Departure Mono"', "NOIR DIGITAL"),
      ];
      void Promise.all(criticalFonts).then(
        () => {
          if (!cancelled) setFontsReady(true);
        },
        () => {
          if (!cancelled) setFontsReady(true);
        },
      );
    } else {
      setFontsReady(true);
    }

    return () => {
      cancelled = true;
      delete document.documentElement.dataset["entryLoading"];
    };
  }, []);

  useEffect(() => {
    if (progress < 100 || (!reducedMotion && !revealReady) || phase !== "loading") return;

    if (reducedMotion) {
      setPhase("done");
      return;
    }

    const revealTimer = window.setTimeout(() => setPhase("revealing"), REVEAL_DELAY_MS);
    return () => window.clearTimeout(revealTimer);
  }, [phase, progress, reducedMotion, revealReady]);

  useEffect(() => {
    if (phase !== "revealing") return;

    const textRevealTimer = window.setTimeout(() => {
      document.documentElement.dataset["entryTextReady"] = "true";
    }, REVEAL_DURATION_MS - TEXT_REVEAL_LEAD_MS);
    const doneTimer = window.setTimeout(() => setPhase("done"), REVEAL_DURATION_MS);
    return () => {
      window.clearTimeout(textRevealTimer);
      window.clearTimeout(doneTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    delete document.documentElement.dataset["entryLoading"];
    document.documentElement.dataset["entryTextReady"] = "true";
    document.documentElement.dataset["entryReady"] = "true";
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`${styles["root"]} ${phase === "revealing" ? styles["revealing"] : ""}`}
      data-entry-preloader="true"
    >
      <div className={styles["surface"]} />
      <EntryRevealCanvas
        active={phase === "revealing"}
        className={styles["revealCanvas"]}
        deferInitialization
        durationMs={REVEAL_DURATION_MS}
        onReady={markRevealReady}
        skipInitialization={skipRevealInitialization}
      />
      <div className={styles["progressWrap"]}>
        <div className={styles["progressTrack"]}>
          <span className={styles["progressValue"]} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
