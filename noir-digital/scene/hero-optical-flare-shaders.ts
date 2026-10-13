// Small screen-space quads keep the analytic rays independent of the half-size
// extraction buffer. Widths are CSS pixels, with derivative-based coverage.
export const HERO_OPTICAL_FLARE_VERTEX_SHADER = /* glsl */ `
attribute vec2 aCenter;
attribute float aGain;
attribute float aRadius;
uniform vec2 uViewport;
varying vec2 vOffset;
varying float vGain;
varying float vRadius;
void main() {
  vOffset = position.xy * 2.0 * aRadius;
  vGain = aGain;
  vRadius = aRadius;
  gl_Position = vec4(aCenter + vOffset * 2.0 / uViewport, 0.0, 1.0);
}
`;

export const HERO_OPTICAL_FLARE_FRAGMENT_SHADER = /* glsl */ `
varying vec2 vOffset;
varying float vGain;
varying float vRadius;

float filament(vec2 point, vec2 direction) {
  float along = abs(dot(point, direction));
  float across = dot(point, vec2(-direction.y, direction.x));
  // Integrate the subpixel core over the pixel footprint instead of snapping
  // positions or repeating discrete bright samples along a ray.
  float footprint = fwidth(across);
  float width = sqrt(0.10 + footprint * footprint * 0.16);
  float core = exp(-0.5 * across * across / (width * width)) * 0.32 / width;
  float halo = exp(-abs(across) / 1.65) * 0.10;
  float tail = exp(-along * 3.6 / vRadius);
  return (core + halo) * tail;
}

void main() {
  float distanceFromCore = length(vOffset);
  float edge = 1.0 - smoothstep(vRadius * 0.70, vRadius, distanceFromCore);
  float rays = filament(vOffset, vec2(0.0, 1.0));
  rays += filament(vOffset, vec2(0.8660254, 0.5));
  rays += filament(vOffset, vec2(0.8660254, -0.5));
  float core = exp(-dot(vOffset, vOffset) / 2.0);
  float halo = exp(-distanceFromCore / 4.0) * 0.08;
  vec3 tailColor = mix(vec3(1.0), vec3(0.83, 0.90, 1.0),
    smoothstep(2.0, vRadius, distanceFromCore) * 0.25);
  vec3 light = (rays * 0.64 + core * 0.7 + halo) * tailColor * edge * vGain;
  gl_FragColor = vec4(light, 1.0);
  #include <colorspace_fragment>
}
`;
