import {
  DoubleSide,
  InstancedBufferAttribute,
  PlaneGeometry,
  ShaderMaterial,
  type Texture,
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
  varying vec2 vUv;
  varying float vOpacity;
  varying float vTile;
  void main() {
    float column = mod(vTile, 4.0);
    float row = floor(vTile / 4.0);
    vec2 atlasUv = (vec2(column, 2.0 - row) + vUv) / vec2(4.0, 3.0);
    vec4 color = texture2D(uAtlas, atlasUv);
    gl_FragColor = vec4(color.rgb, color.a * vOpacity);
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
  return new ShaderMaterial({
    depthWrite: false,
    fragmentShader: STICKER_FRAGMENT_SHADER,
    side: DoubleSide,
    toneMapped: false,
    transparent: true,
    uniforms: { uAtlas: { value: atlas } },
    vertexShader: STICKER_VERTEX_SHADER,
  });
}
