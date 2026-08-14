import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

import { PHYSICAL_PRISM_TEST_CONFIG } from "@/scene/physical-prism-test-config";

export function createPhysicalPrismOpticalCard(resolution: number): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Physical prism optical card requires a 2D canvas context");

  context.fillStyle = PHYSICAL_PRISM_TEST_CONFIG.backgroundColor;
  context.fillRect(0, 0, resolution, resolution);

  for (const region of PHYSICAL_PRISM_TEST_CONFIG.lightRegions) {
    const [centerX, centerY] = region.center;
    const [radiusX, radiusY] = region.radius;
    context.save();
    context.translate(centerX * resolution, (1 - centerY) * resolution);
    context.rotate(region.rotation);
    context.scale(radiusX * resolution, radiusY * resolution);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
    gradient.addColorStop(0, `rgba(255,255,255,${region.intensity})`);
    gradient.addColorStop(region.softness, `rgba(255,255,255,${region.intensity * 0.42})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, 1, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
