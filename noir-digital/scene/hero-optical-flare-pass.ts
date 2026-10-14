import {
  AdditiveBlending,
  type Camera,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  type Object3D,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  type WebGLRenderer,
} from "three";
import type { PointerSnapshot } from "@/features/pointer/pointer-store";
import { resolveSceneFrameDelta } from "@/scene/scene-frame";
import type { HeroOpticalFlareSources } from "@/scene/HeroOpticalFlareSources";
import {
  HERO_OPTICAL_FLARE_FRAGMENT_SHADER,
  HERO_OPTICAL_FLARE_VERTEX_SHADER,
} from "@/scene/hero-optical-flare-shaders";

// Coordinates in the centered model geometry, not viewport-relative ornaments.
export const HERO_OPTICAL_FLARE_ANCHORS = [
  { source: "wordmark", position: [-0.156132694, -0.098452712, 0.003082369], gain: 0.65 },
  { source: "wordmark", position: [0.129490036, 0.095461898, 0.006286813], gain: 0.82 },
  { source: "wordmark", position: [0.348460341, 0.068727683, 0.006408887], gain: 0.62 },
  { source: "pointer", position: [12.497509003, 2.051774085, 0.000000115], gain: 0.45 },
] as const;

export function isOpticalSourceVisible(source: Object3D | null): boolean {
  if (!source) return false;
  for (let node: Object3D | null = source; node; node = node.parent) {
    if (!node.visible) return false;
  }
  return true;
}

export function resolveOpticalFlareRadius(width: number): number {
  return Math.min(42, Math.max(16, width * 0.026));
}

export function createHeroOpticalFlarePass() {
  const plane = new PlaneGeometry(1, 1);
  const geometry = new InstancedBufferGeometry();
  geometry.index = plane.index;
  geometry.attributes = plane.attributes;
  geometry.instanceCount = HERO_OPTICAL_FLARE_ANCHORS.length;
  const centers = new InstancedBufferAttribute(new Float32Array(8), 2);
  const gains = new InstancedBufferAttribute(new Float32Array(4), 1);
  const radii = new InstancedBufferAttribute(new Float32Array(4), 1);
  geometry.setAttribute("aCenter", centers);
  geometry.setAttribute("aGain", gains);
  geometry.setAttribute("aRadius", radii);
  const spectra = new InstancedBufferAttribute(new Float32Array(8), 2);
  geometry.setAttribute("aSpectrum", spectra);
  const smoothedPointer = new Vector2();
  let pointerActivity = 0;
  const viewport = new Vector2();
  const material = new ShaderMaterial({
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
    vertexShader: HERO_OPTICAL_FLARE_VERTEX_SHADER,
    fragmentShader: HERO_OPTICAL_FLARE_FRAGMENT_SHADER,
    uniforms: { uViewport: { value: viewport } },
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new Scene();
  scene.add(mesh);
  const postCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const projected = new Vector3();
  const world = new Vector3();
  const normal = new Vector3();
  const viewDirection = new Vector3();
  const cameraPosition = new Vector3();

  return {
    render(
      gl: WebGLRenderer,
      camera: Camera,
      sources: HeroOpticalFlareSources,
      width: number,
      height: number,
      delta = 1 / 60,
      pointer: Pick<PointerSnapshot, "inside" | "normalizedX" | "normalizedY"> | null = null,
    ) {
      // Null disables motion immediately for reduced motion and compact screens.
      // On exit, hold the last position while fading its influence so highlights
      // cannot brighten as an invisible pointer returns across the model.
      if (!pointer) {
        smoothedPointer.set(0, 0);
        pointerActivity = 0;
      } else {
        const smoothing = 1 - Math.exp(-8 * resolveSceneFrameDelta(delta));
        const targetX = pointer.inside ? Math.max(-1, Math.min(1, pointer.normalizedX)) : smoothedPointer.x;
        const targetY = pointer.inside ? Math.max(-1, Math.min(1, pointer.normalizedY)) : smoothedPointer.y;
        smoothedPointer.x += (targetX - smoothedPointer.x) * smoothing;
        smoothedPointer.y += (targetY - smoothedPointer.y) * smoothing;
        pointerActivity += ((pointer.inside ? 1 : 0) - pointerActivity) * smoothing;
      }
      viewport.set(width, height);
      camera.getWorldPosition(cameraPosition);
      const radius = resolveOpticalFlareRadius(width);
      let visible = false;
      for (let index = 0; index < HERO_OPTICAL_FLARE_ANCHORS.length; index++) {
        const anchor = HERO_OPTICAL_FLARE_ANCHORS[index];
        if (!anchor) continue;
        const source = sources[anchor.source].current;
        gains.setX(index, 0);
        if (!source || !isOpticalSourceVisible(source)) continue;
        world.fromArray(anchor.position).applyMatrix4(source.matrixWorld);
        projected.copy(world).project(camera);
        normal.set(0, 0, 1).transformDirection(source.matrixWorld);
        viewDirection.copy(cameraPosition).sub(world).normalize();
        const facing = Math.max(0, Math.min(1, (normal.dot(viewDirection) - 0.1) / 0.5));
        if (projected.z < -1 || projected.z > 1 || facing === 0) continue;
        centers.setXY(index, projected.x, projected.y);
        // Pixel distance keeps the response circular at every aspect ratio.
        const distanceX = ((smoothedPointer.x - projected.x) * width) / 2;
        const distanceY = ((smoothedPointer.y - projected.y) * height) / 2;
        const reach = Math.max(180, width * 0.28);
        const proximity = Math.exp(-(distanceX * distanceX + distanceY * distanceY) / (reach * reach));
        const response = pointerActivity * (0.15 + proximity * 0.85);
        gains.setX(index, anchor.gain * facing * (1 + response * 0.95));
        radii.setX(index, radius * (anchor.source === "pointer" ? 0.7 : 1) * (1 + response * 0.65));
        spectra.setXY(
          index,
          (smoothedPointer.x * 0.75 + smoothedPointer.y * 0.4) * pointerActivity,
          0, // Identical spatial palette at every anchor; never cycle its hue.
        );
        visible = true;
      }
      if (!visible) return;
      centers.needsUpdate = gains.needsUpdate = radii.needsUpdate = spectra.needsUpdate = true;
      const previousAutoClear = gl.autoClear;
      const previousTarget = gl.getRenderTarget();
      try {
        gl.autoClear = false;
        gl.setRenderTarget(null);
        gl.render(scene, postCamera);
      } finally {
        gl.autoClear = previousAutoClear;
        gl.setRenderTarget(previousTarget);
      }
    },
    dispose() {
      geometry.dispose();
      plane.dispose();
      material.dispose();
    },
  };
}
