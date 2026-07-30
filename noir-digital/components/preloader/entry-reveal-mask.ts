const EASING_X1 = 0.66;
const EASING_X2 = 0.01;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}

function sampleCurveX(time: number) {
  const coefficientC = 3 * EASING_X1;
  const coefficientB = 3 * EASING_X2 - 6 * EASING_X1;
  const coefficientA = 1 - coefficientC - coefficientB;
  return ((coefficientA * time + coefficientB) * time + coefficientC) * time;
}

function sampleCurveDerivativeX(time: number) {
  const coefficientC = 3 * EASING_X1;
  const coefficientB = 3 * EASING_X2 - 6 * EASING_X1;
  const coefficientA = 1 - coefficientC - coefficientB;
  return (3 * coefficientA * time + 2 * coefficientB) * time + coefficientC;
}

function solveCurveTime(progress: number) {
  let time = progress;

  for (let iteration = 0; iteration < 8; iteration += 1) {
    const error = sampleCurveX(time) - progress;
    if (Math.abs(error) < 1e-7) return time;

    const derivative = sampleCurveDerivativeX(time);
    if (Math.abs(derivative) < 1e-7) break;
    time -= error / derivative;
  }

  let lower = 0;
  let upper = 1;
  time = progress;

  while (lower < upper) {
    const sampled = sampleCurveX(time);
    if (Math.abs(sampled - progress) < 1e-7) break;
    if (progress > sampled) lower = time;
    else upper = time;
    time = (upper + lower) / 2;
  }

  return time;
}

export function easeEntryReveal(progress: number) {
  const clamped = clamp01(progress);
  if (clamped === 0 || clamped === 1) return clamped;

  const time = solveCurveTime(clamped);
  return (-2 * time + 3) * time * time;
}

type EntryMaskAlphaOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  progress: number;
  feather?: number;
};

export function getEntryMaskAlpha({
  x,
  y,
  width,
  height,
  progress,
  feather = 0.8,
}: EntryMaskAlphaOptions) {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const aspect = safeWidth / safeHeight;
  const widestAxis = Math.max(aspect, 1 / aspect);
  const maximumRadius = Math.sqrt(widestAxis * widestAxis + 1);
  const clampedProgress = clamp01(progress);
  const holeRadius = maximumRadius * (1 - clampedProgress);

  let normalizedX = (x / safeWidth) * 2 - 1;
  let normalizedY = (y / safeHeight) * 2 - 1;
  if (aspect > 1) normalizedX *= aspect;
  else normalizedY /= Math.max(aspect, 0.0001);

  const distance = Math.hypot(normalizedX, normalizedY);
  const edge = Math.max(feather, holeRadius * 0.12);
  const alphaOutsideHole = smoothstep(holeRadius, holeRadius + edge, distance);
  const closingFill = smoothstep(0.92, 1, clampedProgress);

  return alphaOutsideHole * (1 - closingFill) + closingFill;
}
