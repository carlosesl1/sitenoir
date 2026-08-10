import { describe, expect, it } from "vitest";

import {
  COMPARISON_VIEWPORT,
  comparisonFrameScale,
} from "@/components/glass-test/glass-comparison";

describe("glass comparison framing", () => {
  it("uses one desktop logical viewport for both homes", () => {
    expect(COMPARISON_VIEWPORT).toEqual({ width: 1440, height: 900 });
  });

  it("fits the logical viewport without enlarging it", () => {
    expect(comparisonFrameScale(720)).toBe(0.5);
    expect(comparisonFrameScale(1800)).toBe(1);
    expect(comparisonFrameScale(0)).toBe(0);
  });
});
