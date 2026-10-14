import {
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  type ShaderMaterial,
  Vector3,
  type WebGLRenderer,
} from "three";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createHeroOpticalFlarePass,
  HERO_OPTICAL_FLARE_ANCHORS,
  isOpticalSourceVisible,
  resolveOpticalFlareRadius,
} from "@/scene/hero-optical-flare-pass";

function createSource(position = new Vector3()) {
  const source = new Mesh(new PlaneGeometry(1, 1));
  source.position.copy(position);
  source.updateMatrixWorld(true);
  return source;
}

function createCamera() {
  const camera = new PerspectiveCamera(45, 2, 0.1, 100);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  return camera;
}

function createSources(wordmark: Mesh | null, pointer: Mesh | null = null) {
  return {
    wordmark: { current: wordmark },
    pointer: { current: pointer },
  };
}

function createRenderer(overrides: Partial<WebGLRenderer> = {}) {
  let target: object | null = { name: "previous-target" };
  const render = vi.fn();
  const renderer = {
    autoClear: true,
    getRenderTarget: vi.fn(() => target),
    setRenderTarget: vi.fn((nextTarget: object | null) => {
      target = nextTarget;
    }),
    render,
    ...overrides,
  } as unknown as WebGLRenderer;

  return { renderer, render, target: () => target };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveOpticalFlareRadius", () => {
  it("keeps the CSS-sized flare radius within its supported bounds", () => {
    expect(resolveOpticalFlareRadius(0)).toBe(16);
    expect(resolveOpticalFlareRadius(800)).toBe(20.8);
    expect(resolveOpticalFlareRadius(3000)).toBe(42);
  });
});

describe("isOpticalSourceVisible", () => {
  it("rejects null sources and hidden ancestors", () => {
    expect(isOpticalSourceVisible(null)).toBe(false);

    const parent = new Scene();
    const source = createSource();
    parent.add(source);
    parent.visible = false;

    expect(isOpticalSourceVisible(source)).toBe(false);
    parent.visible = true;
    expect(isOpticalSourceVisible(source)).toBe(true);
  });
});

