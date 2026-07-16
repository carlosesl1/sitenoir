import {
  Box3,
  DataTexture,
  LinearFilter,
  Mesh,
  type Object3D,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  Vector3,
} from "three";

const TEXTURE_SIZE = 256;
const GLOW_RADIUS = 16;
const CHANNEL_SEAL_RADIUS = 20;
const MASK_PADDING = GLOW_RADIUS + CHANNEL_SEAL_RADIUS + 4;
const INFINITY = 1_000_000;
const DIAGONAL_DISTANCE = Math.SQRT2;

export interface ContactExternalGlowResource {
  readonly behindZ: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly height: number;
  readonly texture: DataTexture;
  readonly width: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}

function hsvToRgb(hue: number): readonly [number, number, number] {
  const phase = ((hue % 1) + 1) % 1;
  const sector = phase * 6;
  const channel = Math.floor(sector);
  const fraction = sector - channel;
  const low = 0.04;
  const rising = low + (1 - low) * fraction;
  const falling = 1 - (1 - low) * fraction;

  switch (channel % 6) {
    case 0:
      return [1, rising, low];
    case 1:
      return [falling, 1, low];
    case 2:
      return [low, 1, rising];
    case 3:
      return [low, falling, 1];
    case 4:
      return [rising, low, 1];
    default:
      return [1, low, falling];
  }
}

function classifyExterior(mask: Uint8Array, width: number, height: number): Uint8Array {
  const exterior = new Uint8Array(mask.length);
  const queue = new Int32Array(mask.length);
  let readIndex = 0;
  let writeIndex = 0;

  const enqueue = (index: number) => {
    if ((mask[index] ?? 1) !== 0 || (exterior[index] ?? 1) !== 0) return;
    exterior[index] = 1;
    queue[writeIndex] = index;
    writeIndex += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (readIndex < writeIndex) {
    const index = queue[readIndex] ?? 0;
    readIndex += 1;
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }

  return exterior;
}

export function fillEnclosedHoles(mask: Uint8Array, width: number, height: number): Uint8Array {
  const exterior = classifyExterior(mask, width, height);
  const filled = mask.slice();

  for (let index = 0; index < filled.length; index += 1) {
    if ((filled[index] ?? 0) === 0 && (exterior[index] ?? 0) === 0) filled[index] = 1;
  }

  return filled;
}

function buildIntegralImage(mask: Uint8Array, width: number, height: number): Uint32Array {
  const stride = width + 1;
  const integral = new Uint32Array(stride * (height + 1));

  for (let y = 0; y < height; y += 1) {
    let rowSum = 0;
    for (let x = 0; x < width; x += 1) {
      rowSum += mask[y * width + x] ?? 0;
      integral[(y + 1) * stride + x + 1] = rowSum + (integral[y * stride + x + 1] ?? 0);
    }
  }

  return integral;
}

function rectangleSum(
  integral: Uint32Array,
  width: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): number {
  const stride = width + 1;
  return (
    (integral[y1 * stride + x1] ?? 0) -
    (integral[y0 * stride + x1] ?? 0) -
    (integral[y1 * stride + x0] ?? 0) +
    (integral[y0 * stride + x0] ?? 0)
  );
}

function dilateMask(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const integral = buildIntegralImage(mask, width, height);
  const dilated = new Uint8Array(mask.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.max(0, x - radius);
      const y0 = Math.max(0, y - radius);
      const x1 = Math.min(width, x + radius + 1);
      const y1 = Math.min(height, y + radius + 1);
      if (rectangleSum(integral, width, x0, y0, x1, y1) > 0) {
        dilated[y * width + x] = 1;
      }
    }
  }

  return dilated;
}

function erodeMask(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const integral = buildIntegralImage(mask, width, height);
  const eroded = new Uint8Array(mask.length);
  const diameter = radius * 2 + 1;
  const requiredArea = diameter * diameter;

  for (let y = radius; y < height - radius; y += 1) {
    for (let x = radius; x < width - radius; x += 1) {
      const sum = rectangleSum(
        integral,
        width,
        x - radius,
        y - radius,
        x + radius + 1,
        y + radius + 1,
      );
      if (sum === requiredArea) eroded[y * width + x] = 1;
    }
  }

  return eroded;
}

export function closeMaskChannels(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number,
): Uint8Array {
  const safeRadius = Math.max(0, Math.floor(radius));
  if (safeRadius === 0) return mask.slice();
  return erodeMask(dilateMask(mask, width, height, safeRadius), width, height, safeRadius);
}

function resolveDistanceField(solid: Uint8Array, width: number, height: number): Float32Array {
  const distance = new Float32Array(solid.length);
  for (let index = 0; index < solid.length; index += 1) {
    distance[index] = (solid[index] ?? 0) === 1 ? 0 : INFINITY;
  }

  const read = (x: number, y: number): number => {
    if (x < 0 || x >= width || y < 0 || y >= height) return INFINITY;
    return distance[y * width + x] ?? INFINITY;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if ((distance[index] ?? 0) === 0) continue;
      distance[index] = Math.min(
        distance[index] ?? INFINITY,
        read(x - 1, y) + 1,
        read(x, y - 1) + 1,
        read(x - 1, y - 1) + DIAGONAL_DISTANCE,
        read(x + 1, y - 1) + DIAGONAL_DISTANCE,
      );
    }
  }

  for (let y = height - 1; y >= 0; y -= 1) {
    for (let x = width - 1; x >= 0; x -= 1) {
      const index = y * width + x;
      if ((distance[index] ?? 0) === 0) continue;
      distance[index] = Math.min(
        distance[index] ?? INFINITY,
        read(x + 1, y) + 1,
        read(x, y + 1) + 1,
        read(x + 1, y + 1) + DIAGONAL_DISTANCE,
        read(x - 1, y + 1) + DIAGONAL_DISTANCE,
      );
    }
  }

  return distance;
}

