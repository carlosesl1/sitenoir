"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

import type { PrincipleProgressStage } from "@/components/principles/principles-progress";
import { useTheme } from "@/features/theme/ThemeProvider";

interface SceneBackgroundProps {
  readonly principleActive: boolean;
  readonly principleStage: PrincipleProgressStage;
}

function drawTechnicalGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  dark: boolean,
) {
  const inset = width < 768 ? 16 : 56;
  const column = (width - inset * 2) / 3;
  const rows = [height / 3, (height * 2) / 3];
  const columns = [inset, inset + column, inset + column * 2, width - inset];

  context.strokeStyle = dark ? "rgb(244 244 240 / 0.12)" : "rgb(3 3 3 / 0.12)";
  context.lineWidth = 1;
  context.beginPath();
  for (const x of columns) {
    context.moveTo(Math.round(x) + 0.5, 0);
    context.lineTo(Math.round(x) + 0.5, height);
  }
  for (const y of rows) {
    context.moveTo(0, Math.round(y) + 0.5);
    context.lineTo(width, Math.round(y) + 0.5);
  }
  context.stroke();

  const intersections = [0, ...rows, height];
  for (const x of columns) {
    for (const y of intersections) {
      context.beginPath();
      context.moveTo(x - 6, y + 0.5);
      context.lineTo(x + 6, y + 0.5);
      context.moveTo(x + 0.5, y - 6);
      context.lineTo(x + 0.5, y + 6);
      context.stroke();
    }
  }
}

function drawPaperAtmosphere(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = "#f1faf8";
  context.fillRect(0, 0, width, height);

  const wash = context.createLinearGradient(0, 0, width, height);
  wash.addColorStop(0, "rgb(226 243 250 / 0.72)");
  wash.addColorStop(0.3, "rgb(255 253 245 / 0.88)");
  wash.addColorStop(0.52, "rgb(225 243 250 / 0.62)");
  wash.addColorStop(0.76, "rgb(255 253 245 / 0.78)");
  wash.addColorStop(1, "rgb(225 243 250 / 0.66)");
  context.fillStyle = wash;
  context.fillRect(0, 0, width, height);
}

function drawDarkAtmosphere(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = "#030303";
  context.fillRect(0, 0, width, height);

  const cyanGlow = context.createRadialGradient(
    width * 0.18,
    height * 0.15,
    0,
    width * 0.18,
    height * 0.15,
    width * 0.72,
  );
  cyanGlow.addColorStop(0, "rgb(34 214 214 / 0.1)");
  cyanGlow.addColorStop(0.4, "rgb(47 128 255 / 0.045)");
  cyanGlow.addColorStop(1, "rgb(3 3 3 / 0)");
  context.fillStyle = cyanGlow;
  context.fillRect(0, 0, width, height);

  const violetGlow = context.createRadialGradient(
    width * 0.82,
    height * 0.76,
    0,
    width * 0.82,
    height * 0.76,
    width * 0.66,
  );
  violetGlow.addColorStop(0, "rgb(168 85 247 / 0.075)");
  violetGlow.addColorStop(0.5, "rgb(242 56 58 / 0.025)");
  violetGlow.addColorStop(1, "rgb(3 3 3 / 0)");
  context.fillStyle = violetGlow;
  context.fillRect(0, 0, width, height);

  const diagonalBeam = context.createLinearGradient(0, height, width, 0);
  diagonalBeam.addColorStop(0.25, "rgb(244 244 240 / 0)");
  diagonalBeam.addColorStop(0.48, "rgb(244 244 240 / 0.028)");
  diagonalBeam.addColorStop(0.58, "rgb(34 214 214 / 0.018)");
  diagonalBeam.addColorStop(0.78, "rgb(244 244 240 / 0)");
  context.fillStyle = diagonalBeam;
  context.fillRect(0, 0, width, height);

  const drawBeam = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    thickness: number,
    opacity: number,
    blur: number,
  ) => {
    context.save();
    context.filter = `blur(${blur}px)`;
    context.lineCap = "round";
    context.lineWidth = thickness;
    const beam = context.createLinearGradient(startX, startY, endX, endY);
    beam.addColorStop(0, "rgb(214 224 232 / 0)");
    beam.addColorStop(0.22, `rgb(214 224 232 / ${opacity})`);
    beam.addColorStop(0.74, `rgb(214 224 232 / ${opacity * 0.82})`);
    beam.addColorStop(1, "rgb(214 224 232 / 0)");
    context.strokeStyle = beam;
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
    context.restore();
  };

  if (width < 768) {
    drawBeam(-80, height * 0.64, width * 1.15, height * 1.04, 118, 0.38, 22);
    drawBeam(-40, height * 0.28, width * 0.98, height * 0.7, 28, 0.24, 10);
    drawBeam(width * 0.36, height * 0.34, width * 0.92, height * 0.68, 17, 0.18, 8);
  } else {
    drawBeam(width * 0.1, height * 0.24, width * 0.78, height * 1.02, 42, 0.32, 13);
    drawBeam(width * 0.42, height * 0.03, width * 0.96, height * 0.74, 28, 0.28, 10);
    drawBeam(width * 0.28, height * 0.48, width * 0.72, height * 0.98, 88, 0.31, 20);
    drawBeam(width * 0.63, height * 0.11, width * 0.94, height * 0.65, 22, 0.24, 9);
  }
}

function drawPositioningField(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = "#c9e7f3";
  context.fillRect(0, 0, width, height);
  const centerX = width / 2;
  const centerY = height / 2;
  context.strokeStyle = "rgb(255 255 255 / 0.34)";
  for (let index = 0; index < 22; index += 1) {
    const angle = (Math.PI * 2 * index) / 22;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + Math.cos(angle) * width, centerY + Math.sin(angle) * height);
    context.stroke();
  }
}

function drawDesignTunnel(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = "#030303";
  context.fillRect(0, 0, width, height);
  const centerX = width / 2;
  const centerY = height / 2;
  const colors = ["#22d6d6", "#2f80ff", "#a855f7"];
  for (let index = 0; index < 28; index += 1) {
    const angle = (Math.PI * 2 * index) / 28;
    context.strokeStyle = `${colors[index % colors.length]}8c`;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + Math.cos(angle) * width, centerY + Math.sin(angle) * height);
    context.stroke();
  }
}

export function SceneBackground({ principleActive, principleStage }: SceneBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(size.width));
    canvas.height = Math.max(1, Math.round(size.height));
    const context = canvas.getContext("2d");
    if (!context) return null;

    const dark = resolvedTheme === "dark";
    if (principleActive && principleStage === "positioning") {
      drawPositioningField(context, canvas.width, canvas.height);
    } else if (principleActive && principleStage === "design") {
      drawDesignTunnel(context, canvas.width, canvas.height);
    } else if (dark) {
      drawDarkAtmosphere(context, canvas.width, canvas.height);
    } else {
      drawPaperAtmosphere(context, canvas.width, canvas.height);
    }
    drawTechnicalGrid(context, canvas.width, canvas.height, dark);

    const nextTexture = new CanvasTexture(canvas);
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.minFilter = LinearFilter;
    nextTexture.magFilter = LinearFilter;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [principleActive, principleStage, resolvedTheme, size.height, size.width]);

  useEffect(() => {
    if (!texture) return;
    scene.background = texture;
    return () => {
      if (scene.background === texture) scene.background = null;
      texture.dispose();
    };
  }, [scene, texture]);

  return null;
}
