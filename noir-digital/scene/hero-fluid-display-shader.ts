export const HERO_EFFECT_COMPOSITE_FRAGMENT_SHADER = `
uniform sampler2D tBase;
uniform sampler2D tFlare;
uniform sampler2D uVelocity;
uniform vec2 uSimSize;
uniform float uDisplacementStrength;
uniform float uChromaticBoost;
uniform float uEffectEnabled;
uniform float uFlareEnabled;
uniform vec2 uTrail[16];
uniform float uTrailStrength[16];
uniform float uTrailCount;
uniform vec3 uPointerColor;
uniform float uPointerOpacity;
uniform float uPointerDotRadius;
uniform float uPointerPixelSize;
uniform vec2 uResolution;
uniform float uDevicePixelRatio;
varying vec2 vUv;

vec3 spectrum(float value) {
  return cos((value - vec3(0.0, 0.5, 1.0)) * vec3(0.6, 1.0, 0.5) * 3.14);
}

vec4 getFluidDisplayColor(vec2 uv) {
  vec2 velocity = texture2D(uVelocity, uv).xy;
  float enabled = step(0.5, uEffectEnabled);
  vec2 displacement = velocity / max(uSimSize, vec2(1.0)) * uDisplacementStrength * enabled;
  float velocityMagnitude = length(displacement);
  vec4 color = vec4(0.0);
  vec3 weightSum = vec3(0.0);
  for (int index = 0; index < 4; index++) {
    float sampleProgress = float(index) / 3.0;
    vec3 weight = max(
      vec3(0.0),
      cos((sampleProgress - vec3(0.0, 0.5, 1.0)) * 3.14159 * 0.5)
    );
    vec2 sampleUv = clamp(
      uv - displacement * 0.3 * (sampleProgress + 0.3) * velocityMagnitude,
      0.0,
      1.0
    );
    vec4 sampleColor = texture2D(tBase, sampleUv);
    color.rgb += sampleColor.rgb * weight;
    color.a += sampleColor.a * (weight.r + weight.g + weight.b) / 3.0;
    weightSum += weight;
  }
  color.rgb /= max(weightSum, vec3(0.0001));
  color.a /= max((weightSum.r + weightSum.g + weightSum.b) / 3.0, 0.0001);
  vec3 spectralHighlight = spectrum(sin(velocityMagnitude * 2.0) * 0.4 + 0.6);
  color.rgb += spectralHighlight * smoothstep(0.2, 0.8, velocityMagnitude)
    * 0.5 * uChromaticBoost * enabled;
  return color;
}

float cellEquals(vec2 firstCell, vec2 secondCell) {
  vec2 difference = abs(firstCell - secondCell);
  return 1.0 - step(0.5, max(difference.x, difference.y));
}

vec4 applyPointerOverlay(vec2 uv, vec4 baseColor) {
  float cssPixelSize = uPointerPixelSize * max(uDevicePixelRatio, 1.0);
  vec2 normalizedPixelSize = vec2(
    cssPixelSize / max(uResolution.x, 1.0),
    cssPixelSize / max(uResolution.y, 1.0)
  );
  vec2 safePixelSize = max(normalizedPixelSize, vec2(0.000001));
  vec2 cellId = floor(uv / safePixelSize);
  vec2 cellUv = fract(uv / safePixelSize);
  float highlight = 0.0;
  for (int index = 0; index < 16; index++) {
    float enabled = step(float(index), uTrailCount - 1.0);
    vec2 pointerCell = floor(uTrail[index] / safePixelSize);
    float weight = clamp(uTrailStrength[index], 0.0, 1.0);
    highlight = max(highlight, enabled * cellEquals(cellId, pointerCell) * weight);
  }
  float distanceToCenter = distance(cellUv, vec2(0.5));
  float antialias = fwidth(distanceToCenter) * 1.5;
  float circle = smoothstep(
    uPointerDotRadius,
    uPointerDotRadius - antialias,
    distanceToCenter
  );
  float alpha = circle * highlight * clamp(uPointerOpacity, 0.0, 1.0);
  baseColor.rgb = mix(baseColor.rgb, uPointerColor, alpha);
  return baseColor;
}

void main() {
  vec4 color = texture2D(tBase, vUv);
  if (uEffectEnabled >= 0.5) {
    color = getFluidDisplayColor(vUv);
  }
  if (uPointerOpacity > 0.0) {
    color = applyPointerOverlay(vUv, color);
  }
  if (uFlareEnabled >= 0.5) {
    color.rgb += texture2D(tFlare, vUv).rgb;
  }
  gl_FragColor = color;
  #include <colorspace_fragment>
}
`;
