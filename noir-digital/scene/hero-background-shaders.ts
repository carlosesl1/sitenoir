export const FULLSCREEN_VERTEX_SHADER = `
precision mediump float;
precision mediump int;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const VIGNETTE_FRAGMENT_SHADER = `
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform float uRadius;
uniform float uFalloff;
uniform float uSkew;
uniform float uAngle;
uniform float uEdgeIntensity;
uniform vec3 uVignetteColor;
uniform vec3 uClearColor;
uniform vec2 uPos;
uniform vec2 uResolution;
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
void main() {
  vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 skew = vec2(uSkew, 1.0 - uSkew);
  float halfRadius = uRadius * 0.5;
  float innerEdge = halfRadius - uFalloff * halfRadius * 0.5;
  float outerEdge = halfRadius + uFalloff * halfRadius * 0.5;
  vec2 scaledUV = vUv * aspectRatio * rot(uAngle * 6.28318530718) * skew;
  vec2 scaledPos = uPos * aspectRatio * rot(uAngle * 6.28318530718) * skew;
  float falloff = smoothstep(innerEdge, outerEdge, distance(scaledUV, scaledPos));
  float brighten = max(uEdgeIntensity, 0.0);
  float darken = max(-uEdgeIntensity, 0.0);
  falloff = mix(falloff, 0.0, brighten);
  falloff = mix(falloff, 1.0, darken);
  gl_FragColor = vec4(mix(uClearColor, uVignetteColor, falloff), falloff);
}
`;

export const SWIRL_FRAGMENT_SHADER = `
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform vec2 uResolution;
uniform vec2 uPos;
uniform float uRadius;
uniform float uAngle;
uniform float uPhase;
uniform float uTime;
uniform float uMix;
void main() {
  vec2 uv = vUv;
  vec2 originalUV = uv;
  uv -= uPos;
  vec2 radial = vec2(uv.x * uResolution.x / uResolution.y, uv.y);
  float distanceToCenter = length(radial);
  if (distanceToCenter <= uRadius) {
    float rotation = atan(radial.y, radial.x) + uAngle * 10.0 * smoothstep(uRadius, 0.0, distanceToCenter);
    uv = vec2(
      cos(rotation + uTime / 20.0 + uPhase * 6.28318530718),
      sin(rotation + uTime / 20.0 + uPhase * 6.28318530718)
    );
    uv = distanceToCenter * uv + uPos;
  }
  float edge = smoothstep(0.0, uRadius, distanceToCenter);
  gl_FragColor = texture2D(tInput, mix(vUv, mix(uv, originalUV, edge), uMix));
}
`;

export const SINE_FRAGMENT_SHADER = `
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform vec2 uResolution;
uniform vec2 uPos;
uniform vec2 uMousePos;
uniform float uMixRadius;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uRotation;
uniform float uTime;
void main() {
  vec2 uv = vUv;
  vec2 waveCoord = vUv * 2.0 - 1.0;
  float frequency = 20.0 * uFrequency;
  float amplitude = uAmplitude * 0.2;
  float waveX = sin((waveCoord.y + uPos.y) * frequency + uTime * 0.25) * amplitude;
  float waveY = sin((waveCoord.x - uPos.x) * frequency + uTime * 0.25) * amplitude;
  waveCoord += vec2(mix(waveX, 0.0, uRotation), mix(0.0, waveY, uRotation));
  vec2 finalUV = waveCoord * 0.5 + 0.5;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 mousePosition = uPos + (uMousePos - 0.5);
  float influence = max(
    0.0,
    1.0 - distance(uv * vec2(aspectRatio, 1.0), mousePosition * vec2(aspectRatio, 1.0)) * 4.0 * (1.0 - uMixRadius)
  );
  gl_FragColor = texture2D(tInput, mix(uv, finalUV, influence));
}
`;

export const BOKEH_FRAGMENT_SHADER = `
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D tBlueNoise;
uniform vec2 uResolution;
uniform vec2 uBlueNoiseResolution;
uniform vec2 uPos;
uniform vec2 uMousePos;
uniform float uTrackMouse;
uniform float uAmount;
uniform float uTilt;
#define PI2 6.28318530718
#define ITERATIONS 32.0
#define GOLDEN_ANGLE 2.39996323
vec2 sampleDisk(float theta, inout float radius) {
  radius += 1.0 / radius;
  return (radius - 1.0) * vec2(cos(theta), sin(theta));
}
float blueNoiseOffset(vec2 point) {
  vec2 uv = fract(point * (uResolution / uBlueNoiseResolution) * vec2(uBlueNoiseResolution.x / uBlueNoiseResolution.y, 1.0));
  return mod((texture2D(tBlueNoise, uv).r - 0.5) * PI2, PI2);
}
vec4 bokeh(vec2 uv, float blurRadius) {
  vec3 accumulatedColor = vec3(0.0);
  vec3 accumulatedWeights = vec3(0.0);
  float accumulatedAlpha = 0.0;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 basePixelSize = vec2(1.0 / aspectRatio, 1.0) * 0.003;
  float radius = 1.0;
  float noiseOffset = (blueNoiseOffset(uv) - 0.5) * 0.01;
  float noiseAngle = noiseOffset * PI2;
  mat2 rotation = mat2(cos(noiseAngle), -sin(noiseAngle), sin(noiseAngle), cos(noiseAngle));
  for (float angle = 0.0; angle < GOLDEN_ANGLE * ITERATIONS; angle += GOLDEN_ANGLE) {
    vec2 offset = sampleDisk(angle, radius) * basePixelSize * blurRadius;
    offset *= 1.0 + 0.05 * (sin(angle * 0.1) * 0.5 + 0.5) * sin(angle * 0.7 + noiseOffset);
    vec4 colorSample = texture2D(tInput, uv + rotation * offset);
    vec3 weight = vec3(5.0) + pow(colorSample.rgb, vec3(9.0)) * 150.0;
    accumulatedAlpha += colorSample.a;
    accumulatedColor += colorSample.rgb * weight;
    accumulatedWeights += weight;
  }
  return vec4(accumulatedColor / accumulatedWeights, accumulatedAlpha / ITERATIONS);
}
void main() {
  if (uAmount == 0.0) { gl_FragColor = vec4(0.0); return; }
  vec2 position = uPos + mix(vec2(0.0), uMousePos - 0.5, uTrackMouse);
  float distanceToPointer = distance(vUv, position) * 1000.0;
  float tilt = mix(1.0 - distanceToPointer * 0.001, distanceToPointer * 0.001, uTilt);
  gl_FragColor = bokeh(vUv, uAmount * tilt);
}
`;

export const OUTPUT_FRAGMENT_SHADER = `
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform vec3 uBgColor;
uniform vec3 uOutputColor;
uniform float uOutputMix;
vec3 overlay(vec3 base, vec3 blend) {
  return mix(
    2.0 * base * blend,
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    step(0.5, base)
  );
}
void main() {
  vec3 backgroundTexture = vec3(1.0);
  vec3 base = mix(uBgColor, overlay(uBgColor, backgroundTexture), 0.61);
  vec3 inputColor = texture2D(tInput, vUv).rgb;
  vec3 tint = uOutputColor * 0.35;
  vec3 blend = clamp(inputColor + tint, 0.0, 1.0);
  float darkScene = 1.0 - smoothstep(
    0.08,
    0.32,
    dot(uBgColor, vec3(0.2126, 0.7152, 0.0722))
  );
  float sourceLum = dot(inputColor, vec3(0.2126, 0.7152, 0.0722));
  float darkPattern = (1.0 - smoothstep(0.0, 0.2, sourceLum))
    * darkScene * clamp(uOutputMix, 0.0, 1.0);
  darkPattern = darkPattern * darkPattern * (3.0 - 2.0 * darkPattern);
  vec3 finalColor = base * mix(vec3(1.0), blend, clamp(uOutputMix, 0.0, 1.0));
  vec3 invertedDark = clamp(base + uOutputColor * (0.26 * darkPattern), 0.0, 1.0);
  finalColor = mix(finalColor, invertedDark, darkScene);
  gl_FragColor = vec4(finalColor, 1.0);
  #include <colorspace_fragment>
}
`;
