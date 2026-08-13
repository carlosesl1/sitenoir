export const HERO_CANVAS_UI_RIM_VERTEX_SHADER = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 clipPosition = projectionMatrix * viewPosition;
    vViewNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = clipPosition;
  }
`;

export const HERO_CANVAS_UI_RIM_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uCoreStart;
  uniform float uCoreEnd;
  uniform float uCoreOpacity;
  uniform float uHaloStart;
  uniform float uHaloEnd;
  uniform float uHaloOpacity;

  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDirection = normalize(vViewDirection);
    float fresnel = clamp(1.0 - abs(dot(normal, viewDirection)), 0.0, 1.0);
    float core = smoothstep(uCoreStart, uCoreEnd, fresnel);
    float halo = smoothstep(uHaloStart, uHaloEnd, fresnel) * (1.0 - core);
    float rimOpacity = core * uCoreOpacity + halo * uHaloOpacity;
    float opacity = clamp(rimOpacity, 0.0, 1.0);

    if (opacity <= 0.002) discard;
    gl_FragColor = vec4(uColor, opacity);
  }
`;
