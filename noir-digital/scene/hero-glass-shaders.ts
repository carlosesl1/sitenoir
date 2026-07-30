export const HERO_GLASS_VERTEX_SHADER = `
varying vec3 worldNormal;
varying vec3 eyeVector;
varying float modelLocalY;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;
  worldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  eyeVector = normalize(worldPos.xyz - cameraPosition);
  modelLocalY = position.y;
}
`;

export const HERO_GLASS_FRAGMENT_SHADER = `
uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;
uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uFresnelPower;
uniform float uShininess;
uniform float uDiffuseness;
uniform vec3 uLight;
uniform float uBrightness;
uniform float uContrast;
uniform float uGamma;
uniform float uSpecularStrength;
uniform float uFresnelStrength;
uniform vec3 uFresnelSideDir;
uniform vec4 uTintColorA;
uniform vec4 uTintColorB;
uniform vec2 uTintLocalYRange;
uniform float uTintEnabled;
uniform float uTintMix;
uniform float uTintThicknessMinAlpha;
uniform float uTintThicknessMaxAlpha;
uniform vec2 uScreenResolutionPx;
uniform sampler2D uTexture;
uniform float uSceneRefractionEnabled;
uniform float uRgbRefraction;
uniform float uDark;
uniform vec3 uGlassBaseColor;
uniform float uGlassBaseStrength;
uniform int uLoop;
varying vec3 worldNormal;
varying vec3 eyeVector;
varying float modelLocalY;

float random(vec2 point) {
  return fract(sin(dot(point.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 saturation(vec3 rgb, float adjustment) {
  const vec3 weights = vec3(0.2125, 0.7154, 0.0721);
  return mix(vec3(dot(rgb, weights)), rgb, adjustment);
}

float fresnel(vec3 eyeDirection, vec3 normal, float power) {
  return pow(1.0 - abs(dot(eyeDirection, normal)), power);
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
  float diffuse = max(0.0, dot(normal, lightVector));
  float highlight = pow(abs(dot(normal, halfVector)), shininess);
  return highlight + diffuse * diffuseness;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uScreenResolutionPx.xy;
  vec3 normal = normalize(worldNormal);
  vec3 eyeDirection = normalize(eyeVector);
  vec3 color;

  if (uSceneRefractionEnabled > 0.5) {
    color = vec3(0.0);
    float noise = random(uv) * 0.025;

    if (uRgbRefraction > 0.5) {
      vec3 refractR = refract(eyeDirection, normal, 1.0 / uIorR);
      vec3 refractG = refract(eyeDirection, normal, 1.0 / uIorG);
      vec3 refractB = refract(eyeDirection, normal, 1.0 / uIorB);

      for (int index = 0; index < uLoop; index++) {
        float slide = float(index) / float(uLoop) * 0.1 + noise;
        float offset = (uRefractPower + slide) * uChromaticAberration;
        color.r += texture2D(uTexture, uv + refractR.xy * offset).r;
        color.g += texture2D(uTexture, uv + refractG.xy * offset).g;
        color.b += texture2D(uTexture, uv + refractB.xy * offset).b;
      }
    } else {
      vec3 refractR = refract(eyeDirection, normal, 1.0 / uIorR);
      vec3 refractY = refract(eyeDirection, normal, 1.0 / uIorY);
      vec3 refractG = refract(eyeDirection, normal, 1.0 / uIorG);
      vec3 refractC = refract(eyeDirection, normal, 1.0 / uIorC);
      vec3 refractB = refract(eyeDirection, normal, 1.0 / uIorB);
      vec3 refractP = refract(eyeDirection, normal, 1.0 / uIorP);

      for (int index = 0; index < uLoop; index++) {
        float slide = float(index) / float(uLoop) * 0.1 + noise;
        float offsetR = (uRefractPower + slide) * uChromaticAberration;
        float offsetY = (uRefractPower + slide) * uChromaticAberration;
        float offsetG = (uRefractPower + slide * 2.0) * uChromaticAberration;
        float offsetC = (uRefractPower + slide * 2.5) * uChromaticAberration;
        float offsetB = (uRefractPower + slide * 3.0) * uChromaticAberration;
        float offsetP = (uRefractPower + slide) * uChromaticAberration;
        float red = texture2D(uTexture, uv + refractR.xy * offsetR).r * 0.5;
        vec3 yellowSample = texture2D(uTexture, uv + refractY.xy * offsetY).rgb;
        float yellow = (yellowSample.r * 2.0 + yellowSample.g * 2.0 - yellowSample.b) / 6.0;
        float green = texture2D(uTexture, uv + refractG.xy * offsetG).g * 0.5;
        vec3 cyanSample = texture2D(uTexture, uv + refractC.xy * offsetC).rgb;
        float cyan = (cyanSample.g * 2.0 + cyanSample.b * 2.0 - cyanSample.r) / 6.0;
        float blue = texture2D(uTexture, uv + refractB.xy * offsetB).b * 0.5;
        vec3 purpleSample = texture2D(uTexture, uv + refractP.xy * offsetP).rgb;
        float purple = (purpleSample.b * 2.0 + purpleSample.r * 2.0 - purpleSample.g) / 6.0;
        color.r += red + (2.0 * purple + 2.0 * yellow - cyan) / 3.0;
        color.g += green + (2.0 * yellow + 2.0 * cyan - purple) / 3.0;
        color.b += blue + (2.0 * cyan + 2.0 * purple - yellow) / 3.0;
      }
    }

    color /= float(uLoop);
  } else {
    color = texture2D(uTexture, uv).rgb;
  }

  color = saturation(color, uSaturation);
  color *= uBrightness;
  color = (color - 0.5) * uContrast + 0.5;
  color = pow(max(color, 0.0), vec3(1.0 / max(uGamma, 0.0001)));

  float gradientRange = max(uTintLocalYRange.y - uTintLocalYRange.x, 0.00001);
  float gradientFactor = clamp((modelLocalY - uTintLocalYRange.x) / gradientRange, 0.0, 1.0);
  vec4 tint = mix(uTintColorB, uTintColorA, gradientFactor);
  float thicknessMask = clamp(1.0 - abs(dot(normal, eyeDirection)), 0.0, 1.0);
  float tintAlpha = clamp(tint.a, 0.0, 1.0);
  tintAlpha *= mix(
    clamp(uTintThicknessMaxAlpha, 0.0, 1.0),
    clamp(uTintThicknessMinAlpha, 0.0, 1.0),
    thicknessMask
  );

  float beerMix = clamp(uTintEnabled, 0.0, 1.0) * tintAlpha;
  vec3 transmittance = pow(clamp(tint.rgb, 0.001, 1.0), vec3(clamp(uTintMix, 0.01, 3.0)));
  vec3 beerColor = mix(color, color * transmittance, beerMix);
  float hardMix = clamp(uTintEnabled, 0.0, 1.0) * clamp(uTintMix, 0.0, 1.0) * tintAlpha;
  vec3 base = clamp(color, 0.0, 1.0);
  vec3 blend = clamp(tint.rgb, 0.0, 1.0);
  vec3 hard = mix(
    2.0 * base * blend,
    1.0 - 2.0 * (1.0 - blend) * (1.0 - base),
    step(vec3(0.5), blend)
  );
  color = mix(beerColor, mix(color, hard, hardMix), clamp(uDark, 0.0, 1.0));
  float frontFacing = smoothstep(0.08, 0.9, abs(dot(normal, eyeDirection)));
  color = mix(
    color,
    uGlassBaseColor,
    clamp(uGlassBaseStrength, 0.0, 1.0) * frontFacing
  );
  color += specular(uLight, normal, eyeDirection, uShininess, uDiffuseness) * uSpecularStrength;
  float fresnelLight = fresnel(eyeDirection, normal, uFresnelPower);
  float sideMask = smoothstep(-0.5, 0.5, dot(normal, normalize(uFresnelSideDir)));
  color += fresnelLight * sideMask * vec3(uFresnelStrength);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
