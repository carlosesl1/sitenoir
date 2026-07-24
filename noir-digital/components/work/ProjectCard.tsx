"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useWorkCardAnimation,
  type WorkCardAnimationFrame,
} from "@/components/work/work-card-animation-controller";
import {
  type PreparedWorkCardImage,
  prepareWorkCardImage,
} from "@/components/work/work-card-image-cache";
import {
  resetWorkCardCanvas,
  resolveScreenCurlProfile,
  resolveWorkCardCanvasMetrics,
  resolveWorkCardCurl,
  shouldRenderWorkCardCanvas,
} from "@/components/work/work-card-motion";
import type { Project } from "@/data/projects";
import { setDataFlag } from "@/scene/work-card-runtime";

import { CardHoverRevealCanvas, type CardHoverRevealHandle } from "./CardHoverRevealCanvas";

import styles from "./SelectedWork.module.css";

interface ProjectCardProps {
  readonly featured: boolean;
  readonly project: Project;
}

type CanvasRenderState = {
  curlStrength: number;
  dpr: number;
  height: number;
  hoverProgress: number;
  rectLeft: number;
  rectTop: number;
  width: number;
};

export function ProjectCard({ featured, project }: ProjectCardProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [webglOwned, setWebglOwned] = useState(false);
  const { registerCard, requestFrame } = useWorkCardAnimation();
  const frameRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const primaryImageRef = useRef<HTMLImageElement>(null);
  const hoverImageRef = useRef<HTMLImageElement>(null);
  const hoverRevealRef = useRef<CardHoverRevealHandle>(null);
  const hoverRevealProgressRef = useRef(0);
  const hoverActiveRef = useRef(false);
  const pointerInsideRef = useRef(false);
  const focusInsideRef = useRef(false);
  const lastCanvasRenderRef = useRef<CanvasRenderState | null>(null);
  const primaryImageCacheRef = useRef<PreparedWorkCardImage | null>(null);
  const hoverImageCacheRef = useRef<PreparedWorkCardImage | null>(null);

  const renderFrame = useCallback(
    ({ scrollSpeed }: WorkCardAnimationFrame) => {
      const frame = frameRef.current;
      const canvas = canvasRef.current;
      if (!frame || !canvas || reducedMotion) return;

      const rect = frame.getBoundingClientRect();
      const viewportHeight = Math.max(1, window.innerHeight);
      const visible = rect.bottom > -viewportHeight * 0.25 && rect.top < viewportHeight * 1.25;
      const webglReady = frame.dataset["webglReady"] === "true";
      const rawCurlStrength = resolveWorkCardCurl(scrollSpeed);
      const curlStrength = rawCurlStrength < 0.0005 ? 0 : rawCurlStrength;
      hoverRevealRef.current?.setCurlStrength(visible ? curlStrength : 0);

      const primaryImage = primaryImageRef.current;
      const imageReady = Boolean(
        primaryImage?.complete && primaryImage.naturalWidth > 0 && primaryImage.naturalHeight > 0,
      );
      if (webglReady) {
        canvas.style.opacity = "0";
        lastCanvasRenderRef.current = null;
        return;
      }
      if (!shouldRenderWorkCardCanvas({ imageReady, visible, webglReady })) {
        resetWorkCardCanvas(frame, canvas);
        lastCanvasRenderRef.current = null;
        return;
      }

      const hoverImage = hoverImageRef.current;
      if (!primaryImage) return;

      const viewportWidth = Math.max(1, window.innerWidth);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const overscan = viewportWidth * 0.08;
      const canvasWidth = Math.max(1, Math.round(width + overscan * 2));
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const hoverProgress = hoverRevealProgressRef.current;
      const previousRender = lastCanvasRenderRef.current;
      const needsRedraw =
        !previousRender ||
        previousRender.width !== canvasWidth ||
        previousRender.height !== height ||
        previousRender.dpr !== dpr ||
        Math.abs(previousRender.curlStrength - curlStrength) >= 0.0001 ||
        Math.abs(previousRender.hoverProgress - hoverProgress) >= 0.001 ||
        (curlStrength > 0 &&
          (Math.abs(previousRender.rectTop - rect.top) >= 0.1 ||
            Math.abs(previousRender.rectLeft - rect.left) >= 0.1));

      setDataFlag(frame, "canvasActive", "true");
      setDataFlag(frame, "curlActive", curlStrength > 0 ? "true" : "false");
      canvas.style.opacity = "1";
      if (!needsRedraw) return;

      const canvasMetrics = resolveWorkCardCanvasMetrics(canvasWidth, height, dpr);
      const pixelWidth = canvasMetrics.pixelWidth;
      const pixelHeight = canvasMetrics.pixelHeight;
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      canvas.style.left = `${-overscan}px`;
      canvas.style.width = `${canvasMetrics.cssWidth}px`;
      canvas.style.height = `${canvasMetrics.cssHeight}px`;

      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      context.clearRect(0, 0, canvasWidth, height);

      const preparedPrimary = prepareWorkCardImage({
        dpr,
        height,
        image: primaryImage,
        previous: primaryImageCacheRef.current,
        width,
      });
      if (!preparedPrimary) return;
      primaryImageCacheRef.current = preparedPrimary;
      const hoverReady = Boolean(
        hoverProgress > 0 &&
          hoverImage?.complete &&
          hoverImage.naturalWidth > 0 &&
          hoverImage.naturalHeight > 0,
      );
      const preparedHover =
        hoverReady && hoverImage
          ? prepareWorkCardImage({
              dpr,
              height,
              image: hoverImage,
              previous: hoverImageCacheRef.current,
              width,
            })
          : null;
      if (preparedHover) hoverImageCacheRef.current = preparedHover;

      const stripHeight = 2;
      const drawStrip = (
        prepared: PreparedWorkCardImage,
        alpha: number,
        y: number,
        outputHeight: number,
        outputLeft: number,
        outputWidth: number,
      ) => {
        context.globalAlpha = alpha;
        const sourceY = prepared.sourceTop + (y / prepared.height) * prepared.sourceHeight;
        const sourceHeight = (outputHeight / prepared.height) * prepared.sourceHeight;
        context.drawImage(
          prepared.image,
          prepared.sourceLeft,
          sourceY,
          prepared.sourceWidth,
          sourceHeight,
          outputLeft,
          y,
          outputWidth,
          outputHeight,
        );
      };

      for (let y = 0; y < height; y += stripHeight) {
        const outputHeight = Math.min(stripHeight, height - y);
        const profile = resolveScreenCurlProfile(rect.top + y + outputHeight / 2, viewportHeight);
        const uvScale = 1 - profile * curlStrength;
        const rectLeftUv = rect.left / viewportWidth;
        const rectRightUv = rect.right / viewportWidth;
        const curledLeft = ((rectLeftUv - 0.5) / uvScale + 0.5) * viewportWidth;
        const curledRight = ((rectRightUv - 0.5) / uvScale + 0.5) * viewportWidth;
        const canvasGlobalLeft = rect.left - overscan;
        const outputLeft = curledLeft - canvasGlobalLeft;
        const outputWidth = curledRight - curledLeft;
        drawStrip(preparedPrimary, 1, y, outputHeight, outputLeft, outputWidth);
        if (preparedHover) {
          drawStrip(preparedHover, hoverProgress, y, outputHeight, outputLeft, outputWidth);
        }
      }
      context.globalAlpha = 1;
      lastCanvasRenderRef.current = {
        curlStrength,
        dpr,
        height,
        hoverProgress,
        rectLeft: rect.left,
        rectTop: rect.top,
        width: canvasWidth,
      };
    },
    [reducedMotion],
  );

  useEffect(() => {
    if (webglOwned) return;
    const frame = frameRef.current;
    if (!frame) return;
    return registerCard(frame, renderFrame);
  }, [registerCard, renderFrame, webglOwned]);

  useEffect(() => {
    if (!reducedMotion) return;
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;
    hoverRevealRef.current?.setCurlStrength(0);
    lastCanvasRenderRef.current = null;
    primaryImageCacheRef.current = null;
    hoverImageCacheRef.current = null;
    resetWorkCardCanvas(frame, canvas);
  }, [reducedMotion]);

  useEffect(() => {
    const handleWebGlWorkReady = () => {
      const ready = frameRef.current?.dataset["webglReady"] === "true";
      setWebglOwned(ready);
      if (ready) {
        hoverRevealRef.current?.release();
        if (canvasRef.current) canvasRef.current.style.opacity = "0";
        lastCanvasRenderRef.current = null;
      } else {
        requestFrame();
      }
    };
    window.addEventListener("noir:webgl-work-ready", handleWebGlWorkReady);
    return () => window.removeEventListener("noir:webgl-work-ready", handleWebGlWorkReady);
  }, [requestFrame]);

  const updateHoverState = useCallback(() => {
    const active = pointerInsideRef.current || focusInsideRef.current;
    if (active === hoverActiveRef.current) return;
    hoverActiveRef.current = active;
    if (frameRef.current?.dataset["webglReady"] === "true") {
      hoverRevealRef.current?.release();
      return;
    }
    if (active) hoverRevealRef.current?.reveal();
    else hoverRevealRef.current?.conceal();
  }, []);

  const handleHoverRevealProgress = useCallback(
    (progress: number) => {
      hoverRevealProgressRef.current = progress;
      requestFrame();
    },
    [requestFrame],
  );

  const cardClassName = featured
    ? `${styles["projectCard"]} ${styles["featuredCard"]}`
    : styles["projectCard"];
  const sizes = featured
    ? "(max-width: 767px) calc(100vw - 32px), calc(66.7vw - 75px)"
    : "(max-width: 767px) calc(100vw - 32px), calc(33.3vw - 49px)";

  return (
    <article
      className={cardClassName}
      data-testid={`project-${project.slug}`}
      data-project-featured={featured ? "true" : "false"}
    >
      <a
        className={styles["projectLink"]}
        href={project.href}
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          pointerInsideRef.current = true;
          updateHoverState();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          pointerInsideRef.current = false;
          updateHoverState();
        }}
        onFocus={() => {
          focusInsideRef.current = true;
          updateHoverState();
        }}
        onBlur={() => {
          focusInsideRef.current = false;
          updateHoverState();
        }}
      >
        <span
          ref={frameRef}
          className={styles["imageFrame"]}
          data-work-card={project.slug}
          data-canvas-active="false"
          data-curl-active="false"
        >
          <span className={styles["imageClip"]}>
            <Image
              ref={primaryImageRef}
              className={styles["primaryImage"]}
              data-image-role="primary"
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes={sizes}
            />
            <Image
              ref={hoverImageRef}
              className={styles["hoverImage"]}
              data-image-role="hover"
              src={project.hoverImage}
              alt=""
              aria-hidden="true"
              fill
              sizes={sizes}
            />
          </span>
          <CardHoverRevealCanvas
            ref={hoverRevealRef}
            canvasClassName={styles["hoverRevealCanvas"]}
            frameRef={frameRef}
            hostClassName={styles["hoverRevealHost"]}
            hoverImageRef={hoverImageRef}
            onProgress={handleHoverRevealProgress}
            reducedMotion={reducedMotion}
          />
          <canvas ref={canvasRef} className={styles["curlCanvas"]} />
        </span>

        <span className={styles["projectMeta"]}>
          <span className={styles["projectTitle"]}>{project.title}</span>
          <span>{project.year}</span>
          <span>{[project.client, ...project.deliveryLabels].join(" / ")}</span>
        </span>
      </a>
    </article>
  );
}
