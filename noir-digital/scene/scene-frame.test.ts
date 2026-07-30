import { describe, expect, it } from "vitest";

import { resolveSceneFrameDelta } from "@/scene/scene-frame";

describe("scene frame delta", () => {
  it("caps the first frame after an idle or hidden interval", () => {
    expect(resolveSceneFrameDelta(0)).toBe(0);
    expect(resolveSceneFrameDelta(1 / 120)).toBe(1 / 120);
    expect(resolveSceneFrameDelta(5)).toBe(1 / 30);
  });
});
