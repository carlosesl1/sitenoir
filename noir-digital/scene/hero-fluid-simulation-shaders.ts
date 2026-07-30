export const FLUID_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

export const FLUID_CURL_SHADER = `
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
varying vec2 vUv;
void main() {
  float left = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
  float right = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
  float top = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
  float bottom = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
  gl_FragColor = vec4(0.5 * (right - left - top + bottom), 0.0, 0.0, 1.0);
}
`;

export const FLUID_VORTICITY_SHADER = `
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexelSize;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uPointerDelta;
uniform float uCurlStrength;
uniform float uSplatRadius;
uniform float uSplatForce;
varying vec2 vUv;
void main() {
  float left = abs(texture2D(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x);
  float right = abs(texture2D(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x);
  float top = abs(texture2D(uCurl, vUv + vec2(0.0, uTexelSize.y)).x);
  float bottom = abs(texture2D(uCurl, vUv - vec2(0.0, uTexelSize.y)).x);
  float center = texture2D(uCurl, vUv).x;
  vec2 force = vec2(top - bottom, right - left);
  float forceLength = length(force);
  force = forceLength > 0.0001 ? force / forceLength : vec2(0.0);
  force *= uCurlStrength * center;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy + force * 0.016;
  vec2 mouseUv = uPointer / max(uResolution, vec2(0.0001));
  vec2 difference = vUv - mouseUv;
  difference.x *= uResolution.x / max(uResolution.y, 0.0001);
  float pointerMask = exp(-dot(difference, difference) / max(uSplatRadius, 0.0001));
  velocity += (uPointerDelta / max(uResolution, vec2(0.0001))) * pointerMask * uSplatForce;
  gl_FragColor = vec4(clamp(velocity, vec2(-1000.0), vec2(1000.0)), 0.0, 1.0);
}
`;

export const FLUID_DIVERGENCE_SHADER = `
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
varying vec2 vUv;
void main() {
  float left = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
  float right = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
  float top = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
  float bottom = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
  gl_FragColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
}
`;

export const FLUID_CLEAR_SHADER = `
void main() { gl_FragColor = vec4(0.0); }
`;

export const FLUID_PRESSURE_SHADER = `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;
varying vec2 vUv;
void main() {
  float left = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float right = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float top = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float bottom = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float divergence = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((left + right + top + bottom - divergence) * 0.25, 0.0, 0.0, 1.0);
}
`;

export const FLUID_GRADIENT_SHADER = `
uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 uTexelSize;
varying vec2 vUv;
void main() {
  float left = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float right = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float top = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float bottom = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity -= vec2(right - left, top - bottom);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

export const FLUID_ADVECT_SHADER = `
uniform sampler2D uProjectedVelocity;
uniform vec2 uTexelSize;
uniform float uDissipation;
varying vec2 vUv;
void main() {
  vec2 velocity = texture2D(uProjectedVelocity, vUv).xy;
  vec2 coordinate = clamp(vUv - velocity * uTexelSize * 0.016, 0.0, 1.0);
  vec2 advected = texture2D(uProjectedVelocity, coordinate).xy;
  advected /= 1.0 + uDissipation * 0.016;
  gl_FragColor = vec4(advected, 0.0, 1.0);
}
`;
