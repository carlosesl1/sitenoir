"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { EntryRevealCanvas } from "@/components/preloader/EntryRevealCanvas";
import { resolveEntryLoadProgress } from "@/components/preloader/entry-preloader-state";

import styles from "./EntryPreloader.module.css";

const REVEAL_DELAY_MS = 250;
const REVEAL_DURATION_MS = 800;
const TEXT_REVEAL_LEAD_MS = 500;

export function EntryPreloader() {
  const reducedMotion = useReducedMotion() ?? false;
  const [documentReady, setDocumentReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");

  const progress = useMemo(
    () => resolveEntryLoadProgress({ documentReady, fontsReady }),
    [documentReady, fontsReady],
  );

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

    if (reducedMotion) {
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
  }, [reducedMotion]);

  useEffect(() => {
    if (progress < 100 || phase !== "loading") return;

    const revealTimer = window.setTimeout(() => setPhase("revealing"), REVEAL_DELAY_MS);
    return () => window.clearTimeout(revealTimer);
  }, [phase, progress]);

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
    >
      <div className={styles["surface"]} />
      <EntryRevealCanvas
        active={phase === "revealing"}
        className={styles["revealCanvas"]}
        durationMs={REVEAL_DURATION_MS}
      />
      <div className={styles["progressWrap"]}>
        <div className={styles["progressTrack"]}>
          <span className={styles["progressValue"]} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
