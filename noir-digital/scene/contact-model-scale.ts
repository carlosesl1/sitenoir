const ORIGINAL_CONTACT_HEIGHT = 0.48800151265045233;
const REPLACEMENT_CONTACT_HEIGHT = 390.2063298658468;

export const CONTACT_ASSET_PATH = "/assets/v1/model/contact-551d0148de55.glb";

export function resolveContactAssetScale(): number {
  return ORIGINAL_CONTACT_HEIGHT / REPLACEMENT_CONTACT_HEIGHT;
}
