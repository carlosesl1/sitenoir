"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { EntryRevealCanvas } from "@/components/preloader/EntryRevealCanvas";
import { canRevealEntry } from "@/components/preloader/entry-preloader-state";
import { NoirSymbolPreloaderMark } from "@/components/preloader/NoirSymbolPreloaderMark";

import styles from "./EntryPreloader.module.css";

const REVEAL_DELAY_MS = 80;
const REVEAL_DURATION_MS = 520;
const TEXT_REVEAL_LEAD_MS = 360;

export function EntryPreloader() {
  const reducedMotion = useReducedMotion() ?? false;
  const [documentReady, setDocumentReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const [symbolReady, setSymbolReady] = useState(reducedMotion);
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");
  const markRevealReady = useCallback(() => setRevealReady(true), []);
  const markSymbolReady = useCallback(() => setSymbolReady(true), []);
  const skipRevealInitialization =
    reducedMotion ||
    (typeof document !== "undefined" &&
      document.documentElement.dataset["routeTransition"] === "true");

  const entryCanReveal = canRevealEntry({
    documentReady,
    fontsReady,
    symbolReady,
    revealReady,
    reducedMotion,
  });

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
    if (!entryCanReveal || phase !== "loading") return;

    if (reducedMotion) {
      setPhase("done");
      return;
    }

    const revealTimer = window.setTimeout(() => setPhase("revealing"), REVEAL_DELAY_MS);
    return () => window.clearTimeout(revealTimer);
  }, [entryCanReveal, phase, reducedMotion]);

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
      <div className={styles["markWrap"]}>
        <NoirSymbolPreloaderMark onComplete={markSymbolReady} reducedMotion={reducedMotion} />
      </div>
    </div>
  );
}
