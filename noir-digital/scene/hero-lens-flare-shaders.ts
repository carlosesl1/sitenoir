export const HERO_POST_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

export const HERO_LENS_FLARE_FRAGMENT_SHADER = `
uniform sampler2D tDiffuse;
uniform sampler2D tEdgeSource;
uniform sampler2D tNoFlareMask;
uniform vec2 uResolution;
uniform float uEnabled;
uniform float uEdgeSourceEnabled;
uniform float uIntensity;
uniform float uThreshold;
uniform float uStreakScale;
uniform float uStreakJitter;
uniform float uHotspotPower;
uniform float uGate;
uniform float uStarRays;
uniform float uSpectrumMix;
uniform vec3 uTailColor;
varying vec2 vUv;

float luma(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

float brightMask(float luminance) {
  float value = max(luminance - uThreshold, 0.0);
  value /= max(1.0 - uThreshold, 0.00001);
  value = clamp(value, 0.0, 1.0);
  value = value * value * (3.0 - 2.0 * value);
  if (uHotspotPower > 1.01) value = pow(value, max(uHotspotPower, 1.0));
  float gated = (value - clamp(uGate, 0.0, 1.0)) / max(1.0 - uGate, 0.00001);
  return value * clamp(gated, 0.0, 1.0);
}

vec3 sampleBright(vec2 uv) {
  float noFlareMask = texture2D(tNoFlareMask, uv).r;
  if (noFlareMask > 0.001) return vec3(0.0);
  vec3 color = texture2D(tDiffuse, uv).rgb;
  vec3 edgeSource = texture2D(tEdgeSource, uv).rgb * uEdgeSourceEnabled;
  color = max(color, edgeSource);
  return color * brightMask(luma(color));
}

vec3 hsvToRgb(vec3 color) {
  vec3 channel = abs(fract(color.xxx + vec3(0.0, 0.6666667, 0.3333333)) * 6.0 - 3.0);
  vec3 rgb = clamp(channel - 1.0, 0.0, 1.0);
  return color.z * mix(vec3(1.0), rgb, color.y);
}

vec3 resolveStreakRamp(float tail, float spectrumPosition) {
  vec3 baseRamp = mix(vec3(1.0), uTailColor, tail);
  float hue = mix(0.78, 0.0, spectrumPosition);
  vec3 spectrum = hsvToRgb(vec3(hue, 1.0, 1.0));
  vec3 spectrumRamp = pow(spectrum, vec3(1.8));
  return mix(baseRamp, spectrumRamp, clamp(uSpectrumMix, 0.0, 1.0));
}

vec3 streak(vec2 direction) {
  vec3 accumulated = vec3(0.0);
  vec2 pixel = floor(vUv * uResolution);
  float hash = fract(52.9829189 * fract(dot(pixel, vec2(0.06711056, 0.00583715))));
  float phase = step(0.5, hash) * 0.5 * clamp(uStreakJitter, 0.0, 1.0);
  for (int index = 1; index <= 8; index++) {
    float distanceFromCore = float(index) * 1.5 + phase;
    float weight = 1.0 / (1.0 + distanceFromCore * 0.22);
    weight *= weight;
    float tail = clamp(distanceFromCore / 8.0, 0.0, 1.0);
    tail = pow(tail, 0.5);
    float spectrumPosition = float(index - 1) / 7.0;
    vec3 ramp = resolveStreakRamp(tail, spectrumPosition);
    vec2 offset = direction * distanceFromCore;
    accumulated += sampleBright(vUv + offset) * weight * ramp;
    accumulated += sampleBright(vUv - offset) * weight * ramp;
  }
  return accumulated;
}

void main() {
  vec3 flare = vec3(0.0);
  if (uEnabled >= 0.5 && uIntensity > 0.0001) {
    vec3 base = texture2D(tDiffuse, vUv).rgb;
    vec2 pixelStep = (1.0 / max(uResolution, vec2(1.0))) * uStreakScale;
    float spectrumMix = clamp(uSpectrumMix, 0.0, 1.0);
    float coreStrength = mix(1.2, 0.08, spectrumMix);
    flare += base * brightMask(luma(base)) * coreStrength;
    if (uStarRays >= 7.5) {
      flare += streak(vec2(pixelStep.x, 0.0));
      flare += streak(vec2(0.0, pixelStep.y));
      flare += streak(vec2(pixelStep.x * 0.70710678, pixelStep.y * 0.70710678));
      flare += streak(vec2(pixelStep.x * 0.70710678, -pixelStep.y * 0.70710678));
    } else if (uStarRays >= 5.5) {
      flare += streak(vec2(0.0, pixelStep.y));
      flare += streak(vec2(pixelStep.x * 0.8660254, pixelStep.y * 0.5));
      flare += streak(vec2(pixelStep.x * 0.8660254, -pixelStep.y * 0.5));
    } else {
      flare += streak(vec2(pixelStep.x, 0.0));
      flare += streak(vec2(0.0, pixelStep.y));
    }
  }
  float intensityScale = mix(1.0, 0.72, clamp(uSpectrumMix, 0.0, 1.0));
  gl_FragColor = vec4(flare * (uIntensity * 0.75 * intensityScale), 1.0);
}
`;

export const HERO_LENS_COMPOSITE_FRAGMENT_SHADER = `
uniform sampler2D tBase;
uniform sampler2D tFlare;
uniform sampler2D tFluid;
uniform float uFluidStrength;
uniform vec2 uFluidPointer;
uniform float uFluidPresence;
uniform float uFluidAspect;
uniform vec3 uFluidColor;
uniform float uStainIntensity;
uniform float uStainRadius;
varying vec2 vUv;
void main() {
  vec3 fluid = texture2D(tFluid, vUv).rgb;
  vec2 displacedUv = clamp(vUv + fluid.rg * uFluidStrength * (0.35 + fluid.b), 0.0, 1.0);
  vec3 base = texture2D(tBase, displacedUv).rgb;
  vec3 flare = texture2D(tFlare, displacedUv).rgb;
  vec2 pointerDelta = vUv - uFluidPointer;
  pointerDelta.x *= uFluidAspect;
  float radius = max(uStainRadius, 0.0001);
  float pointerStain = exp(-dot(pointerDelta, pointerDelta) / (radius * radius));
  float trailStain = smoothstep(0.02, 0.65, fluid.b);
  float stain = max(pointerStain * uFluidPresence, trailStain);
  vec3 stainColor = uFluidColor * stain * uStainIntensity;
  gl_FragColor = vec4(base + flare + stainColor, 1.0);
  #include <colorspace_fragment>
}
`;
