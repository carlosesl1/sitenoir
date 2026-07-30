export const HERO_FLUID_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const HERO_FLUID_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tField;
  uniform vec2 uPointer;
  uniform vec2 uPointerDelta;
  uniform float uActive;
  uniform float uAspect;
  uniform float uDeltaTime;

  void main() {
    vec2 previousVelocity = texture2D(tField, vUv).rg;
    vec2 advectedUv = clamp(vUv - previousVelocity * uDeltaTime * 0.9, 0.0, 1.0);
    vec4 previous = texture2D(tField, advectedUv);
    vec2 velocity = previous.rg * exp(-2.8 * uDeltaTime);
    float density = previous.b * exp(-3.6 * uDeltaTime);
    vec2 offset = vUv - uPointer;
    offset.x *= uAspect;
    float splat = exp(-dot(offset, offset) * 280.0) * uActive;
    vec2 tangent = vec2(-offset.y, offset.x);
    velocity += uPointerDelta * splat * 18.0;
    velocity += tangent * splat * length(uPointerDelta) * 2.4;
    density = max(density, splat * min(length(uPointerDelta) * 24.0, 1.0));
    gl_FragColor = vec4(velocity, density, 1.0);
  }
`;
