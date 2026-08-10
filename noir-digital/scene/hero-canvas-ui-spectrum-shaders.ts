export const HERO_CANVAS_UI_SPECTRUM_VERTEX_SHADER = `
varying vec3 vLocalPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vLocalPosition = position;
  vWorldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER = `
uniform float uBandFrequency;
uniform float uBandSharpness;
uniform float uBandStrength;
uniform float uMaximumOpacity;
uniform float uRimPower;
uniform float uRimStrength;
uniform float uSaturation;

varying vec3 vLocalPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

vec3 saturateColor(vec3 color, float amount) {
  const vec3 weights = vec3(0.2125, 0.7154, 0.0721);
  return mix(vec3(dot(color, weights)), color, amount);
}

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float viewAlignment = abs(dot(normal, viewDirection));
  float grazing = clamp(1.0 - viewAlignment, 0.0, 1.0);
  float rim = pow(grazing, max(uRimPower, 0.0001)) * uRimStrength;

  float spectralCoordinate = vLocalPosition.x * 0.17
    + vLocalPosition.y * 0.11
    + dot(normal, vec3(0.23, 0.37, 0.17));
  float wave = 0.5 + 0.5 * sin(spectralCoordinate * uBandFrequency * 6.2831853);
  float bands = pow(max(wave, 0.0), max(uBandSharpness, 1.0));
  float faceVisibility = smoothstep(0.18, 0.92, viewAlignment);
  float bandLight = bands * faceVisibility * uBandStrength;

  vec3 palette = 0.5 + 0.5 * cos(
    6.2831853 * (spectralCoordinate + vec3(0.0, 0.3333, 0.6667))
  );
  vec3 color = saturateColor(palette, uSaturation) * (rim + bandLight);
  float alpha = clamp((rim + bandLight) * uMaximumOpacity, 0.0, uMaximumOpacity);

  gl_FragColor = vec4(max(color, vec3(0.0)), alpha);
}
`;
