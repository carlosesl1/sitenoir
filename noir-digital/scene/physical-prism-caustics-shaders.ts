import {
  PHYSICAL_PRISM_CAUSTICS_CONFIG as config,
  type PhysicalPrismCausticLobe,
} from "@/scene/physical-prism-caustics-config";

function formatFloat(value: number): string {
  return Number(value.toFixed(4)).toString();
}

function vectorFromHex(hex: string): string {
  const normalized = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) =>
    formatFloat(Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255),
  );

  return `vec3(${channels.join(", ")})`;
}

function serializeLobe(lobe: PhysicalPrismCausticLobe): string {
  return `field = max(field, warpedEllipse(uv, vec2(${formatFloat(lobe.center[0])}, ${formatFloat(lobe.center[1])}), vec2(${formatFloat(lobe.radius[0])}, ${formatFloat(lobe.radius[1])}), ${formatFloat(config.lightAngle + lobe.angleOffset)}, ${formatFloat(lobe.seed)}, ${formatFloat(lobe.softness)}) * ${formatFloat(lobe.strength)});`;
}

const serializedLobes = config.lobes.map(serializeLobe).join("\n  ");
const prismBlue = vectorFromHex(config.palette.blue);
const prismGreen = vectorFromHex(config.palette.green);
const prismYellow = vectorFromHex(config.palette.yellow);
const prismRed = vectorFromHex(config.palette.red);

export const PHYSICAL_PRISM_CAUSTICS_VERTEX_SHADER = /* glsl */ `
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

export const PHYSICAL_PRISM_CAUSTICS_FRAGMENT_SHADER = /* glsl */ `
uniform vec2 uLightDirection;
uniform float uIntensity;
uniform float uSeparation;
uniform float uSurfaceOpacity;
uniform float uTime;

varying vec2 vPlanarUv;
varying vec3 vViewDirection;
varying vec3 vViewNormal;

const vec3 PRISM_BLUE = ${prismBlue};
const vec3 PRISM_GREEN = ${prismGreen};
const vec3 PRISM_YELLOW = ${prismYellow};
const vec3 PRISM_RED = ${prismRed};

float hash21(vec2 point) {
  point = fract(point * vec2(123.34, 345.45));
  point += dot(point, point + 34.345);
  return fract(point.x * point.y);
}

float valueNoise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);

  float a = hash21(cell);
  float b = hash21(cell + vec2(1.0, 0.0));
  float c = hash21(cell + vec2(0.0, 1.0));
  float d = hash21(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
}

float warpedEllipse(
  vec2 uv,
  vec2 center,
  vec2 radius,
  float angle,
  float seed,
  float softness
) {
  vec2 point = uv - center;
  float sine = sin(angle);
  float cosine = cos(angle);
  point = mat2(cosine, -sine, sine, cosine) * point;

  float granularWarp = valueNoise(point * vec2(18.0, 31.0) + seed * 19.0) - 0.5;
  float rippleWarp = sin(point.x * 26.0 + point.y * 13.0 + seed * 42.0) * 0.045;
  float distanceToLobe = length(point / radius) + granularWarp * 0.16 + rippleWarp;
  float falloff = 1.0 - smoothstep(0.28, 1.0, distanceToLobe);

  return pow(max(falloff, 0.0), mix(1.75, 0.72, softness));
}

float causticField(vec2 uv) {
  float field = 0.0;
  ${serializedLobes}

  float grain = valueNoise(uv * vec2(34.0, 47.0) + vec2(uTime * 0.6, -uTime * 0.4));
  return clamp(field * mix(0.84, 1.0, grain), 0.0, 1.0);
}

vec3 prismPalette(float spectralPosition) {
  float position = clamp(spectralPosition, 0.0, 1.0);
  if (position < 0.3333) {
    return mix(PRISM_BLUE, PRISM_GREEN, position * 3.0);
  }
  if (position < 0.6667) {
    return mix(PRISM_GREEN, PRISM_YELLOW, (position - 0.3333) * 3.0);
  }
  return mix(PRISM_YELLOW, PRISM_RED, (position - 0.6667) * 3.0);
}

void main() {
  vec2 drift = vec2(uTime * 0.018, -uTime * 0.011);
  vec2 uv = vPlanarUv + drift;
  vec2 direction = normalize(uLightDirection);

  float blueField = causticField(uv - direction * uSeparation * 1.5);
  float greenField = causticField(uv - direction * uSeparation * 0.5);
  float yellowField = causticField(uv + direction * uSeparation * 0.5);
  float redField = causticField(uv + direction * uSeparation * 1.5);

  float blue = max(blueField - max(greenField, yellowField) * 0.38, 0.0);
  float green = max(greenField - max(blueField, yellowField) * 0.38, 0.0);
  float yellow = max(yellowField - max(greenField, redField) * 0.38, 0.0);
  float red = max(redField - max(yellowField, greenField) * 0.38, 0.0);
  float spectralStrength = max(max(blue, green), max(yellow, red));

  vec3 color =
    prismPalette(0.0) * blue +
    prismPalette(0.3334) * green +
    prismPalette(0.6667) * yellow +
    prismPalette(1.0) * red;
  color /= max(blue + green + yellow + red, 0.0001);

  float facing = smoothstep(
    0.16,
    0.88,
    max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0)
  );
  float alpha = spectralStrength * facing * uIntensity * uSurfaceOpacity;

  if (alpha < 0.003) discard;
  gl_FragColor = vec4(color, alpha);
}
`;
