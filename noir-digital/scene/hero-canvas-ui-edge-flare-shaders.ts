export const HERO_CANVAS_UI_EDGE_FLARE_VERTEX_SHADER = /* glsl */ `
  varying vec3 vModelPosition;
  varying vec3 vViewDirection;
  varying vec3 vViewNormal;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vModelPosition = position;
    vViewDirection = normalize(-viewPosition.xyz);
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const HERO_CANVAS_UI_EDGE_FLARE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uFresnelEnd;
  uniform float uFresnelStart;
  uniform float uEdgeFeather;
  uniform float uIPatchXEnd;
  uniform float uIPatchXStart;
  uniform float uIPatchYEnd;
  uniform float uIPatchYStart;
  uniform float uRContourEnd;
  uniform float uRContourFeather;
  uniform float uRContourIntercept;
  uniform float uRContourSlope;
  uniform float uRContourStart;
  uniform float uRContourWidth;
  uniform float uRSourceLuminance;

  varying vec3 vModelPosition;
  varying vec3 vViewDirection;
  varying vec3 vViewNormal;

  float softRange(float value, float start, float end, float feather) {
    return smoothstep(start, start + feather, value) *
      (1.0 - smoothstep(end - feather, end, value));
  }

  float softBand(float value, float center, float halfWidth, float feather) {
    return 1.0 - smoothstep(halfWidth, halfWidth + feather, abs(value - center));
  }

  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDirection = normalize(vViewDirection);
    float fresnel = clamp(1.0 - abs(dot(normal, viewDirection)), 0.0, 1.0);
    float silhouette = smoothstep(uFresnelStart, uFresnelEnd, fresnel);

    // This mesh is rendered only to the lens-flare source texture. It marks
    // two small rim fragments so the existing RGB flare can originate there,
    // without adding a visible surface or a continuous color stripe.
    float iPatch =
      softRange(vModelPosition.x, uIPatchXStart, uIPatchXEnd, uEdgeFeather) *
      softRange(vModelPosition.y, uIPatchYStart, uIPatchYEnd, uEdgeFeather);
    // Unlike the former rectangle, this is a slender band following the
    // chamfer at R's terminal, so the flare grows along its contour.
    float rPatch =
      softRange(
        vModelPosition.x,
        uRContourStart,
        uRContourEnd,
        uRContourFeather
      ) *
      softBand(
        vModelPosition.y + vModelPosition.x * uRContourSlope,
        uRContourIntercept,
        uRContourWidth,
        uRContourFeather
      );
    // The I is a true silhouette detail, while the R terminal faces the
    // camera. Keep its tiny source patch independent from the Fresnel gate so
    // it can feed the same RGB flare without rendering a visible surface.
    float iSource = iPatch * silhouette;
    float rSource = rPatch;

    if (max(iSource, rSource) < 0.44) discard;
    float luminance = iSource >= rSource ? 1.0 : uRSourceLuminance;
    gl_FragColor = vec4(vec3(luminance), 1.0);
  }
`;
