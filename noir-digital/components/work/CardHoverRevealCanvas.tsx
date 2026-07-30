"use client";

import { forwardRef, type RefObject, useImperativeHandle, useLayoutEffect, useRef } from "react";

import { resolveWorkCardCanvasMetrics } from "@/components/work/work-card-motion";

const DOT_PIXEL_SIZE = 18;
const TRANSITION_SECONDS = 0.42;

const VERTEX_SHADER = `
  attribute vec2 aPosition;

  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  #extension GL_OES_standard_derivatives : enable
  precision highp float;

  uniform sampler2D uHover;
  uniform vec2 uCanvasOffsetPx;
  uniform vec2 uViewportPx;
  uniform vec4 uRect;
  uniform vec2 uHoverSize;
  uniform float uCurlStrength;
  uniform float uHoverRevealProgress;
  uniform float uDotPixelSize;

  vec2 coverUv(vec2 uv, vec2 imageSize) {
    float rectWidthPx = max(uRect.z * uViewportPx.x, 1.0);
    float rectHeightPx = max(uRect.w * uViewportPx.y, 1.0);
    float viewportAspect = rectWidthPx / rectHeightPx;
    float imageAspect = imageSize.x / max(imageSize.y, 1.0);
    vec2 result = uv;

    if (imageAspect > viewportAspect) {
      result.x = 0.5 + (uv.x - 0.5) * (viewportAspect / imageAspect);
    } else {
      result.y = 0.5 + (uv.y - 0.5) * (imageAspect / viewportAspect);
    }

    return clamp(result, 0.0, 1.0);
  }

  vec2 applyCurl(vec2 screenUv) {
    float centered = 2.0 * screenUv.y - 1.0;
    float profile = 1.0 - sqrt(max(0.0, 1.0 - centered * centered));
    float uvScale = 1.0 - profile * uCurlStrength;
    float distortedX = (screenUv.x - 0.5) * uvScale + 0.5;
    return vec2(distortedX, screenUv.y);
  }

  float hoverDotCoverage(vec2 screenUv) {
    float hoverProgress = clamp(uHoverRevealProgress, 0.0, 1.0);
    if (hoverProgress <= 0.0) return 0.0;

    vec2 viewportPx = max(uViewportPx, vec2(1.0));
    float dotPx = max(2.0, uDotPixelSize);
    vec2 cellSizeUv = vec2(dotPx) / viewportPx;
    vec2 safeCellSize = max(cellSizeUv, vec2(1.0 / 4096.0));

    float rectWidthPx = max(uRect.z * viewportPx.x, 1.0);
    float rectHeightPx = max(uRect.w * viewportPx.y, 1.0);
    float rectAspect = max(rectWidthPx / rectHeightPx, 0.00001);
    vec2 localUv = (screenUv - uRect.xy) / uRect.zw;
    vec2 centered = localUv * 2.0 - 1.0;
    centered.x *= rectAspect;
    float distanceToCenter = length(centered);

    float maximumRadius = sqrt(1.0 + rectAspect * rectAspect);
    float revealBand = max(length(safeCellSize) * 18.0, 0.08);
    float revealRadius = hoverProgress * (maximumRadius + revealBand);
    float grow = clamp((revealRadius - distanceToCenter) / revealBand, 0.0, 1.0);
    grow = smoothstep(0.0, 1.0, grow);

    vec2 cellUv = fract(screenUv / safeCellSize);
    vec2 cellFromCenter = abs(cellUv - vec2(0.5));
    float squareExtent = mix(0.0, 0.5, grow);
    float squareDistance = max(cellFromCenter.x, cellFromCenter.y);
    float squareAa = max(fwidth(squareDistance), 0.0001) * 1.5;
    if (squareExtent <= squareAa) return 0.0;
    if (grow >= 0.999) return 1.0;

    return 1.0 - smoothstep(
      squareExtent - squareAa,
      squareExtent + squareAa,
      squareDistance
    );
  }

  float edgeAaMask(vec2 uv) {
    vec2 aa = max(fwidth(uv), vec2(0.00001));
    vec2 edgeDistance = min(uv, 1.0 - uv);
    float xClip = smoothstep(0.0, aa.x, edgeDistance.x);
    float yClip = smoothstep(0.0, aa.y, edgeDistance.y);
    return xClip * yClip;
  }

  void main() {
    vec2 screenUv = (gl_FragCoord.xy + uCanvasOffsetPx) / uViewportPx;
    vec2 distortedScreenUv = applyCurl(screenUv);
    vec2 localUv = (distortedScreenUv - uRect.xy) / uRect.zw;
    float hoverCoverage = hoverDotCoverage(screenUv);
    if (hoverCoverage <= 0.0) discard;
    vec4 hoverColor = texture2D(uHover, coverUv(localUv, uHoverSize));
    float inside = edgeAaMask(localUv);
    float outputAlpha = hoverColor.a * inside * hoverCoverage;
    if (outputAlpha < 0.001) discard;
    gl_FragColor = vec4(hoverColor.rgb, outputAlpha);
  }
`;

