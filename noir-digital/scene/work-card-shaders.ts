export const WORK_CARD_VERTEX_SHADER = `
uniform vec4 uDrawRect;
varying vec2 vUv;
void main() {
  vec2 screenUv = uDrawRect.xy + uv * uDrawRect.zw;
  vUv = screenUv;
  gl_Position = vec4(screenUv * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const WORK_CARD_FRAGMENT_SHADER = `
uniform sampler2D map;
uniform sampler2D mapHover;
uniform vec2 uBaseCoverScale;
uniform vec2 uHoverCoverScale;
uniform vec2 uDotCellSize;
uniform vec4 uHoverMetrics;
uniform vec4 uRect;
uniform float uCurlStrength;
uniform float uLayerOpacity;
uniform float uHoverRevealProgress;
varying vec2 vUv;

vec2 applyCurl(vec2 screenUv) {
  float centered = 2.0 * screenUv.y - 1.0;
  float profile = 1.0 - sqrt(max(0.0, 1.0 - centered * centered));
  float uvScale = 1.0 - profile * uCurlStrength;
  float distortedX = (screenUv.x - 0.5) * uvScale + 0.5;
  return vec2(distortedX, screenUv.y);
}

vec2 coverUv(vec2 uv, vec2 scale) {
  return clamp(0.5 + (uv - 0.5) * scale, 0.0, 1.0);
}

float hoverDotCoverage(vec2 screenUv) {
  float progress = clamp(uHoverRevealProgress, 0.0, 1.0);
  if (progress <= 0.0) return 0.0;
  vec2 local = (screenUv - uRect.xy) / uRect.zw;
  vec2 centered = local * 2.0 - 1.0;
  centered.x *= uHoverMetrics.x;
  float distanceToCenter = length(centered);
  float revealRadius = progress * (uHoverMetrics.y + uHoverMetrics.z);
  float growth = smoothstep(
    0.0,
    1.0,
    clamp((revealRadius - distanceToCenter) / uHoverMetrics.z, 0.0, 1.0)
  );
  vec2 cellUv = fract(screenUv / uDotCellSize);
  float squareDistance = max(abs(cellUv.x - 0.5), abs(cellUv.y - 0.5));
  float squareExtent = mix(0.0, 0.5, growth);
  float antialias = max(fwidth(squareDistance), 0.0001) * 1.5;
  if (squareExtent <= antialias) return 0.0;
  if (growth >= 0.999) return 1.0;
  return 1.0 - smoothstep(
    squareExtent - antialias,
    squareExtent + antialias,
    squareDistance
  );
}

float edgeMask(vec2 uv, vec2 antialias) {
  vec2 edgeDistance = min(uv, 1.0 - uv);
  return smoothstep(0.0, antialias.x, edgeDistance.x)
    * smoothstep(0.0, antialias.y, edgeDistance.y);
}

void main() {
  vec2 distortedScreenUv = applyCurl(vUv);
  vec2 localUv = (distortedScreenUv - uRect.xy) / uRect.zw;
  vec2 antialias = max(fwidth(localUv), vec2(0.00001));
  float hoverCoverage = hoverDotCoverage(vUv);
  vec4 baseColor = texture2D(map, coverUv(localUv, uBaseCoverScale));
  vec4 hoverColor = hoverCoverage < 0.001
    ? baseColor
    : texture2D(mapHover, coverUv(localUv, uHoverCoverScale));
  vec4 sourceColor = mix(baseColor, hoverColor, hoverCoverage);
  float alpha = sourceColor.a * edgeMask(localUv, antialias)
    * clamp(uLayerOpacity, 0.0, 1.0);
  if (alpha < 0.001) discard;
  gl_FragColor = vec4(sourceColor.rgb, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
