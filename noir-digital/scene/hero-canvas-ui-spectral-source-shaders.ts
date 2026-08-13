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
    ({ angle, breakup, center, curve, length, phase, strength, widthEnd, widthMid, widthStart }) =>
      `beam += spectralBeam(vUv, vec2(${toGlslFloat(center[0])}, ${toGlslFloat(center[1])}), ${toGlslFloat(angle)}, ${toGlslFloat(length)}, ${toGlslFloat(widthStart)}, ${toGlslFloat(widthMid)}, ${toGlslFloat(widthEnd)}, ${toGlslFloat(curve)}, ${toGlslFloat(breakup)}, ${toGlslFloat(strength)}, ${toGlslFloat(phase)});`,
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
    float palettePosition = clamp((0.72 - transversePosition) / 1.44 + phase * 0.05, 0.0, 1.0);
    vec3 paletteColor = spectralPalette(palettePosition);
    return paletteColor * 2.2;
  }

  float streakWidth(float axisPosition, float widthStart, float widthMid, float widthEnd) {
    float firstHalf = smoothstep(0.0, 0.5, axisPosition);
    float secondHalf = smoothstep(0.5, 1.0, axisPosition);
    float opening = mix(widthStart, widthMid, firstHalf);
    return mix(opening, widthEnd, secondHalf);
  }

  float asymmetricEnvelope(float axisPosition) {
    float attack = smoothstep(0.0, 0.16, axisPosition);
    float release = 1.0 - smoothstep(0.7, 1.0, axisPosition);
    return attack * release;
  }

  float curvedCenterline(float axisPosition, float curve) {
    float centered = axisPosition - 0.5;
    return curve * (centered * centered * 4.0 - 0.35);
  }

  float breakupMask(float axisPosition, float phase, float breakup) {
    float broad = sin(axisPosition * 13.0 + phase * 17.0);
    float fine = sin(axisPosition * 29.0 - phase * 11.0);
    float variation = 0.5 + 0.32 * broad + 0.18 * fine;
    return mix(1.0, smoothstep(-0.15, 0.8, variation), breakup);
  }

  vec4 spectralBeam(
    vec2 uv,
    vec2 center,
    float angle,
    float beamLength,
    float widthStart,
    float widthMid,
    float widthEnd,
    float curve,
    float breakup,
    float strength,
    float phase
  ) {
    float cosine = cos(angle);
    float sine = sin(angle);
    vec2 point = uv - center;
    point = mat2(cosine, -sine, sine, cosine) * point;

    float axisPosition = point.x / max(beamLength * 2.0, 0.0001) + 0.5;
    float localWidth = streakWidth(axisPosition, widthStart, widthMid, widthEnd);
    float centerline = curvedCenterline(axisPosition, curve);
    float transversePosition = (point.y - centerline) / max(localWidth, 0.0001);

    float longitudinal = asymmetricEnvelope(axisPosition);
    float transverse = 1.0 - smoothstep(0.68, 1.08, abs(transversePosition));
    float caustic = pow(max(transverse, 0.0), 1.35);
    float irregularity = breakupMask(axisPosition, phase, breakup);
    float mask = longitudinal * caustic * irregularity * strength;

    vec3 color = dispersedSpectrum(transversePosition, phase);
    return vec4(color * mask, mask);
  }

  void main() {
    vec4 beam = vec4(0.0);
    ${beamCalls}
    gl_FragColor = vec4(beam.rgb * uIntensity, clamp(beam.a * uIntensity, 0.0, 1.0));
  }
`;
