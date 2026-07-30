export const SHATTER_FRAGMENT_SHADER = `
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform float uAmount;
uniform float uSpread;
uniform float uAngle;
uniform float uSkew;
uniform float uCellScale;
uniform vec2 uPos;
uniform vec2 uResolution;
uniform float uMixRadius;
uniform int uMixRadiusInvert;
uniform vec2 uMousePos;
uniform float uTrackMouse;
uniform float uRoundness;
uniform float uTime;

vec2 random2(vec2 point) {
  return fract(sin(vec2(
    dot(point, vec2(127.1, 311.7)),
    dot(point, vec2(269.5, 183.3))
  )) * 43758.5453);
}

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 skew = mix(vec2(1.0), vec2(1.0, 0.0), uSkew);
  vec2 position = (uv - uPos) * vec2(aspect, 1.0) * uCellScale * uAmount;
  position = position * rotate2d(uAngle * 6.28318530718) * skew;
  vec2 cell = floor(position);
  vec2 local = fract(position);
  float nearest = 15.0;
  float secondNearest = 15.0;
  vec2 nearestPoint = vec2(0.0);

  for (int row = -1; row <= 1; row++) {
    for (int column = -1; column <= 1; column++) {
      vec2 neighbor = vec2(float(column), float(row));
      vec2 point = random2(cell + neighbor);
      point = 0.5 + 0.5 * sin(5.0 + uTime * 0.2 + 6.2831 * point);
      float distanceToPoint = length(neighbor + point - local);
      if (distanceToPoint < nearest) {
        secondNearest = nearest;
        nearest = distanceToPoint;
        nearestPoint = point;
      } else if (distanceToPoint < secondNearest) {
        secondNearest = distanceToPoint;
      }
    }
  }

  vec2 offset = nearestPoint * 0.4 * uSpread - uSpread * 0.2;
  float cornerSoftness = smoothstep(
    0.0,
    max(0.0001, uRoundness) * 2.0,
    secondNearest - nearest
  );
  float edgeSoftness = smoothstep(0.0, max(0.0001, uRoundness), nearest) * cornerSoftness;
  offset *= edgeSoftness;
  vec2 mousePosition = uPos + mix(vec2(0.0), uMousePos - 0.5, uTrackMouse);
  float influence = max(
    0.0,
    1.0 - distance(uv * vec2(aspect, 1.0), mousePosition * vec2(aspect, 1.0))
      * 4.0 * (1.0 - uMixRadius)
  );
  if (uMixRadiusInvert == 1) influence = 1.0 - influence;
  influence = 1.0 - (1.0 - influence) * (1.0 - influence);
  gl_FragColor = texture2D(tInput, uv + offset * influence);
}
`;
