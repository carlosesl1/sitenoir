import { describe, expect, it } from "vitest";

import {
  resolveStickerAtlasSource,
  STICKER_ATLAS_MOBILE_SOURCE,
  STICKER_ATLAS_SOURCE,
  STICKER_PLANE_SIZE,
} from "@/scene/sticker-rendering";

describe("sticker rendering", () => {
  it("uses the original two-unit particle plane", () => {
    expect(STICKER_PLANE_SIZE).toBe(2);
  });

  it("uses the smaller atlas only below the mobile breakpoint", () => {
    expect(resolveStickerAtlasSource(390)).toBe(STICKER_ATLAS_MOBILE_SOURCE);
    expect(resolveStickerAtlasSource(767)).toBe(STICKER_ATLAS_MOBILE_SOURCE);
    expect(resolveStickerAtlasSource(768)).toBe(STICKER_ATLAS_SOURCE);
  });
});
