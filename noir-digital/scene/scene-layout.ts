import type { PrincipleProgressStage } from "@/components/principles/principles-progress";

export type ViewportFamily = "mobile" | "tablet" | "desktop";
export type Vector3Tuple = readonly [number, number, number];

export interface ModelTransform {
  readonly position: Vector3Tuple;
  readonly rotation: Vector3Tuple;
  readonly scale: number;
}

export interface StickerTransform extends ModelTransform {
  readonly atlasTile: number;
  readonly contactPosition: Vector3Tuple;
  readonly heroPosition: Vector3Tuple;
  readonly id: string;
}

export interface SceneLayout {
  readonly hero: ModelTransform;
  readonly pointer: ModelTransform;
  readonly contact: ModelTransform;
  readonly stickers: readonly StickerTransform[];
}

export interface PrincipleSceneLayout {
  readonly stickerVisibility: number;
}

interface BaseSticker {
  readonly atlasTile: number;
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly rotation: Vector3Tuple;
  readonly scale: number;
}

const baseStickers = [
  {
    atlasTile: 0,
    id: "sticker-01",
    position: [-11, 7, -4],
    rotation: [8, -14, -9],
    scale: 1.06,
  },
  {
    atlasTile: 1,
    id: "sticker-02",
    position: [-7.8, 3.2, -3.5],
    rotation: [-7, 11, 13],
    scale: 1.11,
  },
  {
    atlasTile: 2,
    id: "sticker-03",
    position: [-3.6, 6.2, -5],
    rotation: [13, 7, -16],
    scale: 1.16,
  },
  {
    atlasTile: 3,
    id: "sticker-04",
    position: [0.4, 2.4, -4],
    rotation: [-11, -8, 19],
    scale: 1.21,
  },
  {
    atlasTile: 4,
    id: "sticker-05",
    position: [4.2, 7.4, -4.5],
    rotation: [17, 6, -22],
    scale: 1.26,
  },
  {
    atlasTile: 5,
    id: "sticker-06",
    position: [8.3, 3.7, -3.8],
    rotation: [-15, 18, 25],
    scale: 1.31,
  },
  {
    atlasTile: 6,
    id: "sticker-07",
    position: [11.2, 6.1, -5.2],
    rotation: [21, -17, -28],
    scale: 1.36,
  },
  {
    atlasTile: 7,
    id: "sticker-08",
    position: [-9.4, -4.6, -4.3],
    rotation: [-19, 15, 31],
    scale: 1.41,
  },
  {
    atlasTile: 8,
    id: "sticker-09",
    position: [-3.1, -6.8, -5.1],
    rotation: [23, -12, -34],
    scale: 1.46,
  },
  {
    atlasTile: 9,
    id: "sticker-10",
    position: [3.7, -5.4, -3.9],
    rotation: [-25, 21, 37],
    scale: 1.51,
  },
  {
    atlasTile: 10,
    id: "sticker-11",
    position: [9.8, -6.2, -4.8],
    rotation: [27, -23, -40],
    scale: 1.56,
  },
  {
    atlasTile: 11,
    id: "sticker-12",
    position: [0.8, -9.2, -4.4],
    rotation: [-18, 16, 24],
    scale: 1.48,
  },
] as const satisfies readonly BaseSticker[];

const mobileHeroPositions = [
  [-3.8, 4.8, -4],
  [-5.5, 2.8, -3.5],
  [-2.2, 5.7, -5],
  [3.6, 5.8, -4],
  [-4.5, 5.5, -4.5],
  [0.2, 5.6, -3.8],
  [3.8, 3.8, -5.2],
  [-3.5, 3.5, -4.3],
] as const satisfies readonly Vector3Tuple[];

const desktopHeroPositions = [
  [30, 18, -4],
  [-30, 1, -3.5],
  [-17, 12.5, -5],
  [30, 6, -4],
  [-30, 6, -4.5],
  [30, 18, -3.8],
  [0, 20, -5.2],
  [-30, -8, -4.3],
] as const satisfies readonly Vector3Tuple[];

