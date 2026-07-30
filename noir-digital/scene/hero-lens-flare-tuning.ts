export interface LensFlareTuning {
  readonly gate: number;
  readonly hotspotPower: number;
  readonly intensity: number;
  readonly threshold: number;
}

const HERO_FLARE_TUNING: LensFlareTuning = {
  gate: 0.88,
  hotspotPower: 32,
  intensity: 0.7,
  threshold: 0.99,
};

const CONTACT_FLARE_TUNING: LensFlareTuning = {
  gate: 0.02,
  hotspotPower: 1,
  intensity: 1.35,
  threshold: 0.5,
};

export function resolveLensFlareTuning(contactVisible: boolean): LensFlareTuning {
  return contactVisible ? CONTACT_FLARE_TUNING : HERO_FLARE_TUNING;
}
