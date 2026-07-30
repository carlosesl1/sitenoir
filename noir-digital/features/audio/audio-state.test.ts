import { describe, expect, it } from "vitest";

import { toggleSound } from "@/features/audio/audio-state";

describe("toggleSound", () => {
  it("toggles between on and off", () => {
    expect(toggleSound("on")).toBe("off");
    expect(toggleSound("off")).toBe("on");
  });
});