export function createExteriorGlowPixels(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number,
  channelSealRadius = 0,
): Uint8Array {
  const sealedMask = closeMaskChannels(mask, width, height, channelSealRadius);
  const solid = fillEnclosedHoles(sealedMask, width, height);
  const distance = resolveDistanceField(solid, width, height);
  const pixels = new Uint8Array(width * height * 4);
  const safeRadius = Math.max(1, radius);

  for (let index = 0; index < solid.length; index += 1) {
    if ((solid[index] ?? 0) === 1) continue;
    const pixelDistance = distance[index] ?? INFINITY;
    if (pixelDistance > safeRadius) continue;
    const progress = clamp01((pixelDistance - 1) / Math.max(1, safeRadius - 1));
    const hue = 0.78 * (1 - progress);
    const [red, green, blue] = hsvToRgb(hue);
    const alpha = (1 - smoothstep(0.38, 1, progress)) * 0.9;
    const output = index * 4;
    pixels[output] = Math.round(red * 255);
    pixels[output + 1] = Math.round(green * 255);
    pixels[output + 2] = Math.round(blue * 255);
    pixels[output + 3] = Math.round(alpha * 255);
  }

  return pixels;
}

function triangleEdge(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: number,
  py: number,
): number {
  return (px - ax) * (by - ay) - (py - ay) * (bx - ax);
}

function rasterizeTriangle(
  mask: Uint8Array,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): void {
  const area = triangleEdge(ax, ay, bx, by, cx, cy);
  if (Math.abs(area) < 0.00001) return;
  const minimumX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
  const maximumX = Math.min(TEXTURE_SIZE - 1, Math.ceil(Math.max(ax, bx, cx)));
  const minimumY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
  const maximumY = Math.min(TEXTURE_SIZE - 1, Math.ceil(Math.max(ay, by, cy)));
  const sign = area < 0 ? -1 : 1;

  for (let y = minimumY; y <= maximumY; y += 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const edge0 = triangleEdge(bx, by, cx, cy, px, py) * sign;
      const edge1 = triangleEdge(cx, cy, ax, ay, px, py) * sign;
      const edge2 = triangleEdge(ax, ay, bx, by, px, py) * sign;
      if (edge0 >= -0.001 && edge1 >= -0.001 && edge2 >= -0.001) {
        mask[y * TEXTURE_SIZE + x] = 1;
      }
    }
  }
}

export function createContactExternalGlow(root: Object3D): ContactExternalGlowResource {
  root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(root);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const width = Math.max(size.x, 0.0001);
  const height = Math.max(size.y, 0.0001);
  const available = TEXTURE_SIZE - MASK_PADDING * 2;
  const scale = available / Math.max(width, height);
  const projectedWidth = width * scale;
  const projectedHeight = height * scale;
  const offsetX = (TEXTURE_SIZE - projectedWidth) * 0.5;
  const offsetY = (TEXTURE_SIZE - projectedHeight) * 0.5;
  const mask = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE);
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();

  const projectX = (value: number) => offsetX + (value - bounds.min.x) * scale;
  const projectY = (value: number) => offsetY + (value - bounds.min.y) * scale;

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const position = object.geometry.getAttribute("position");
    if (!position) return;
    const index = object.geometry.index;
    const triangleCount = Math.floor((index?.count ?? position.count) / 3);

    for (let triangle = 0; triangle < triangleCount; triangle += 1) {
      const offset = triangle * 3;
      const indexA = index?.getX(offset) ?? offset;
      const indexB = index?.getX(offset + 1) ?? offset + 1;
      const indexC = index?.getX(offset + 2) ?? offset + 2;
      a.set(position.getX(indexA), position.getY(indexA), position.getZ(indexA)).applyMatrix4(
        object.matrixWorld,
      );
      b.set(position.getX(indexB), position.getY(indexB), position.getZ(indexB)).applyMatrix4(
        object.matrixWorld,
      );
      c.set(position.getX(indexC), position.getY(indexC), position.getZ(indexC)).applyMatrix4(
        object.matrixWorld,
      );
      rasterizeTriangle(
        mask,
        projectX(a.x),
        projectY(a.y),
        projectX(b.x),
        projectY(b.y),
        projectX(c.x),
        projectY(c.y),
      );
    }
  });

  const pixels = createExteriorGlowPixels(
    mask,
    TEXTURE_SIZE,
    TEXTURE_SIZE,
    GLOW_RADIUS,
    CHANNEL_SEAL_RADIUS,
  );
  const texture = new DataTexture(pixels, TEXTURE_SIZE, TEXTURE_SIZE, RGBAFormat, UnsignedByteType);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  const planeSize = TEXTURE_SIZE / scale;
  const depthOffset = Math.max(size.z * 0.035, planeSize * 0.0015);

  return {
    behindZ: bounds.min.z - depthOffset,
    centerX: center.x,
    centerY: center.y,
    height: planeSize,
    texture,
    width: planeSize,
  };
}
