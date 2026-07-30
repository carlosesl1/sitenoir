"use client";

import { useLayoutEffect, useRef } from "react";

import { easeEntryReveal } from "@/components/preloader/entry-reveal-mask";

const DOT_CELL_SIZE = 16;

const VERTEX_SHADER = `
  attribute vec2 aPosition;

  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  #extension GL_OES_standard_derivatives : enable
  precision highp float;

  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform float uFeather;
  uniform float uAspect;
  uniform float uHoleRadius;
  uniform float uProgress;
  uniform vec3 uOverlayColor;

  float radialMaskAlpha(vec2 uv) {
    vec2 point = uv * 2.0 - 1.0;
    if (uAspect > 1.0) {
      point.x *= uAspect;
    } else {
      point.y /= max(uAspect, 0.0001);
    }

    float distanceFromCenter = length(point);
    float edge = max(uFeather, uHoleRadius * 0.12);
    float alphaOutsideHole = smoothstep(
      uHoleRadius,
      uHoleRadius + edge,
      distanceFromCenter
    );
    float closingFill = smoothstep(0.92, 1.0, uProgress);
    return mix(alphaOutsideHole, 1.0, closingFill);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 normalizedPixelSize = vec2(uPixelSize) / uResolution;
    vec2 cellId = floor(uv / normalizedPixelSize);
    vec2 cellCenter = (cellId + vec2(0.5)) * normalizedPixelSize;
    float cellAlpha = clamp(radialMaskAlpha(cellCenter), 0.0, 1.0);

    vec2 cellUv = fract(uv / normalizedPixelSize);
    float radius = 0.8 * cellAlpha;
    float distanceFromDot = distance(cellUv, vec2(0.5));
    float antialiasWidth = fwidth(distanceFromDot) * 1.5;
    float dotMask = 1.0 - smoothstep(
      radius - antialiasWidth,
      radius,
      distanceFromDot
    );

    gl_FragColor = vec4(uOverlayColor * dotMask, dotMask);
  }
`;

type EntryRevealCanvasProps = {
  active: boolean;
  className: string | undefined;
  direction?: TransitionDirection;
  durationMs: number;
};

export type TransitionDirection = "cover" | "reveal";

export function resolveTransitionMaskProgress(
  direction: TransitionDirection,
  easedProgress: number,
): number {
  return direction === "cover" ? easedProgress : 1 - easedProgress;
}

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

function resolveOverlayColor() {
  const cssColor = getComputedStyle(document.body).backgroundColor;
  const channels = cssColor
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number);
  if (!channels || channels.length < 3) return [3 / 255, 3 / 255, 3 / 255] as const;
  const [red = 3, green = 3, blue = 3] = channels;
  return [red / 255, green / 255, blue / 255] as const;
}

export function EntryRevealCanvas({
  active,
  className,
  direction = "reveal",
  durationMs,
}: EntryRevealCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{
    animationFrame: number;
    drawFrame: (maskProgress: number) => void;
    updateOverlayColor: () => void;
  } | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
    });
    if (!gl?.getExtension("OES_standard_derivatives")) return;

    const program = createProgram(gl);
    const positionBuffer = gl.createBuffer();
    if (!program || !positionBuffer) {
      if (program) gl.deleteProgram(program);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const pixelSizeLocation = gl.getUniformLocation(program, "uPixelSize");
    const featherLocation = gl.getUniformLocation(program, "uFeather");
    const aspectLocation = gl.getUniformLocation(program, "uAspect");
    const holeRadiusLocation = gl.getUniformLocation(program, "uHoleRadius");
    const progressLocation = gl.getUniformLocation(program, "uProgress");
    const overlayColorLocation = gl.getUniformLocation(program, "uOverlayColor");

    if (
      positionLocation < 0 ||
      !resolutionLocation ||
      !pixelSizeLocation ||
      !featherLocation ||
      !aspectLocation ||
      !holeRadiusLocation ||
      !progressLocation ||
      !overlayColorLocation
    ) {
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl["useProgram"](program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const updateOverlayColor = () => {
      const overlayColor = resolveOverlayColor();
      gl.uniform3f(overlayColorLocation, overlayColor[0], overlayColor[1], overlayColor[2]);
    };
    gl.uniform1f(featherLocation, 0.8);
    updateOverlayColor();

    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let maximumRadius = Math.SQRT2;
    let currentMaskProgress = 1;

    const resizeCanvas = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const aspect = width / height;
      const widestAxis = Math.max(aspect, 1 / aspect);
      maximumRadius = Math.sqrt(widestAxis * widestAxis + 1);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(pixelSizeLocation, DOT_CELL_SIZE * pixelRatio);
      gl.uniform1f(aspectLocation, aspect);
    };

    const drawFrame = (maskProgress: number) => {
      currentMaskProgress = maskProgress;
      const holeRadius = maximumRadius * (1 - maskProgress);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(holeRadiusLocation, holeRadius);
      gl.uniform1f(progressLocation, maskProgress);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const handleResize = () => {
      resizeCanvas();
      drawFrame(currentMaskProgress);
    };

    resizeCanvas();
    runtimeRef.current = { animationFrame: 0, drawFrame, updateOverlayColor };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      const runtime = runtimeRef.current;
      if (runtime) window.cancelAnimationFrame(runtime.animationFrame);
      runtimeRef.current = null;
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  useLayoutEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    window.cancelAnimationFrame(runtime.animationFrame);
    runtime.animationFrame = 0;
    runtime.updateOverlayColor();
    runtime.drawFrame(resolveTransitionMaskProgress(direction, 0));
    if (!active) return;

    let startTime: number | null = null;
    const animate = (time: number) => {
      startTime ??= time;
      const linearProgress = Math.min(1, (time - startTime) / durationMs);
      runtime.drawFrame(resolveTransitionMaskProgress(direction, easeEntryReveal(linearProgress)));

      if (linearProgress < 1) runtime.animationFrame = window.requestAnimationFrame(animate);
    };

    runtime.animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(runtime.animationFrame);
  }, [active, direction, durationMs]);

  return <canvas ref={canvasRef} className={className} />;
}
