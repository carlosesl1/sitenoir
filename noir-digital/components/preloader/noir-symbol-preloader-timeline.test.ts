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

  it("completes the accelerated sequence at exactly 1400ms", () => {
    expect(NOIR_SYMBOL_DURATION_MS).toBe(1_400);
    expect(resolveNoirSymbolFrame(0).phase).toBe("void");
    expect(resolveNoirSymbolFrame(160).phase).toBe("pulse");
    expect(resolveNoirSymbolFrame(420).phase).toBe("flight");
    expect(resolveNoirSymbolFrame(760).phase).toBe("draw");
    expect(resolveNoirSymbolFrame(1_140).phase).toBe("ignite");
    expect(resolveNoirSymbolFrame(1_400)).toMatchObject({
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
    expect(resolveNoirSymbolFrame(9_000)).toEqual(resolveNoirSymbolFrame(1_400));
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