describe("createHeroOpticalFlarePass", () => {
  it("does not render when its only source is missing or hidden through an ancestor", () => {
    const camera = createCamera();
    const { renderer, render } = createRenderer();
    const pass = createHeroOpticalFlarePass();

    pass.render(renderer, camera, createSources(null), 800, 600);
    expect(render).not.toHaveBeenCalled();

    const parent = new Scene();
    const source = createSource();
    parent.add(source);
    parent.visible = false;
    pass.render(renderer, camera, createSources(source), 800, 600);

    expect(render).not.toHaveBeenCalled();
    pass.dispose();
  });

  it("projects instanced centers from each source matrix and camera", () => {
    const camera = createCamera();
    const wordmark = createSource(new Vector3(1.5, -0.5, 0));
    const pointer = createSource(new Vector3(-2, 1, 0));
    const { renderer, render } = createRenderer();
    const pass = createHeroOpticalFlarePass();

    pass.render(renderer, camera, createSources(wordmark, pointer), 800, 600);

    expect(render).toHaveBeenCalledOnce();
    const [renderedScene] = render.mock.calls[0] as [Scene];
    const mesh = renderedScene.children[0] as Mesh;
    const centers = mesh.geometry.getAttribute("aCenter");
    const gains = mesh.geometry.getAttribute("aGain");
    const radii = mesh.geometry.getAttribute("aRadius");
    const projected = new Vector3();

    for (let index = 0; index < HERO_OPTICAL_FLARE_ANCHORS.length; index++) {
      const anchor = HERO_OPTICAL_FLARE_ANCHORS[index];
      if (!anchor) continue;
      const source = anchor.source === "wordmark" ? wordmark : pointer;
      projected.fromArray(anchor.position).applyMatrix4(source.matrixWorld).project(camera);
      expect(centers.getX(index)).toBeCloseTo(projected.x, 5);
      expect(centers.getY(index)).toBeCloseTo(projected.y, 5);
      expect(gains.getX(index)).toBeGreaterThan(0);
      expect(radii.getX(index)).toBeCloseTo(20.8 * (anchor.source === "pointer" ? 0.7 : 1), 5);
    }

    pass.dispose();
  });

  it("strengthens and rotates nearby highlights while keeping their shared palette fixed", () => {
    const camera = createCamera();
    const sources = createSources(createSource());
    const { renderer, render } = createRenderer();
    const pass = createHeroOpticalFlarePass();
    pass.render(renderer, camera, sources, 800, 600);
    const [renderedScene] = render.mock.calls[0] as [Scene];
    const mesh = renderedScene.children[0] as Mesh;
    const centers = mesh.geometry.getAttribute("aCenter");
    const radii = mesh.geometry.getAttribute("aRadius");
    const gains = mesh.geometry.getAttribute("aGain");
    const spectra = mesh.geometry.getAttribute("aSpectrum");
    const centerX = centers.getX(0);
    const centerY = centers.getY(0);
    const restingRadius = radii.getX(0);
    const restingGain = gains.getX(0);
    const near = { inside: true, normalizedX: centerX, normalizedY: centerY };
    for (let frame = 0; frame < 120; frame++) {
      pass.render(renderer, camera, sources, 800, 600, 1 / 60, near);
    }
    const nearbyRadius = radii.getX(0);
    const nearbyGain = gains.getX(0);
    const nearbyAngle = spectra.getX(0);
    const nearbyHue = spectra.getY(0);
    expect(nearbyRadius).toBeGreaterThan(restingRadius * 1.5);
    expect(nearbyGain).toBeGreaterThan(restingGain * 1.8);

    const far = { inside: true, normalizedX: 1, normalizedY: 1 };
    for (let frame = 0; frame < 120; frame++) {
      pass.render(renderer, camera, sources, 800, 600, 1 / 60, far);
    }
    expect(radii.getX(0)).toBeLessThan(nearbyRadius);
    expect(gains.getX(0)).toBeLessThan(nearbyGain);
    expect(spectra.getX(0) - nearbyAngle).toBeGreaterThan(0.5);
    expect(spectra.getY(0)).toBe(nearbyHue);
    for (let index = 0; index < HERO_OPTICAL_FLARE_ANCHORS.length; index++) {
      expect(spectra.getY(index)).toBe(0);
    }
    // Mouse response changes only light, never the projected model attachment.
    expect(centers.getX(0)).toBe(centerX);
    expect(centers.getY(0)).toBe(centerY);
    pass.dispose();
  });

  it("eases back on pointer exit and immediately rests when interaction is disabled", () => {
    const camera = createCamera();
    const sources = createSources(createSource());
    const { renderer, render } = createRenderer();
    const pass = createHeroOpticalFlarePass();
    pass.render(renderer, camera, sources, 800, 600);
    const [renderedScene] = render.mock.calls[0] as [Scene];
    const mesh = renderedScene.children[0] as Mesh;
    const radii = mesh.geometry.getAttribute("aRadius");
    const spectra = mesh.geometry.getAttribute("aSpectrum");
    const restingRadius = radii.getX(0);
    const pointer = { inside: true, normalizedX: 0.6, normalizedY: 0.4 };
    for (let frame = 0; frame < 120; frame++) {
      pass.render(renderer, camera, sources, 800, 600, 1 / 60, pointer);
    }
    const activeRadius = radii.getX(0);
    pass.render(renderer, camera, sources, 800, 600, 1 / 60, { ...pointer, inside: false });
    expect(radii.getX(0)).toBeLessThan(activeRadius);
    expect(radii.getX(0)).toBeGreaterThan(restingRadius);
    for (let frame = 0; frame < 120; frame++) {
      pass.render(renderer, camera, sources, 800, 600, 1 / 60, { ...pointer, inside: false });
    }
    expect(radii.getX(0)).toBeCloseTo(restingRadius, 4);
    expect(spectra.getX(0)).toBeCloseTo(0, 4);

    pass.render(renderer, camera, sources, 800, 600, 1 / 60, pointer);
    expect(spectra.getX(0)).toBeGreaterThan(0);
    pass.render(renderer, camera, sources, 800, 600, 1 / 60, null);
    expect(radii.getX(0)).toBe(restingRadius);
    expect(spectra.getX(0)).toBe(0);
    expect(spectra.getY(0)).toBe(0);
    pass.dispose();
  });

  it("caps interaction easing after a long paused frame", () => {
    const camera = createCamera();
    const sources = createSources(createSource());
    const { renderer, render } = createRenderer();
    const pass = createHeroOpticalFlarePass();
    pass.render(renderer, camera, sources, 800, 600, 30, {
      inside: true, normalizedX: 10, normalizedY: 10,
    });
    const [renderedScene] = render.mock.calls[0] as [Scene];
    const mesh = renderedScene.children[0] as Mesh;
    const angle = mesh.geometry.getAttribute("aSpectrum").getX(0);
    expect(angle).toBeGreaterThan(0);
    expect(angle).toBeLessThan(0.3);
    pass.dispose();
  });

  it("suppresses sources behind the camera or facing away from it", () => {
    const camera = createCamera();
    const { renderer, render } = createRenderer();
    const pass = createHeroOpticalFlarePass();

    const behindCamera = createSource(new Vector3(0, 0, 20));
    pass.render(renderer, camera, createSources(behindCamera), 800, 600);
    expect(render).not.toHaveBeenCalled();

    const backFacing = createSource();
    backFacing.rotation.y = Math.PI;
    backFacing.updateMatrixWorld(true);
    pass.render(renderer, camera, createSources(backFacing), 800, 600);
    expect(render).not.toHaveBeenCalled();

    pass.dispose();
  });

  it("restores renderer state when the post pass throws", () => {
    const camera = createCamera();
    const source = createSource();
    const error = new Error("render failed");
    const { renderer, render, target } = createRenderer();
    render.mockImplementation(() => {
      throw error;
    });
    renderer.autoClear = true;
    const pass = createHeroOpticalFlarePass();

    expect(() => pass.render(renderer, camera, createSources(source), 800, 600)).toThrow(error);
    expect(renderer.autoClear).toBe(true);
    expect(target()).toEqual({ name: "previous-target" });
    expect(renderer.setRenderTarget).toHaveBeenNthCalledWith(1, null);
    expect(renderer.setRenderTarget).toHaveBeenNthCalledWith(2, { name: "previous-target" });

    pass.dispose();
  });

  it("disposes its geometry and material resources", () => {
    const pass = createHeroOpticalFlarePass();
    const camera = createCamera();
    const source = createSource();
    const { renderer, render } = createRenderer();

    pass.render(renderer, camera, createSources(source), 800, 600);
    const [renderedScene] = render.mock.calls[0] as [Scene];
    const mesh = renderedScene.children[0] as Mesh;
    const geometryDispose = vi.spyOn(mesh.geometry, "dispose");
    const materialDispose = vi.spyOn(mesh.material as ShaderMaterial, "dispose");

    pass.dispose();

    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(materialDispose).toHaveBeenCalledOnce();
  });
});