export type CardHoverRevealHandle = {
  conceal: () => void;
  release: () => void;
  reveal: () => void;
  setCurlStrength: (strength: number) => void;
};

type CardHoverRevealCanvasProps = {
  canvasClassName: string | undefined;
  frameRef: RefObject<HTMLSpanElement | null>;
  hostClassName: string | undefined;
  hoverImageRef: RefObject<HTMLImageElement | null>;
  onProgress: (progress: number) => void;
  reducedMotion: boolean;
};

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;

  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

function isRenderableImage(image: HTMLImageElement | null): image is HTMLImageElement {
  return Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
}

type HoverTarget = {
  canvasClassName: string | undefined;
  frame: HTMLSpanElement;
  host: HTMLSpanElement;
  hoverImage: HTMLImageElement;
  onProgress: (progress: number) => void;
};

type ShaderLocations = {
  canvasOffset: WebGLUniformLocation;
  curlStrength: WebGLUniformLocation;
  dotPixelSize: WebGLUniformLocation;
  hover: WebGLUniformLocation;
  hoverSize: WebGLUniformLocation;
  progress: WebGLUniformLocation;
  rect: WebGLUniformLocation;
  viewport: WebGLUniformLocation;
};

class SharedCardHoverRenderer {
  private readonly canvas = document.createElement("canvas");
  private animationFrame = 0;
  private curlStrength = 0;
  private gl: WebGLRenderingContext | null = null;
  private hoverTexture: WebGLTexture | null = null;
  private locations: ShaderLocations | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private previousTime: number | null = null;
  private program: WebGLProgram | null = null;
  private rawProgress = 0;
  private target: HoverTarget | null = null;
  private targetProgress = 0;

  constructor() {
    this.canvas.setAttribute("aria-hidden", "true");
    this.canvas.addEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.addEventListener("webglcontextrestored", this.handleContextRestored);
    window.addEventListener("resize", this.handleResize, { passive: true });
  }

  reveal(target: HoverTarget) {
    if (this.target?.host !== target.host) this.resetTarget();
    if (!this.ensureResources() || !this.uploadImages(target)) return false;

    this.target = target;
    this.canvas.className = target.canvasClassName ?? "";
    target.host.append(this.canvas);
    target.frame.dataset["hoverRevealReady"] = "true";
    this.canvas.style.opacity = "1";

    if (this.rawProgress >= 0.999 && this.targetProgress === 1) {
      target.onProgress(1);
      this.draw(1);
      return true;
    }

    this.targetProgress = 1;
    this.startAnimation();
    return true;
  }

  conceal(host: HTMLSpanElement) {
    if (this.target?.host !== host) return false;
    if (this.rawProgress <= 0.001) {
      this.resetTarget();
      return true;
    }

    this.targetProgress = 0;
    this.startAnimation();
    return true;
  }

  release(host: HTMLSpanElement) {
    if (this.target?.host === host) this.resetTarget();
  }

  setCurlStrength(host: HTMLSpanElement, strength: number) {
    if (this.target?.host !== host) return;
    const nextStrength = Math.max(0, Math.min(0.12, strength));
    if (Math.abs(nextStrength - this.curlStrength) < 0.0001) return;
    this.curlStrength = nextStrength;
    if (this.animationFrame !== 0) return;
    const easedProgress = 0.5 - 0.5 * Math.cos(Math.PI * this.rawProgress);
    this.draw(easedProgress);
  }

