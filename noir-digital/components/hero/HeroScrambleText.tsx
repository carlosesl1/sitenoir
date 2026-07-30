"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  resolveScrambleGlyph,
  resolveScrambleTotalDuration,
} from "@/components/hero/hero-scramble";

import styles from "./HeroScrambleText.module.css";

const TICK_INTERVAL_MS = 40;

type TickListener = (timestamp: number, frame: number) => void;

const tickListeners = new Set<TickListener>();
let tickInterval: number | null = null;
let tickFrame = 0;

function subscribeToScrambleClock(listener: TickListener) {
  tickListeners.add(listener);
  if (tickInterval === null) {
    tickInterval = window.setInterval(() => {
      tickFrame += 1;
      const timestamp = performance.now();
      for (const currentListener of tickListeners) currentListener(timestamp, tickFrame);
    }, TICK_INTERVAL_MS);
  }

  return () => {
    tickListeners.delete(listener);
    if (tickListeners.size > 0 || tickInterval === null) return;
    window.clearInterval(tickInterval);
    tickInterval = null;
  };
}

interface HeroScrambleTextProps {
  readonly active: boolean;
  readonly letterDelayMs: number;
  readonly reducedMotion: boolean;
  readonly startDelayMs: number;
  readonly text: string;
}

type ScrambleState = "waiting" | "running" | "settled";

function createGlyphEntries(text: string) {
  const occurrences = new Map<string, number>();
  return Array.from(text, (glyph) => {
    const occurrence = (occurrences.get(glyph) ?? 0) + 1;
    occurrences.set(glyph, occurrence);
    return { glyph, key: `${glyph}-${occurrence}` };
  });
}

export function HeroScrambleText({
  active,
  letterDelayMs,
  reducedMotion,
  startDelayMs,
  text,
}: HeroScrambleTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [scrambleState, setScrambleState] = useState<ScrambleState>("waiting");
  const glyphEntries = useMemo(() => createGlyphEntries(text), [text]);
  const glyphs = useMemo(() => glyphEntries.map(({ glyph }) => glyph), [glyphEntries]);

  useEffect(() => {
    if (reducedMotion) {
      setScrambleState("settled");
      return;
    }
    setScrambleState(active ? "running" : "waiting");
  }, [active, reducedMotion]);

  useEffect(() => {
    if (scrambleState !== "running") return;

    const root = rootRef.current;
    if (!root) return;
    const glyphNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-scramble-glyph]"));
    const startedAt = performance.now();
    const totalDurationMs = resolveScrambleTotalDuration(
      glyphs.length,
      startDelayMs,
      letterDelayMs,
    );

    let unsubscribe = () => {};
    const update = (timestamp: number, frame: number) => {
      const elapsedMs = timestamp - startedAt - startDelayMs;
      for (const [index, node] of glyphNodes.entries()) {
        const resolved = resolveScrambleGlyph(
          glyphs[index] ?? "",
          index,
          elapsedMs,
          letterDelayMs,
          frame,
        );
        node.textContent = resolved.glyph;
        node.dataset["phase"] = resolved.phase;
      }
      if (timestamp - startedAt < totalDurationMs) return;
      unsubscribe();
      setScrambleState("settled");
    };

    unsubscribe = subscribeToScrambleClock(update);
    update(startedAt, tickFrame);
    return unsubscribe;
  }, [glyphs, letterDelayMs, scrambleState, startDelayMs]);

  const settled = reducedMotion || scrambleState === "settled";

  return (
    <span
      ref={rootRef}
      className={styles["root"]}
      data-hero-scramble="true"
      data-scramble-active={scrambleState === "running"}
      data-scramble-delay={startDelayMs}
      data-scramble-letter-delay={letterDelayMs}
      data-scramble-state={settled ? "settled" : scrambleState}
      data-scramble-text={text}
    >
      {settled ? (
        text
      ) : (
        <>
          <span
            className={styles["measure"]}
            data-scramble-measure="true"
            data-text={text}
            aria-hidden="true"
          />
          {scrambleState === "running" ? (
            <span className={styles["visual"]} data-scramble-visual="true" aria-hidden="true">
              {glyphEntries.map(({ glyph, key }) => (
                <span
                  className={styles["glyph"]}
                  data-scramble-glyph="true"
                  data-phase="hidden"
                  key={key}
                >
                  {glyph}
                </span>
              ))}
            </span>
          ) : null}
          <span className={styles["screenReaderText"]}>{text}</span>
        </>
      )}
    </span>
  );
}
