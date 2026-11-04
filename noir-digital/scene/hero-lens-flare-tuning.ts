export interface LensFlareTuning {
  readonly gate: number;
  readonly hotspotPower: number;
  readonly intensity: number;
  readonly spectrumMix: number;
  readonly streakJitter: number;
  readonly streakScale: number;
  readonly threshold: number;
}

export const HERO_FLARE_TUNING: LensFlareTuning = {
  gate: 0.88,
  hotspotPower: 32,
  intensity: 0.7,
  spectrumMix: 1,
  streakJitter: 1,
  streakScale: 1,
  threshold: 0.99,
};
