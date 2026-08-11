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

  vec3 normalizeSpectrumColor(vec3 color) {
    return color / max(max(color.r, color.g), color.b);
  }

  vec3 spectralPalette(float position) {
    vec3 red = normalizeSpectrumColor(vec3(0.823529, 0.188235, 0.070588));
    vec3 yellow = normalizeSpectrumColor(vec3(0.988235, 0.901961, 0.035294));
    vec3 green = normalizeSpectrumColor(vec3(0.129412, 0.827451, 0.266667));
    vec3 blue = normalizeSpectrumColor(vec3(0.011765, 0.207843, 0.486275));
    float segment = clamp(position, 0.0, 1.0) * 3.0;

    if (segment < 1.0) {
      return mix(red, yellow, smoothstep(0.0, 1.0, segment));
    }
    if (segment < 2.0) {
      return mix(yellow, green, smoothstep(1.0, 2.0, segment));
    }
    return mix(green, blue, smoothstep(2.0, 3.0, segment));
  }

  vec3 dispersedSpectrum(float transversePosition, float phase) {
    float palettePosition = (1.15 - transversePosition) / 2.3 + phase * 0.05;
    vec3 paletteColor = spectralPalette(palettePosition);
    float whiteCore = exp(-pow(transversePosition * 6.0, 2.0));
    return mix(paletteColor, vec3(1.0), whiteCore * 0.72) * 2.2;
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
    float luminousTransverse = smoothstep(0.18, 0.72, transverse);
    float mask = longitudinal * luminousTransverse * strength;
    vec3 color = dispersedSpectrum(point.y / max(width, 0.0001), phase);
    return vec4(color * mask, mask);
  }

  void main() {
    vec4 beam = vec4(0.0);
    ${beamCalls}
    gl_FragColor = vec4(beam.rgb * uIntensity, clamp(beam.a * uIntensity, 0.0, 1.0));
  }
`;
