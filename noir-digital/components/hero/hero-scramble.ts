export const HERO_SCRAMBLE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=?/<>[]{}";

export type ScrambleGlyphPhase = "hidden" | "primary" | "secondary" | "settled";

export interface ScrambleGlyphFrame {
  readonly glyph: string;
  readonly phase: ScrambleGlyphPhase;
}

export function resolveScrambleGlyph(
  finalGlyph: string,
  index: number,
  elapsedMs: number,
  letterDelayMs: number,
  frame: number,
): ScrambleGlyphFrame {
  if (/\s/u.test(finalGlyph)) return { glyph: finalGlyph, phase: "settled" };

  const glyphStartMs = index * letterDelayMs;
  const phaseDurationMs = letterDelayMs * 2;
  if (elapsedMs < glyphStartMs) return { glyph: finalGlyph, phase: "hidden" };

  const glyphElapsedMs = elapsedMs - glyphStartMs;
  if (glyphElapsedMs >= phaseDurationMs * 2) return { glyph: finalGlyph, phase: "settled" };

  const characterIndex = Math.abs(frame + index * 17) % HERO_SCRAMBLE_CHARACTERS.length;
  return {
    glyph: HERO_SCRAMBLE_CHARACTERS[characterIndex] ?? finalGlyph,
    phase: glyphElapsedMs < phaseDurationMs ? "primary" : "secondary",
  };
}

export function resolveScrambleTotalDuration(
  glyphCount: number,
  startDelayMs: number,
  letterDelayMs: number,
) {
  const staggerDurationMs = glyphCount > 0 ? (glyphCount - 1) * letterDelayMs : 0;
  return startDelayMs + staggerDurationMs + letterDelayMs * 4;
}