function createStickerLayout(family: ViewportFamily): readonly StickerTransform[] {
  const horizontalScale = family === "mobile" ? 0.58 : family === "tablet" ? 0.82 : 1;
  const verticalScale = family === "mobile" ? 0.72 : family === "tablet" ? 0.88 : 1;
  const stickerScale = family === "mobile" ? 0.78 * 2.2 : (family === "tablet" ? 0.9 : 1) * 2.8;

  return baseStickers.map((sticker, index) => {
    const position: Vector3Tuple = [
      sticker.position[0] * horizontalScale,
      sticker.position[1] * verticalScale,
      sticker.position[2],
    ];
    const heroPosition =
      (family === "mobile" ? mobileHeroPositions[index] : desktopHeroPositions[index]) ?? position;

    return {
      atlasTile: sticker.atlasTile,
      contactPosition: position,
      heroPosition,
      id: sticker.id,
      position,
      rotation: sticker.rotation,
      scale: sticker.scale * stickerScale,
    };
  });
}

export const sceneLayouts = {
  mobile: {
    hero: { position: [-0.1, 0, 2], rotation: [0, 4, 0], scale: 8.1 },
    pointer: { position: [3.25, -1, -3], rotation: [0, 0, 0], scale: 0.032 },
    contact: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 10 },
    stickers: createStickerLayout("mobile"),
  },
  tablet: {
    hero: { position: [-0.1, 1.65, 2], rotation: [0, 4, 0], scale: 15.1 },
    pointer: { position: [5.8, -2.2, -3], rotation: [0, 0, 0], scale: 0.069 },
    contact: { position: [0, -1, 0], rotation: [0, 0, 0], scale: 17 },
    stickers: createStickerLayout("tablet"),
  },
  desktop: {
    hero: { position: [-0.1, 1.9, 2], rotation: [0, 4, 0], scale: 20.7 },
    pointer: { position: [9.2, -2.2, -3], rotation: [0, 0, 0], scale: 0.078 },
    contact: { position: [0, -0.1, 0], rotation: [0, 0, 0], scale: 19 },
    stickers: createStickerLayout("desktop"),
  },
} as const satisfies Readonly<Record<ViewportFamily, SceneLayout>>;

const SHORT_VIEWPORT_HEIGHT = 720;
const REFERENCE_VIEWPORT_HEIGHT = 515;
const SHORT_VIEWPORT_SCALE_BOOST = 1.05;
const SHORT_VIEWPORT_X_SHIFT = 6.4;
const SHORT_VIEWPORT_Y_LIFT = 8.5;

export function resolveHeroSceneLayout(width: number, height: number): ModelTransform {
  const family = resolveViewportFamily(width);
  const base = sceneLayouts[family].hero;
  if (family === "mobile" || height >= SHORT_VIEWPORT_HEIGHT) return base;

  const heightCompactness = Math.min(
    1,
    Math.max(
      0,
      (SHORT_VIEWPORT_HEIGHT - height) /
        (SHORT_VIEWPORT_HEIGHT - REFERENCE_VIEWPORT_HEIGHT),
    ),
  );
  const aspectRatio = width / Math.max(1, height);
  const aspectCompactness = Math.min(1, Math.max(0, (aspectRatio - 2.2) / 0.3));
  const compactness = Math.max(heightCompactness, aspectCompactness);

  return {
    position: [
      base.position[0] + SHORT_VIEWPORT_X_SHIFT * compactness,
      base.position[1] + SHORT_VIEWPORT_Y_LIFT * compactness,
      base.position[2],
    ],
    rotation: base.rotation,
    scale: base.scale * (1 + SHORT_VIEWPORT_SCALE_BOOST * compactness),
  };
}

export const principleSceneLayouts = {
  positioning: { stickerVisibility: 0 },
  design: { stickerVisibility: 0 },
  principles: { stickerVisibility: 0.9 },
  technology: { stickerVisibility: 0.35 },
} as const satisfies Readonly<Record<PrincipleProgressStage, PrincipleSceneLayout>>;

export function resolveViewportFamily(width: number): ViewportFamily {
  if (width < 768) return "mobile";
  if (width < 1280) return "tablet";
  return "desktop";
}
