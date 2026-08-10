import { HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG } from "@/scene/hero-canvas-ui-spectral-source-config";

export const HERO_CANVAS_UI_SPECTRAL_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

function toGlslFloat(value: number): string {
  return Number.isInteger(value) ? value.toFixed(1) : String(value);
}

const beamCalls = HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.beams
  .map(
    ({ angle, center, length, phase, strength, width }) =>
      `beam += spectralBeam(vUv, vec2(${toGlslFloat(center[0])}, ${toGlslFloat(center[1])}), ${toGlslFloat(angle)}, ${toGlslFloat(width)}, ${toGlslFloat(length)}, ${toGlslFloat(strength)}, ${toGlslFloat(phase)});`,
  )
  .join("\n");

export const HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uIntensity;
  varying vec2 vUv;

  vec3 prismSpectrum(float value) {
    float t = fract(value);
    return clamp(vec3(
      1.5 - abs(4.0 * t - 3.0),
      1.5 - abs(4.0 * t - 2.0),
      1.5 - abs(4.0 * t - 1.0)
    ), 0.0, 1.0);
  }

  vec4 spectralBeam(
    vec2 uv,
    vec2 center,
    float angle,
    float width,
    float beamLength,
    float strength,
    float phase
  ) {
    float cosine = cos(angle);
    float sine = sin(angle);
    vec2 point = uv - center;
    point = mat2(cosine, -sine, sine, cosine) * point;
    float longitudinal = 1.0 - smoothstep(beamLength * 0.72, beamLength, abs(point.x));
    float transverse = exp(-pow(abs(point.y) / width, 2.0));
    float mask = longitudinal * transverse * strength;
    vec3 color = prismSpectrum(point.y / max(width * 2.5, 0.0001) + 0.5 + phase);
    return vec4(color * mask, mask);
  }

  void main() {
    vec4 beam = vec4(0.0);
    ${beamCalls}
    gl_FragColor = vec4(beam.rgb * uIntensity, clamp(beam.a * uIntensity, 0.0, 1.0));
  }
`;
