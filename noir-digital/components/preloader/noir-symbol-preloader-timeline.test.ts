import { describe, expect, it } from "vitest";

import {
  NOIR_SYMBOL_DURATION_MS,
  NOIR_SYMBOL_FRONTS,
  resolveNoirSymbolFrame,
} from "@/components/preloader/noir-symbol-preloader-timeline";

describe("NOIR symbol preloader timeline", () => {
  it("uses the six approved origins", () => {
    expect(NOIR_SYMBOL_FRONTS.map((front) => front.name)).toEqual([
      "upper-right",
      "inner-lower",
      "lower-right",
      "top",
      "upper-left",
      "lower-left",
    ]);
  });

  it("completes the readable sequence at exactly 2600ms", () => {
    expect(NOIR_SYMBOL_DURATION_MS).toBe(2_600);
    expect(resolveNoirSymbolFrame(0).phase).toBe("void");
    expect(resolveNoirSymbolFrame(300).phase).toBe("pulse");
    expect(resolveNoirSymbolFrame(760).phase).toBe("flight");
    expect(resolveNoirSymbolFrame(1_400).phase).toBe("draw");
    expect(resolveNoirSymbolFrame(2_080).phase).toBe("ignite");
    expect(resolveNoirSymbolFrame(2_600)).toMatchObject({
      phase: "complete",
      complete: true,
      drawProgress: 1,
      fillOpacity: 1,
    });
  });

  it("stays clamped and deterministic at every boundary", () => {
    const sample = resolveNoirSymbolFrame(1_640);

    expect(sample).toEqual(resolveNoirSymbolFrame(1_640));
    expect(resolveNoirSymbolFrame(-500)).toEqual(resolveNoirSymbolFrame(0));
    expect(resolveNoirSymbolFrame(9_000)).toEqual(resolveNoirSymbolFrame(2_600));
    expect(
      [
        sample.heartOpacity,
        ...sample.flightProgress,
        sample.drawProgress,
        sample.ignitionProgress,
        sample.fillOpacity,
      ].every((value) => value >= 0 && value <= 1),
    ).toBe(true);
  });
});
