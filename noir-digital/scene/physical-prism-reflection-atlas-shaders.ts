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

  vec4 sampled = texture2D(uReflectionMap, localUv);
  float luminance = dot(sampled.rgb, vec3(0.2126, 0.7152, 0.0722));
  float saturation = max(max(sampled.r, sampled.g), sampled.b) - min(min(sampled.r, sampled.g), sampled.b);
  float coloredLight = smoothstep(uLuminanceStart, uLuminanceEnd, luminance);
  float chroma = smoothstep(uSaturationStart, uSaturationEnd, saturation);
  float facing = smoothstep(
    0.16,
    0.88,
    max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0)
  );
  float alpha = sampled.a * coloredLight * chroma * facing * uOpacity;

  if (alpha < 0.003) discard;
  gl_FragColor = vec4(clamp(sampled.rgb, 0.0, 1.0), alpha);
}
`;
