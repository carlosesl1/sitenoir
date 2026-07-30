import { HERO_GLASS_FRAGMENT_SHADER, HERO_GLASS_VERTEX_SHADER } from "@/scene/hero-glass-shaders";

export const CONTACT_FLARE_MASK_VERTEX_SHADER = `
attribute float contactFlareMask;
varying float contactFlareMaskValue;

void main() {
  contactFlareMaskValue = contactFlareMask;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const CONTACT_FLARE_MASK_FRAGMENT_SHADER = `
varying float contactFlareMaskValue;

void main() {
  float externalSide = smoothstep(0.35, 0.8, contactFlareMaskValue);
  if (externalSide <= 0.001) discard;
  gl_FragColor = vec4(vec3(1.0), externalSide);
}
`;

export const CONTACT_REFRACTIVE_VERTEX_SHADER = HERO_GLASS_VERTEX_SHADER.replace(
  "varying float modelLocalY;",
  `attribute float contactSurfaceKind;
varying float contactSurfaceKindValue;
varying float modelLocalY;`,
).replace(
  "modelLocalY = position.y;",
  `modelLocalY = position.y;
  contactSurfaceKindValue = contactSurfaceKind;`,
);

export const CONTACT_REFRACTIVE_FRAGMENT_SHADER = HERO_GLASS_FRAGMENT_SHADER.replace(
  "uniform int uLoop;",
  `uniform vec3 uContactInnerColor;
uniform float uContactInnerDarkening;
uniform vec3 uContactOuterColor;
uniform float uContactOuterBrightness;
uniform float uContactOuterWhiteMix;
uniform float uContactSurfaceRouting;
uniform int uLoop;`,
)
  .replace(
    "varying float modelLocalY;",
    `varying float contactSurfaceKindValue;
varying float modelLocalY;`,
  )
  .replace(
    "color += specular(uLight, normal, eyeDirection, uShininess, uDiffuseness) * uSpecularStrength;",
    `float contactRouting = clamp(uContactSurfaceRouting, 0.0, 1.0);
  float contactOuter = smoothstep(0.45, 0.85, contactSurfaceKindValue);
  float contactInner = smoothstep(0.45, 0.85, -contactSurfaceKindValue);
  float contactCap = 1.0 - max(contactOuter, contactInner);
  vec3 contactCapColor = color;
  vec3 contactInnerColor = mix(
    contactCapColor,
    uContactInnerColor,
    clamp(uContactInnerDarkening, 0.0, 1.0)
  );
  vec3 contactOuterColor = mix(
    color,
    uContactOuterColor,
    clamp(uContactOuterWhiteMix, 0.0, 1.0)
  );
  vec3 contactRoutedColor = contactCapColor;
  contactRoutedColor = mix(contactRoutedColor, contactInnerColor, contactInner);
  contactRoutedColor = mix(contactRoutedColor, contactOuterColor, contactOuter);
  color = mix(color, contactRoutedColor, contactRouting);
  color += uContactOuterColor
    * contactOuter
    * clamp(uContactOuterBrightness, 0.0, 2.0)
    * contactRouting;

  float contactHighlightMask = mix(
    1.0,
    contactOuter + contactCap * 0.12 + contactInner * 0.04,
    contactRouting
  );
  color += specular(uLight, normal, eyeDirection, uShininess, uDiffuseness)
    * uSpecularStrength
    * contactHighlightMask;`,
  )
  .replace(
    "color += fresnelLight * sideMask * vec3(uFresnelStrength);",
    `color += fresnelLight
    * sideMask
    * vec3(uFresnelStrength)
    * contactHighlightMask;`,
  );
