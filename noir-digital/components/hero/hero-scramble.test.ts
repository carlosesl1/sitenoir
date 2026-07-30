import { describe, expect, it } from "vitest";

import {
  HERO_SCRAMBLE_CHARACTERS,
  resolveScrambleGlyph,
  resolveScrambleTotalDuration,
} from "@/components/hero/hero-scramble";

describe("hero scramble timing", () => {
  it("moves a glyph through hidden, two code phases, and its final value", () => {
    expect(resolveScrambleGlyph("A", 2, 159, 80, 0)).toEqual({ glyph: "A", phase: "hidden" });

    const primary = resolveScrambleGlyph("A", 2, 160, 80, 0);
    expect(primary.phase).toBe("primary");
    expect(HERO_SCRAMBLE_CHARACTERS).toContain(primary.glyph);

    const secondary = resolveScrambleGlyph("A", 2, 320, 80, 1);
    expect(secondary.phase).toBe("secondary");
    expect(HERO_SCRAMBLE_CHARACTERS).toContain(secondary.glyph);

    expect(resolveScrambleGlyph("A", 2, 480, 80, 2)).toEqual({
      glyph: "A",
      phase: "settled",
    });
  });

  it("preserves whitespace without decoding it", () => {
    expect(resolveScrambleGlyph(" ", 12, 0, 80, 0)).toEqual({
      glyph: " ",
      phase: "settled",
    });
  });

  it("matches the original staggered total duration", () => {
    expect(resolveScrambleTotalDuration(18, 300, 80)).toBe(1_980);
    expect(resolveScrambleTotalDuration(0, 300, 80)).toBe(620);
  });
});
