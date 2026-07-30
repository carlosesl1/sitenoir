import { describe, expect, it } from "vitest";

import { STICKER_PLANE_SIZE } from "@/scene/sticker-rendering";

describe("sticker rendering", () => {
  it("uses the original two-unit particle plane", () => {
    expect(STICKER_PLANE_SIZE).toBe(2);
  });
});
