export const HERO_CANVAS_UI_RIM_VERTEX_SHADER = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
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
    float opacity = clamp(core * uCoreOpacity + halo * uHaloOpacity, 0.0, 1.0);

    if (opacity <= 0.002) discard;
    gl_FragColor = vec4(uColor, opacity);
  }
`;
