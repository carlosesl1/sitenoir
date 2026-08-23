const ORIGINAL_CONTACT_HEIGHT = 0.48800151265045233;
const PREVIOUS_CONTACT_SOURCE_HEIGHT = 390.2063298658468;
const ORIGINAL_CONTACT_DEPTH = 10.00316;
const REPLACEMENT_CONTACT_HEIGHT = 187.27878;
const REPLACEMENT_CONTACT_DEPTH = 11.00831;
const REFERENCE_DEPTH_SCALE = 3.98001451217401;

export const CONTACT_ASSET_PATH = "/assets/v1/model/contact-10b2fb07-meshopt.glb";

export function resolveContactAssetScale(): number {
  return ORIGINAL_CONTACT_HEIGHT / REPLACEMENT_CONTACT_HEIGHT;
}

export function resolveContactCanvasUiAssetScale(): number {
  return ORIGINAL_CONTACT_HEIGHT;
}

export function resolveContactCanvasUiGeometryScale(): number {
  return 1 / REPLACEMENT_CONTACT_HEIGHT;
}

export function resolveContactCanvasUiDepthScale(): number {
  const originalDepthRatio = ORIGINAL_CONTACT_DEPTH / PREVIOUS_CONTACT_SOURCE_HEIGHT;
  const replacementDepthRatio = REPLACEMENT_CONTACT_DEPTH / REPLACEMENT_CONTACT_HEIGHT;
  return REFERENCE_DEPTH_SCALE * (originalDepthRatio / replacementDepthRatio);
}
