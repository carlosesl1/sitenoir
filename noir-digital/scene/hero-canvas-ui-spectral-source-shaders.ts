import {
  HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE,
  HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG,
  type HeroCanvasUiSpectralFragmentKind,
} from "@/scene/hero-canvas-ui-spectral-source-config";

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

function fragmentKindToGlsl(kind: HeroCanvasUiSpectralFragmentKind): string {
  if (kind === "lens") return "0.0";
  if (kind === "wedge") return "1.0";
  return "2.0";
}

const fragmentCalls = HERO_CANVAS_UI_SPECTRAL_SOURCE_CONFIG.fragments
  .map(
    ({ center, colorEnd, colorStart, kind, phase, size, skew, softness, strength }) =>
      `field += spectralFragment(vUv, vec2(${toGlslFloat(center[0])}, ${toGlslFloat(center[1])}), vec2(${toGlslFloat(size[0])}, ${toGlslFloat(size[1])}), ${toGlslFloat(HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE)}, ${fragmentKindToGlsl(kind)}, ${toGlslFloat(strength)}, ${toGlslFloat(softness)}, ${toGlslFloat(skew)}, ${toGlslFloat(phase)}, ${toGlslFloat(colorStart)}, ${toGlslFloat(colorEnd)});`,
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

  float maskEdge(float distanceValue, float softness) {
    float feather = mix(0.08, 0.38, softness);
    return 1.0 - smoothstep(1.0 - feather, 1.0, distanceValue);
  }

  float lensMask(vec2 point, float softness) {
    float distanceValue = length(point);
    float body = maskEdge(distanceValue, softness);
    float concentration = 0.72 + 0.28 * (1.0 - smoothstep(0.0, 0.75, distanceValue));
    return body * concentration;
  }

  float wedgeMask(vec2 point, float softness) {
    float axis = clamp(point.x * 0.5 + 0.5, 0.0, 1.0);
    float localWidth = mix(0.18, 1.0, smoothstep(0.0, 0.82, axis));
    float distanceValue = max(abs(point.x), abs(point.y) / max(localWidth, 0.001));
    float body = maskEdge(distanceValue, softness);
    float release = 1.0 - smoothstep(0.68, 1.0, axis);
    return body * mix(0.55, 1.0, axis) * release;
  }

  float glintMask(vec2 point, float softness) {
    float longitudinal = 1.0 - smoothstep(0.5, 1.0, abs(point.x));
    float transverse = 1.0 - smoothstep(0.22, 1.0, abs(point.y));
    float core = pow(max(longitudinal * transverse, 0.0), mix(1.8, 1.1, softness));
    return core;
  }

  vec4 spectralFragment(
    vec2 uv,
    vec2 center,
    vec2 size,
    float angle,
    float kind,
    float strength,
    float softness,
    float skew,
    float phase,
    float colorStart,
    float colorEnd
  ) {
    float cosine = cos(angle);
    float sine = sin(angle);
    vec2 point = uv - center;
    point = mat2(cosine, -sine, sine, cosine) * point;
    point /= max(size, vec2(0.0001));
    point.y -= point.x * skew;

    float mask = lensMask(point, softness);
    if (kind > 0.5 && kind < 1.5) mask = wedgeMask(point, softness);
    if (kind >= 1.5) mask = glintMask(point, softness);

    float transverse = clamp((0.72 - point.y) / 1.44 + phase * 0.05, 0.0, 1.0);
    float palettePosition = mix(colorStart, colorEnd, transverse);
    vec3 color = spectralPalette(palettePosition) * 2.2;
    float alpha = mask * strength;
    return vec4(color * alpha, alpha);
  }

  void main() {
    vec4 field = vec4(0.0);
    ${fragmentCalls}
    gl_FragColor = vec4(field.rgb * uIntensity, clamp(field.a * uIntensity, 0.0, 1.0));
  }
`;
