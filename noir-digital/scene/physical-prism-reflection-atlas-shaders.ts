export const PHYSICAL_PRISM_REFLECTION_ATLAS_VERTEX_SHADER = /* glsl */ `
uniform vec2 uPlanarMin;
uniform vec2 uPlanarSize;

varying vec2 vPlanarUv;
varying vec3 vViewDirection;
varying vec3 vViewNormal;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vPlanarUv = (position.xy - uPlanarMin) / max(uPlanarSize, vec2(0.0001));
  vViewDirection = normalize(-viewPosition.xyz);
  vViewNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const PHYSICAL_PRISM_REFLECTION_ATLAS_FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uReflectionMap;
uniform float uLuminanceEnd;
uniform float uLuminanceStart;
uniform float uOpacity;
uniform float uOpticalBloom;
uniform float uOpticalDispersion;
uniform float uOpticalDispersionMix;
uniform float uOpticalSoftness;
uniform float uOpticalSoftnessRadius;
uniform vec2 uRegionMin;
uniform vec2 uRegionSize;
uniform float uSaturationEnd;
uniform float uSaturationStart;

varying vec2 vPlanarUv;
varying vec3 vViewDirection;
varying vec3 vViewNormal;

void main() {
  vec2 localUv = (vPlanarUv - uRegionMin) / max(uRegionSize, vec2(0.0001));
  if (
    localUv.x < 0.0 || localUv.x > 1.0 ||
    localUv.y < 0.0 || localUv.y > 1.0
  ) discard;

  float viewFacing = max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0);
  float facing = smoothstep(0.16, 0.88, viewFacing);
  vec2 dispersionDirection = normalize(vViewNormal.xy + vec2(0.21, -0.13));
  float dispersion = uOpticalDispersion * mix(0.58, 1.0, 1.0 - viewFacing);
  vec2 spectralOffset = dispersionDirection * dispersion;
  vec2 softnessOffset = vec2(uOpticalSoftnessRadius);

  vec4 sampled = texture2D(uReflectionMap, localUv);
  vec4 softenedPositive = texture2D(uReflectionMap, localUv + softnessOffset);
  vec4 softenedNegative = texture2D(uReflectionMap, localUv - softnessOffset);
  vec4 redSample = texture2D(uReflectionMap, localUv + spectralOffset);
  vec4 blueSample = texture2D(uReflectionMap, localUv - spectralOffset);
  vec4 softenedSample = sampled * 0.5 + (softenedPositive + softenedNegative) * 0.25;
  vec3 reflectedColor = mix(sampled.rgb, softenedSample.rgb, uOpticalSoftness);
  vec3 dispersedColor = vec3(redSample.r, reflectedColor.g, blueSample.b);
  float luminance = dot(reflectedColor, vec3(0.2126, 0.7152, 0.0722));
  float saturation = max(max(reflectedColor.r, reflectedColor.g), reflectedColor.b) - min(min(reflectedColor.r, reflectedColor.g), reflectedColor.b);
  float coloredLight = smoothstep(uLuminanceStart, uLuminanceEnd, luminance);
  float chroma = smoothstep(uSaturationStart, uSaturationEnd, saturation);
  float brightLight = smoothstep(0.38, 0.85, luminance);
  vec3 opticalColor = mix(reflectedColor, dispersedColor, uOpticalDispersionMix);
  opticalColor += dispersedColor * brightLight * uOpticalBloom;
  float opticalAlpha = max(sampled.a, max(redSample.a, blueSample.a) * 0.18);
  float alpha = opticalAlpha * coloredLight * chroma * facing * uOpacity;

  if (alpha < 0.003) discard;
  gl_FragColor = vec4(clamp(opticalColor, 0.0, 1.0), alpha);
}
`;
