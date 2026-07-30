"use client";

import { useCallback, useEffect, useRef } from "react";

import styles from "./CustomScrollbar.module.css";

const MIN_THUMB_HEIGHT = 26;

export function CustomScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerY: number; scrollY: number } | null>(null);

  const updateThumb = useCallback(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const viewportHeight = Math.max(1, window.innerHeight);
    const documentHeight = Math.max(viewportHeight, document.documentElement.scrollHeight);
    const maxScroll = Math.max(1, documentHeight - viewportHeight);
    const trackHeight = track.clientHeight;
    const thumbHeight = Math.max(
      MIN_THUMB_HEIGHT,
      Math.min(trackHeight, trackHeight * (viewportHeight / documentHeight)),
    );
    const travel = Math.max(0, trackHeight - thumbHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translate3d(0, ${travel * progress}px, 0)`;
    track.dataset["scrollable"] = documentHeight > viewportHeight + 1 ? "true" : "false";
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    const requestUpdate = () => {
      if (animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateThumb();
      });
    };
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(requestUpdate);
    resizeObserver?.observe(document.documentElement);
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("scroll", requestUpdate, { passive: true });
    requestUpdate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("scroll", requestUpdate);
    };
  }, [updateThumb]);

  const scrollFromPointer = (pointerY: number, initialScrollY: number, initialPointerY: number) => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const travel = Math.max(1, track.clientHeight - thumb.offsetHeight);
    window.scrollTo(0, initialScrollY + ((pointerY - initialPointerY) / travel) * maxScroll);
  };

  return (
    <div
      ref={trackRef}
      className={styles["track"]}
      aria-hidden="true"
      onPointerDown={(event) => {
        if (event.target === thumbRef.current) return;
        const track = trackRef.current;
        const thumb = thumbRef.current;
        if (!track || !thumb) return;
        const rect = track.getBoundingClientRect();
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const travel = Math.max(1, track.clientHeight - thumb.offsetHeight);
        const target = Math.min(
          travel,
          Math.max(0, event.clientY - rect.top - thumb.offsetHeight / 2),
        );
        window.scrollTo({ top: (target / travel) * maxScroll, behavior: "smooth" });
      }}
    >
      <div
        ref={thumbRef}
        className={styles["thumb"]}
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = { pointerY: event.clientY, scrollY: window.scrollY };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag) return;
          scrollFromPointer(event.clientY, drag.scrollY, drag.pointerY);
        }}
        onPointerUp={(event) => {
          dragRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      />
    </div>
  );
}
