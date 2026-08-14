import { CubeTexture, SRGBColorSpace } from "three";

const FACE_SIZE = 128;
const LIGHTS_PER_FACE = 5;

function drawWhiteLight(context: CanvasRenderingContext2D, face: number, light: number): void {
  const x = ((face * 37 + light * 43 + 19) % 100) / 100;
  const y = ((face * 53 + light * 29 + 31) % 100) / 100;
  const radius = FACE_SIZE * (0.18 + ((face + light * 2) % 4) * 0.025);
  const gradient = context.createRadialGradient(
    x * FACE_SIZE,
    y * FACE_SIZE,
    0,
    x * FACE_SIZE,
    y * FACE_SIZE,
    radius,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.28, "rgba(255,255,255,0.92)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.24)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, FACE_SIZE, FACE_SIZE);
}

export function createPhysicalPrismEnvironment(): CubeTexture {
  const faces = Array.from({ length: 6 }, (_, face) => {
    const canvas = document.createElement("canvas");
    canvas.width = FACE_SIZE;
    canvas.height = FACE_SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Physical prism environment requires a 2D canvas context");
    context.fillStyle = "#000000";
    context.fillRect(0, 0, FACE_SIZE, FACE_SIZE);
    for (let light = 0; light < LIGHTS_PER_FACE; light += 1) {
      drawWhiteLight(context, face, light);
    }
    return canvas;
  });
  const texture = new CubeTexture(faces);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
