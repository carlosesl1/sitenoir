export const NOIR_SYMBOL_DURATION_MS = 2_600;

export const NOIR_SYMBOL_FRONTS = [
  { name: "upper-right", contour: 0, seed: 0, end: 0.1344, x: 141.536, y: 58.991 },
  { name: "inner-lower", contour: 0, seed: 0.1344, end: 0.2575, x: 98.819, y: 152.065 },
  { name: "lower-right", contour: 0, seed: 0.2575, end: 0.4665, x: 163.843, y: 135.461 },
  { name: "top", contour: 0, seed: 0.4665, end: 0.554, x: 82.061, y: 0.001 },
  { name: "upper-left", contour: 0, seed: 0.554, end: 1, x: 17.485, y: 38.829 },
  { name: "lower-left", contour: 1, seed: 0, end: 1, x: 22.336, y: 145.566 },
] as const;

export type NoirSymbolPhase =
  | "void"
  | "pulse"
  | "flight"
  | "draw"
  | "ignite"
  | "settle"
  | "complete";

export interface NoirSymbolFrame {
  readonly phase: NoirSymbolPhase;
  readonly complete: boolean;
  readonly heartOpacity: number;
  readonly flightProgress: readonly number[];
  readonly drawProgress: number;
  readonly ignitionProgress: number;
  readonly fillOpacity: number;
}

const PULSE_START_MS = 100;
const PULSE_END_MS = 500;
const FLIGHT_START_MS = 500;
const FLIGHT_STAGGER_MS = 32;
const FLIGHT_DURATION_MS = 420;
const DRAW_START_MS = 1_080;
const DRAW_END_MS = 1_960;
const IGNITION_START_MS = 1_960;
const IGNITION_END_MS = 2_300;
const FILL_START_MS = 2_140;
const FILL_END_MS = 2_480;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smooth(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  function solveT(x: number): number {
    let t = x;

    for (let iteration = 0; iteration < 8; iteration += 1) {
      const derivative = sampleDerivativeX(t);
      if (Math.abs(derivative) < 1e-6) break;
      t -= (sampleX(t) - x) / derivative;
    }

    if (t >= 0 && t <= 1 && Math.abs(sampleX(t) - x) < 1e-4) return t;

    let low = 0;
    let high = 1;
    t = x;
    while (high - low >= 1e-6) {
      const sampled = sampleX(t);
      if (Math.abs(sampled - x) < 1e-4) return t;
      if (sampled < x) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return t;
  }

  return (value: number): number => {
    const x = clamp01(value);
    if (x === 0 || x === 1) return x;
    return clamp01(sampleY(solveT(x)));
  };
}

const drawEase = cubicBezier(0.7, 0.02, 0.16, 1);
const sweepEase = cubicBezier(0.6, 0.05, 0.25, 1);

function resolvePhase(elapsedMs: number): NoirSymbolPhase {
  if (elapsedMs >= NOIR_SYMBOL_DURATION_MS) return "complete";
  if (elapsedMs >= IGNITION_END_MS) return "settle";
  if (elapsedMs >= IGNITION_START_MS) return "ignite";
  if (elapsedMs >= DRAW_START_MS) return "draw";
  if (elapsedMs >= FLIGHT_START_MS) return "flight";
  if (elapsedMs >= PULSE_START_MS) return "pulse";
  return "void";
}

export function resolveNoirSymbolFrame(rawElapsedMs: number): NoirSymbolFrame {
  const elapsedMs = Math.min(NOIR_SYMBOL_DURATION_MS, Math.max(0, rawElapsedMs));
  const complete = elapsedMs >= NOIR_SYMBOL_DURATION_MS;
  const pulseProgress = clamp01((elapsedMs - PULSE_START_MS) / (PULSE_END_MS - PULSE_START_MS));
  const heartOpacity = Math.sin(Math.PI * pulseProgress) ** 0.8;
  const flightProgress = NOIR_SYMBOL_FRONTS.map((_, index) =>
    sweepEase((elapsedMs - FLIGHT_START_MS - index * FLIGHT_STAGGER_MS) / FLIGHT_DURATION_MS),
  );
  const drawProgress = drawEase((elapsedMs - DRAW_START_MS) / (DRAW_END_MS - DRAW_START_MS));
  const ignitionProgress = sweepEase(
    (elapsedMs - IGNITION_START_MS) / (IGNITION_END_MS - IGNITION_START_MS),
  );
  const fillOpacity = smooth((elapsedMs - FILL_START_MS) / (FILL_END_MS - FILL_START_MS));

  return {
    phase: resolvePhase(elapsedMs),
    complete,
    heartOpacity,
    flightProgress,
    drawProgress: complete ? 1 : drawProgress,
    ignitionProgress,
    fillOpacity: complete ? 1 : fillOpacity,
  };
}
