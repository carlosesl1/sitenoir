import {
  DoubleSide,
  InstancedBufferAttribute,
  PlaneGeometry,
  ShaderMaterial,
  type Texture,
  Vector2,
} from "three";

export const MAX_STICKER_PARTICLES = 96;
export const STICKER_PLANE_SIZE = 2;
export const STICKER_ATLAS_SOURCE = "/assets/v1/stickers/atlas.webp";
export const STICKER_ATLAS_MOBILE_SOURCE = "/assets/v1/stickers/atlas-mobile.webp";

export function resolveStickerAtlasSource(viewportWidth: number): string {
  return viewportWidth < 768 ? STICKER_ATLAS_MOBILE_SOURCE : STICKER_ATLAS_SOURCE;
}

const STICKER_VERTEX_SHADER = `
  attribute float instanceOpacity;
  attribute float instanceTile;
  varying vec2 vUv;
  varying float vOpacity;
  varying float vTile;
  void main() {
    vUv = uv;
    vOpacity = instanceOpacity;
    vTile = instanceTile;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const STICKER_FRAGMENT_SHADER = `
  uniform sampler2D uAtlas;
  uniform vec2 uTexel;
  varying vec2 vUv;
  varying float vOpacity;
  varying float vTile;
  void main() {
    float column = mod(vTile, 4.0);
    float row = floor(vTile / 4.0);
    vec2 atlasUv = (vec2(column, 2.0 - row) + vUv) / vec2(4.0, 3.0);
    vec4 color = texture2D(uAtlas, atlasUv);

    // Same family as the NOIR letters: dark chrome body, bright rim, light splitting at the edges.
    vec2 reach = uTexel * 6.0;
    float left = texture2D(uAtlas, atlasUv - vec2(reach.x, 0.0)).a;
    float right = texture2D(uAtlas, atlasUv + vec2(reach.x, 0.0)).a;
    float up = texture2D(uAtlas, atlasUv + vec2(0.0, reach.y)).a;
    float down = texture2D(uAtlas, atlasUv - vec2(0.0, reach.y)).a;
    float rim = clamp(color.a - min(min(left, right), min(up, down)), 0.0, 1.0);
    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    float sheen = mix(0.03, 0.5, pow(clamp(vUv.y, 0.0, 1.0), 1.5));
    vec3 body = vec3(sheen) * mix(0.3, 1.2, smoothstep(0.08, 0.85, luminance));
    vec3 warm = vec3(1.0, 0.25, 0.12) * clamp(color.a - left, 0.0, 1.0);
    vec3 cool = vec3(0.14, 0.34, 1.0) * clamp(color.a - right, 0.0, 1.0);
    vec3 glass = body + vec3(rim) * 0.85 + (warm + cool) * 0.4;

    gl_FragColor = vec4(glass, color.a * vOpacity);
    #include <colorspace_fragment>
  }
`;

export function createStickerGeometry(): PlaneGeometry {
  const geometry = new PlaneGeometry(STICKER_PLANE_SIZE, STICKER_PLANE_SIZE);
  geometry.setAttribute(
    "instanceOpacity",
    new InstancedBufferAttribute(new Float32Array(MAX_STICKER_PARTICLES), 1),
  );
  geometry.setAttribute(
    "instanceTile",
    new InstancedBufferAttribute(new Float32Array(MAX_STICKER_PARTICLES), 1),
  );
  return geometry;
}

export function createStickerMaterial(atlas: Texture): ShaderMaterial {
  const image = atlas.image as { readonly height?: number; readonly width?: number } | null;
  return new ShaderMaterial({
    depthWrite: false,
    fragmentShader: STICKER_FRAGMENT_SHADER,
    side: DoubleSide,
    toneMapped: false,
    transparent: true,
    uniforms: {
      uAtlas: { value: atlas },
      uTexel: {
        value: new Vector2(
          1 / Math.max(image?.width ?? 2048, 1),
          1 / Math.max(image?.height ?? 1536, 1),
        ),
      },
    },
    vertexShader: STICKER_VERTEX_SHADER,
  });
}
