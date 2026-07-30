export const principleCursorVertexShader = `
varying vec3 vWorldNormal;
varying vec3 vEyeVector;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vEyeVector = normalize(worldPosition.xyz - cameraPosition);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const principleCursorFragmentShader = `
precision highp float;

varying vec3 vWorldNormal;
varying vec3 vEyeVector;
uniform float uProgress;
uniform float uScaleReveal;
uniform vec2 uResolution;
uniform vec3 uAccentColor;
uniform vec3 uStripeColorA;
uniform vec3 uStripeColorB;
uniform float uOpacity;
uniform vec3 uLight;
uniform float uShininess;
uniform float uDiffuseness;
uniform float uSpecularStrength;
uniform float uFresnelPower;
uniform float uFresnelStrength;
uniform vec3 uFresnelSideDir;

float hash21(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 hsv2rgb(vec3 color) {
  vec4 constants = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 point = abs(fract(color.xxx + constants.xyz) * 6.0 - constants.www);
  return color.z * mix(constants.xxx, clamp(point - constants.xxx, 0.0, 1.0), color.y);
}

vec3 sampleHyperspace(vec2 fragCoord) {
  float baseScale = max(1.0, min(uResolution.x, uResolution.y));
  vec2 point = (fragCoord * 2.0 - uResolution) / baseScale;
  float time = clamp(uProgress, 0.0, 2.0);
  float normalizedTime = clamp(time / 2.0, 0.0, 1.0);
  const float cellDensity = 100.0;
  vec2 polar = vec2(atan(point.y, point.x) / 3.0, length(point));
  float angleCoord = (6.0 - polar.x) * cellDensity;
  float angleId = floor(angleCoord) + 0.5;
  float angleCell = abs(fract(angleCoord) - 0.5);
  float radialCoord = (6.0 - polar.y) * cellDensity;
  float travel = smoothstep(0.0, 1.0, normalizedTime);
  float keepProbability = mix(0.18, 1.0, travel);
  float scrollSpeed = mix(0.7, 3.6, travel);
  float trailLength = mix(2.7, 0.975, travel);
  float raySequence = fract((angleId + 0.5) * 0.61803398875);
  float keepMask = 1.0 - smoothstep(keepProbability - 0.025, keepProbability + 0.025, raySequence);
  float phaseBase = (radialCoord * 0.02 + angleId * 0.4) * fract(angleId * 0.61);
  vec3 spark = max(
    1.0 - fract(vec3(7.0, 6.0, 4.0) * 0.02 + phaseBase + time * scrollSpeed) * trailLength,
    0.0
  );
  float channelMix = max(max(spark.r, spark.g), spark.b);
  float edge = max(fwidth(channelMix) * 1.5, 2.0 / max(uResolution.y, 1.0));
  float star = smoothstep(0.12 - edge, 0.12 + edge, channelMix);
  float thinEdge = max(fwidth(angleCell) * 1.5, 0.002);
  float thinMask = 1.0 - smoothstep(0.13 - thinEdge, 0.13 + thinEdge, angleCell);
  star *= thinMask * keepMask;
  float radialBoost = pow(smoothstep(0.1, 1.0, polar.y), 1.25);
  float intensity = mix(0.0, 6.5, normalizedTime * 1.2);
  float stripeBlend = hash21(vec2(angleId, 19.713));
  float stripeRed = stripeBlend * (100.0 / 255.0);
  float stripeGreen = mix(157.0 / 255.0, 195.0 / 255.0, stripeBlend);
  float stripeDelta = 1.0 - stripeRed;
  float stripeHue = (4.0 + (stripeRed - stripeGreen) / stripeDelta) / 6.0;
  const float hueBand = 0.07;
  vec3 hsv = vec3(stripeHue, stripeDelta, 1.0);
  float idHash = hash21(vec2(angleId, 6.18));
  float idHash2 = hash21(vec2(angleId, 91.7));
  float scrollPhase = time * scrollSpeed;
  float hueAnimation = sin(scrollPhase * 0.52 + angleId * 0.29 + idHash * 6.2831853) * (hueBand * 0.85);
  float hueStripe = (idHash - 0.5) * hueBand * 2.0;
  hsv.x = fract(hsv.x + hueStripe + hueAnimation);
  hsv.y = clamp(hsv.y * mix(0.96, 1.06, idHash2), 0.0, 1.0);
  hsv.z = clamp(hsv.z * mix(0.97, 1.05, idHash), 0.0, 1.0);
  vec3 sparkColor = hsv2rgb(hsv);
  sparkColor *= mix(0.78, 1.0, smoothstep(0.14, 0.5, channelMix));
  return intensity * radialBoost * sparkColor * star;
}

float fresnel(vec3 eyeDirection, vec3 normal, float power) {
  float fresnelFactor = abs(dot(eyeDirection, normal));
  return pow(1.0 - fresnelFactor, power);
}

float specular(
  vec3 light,
  vec3 normal,
  vec3 eyeDirection,
  float shininess,
  float diffuseness
) {
  vec3 lightVector = normalize(-light);
  vec3 halfVector = normalize(eyeDirection + lightVector);
  float normalDotLight = dot(normal, lightVector);
  float normalDotHalf = abs(dot(normal, halfVector));
  float diffuse = max(0.0, normalDotLight);
  float shine = pow(normalDotHalf, shininess);
  return shine + diffuse * diffuseness;
}

void main() {
  vec3 stripes = sampleHyperspace(gl_FragCoord.xy);
  float reveal = clamp(uScaleReveal, 0.0, 1.0);
  float stripeLuma = dot(stripes, vec3(0.299, 0.587, 0.114));
  float darken = smoothstep(0.0, 0.88, reveal);
  vec3 darkBase = mix(uAccentColor, vec3(0.0), darken);
  float gapMask = (1.0 - smoothstep(0.035, 0.12, stripeLuma)) * reveal;
  float crackGuard = 1.0 - smoothstep(0.68, 0.94, reveal);
  vec3 color = darkBase + stripes * reveal + uAccentColor * gapMask * 0.07 * crackGuard;

  vec3 normal = normalize(vWorldNormal);
  if (!gl_FrontFacing) normal = -normal;
  vec3 eyeDirection = normalize(vEyeVector);
  float glossMask = mix(1.0, smoothstep(0.1, 0.48, stripeLuma), reveal);
  float specularLight = specular(uLight, normal, eyeDirection, uShininess, uDiffuseness);
  color += specularLight * uSpecularStrength * glossMask;
  float fresnelLight = fresnel(eyeDirection, normal, uFresnelPower);
  float sideMask = smoothstep(-0.5, 0.5, dot(normal, normalize(uFresnelSideDir)));
  color += fresnelLight * sideMask * vec3(uFresnelStrength) * glossMask;

  float alpha = clamp(uOpacity, 0.0, 1.0);
  if (alpha <= 0.0001) discard;
  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
