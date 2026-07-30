export const CONTACT_FLARE_LAYER = 11;

export function resolveFlareSourceLayer(contactVisible: boolean): number | null {
  return contactVisible ? CONTACT_FLARE_LAYER : null;
}
