// Small screen-space quads keep the analytic rays independent of the half-size
// extraction buffer. Widths are CSS pixels, with derivative-based coverage.
export const HERO_OPTICAL_FLARE_VERTEX_SHADER = /* glsl */ `
attribute vec2 aCenter;
attribute float aGain;
attribute float aRadius;
attribute vec2 aSpectrum;
uniform vec2 uViewport;
varying vec2 vOffset;
varying float vGain;
varying float vRadius;
varying vec2 vSpectrum;
void main() {
  vOffset = position.xy * 2.0 * aRadius;
  vGain = aGain;
  vRadius = aRadius;
  vSpectrum = aSpectrum;
  gl_Position = vec4(aCenter + vOffset * 2.0 / uViewport, 0.0, 1.0);
}
`;

export const HERO_OPTICAL_FLARE_FRAGMENT_SHADER = /* glsl */ `
varying vec2 vOffset;
varying float vGain;
varying float vRadius;
varying vec2 vSpectrum;

float filament(vec2 point, vec2 direction) {
  float along = abs(dot(point, direction));
  float across = dot(point, vec2(-direction.y, direction.x));
  // Integrate the subpixel core over the pixel footprint instead of snapping
  // positions or repeating discrete bright samples along a ray.
  float footprint = fwidth(across);
  float width = sqrt(0.10 + footprint * footprint * 0.16);
  float core = exp(-0.5 * across * across / (width * width)) * 0.32 / width;
  float halo = exp(-abs(across) / 1.65) * 0.10;
  float tail = exp(-along * 3.0 / vRadius);
  return (core + halo) * tail;
}

vec3 spectrum(float phase) {
  // All four colors coexist along the rays. Smooth spatial interpolation
  // joins purple, blue, green and red without a clock or per-anchor offsets.
  vec3 purple = vec3(0.40, 0.035, 1.0);
  vec3 blue = vec3(0.025, 0.18, 1.0);
  vec3 green = vec3(0.02, 0.85, 0.14);
  vec3 red = vec3(1.0, 0.025, 0.045);
  float segment = fract(phase) * 4.0;
  float blend = smoothstep(0.0, 1.0, fract(segment));
  if (segment < 1.0) return mix(purple, blue, blend);
  if (segment < 2.0) return mix(blue, green, blend);
  if (segment < 3.0) return mix(green, red, blend);
  return mix(red, purple, blend);
}

vec3 coloredFilament(vec2 point, vec2 direction, float phase) {
  float dispersion = dot(point, direction) / vRadius * 0.55;
  vec3 color = spectrum(vSpectrum.y + phase + dispersion);
  color = mix(vec3(1.0), color, smoothstep(1.0, 5.0, length(point)));
  return filament(point, direction) * color;
}

void main() {
  float distanceFromCore = length(vOffset);
  float edge = 1.0 - smoothstep(vRadius * 0.70, vRadius, distanceFromCore);
  float cosine = cos(vSpectrum.x);
  float sine = sin(vSpectrum.x);
  vec2 point = mat2(cosine, -sine, sine, cosine) * vOffset;
  vec3 rays = coloredFilament(point, vec2(0.0, 1.0), 0.0);
  rays += coloredFilament(point, vec2(0.8660254, 0.5), 0.3333333);
  rays += coloredFilament(point, vec2(0.8660254, -0.5), 0.6666667);
  float core = exp(-dot(vOffset, vOffset) / 2.0);
  float halo = exp(-distanceFromCore / 4.0) * 0.08;
  vec3 light = (rays * 0.88 + vec3(core * 0.7 + halo)) * edge * vGain;
  gl_FragColor = vec4(light, 1.0);
  #include <colorspace_fragment>
}
`;
