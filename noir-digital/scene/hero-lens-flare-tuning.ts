export interface LensFlareTuning {
  readonly gate: number;
  readonly hotspotPower: number;
  readonly intensity: number;
  readonly spectrumMix: number;
  readonly streakJitter: number;
  readonly streakScale: number;
  readonly threshold: number;
}

const HERO_FLARE_TUNING: LensFlareTuning = {
  gate: 0.88,
  hotspotPower: 32,
  intensity: 0.7,
  spectrumMix: 1,
  streakJitter: 1,
  streakScale: 1,
  threshold: 0.99,
};

const CONTACT_FLARE_TUNING: LensFlareTuning = {
  gate: 0.08,
  hotspotPower: 1.4,
  intensity: 0.65,
  spectrumMix: 0.42,
  streakJitter: 0.12,
  streakScale: 0.55,
  threshold: 0.68,
};

export function resolveLensFlareTuning(contactVisible: boolean): LensFlareTuning {
  return contactVisible ? CONTACT_FLARE_TUNING : HERO_FLARE_TUNING;
}
