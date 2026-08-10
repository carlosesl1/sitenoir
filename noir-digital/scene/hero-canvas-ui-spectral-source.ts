import {
  AdditiveBlending,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  type WebGLRenderer,
} from "three";

import {
  HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER,
  HERO_CANVAS_UI_SPECTRAL_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-spectral-source-shaders";

export interface HeroCanvasUiSpectralSource {
  readonly dispose: () => void;
  readonly render: (renderer: WebGLRenderer, intensity: number) => void;
}

export function createHeroCanvasUiSpectralMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    fragmentShader: HERO_CANVAS_UI_SPECTRAL_FRAGMENT_SHADER,
    toneMapped: false,
    transparent: true,
    uniforms: { uIntensity: { value: 0 } },
    vertexShader: HERO_CANVAS_UI_SPECTRAL_VERTEX_SHADER,
  });
}

export function createHeroCanvasUiSpectralSource(): HeroCanvasUiSpectralSource {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const material = createHeroCanvasUiSpectralMaterial();
  const quad = new Mesh(geometry, material);
  scene.add(quad);
  let disposed = false;

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      geometry.dispose();
      material.dispose();
    },
    render(renderer, intensity) {
      if (disposed) return;
      const intensityUniform = material.uniforms["uIntensity"];
      if (intensityUniform) intensityUniform.value = intensity;
      renderer.render(scene, camera);
    },
  };
}