  private ensureResources() {
    if (this.gl && this.program && this.positionBuffer && this.hoverTexture && this.locations) {
      return true;
    }

    const gl = this.canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false,
    });
    if (!gl?.getExtension("OES_standard_derivatives")) return false;

    const program = createProgram(gl);
    const positionBuffer = gl.createBuffer();
    const hoverTexture = gl.createTexture();
    if (!program || !positionBuffer || !hoverTexture) {
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (hoverTexture) gl.deleteTexture(hoverTexture);
      if (program) gl.deleteProgram(program);
      return false;
    }

    const position = gl.getAttribLocation(program, "aPosition");
    const hover = gl.getUniformLocation(program, "uHover");
    const canvasOffset = gl.getUniformLocation(program, "uCanvasOffsetPx");
    const viewport = gl.getUniformLocation(program, "uViewportPx");
    const rect = gl.getUniformLocation(program, "uRect");
    const hoverSize = gl.getUniformLocation(program, "uHoverSize");
    const progress = gl.getUniformLocation(program, "uHoverRevealProgress");
    const dotPixelSize = gl.getUniformLocation(program, "uDotPixelSize");
    const curlStrength = gl.getUniformLocation(program, "uCurlStrength");
    if (
      position < 0 ||
      !hover ||
      !canvasOffset ||
      !viewport ||
      !rect ||
      !hoverSize ||
      !progress ||
      !dotPixelSize ||
      !curlStrength
    ) {
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(hoverTexture);
      gl.deleteProgram(program);
      return false;
    }

    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React hook.
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.uniform1i(hover, 0);

    this.gl = gl;
    this.program = program;
    this.positionBuffer = positionBuffer;
    this.hoverTexture = hoverTexture;
    this.locations = {
      canvasOffset,
      curlStrength,
      dotPixelSize,
      hover,
      hoverSize,
      progress,
      rect,
      viewport,
    };
    return true;
  }

  private uploadImages(target: HoverTarget) {
    const { gl, hoverTexture, locations } = this;
    if (!gl || !hoverTexture || !locations) return false;

    const upload = (texture: WebGLTexture, image: HTMLImageElement, unit: number) => {
      gl.activeTexture(unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };

    try {
      upload(hoverTexture, target.hoverImage, gl.TEXTURE0);
      gl.uniform2f(
        locations.hoverSize,
        target.hoverImage.naturalWidth,
        target.hoverImage.naturalHeight,
      );
      return true;
    } catch {
      this.resetTarget();
      return false;
    }
  }

  private startAnimation() {
    window.cancelAnimationFrame(this.animationFrame);
    this.previousTime = null;
    this.animationFrame = window.requestAnimationFrame(this.animate);
  }

  private readonly animate = (time: number) => {
    if (!this.target) return;
    const deltaSeconds =
      this.previousTime === null ? 1 / 60 : Math.min((time - this.previousTime) / 1000, 0.1);
    this.previousTime = time;

    const difference = this.targetProgress - this.rawProgress;
    if (Math.abs(difference) <= 0.001) {
      this.rawProgress = this.targetProgress;
    } else {
      const direction = difference > 0 ? 1 : -1;
      this.rawProgress = Math.max(
        0,
        Math.min(1, this.rawProgress + (deltaSeconds / TRANSITION_SECONDS) * direction),
      );
    }

    const easedProgress = 0.5 - 0.5 * Math.cos(Math.PI * this.rawProgress);
    this.target.onProgress(easedProgress);
    this.draw(easedProgress);

    if (this.rawProgress !== this.targetProgress) {
      this.animationFrame = window.requestAnimationFrame(this.animate);
    } else {
      this.animationFrame = 0;
      if (this.rawProgress === 0) this.resetTarget();
    }
  };

  private draw(progress: number) {
    const { canvas, gl, locations, target } = this;
    if (!gl || !locations || !target) return;

    const bounds = target.frame.getBoundingClientRect();
    const canvasBounds = target.host.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const viewportWidth = Math.max(1, window.innerWidth);
    const viewportHeight = Math.max(1, window.innerHeight);
    const canvasMetrics = resolveWorkCardCanvasMetrics(
      canvasBounds.width,
      canvasBounds.height,
      pixelRatio,
    );
    if (canvas.width !== canvasMetrics.pixelWidth || canvas.height !== canvasMetrics.pixelHeight) {
      canvas.width = canvasMetrics.pixelWidth;
      canvas.height = canvasMetrics.pixelHeight;
    }

    canvas.style.width = `${canvasMetrics.cssWidth}px`;
    canvas.style.height = `${canvasMetrics.cssHeight}px`;

    gl.viewport(0, 0, canvasMetrics.pixelWidth, canvasMetrics.pixelHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(
      locations.canvasOffset,
      canvasBounds.left * pixelRatio,
      (viewportHeight - canvasBounds.bottom) * pixelRatio,
    );
    gl.uniform2f(locations.viewport, viewportWidth * pixelRatio, viewportHeight * pixelRatio);
    gl.uniform4f(
      locations.rect,
      bounds.left / viewportWidth,
      1 - bounds.bottom / viewportHeight,
      bounds.width / viewportWidth,
      bounds.height / viewportHeight,
    );
    gl.uniform1f(locations.dotPixelSize, DOT_PIXEL_SIZE * pixelRatio);
    gl.uniform1f(locations.curlStrength, this.curlStrength);
    gl.uniform1f(locations.progress, progress);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private resetTarget() {
    window.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
    this.previousTime = null;
    this.targetProgress = 0;
    this.rawProgress = 0;
    this.curlStrength = 0;
    if (this.target) {
      delete this.target.frame.dataset["hoverRevealReady"];
      this.target.onProgress(0);
    }
    this.canvas.style.opacity = "0";
    this.canvas.remove();
    this.target = null;
  }

  private readonly handleResize = () => {
    if (!this.target) return;
    const easedProgress = 0.5 - 0.5 * Math.cos(Math.PI * this.rawProgress);
    this.draw(easedProgress);
  };

  private readonly handleContextLost = (event: Event) => {
    event.preventDefault();
    this.resetTarget();
    this.gl = null;
    this.program = null;
    this.positionBuffer = null;
    this.hoverTexture = null;
    this.locations = null;
  };

  private readonly handleContextRestored = () => {
    this.gl = null;
    this.program = null;
    this.positionBuffer = null;
    this.hoverTexture = null;
    this.locations = null;
  };
}

let sharedRenderer: SharedCardHoverRenderer | null = null;

function getSharedRenderer() {
  sharedRenderer ??= new SharedCardHoverRenderer();
  return sharedRenderer;
}

export const CardHoverRevealCanvas = forwardRef<CardHoverRevealHandle, CardHoverRevealCanvasProps>(
  function CardHoverRevealCanvas(
    { canvasClassName, frameRef, hostClassName, hoverImageRef, onProgress, reducedMotion },
    ref,
  ) {
    const hostRef = useRef<HTMLSpanElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        conceal: () => {
          const host = hostRef.current;
          if (!host || reducedMotion || !getSharedRenderer().conceal(host)) onProgress(0);
        },
        release: () => {
          const host = hostRef.current;
          if (host) sharedRenderer?.release(host);
          onProgress(0);
        },
        reveal: () => {
          const host = hostRef.current;
          const frame = frameRef.current;
          const hoverImage = hoverImageRef.current;
          if (
            reducedMotion ||
            !host ||
            !frame ||
            !isRenderableImage(hoverImage) ||
            !getSharedRenderer().reveal({
              canvasClassName,
              frame,
              host,
              hoverImage,
              onProgress,
            })
          ) {
            onProgress(1);
          }
        },
        setCurlStrength: (strength) => {
          const host = hostRef.current;
          if (host) sharedRenderer?.setCurlStrength(host, strength);
        },
      }),
      [canvasClassName, frameRef, hoverImageRef, onProgress, reducedMotion],
    );

    useLayoutEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      return () => {
        sharedRenderer?.release(host);
      };
    }, []);

    useLayoutEffect(() => {
      if (!reducedMotion) return;
      const host = hostRef.current;
      if (host) sharedRenderer?.release(host);
      onProgress(0);
    }, [onProgress, reducedMotion]);

    return (
      <span
        ref={hostRef}
        className={hostClassName}
        data-card-hover-reveal="true"
        aria-hidden="true"
      />
    );
  },
);
