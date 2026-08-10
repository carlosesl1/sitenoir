"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import {
  COMPARISON_VIEWPORT,
  comparisonFrameScale,
} from "@/components/glass-test/glass-comparison";

import styles from "./GlassComparison.module.css";

const FRAMES = [
  { label: "ATUAL", src: "/?effects=full", title: "NOIR atual" },
  {
    label: "CANVAS UI",
    src: "/?effects=full&glass=canvas-ui",
    title: "NOIR Canvas UI",
  },
] as const;

function ComparisonFrame({ label, src, title }: (typeof FRAMES)[number]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const update = (width: number) => setScale(comparisonFrameScale(width));
    update(container.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const viewportStyle = {
    height: COMPARISON_VIEWPORT.height * scale,
  } satisfies CSSProperties;
  const frameStyle = {
    height: COMPARISON_VIEWPORT.height,
    transform: `scale(${scale})`,
    width: COMPARISON_VIEWPORT.width,
  } satisfies CSSProperties;

  return (
    <article className={styles["panel"]}>
      <header className={styles["label"]}>{label}</header>
      <div ref={containerRef} className={styles["viewport"]} style={viewportStyle}>
        {loadState === "ready" ? null : (
          <p className={styles["status"]} role={loadState === "error" ? "alert" : "status"}>
            {loadState === "error" ? "Não foi possível carregar esta versão." : "Carregando…"}
          </p>
        )}
        <iframe
          className={styles["frame"]}
          height={COMPARISON_VIEWPORT.height}
          loading="eager"
          onError={() => setLoadState("error")}
          onLoad={() => setLoadState("ready")}
          src={src}
          style={frameStyle}
          title={title}
          width={COMPARISON_VIEWPORT.width}
        />
      </div>
    </article>
  );
}

export function GlassComparison() {
  return (
    <main className={styles["comparison"]} id="main-content">
      {FRAMES.map((frame) => (
        <ComparisonFrame key={frame.label} {...frame} />
      ))}
    </main>
  );
}
