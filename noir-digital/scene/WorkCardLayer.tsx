"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  DataTexture,
  DoubleSide,
  LinearFilter,
  MathUtils,
  Mesh,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
  Vector2,
  Vector4,
  type WebGLRenderer,
} from "three";

import { projects, type ServiceId, serviceGroups } from "@/data/projects";
import {
  createImageCanvasGate,
  createWorkCardTexture,
  initializeWorkCardTexture,
  setDataFlag,
  setWebGlCardVisibility,
} from "@/scene/work-card-runtime";
import { WORK_CARD_FRAGMENT_SHADER, WORK_CARD_VERTEX_SHADER } from "@/scene/work-card-shaders";

function setCoverScale(
  target: Vector2,
  imageWidth: number,
  imageHeight: number,
  rectWidth: number,
  rectHeight: number,
) {
  const rectAspect = Math.max(1, rectWidth) / Math.max(1, rectHeight);
  const imageAspect = Math.max(1, imageWidth) / Math.max(1, imageHeight);
  target.set(1, 1);
  if (imageAspect > rectAspect) target.x = rectAspect / imageAspect;
  else target.y = imageAspect / rectAspect;
}

function configureTexture(texture: Texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
}

function createCardMaterial(placeholder: Texture) {
  const material = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    fragmentShader: WORK_CARD_FRAGMENT_SHADER,
    side: DoubleSide,
    toneMapped: false,
    transparent: true,
    uniforms: {
      map: { value: placeholder },
      mapHover: { value: placeholder },
      uBaseCoverScale: { value: new Vector2(1, 1) },
      uCurlStrength: { value: 0 },
      uDotCellSize: { value: new Vector2(18, 18) },
      uDrawRect: { value: new Vector4(0, 0, 0, 0) },
      uHoverCoverScale: { value: new Vector2(1, 1) },
      uHoverMetrics: { value: new Vector4(1, Math.SQRT2, 0.08, 0) },
      uHoverRevealProgress: { value: 0 },
      uLayerOpacity: { value: 0 },
      uRect: { value: new Vector4(0, 0, 1, 1) },
    },
    vertexShader: WORK_CARD_VERTEX_SHADER,
  });
  material.name = "WorkCardMaterial";
  material.visible = false;
  return material;
}

export function WorkCardLayer() {
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const prepareImage = useMemo(() => createImageCanvasGate(invalidate), [invalidate]);
  const placeholder = useMemo(() => {
    const texture = new DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
    configureTexture(texture);
    texture.needsUpdate = true;
    return texture;
  }, []);
  const materials = useMemo(
    () => projects.map(() => createCardMaterial(placeholder)),
    [placeholder],
  );
  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);
  const compileScene = useMemo(() => {
    const isolatedScene = new Scene();
    const material = materials[0];
    if (material) isolatedScene.add(new Mesh(geometry, material));
    return isolatedScene;
  }, [geometry, materials]);
  const elements = useRef<Array<HTMLElement | null>>(projects.map(() => null));
  const rects = useRef<Array<DOMRectReadOnly | null>>(projects.map(() => null));
  const hoverProgress = useRef(projects.map(() => 0));
  const textures = useRef<Array<CardTextures | null>>(projects.map(() => null));
  const prewarm = useRef(new Map<number, CardPrewarmState>());
  const programReady = useRef(false);
  const previousScroll = useRef<number | null>(null);
  const smoothedVelocity = useRef(0);

  useEffect(() => {
    prepareImage.activate();
    let disposed = false;
    let compileGeneration = 0;
    const setReady = (ready: boolean) => {
      if (ready) document.documentElement.dataset["webglWorkReady"] = "true";
      else delete document.documentElement.dataset["webglWorkReady"];
      if (!ready) {
        for (const element of elements.current) {
          if (!element) continue;
          setDataFlag(element, "canvasActive", "false");
          setDataFlag(element, "curlActive", "false");
          delete element.dataset["webglReady"];
        }
      }
      window.dispatchEvent(new Event("noir:webgl-work-ready"));
    };
    const publishReadyCards = () => {
      if (!programReady.current) return;
      let changed = false;
      for (let index = 0; index < textures.current.length; index += 1) {
        const element = resolveElement(elements.current, index);
        if (!element || !textures.current[index]?.base) continue;
        changed = setDataFlag(element, "webglReady", "true") || changed;
      }
      if (changed) window.dispatchEvent(new Event("noir:webgl-work-ready"));
    };
    const reinitializeTextures = () => {
      for (let index = 0; index < textures.current.length; index += 1) {
        const pair = textures.current[index];
        if (!pair) continue;
        if (!initializeWorkCardTexture(gl, pair.base)) {
          pair.hover?.dispose();
          textures.current[index] = null;
          continue;
        }
        if (pair.hover && !initializeWorkCardTexture(gl, pair.hover)) delete pair.hover;
      }
    };
    const compilePipeline = async (restoreTextures = false) => {
      const generation = ++compileGeneration;
      programReady.current = false;
      try {
        await gl.compileAsync(compileScene, camera);
        if (disposed || generation !== compileGeneration) return;
        if (restoreTextures) reinitializeTextures();
        programReady.current = true;
        publishReadyCards();
        invalidate();
      } catch {
        if (disposed || generation !== compileGeneration) return;
        programReady.current = false;
        setReady(false);
      }
    };
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      compileGeneration += 1;
      programReady.current = false;
      setReady(false);
    };
    const handleContextRestored = () => {
      setReady(true);
      void compilePipeline(true);
    };
    gl.domElement.addEventListener("webglcontextlost", handleContextLost);
    gl.domElement.addEventListener("webglcontextrestored", handleContextRestored);
    setReady(true);
    void compilePipeline();
    return () => {
      disposed = true;
      compileGeneration += 1;
      programReady.current = false;
      gl.domElement.removeEventListener("webglcontextlost", handleContextLost);
      gl.domElement.removeEventListener("webglcontextrestored", handleContextRestored);
      setReady(false);
      prepareImage.dispose();
      prewarm.current.clear();
      geometry.dispose();
      for (const material of materials) material.dispose();
      for (const pair of textures.current) {
        pair?.base.dispose();
        pair?.hover?.dispose();
      }
      placeholder.dispose();
    };
  }, [camera, compileScene, geometry, gl, invalidate, materials, placeholder, prepareImage]);

  useEffect(() => {
    let disposed = false;
    const indexByElement = new Map<HTMLElement, number>();
    const imageCleanups = new Set<() => void>();
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          setDataFlag(element, "workCardInView", entry.isIntersecting ? "true" : "false");
        }
        window.dispatchEvent(new Event("noir:work-card-visibility"));
      },
      { rootMargin: "10% 0px" },
    );
    const queuePrewarm = (element: HTMLElement, index: number) => {
      if (prewarm.current.has(index)) return;
      const state: CardPrewarmState = {
        baseFailed: false,
        hoverFailed: false,
      };
      prewarm.current.set(index, state);
      const decode = (role: "hover" | "primary", handleFailure: () => void) => {
        const image = element.querySelector<HTMLImageElement>(`[data-image-role="${role}"]`);
        if (!image) {
          handleFailure();
          return;
        }
        let settled = false;
        const cleanup = () => {
          image.removeEventListener("load", handleLoad);
          image.removeEventListener("error", handleError);
          imageCleanups.delete(cleanup);
        };
        const finish = () => {
          if (settled) return;
          settled = true;
          cleanup();
          void image
            .decode()
            .catch(() => handleFailure())
            .finally(() => {
              if (!disposed) invalidate();
            });
        };
        const handleLoad = () => finish();
        const handleError = () => {
          if (settled) return;
          settled = true;
          cleanup();
          handleFailure();
          if (!disposed) invalidate();
        };
        if (image.complete) {
          if (image.naturalWidth > 0) finish();
          else handleError();
          return;
        }
        imageCleanups.add(cleanup);
        image.addEventListener("load", handleLoad, { once: true });
        image.addEventListener("error", handleError, { once: true });
        if (image.complete) {
          if (image.naturalWidth > 0) finish();
          else handleError();
        }
      };
      decode("primary", () => {
        state.baseFailed = true;
      });
      decode("hover", () => {
        state.hoverFailed = true;
      });
      invalidate();
    };
    const prewarmObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          const index = indexByElement.get(element);
          if (index === undefined) continue;
          prewarmObserver.unobserve(element);
          queuePrewarm(element, index);
        }
      },
      { rootMargin: "150% 0px" },
    );
    let idleCallback = 0;
    let idleTimeout = 0;
    let nextServiceIndex = 1;
    const queueService = (service: ServiceId) => {
      for (let index = 0; index < projects.length; index += 1) {
        if (projects[index]?.primaryService !== service) continue;
        const element = resolveElement(elements.current, index);
        if (!element) continue;
        for (const image of element.querySelectorAll<HTMLImageElement>("img")) {
          image.fetchPriority = "low";
          image.loading = "eager";
        }
        prewarmObserver.unobserve(element);
        queuePrewarm(element, index);
      }
    };
    const queueNextService = () => {
      if (disposed || nextServiceIndex >= serviceGroups.length) return;
      const service = serviceGroups[nextServiceIndex];
      nextServiceIndex += 1;
      if (service) queueService(service.id);
      scheduleNextService();
    };
    const scheduleNextService = () => {
      if (disposed || nextServiceIndex >= serviceGroups.length) return;
      if (typeof window.requestIdleCallback === "function") {
        idleCallback = window.requestIdleCallback(queueNextService, { timeout: 750 });
      } else {
        idleTimeout = window.setTimeout(queueNextService, 0);
      }
    };
    for (let index = 0; index < projects.length; index += 1) {
      const element = resolveElement(elements.current, index);
      if (!element) continue;
      indexByElement.set(element, index);
      visibilityObserver.observe(element);
      prewarmObserver.observe(element);
    }
    const initialService = serviceGroups[0];
    if (initialService) queueService(initialService.id);
    scheduleNextService();
    return () => {
      disposed = true;
      if (idleCallback && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleCallback);
      }
      if (idleTimeout) window.clearTimeout(idleTimeout);
      for (const cleanup of imageCleanups) cleanup();
      imageCleanups.clear();
      visibilityObserver.disconnect();
      prewarmObserver.disconnect();
      prewarm.current.clear();
      for (const element of elements.current) {
        if (element) delete element.dataset["workCardInView"];
      }
    };
  }, [invalidate]);

  useFrame((_state, delta) => {
    const frameDelta = Math.max(1 / 240, Math.min(delta, 0.1));
    const scrollTop = window.scrollY;
    const settle = document.documentElement.dataset["workCardSettle"] === "true";
    if (settle) delete document.documentElement.dataset["workCardSettle"];
    const previous = previousScroll.current;
    previousScroll.current = scrollTop;
    const speed = previous === null ? 0 : Math.abs(scrollTop - previous) / frameDelta;
    const targetVelocity = settle ? 0 : MathUtils.clamp(speed / 800, 0, 1);
    const response = targetVelocity > smoothedVelocity.current ? 0.025 : 0.175;
    const blend = 1 - Math.exp(-frameDelta / response);
    smoothedVelocity.current += (targetVelocity - smoothedVelocity.current) * blend;
    if (settle) smoothedVelocity.current = 0;
    const curl = 0.06 * smoothedVelocity.current;
    for (let index = 0; index < materials.length; index += 1) {
      const element = resolveElement(elements.current, index);
      const shouldMeasure =
        element?.dataset["workCardInView"] === "true" || prewarm.current.has(index);
      if (shouldMeasure) {
        rects.current[index] = element?.getBoundingClientRect() ?? null;
      }
    }
    const textureBudget: TexturePreparationBudget = { remaining: 1 };
    for (let index = 0; index < materials.length; index += 1) {
      const prewarmState = prewarm.current.get(index);
      const preparation = updateCardMaterial({
        curl,
        delta: frameDelta,
        element: elements.current[index] ?? null,
        hoverProgress: hoverProgress.current,
        index,
        material: materials[index],
        pixelRatio: gl.getPixelRatio(),
        prepareImage,
        prewarm: Boolean(prewarmState),
        programReady: programReady.current,
        rect: rects.current[index] ?? null,
        renderer: gl,
        textureBudget,
        textures: textures.current,
        viewportHeight: size.height,
        viewportWidth: size.width,
      });
      if (
        prewarmState &&
        (prewarmState.baseFailed ||
          ((preparation & CARD_BASE_READY) !== 0 &&
            ((preparation & CARD_HOVER_READY) !== 0 || prewarmState.hoverFailed)))
      ) {
        prewarm.current.delete(index);
      }
    }
    if (textureBudget.remaining === 0 && prewarm.current.size > 0) invalidate();
  });

  return (
    <>
      {materials.map((material, index) => (
        <mesh
          key={projects[index]?.slug ?? index}
          geometry={geometry}
          material={material}
          renderOrder={20 + index}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

function resolveElement(elements: Array<HTMLElement | null>, index: number) {
  const existing = elements[index];
  if (existing?.isConnected) return existing;
  const slug = projects[index]?.slug;
  const element = slug ? document.querySelector<HTMLElement>(`[data-work-card="${slug}"]`) : null;
  elements[index] = element;
  return element;
}

interface CardUpdateInput {
  readonly curl: number;
  readonly delta: number;
  readonly element: HTMLElement | null;
  readonly hoverProgress: number[];
  readonly index: number;
  readonly material: ShaderMaterial | undefined;
  readonly pixelRatio: number;
  readonly prepareImage: (
    image: HTMLImageElement,
    renderedWidth: number,
    renderedHeight: number,
    pixelRatio: number,
  ) => HTMLCanvasElement | ImageBitmap | null;
  readonly prewarm: boolean;
  readonly programReady: boolean;
  readonly rect: DOMRectReadOnly | null;
  readonly renderer: Pick<WebGLRenderer, "initTexture">;
  readonly textureBudget: TexturePreparationBudget;
  readonly textures: Array<CardTextures | null>;
  readonly viewportHeight: number;
  readonly viewportWidth: number;
}

interface CardTextures {
  base: Texture;
  hover?: Texture;
}

interface CardPrewarmState {
  baseFailed: boolean;
  hoverFailed: boolean;
}

interface TexturePreparationBudget {
  remaining: number;
}

const CARD_BASE_READY = 1;
const CARD_HOVER_READY = 2;
type CardPreparation = 0 | 1 | 2 | 3;

function resolveHoverTexture(input: CardUpdateInput): boolean {
  const pair = input.textures[input.index];
  if (!pair || !input.element || !input.material) return false;
  const image = input.element.querySelector<HTMLImageElement>('[data-image-role="hover"]');
  if (!image?.complete || image.naturalWidth <= 0) return false;
  const prepared = input.prepareImage(
    image,
    input.rect?.width ?? 1,
    input.rect?.height ?? 1,
    input.pixelRatio,
  );
  if (!prepared) return Boolean(pair.hover);
  if (pair.hover?.image === prepared) return true;
  if (input.textureBudget.remaining <= 0) return Boolean(pair.hover);
  input.textureBudget.remaining -= 1;
  const hover = createWorkCardTexture(prepared);
  if (!initializeWorkCardTexture(input.renderer, hover)) return Boolean(pair.hover);
  pair.hover?.dispose();
  pair.hover = hover;
  const mapHover = input.material.uniforms["mapHover"];
  if (mapHover) mapHover.value = hover;
  return true;
}

function resolveCardTextures(input: CardUpdateInput): boolean {
  if (!input.element) return false;
  const existing = input.textures[input.index];
  const baseImage = input.element.querySelector<HTMLImageElement>('[data-image-role="primary"]');
  if (!baseImage?.complete || baseImage.naturalWidth <= 0 || !input.material) {
    return Boolean(existing);
  }
  const prepared = input.prepareImage(
    baseImage,
    input.rect?.width ?? 1,
    input.rect?.height ?? 1,
    input.pixelRatio,
  );
  if (!prepared) return Boolean(existing);
  if (existing?.base.image === prepared) return true;
  if (input.textureBudget.remaining <= 0) return Boolean(existing);
  input.textureBudget.remaining -= 1;
  const base = createWorkCardTexture(prepared);
  if (!initializeWorkCardTexture(input.renderer, base)) return Boolean(existing);
  existing?.base.dispose();
  input.textures[input.index] = existing ? { ...existing, base } : { base };
  const map = input.material.uniforms["map"];
  const mapHover = input.material.uniforms["mapHover"];
  if (map) map.value = base;
  if (mapHover && !existing?.hover) mapHover.value = base;
  return true;
}

function updateCardMaterial(input: CardUpdateInput): CardPreparation {
  const material = input.material;
  const element = input.element;
  if (!material || !element) return 0;
  const nearViewport = element.dataset["workCardInView"] === "true";
  if (!nearViewport && !input.prewarm) {
    material.visible = false;
    setWebGlCardVisibility(element, false, false);
    return 0;
  }
  const rect = input.rect;
  if (!rect) return 0;
  const baseReady = resolveCardTextures(input);
  const hoverReady = baseReady && resolveHoverTexture(input);
  const preparation = (baseReady ? CARD_BASE_READY : 0) | (hoverReady ? CARD_HOVER_READY : 0);
  const baseImage = element.querySelector<HTMLImageElement>('[data-image-role="primary"]');
  const hoverImage = element.querySelector<HTMLImageElement>('[data-image-role="hover"]');
  const baseCoverScale = material.uniforms["uBaseCoverScale"];
  const hoverCoverScale = material.uniforms["uHoverCoverScale"];
  if (baseCoverScale && baseImage) {
    setCoverScale(
      baseCoverScale.value,
      baseImage.naturalWidth,
      baseImage.naturalHeight,
      rect.width,
      rect.height,
    );
  }
  if (hoverCoverScale) {
    const source = hoverReady && hoverImage ? hoverImage : baseImage;
    if (source) {
      setCoverScale(
        hoverCoverScale.value,
        source.naturalWidth,
        source.naturalHeight,
        rect.width,
        rect.height,
      );
    }
  }
  if (baseReady && input.programReady && setDataFlag(element, "webglReady", "true")) {
    window.dispatchEvent(new Event("noir:webgl-work-ready"));
  }
  const visible = nearViewport && rect.bottom > 0 && rect.top < input.viewportHeight;
  const layerOpacity = material.uniforms["uLayerOpacity"];
  if (!visible || rect.width <= 0 || rect.height <= 0) {
    material.visible = false;
    if (layerOpacity) layerOpacity.value = 0;
    setWebGlCardVisibility(element, false, false);
    return preparation as CardPreparation;
  }
  if (!baseReady || !input.programReady) {
    material.visible = false;
    if (layerOpacity) layerOpacity.value = 0;
    setWebGlCardVisibility(element, false, false);
    return preparation as CardPreparation;
  }
  material.visible = true;
  setWebGlCardVisibility(element, true, input.curl > 0.0005);
  const hovered = element.parentElement?.matches(":hover, :focus-within") ?? false;
  const hover = input.hoverProgress[input.index] ?? 0;
  input.hoverProgress[input.index] = MathUtils.clamp(
    hover + (hovered && hoverReady ? input.delta : -input.delta) / 0.42,
    0,
    1,
  );
  const rectUniform = material.uniforms["uRect"];
  const drawRectUniform = material.uniforms["uDrawRect"];
  const curlUniform = material.uniforms["uCurlStrength"];
  const dotCellSize = material.uniforms["uDotCellSize"];
  const hoverMetrics = material.uniforms["uHoverMetrics"];
  const hoverUniform = material.uniforms["uHoverRevealProgress"];
  if (layerOpacity) layerOpacity.value = 1;
  if (rectUniform) {
    rectUniform.value.set(
      rect.left / input.viewportWidth,
      1 - rect.bottom / input.viewportHeight,
      rect.width / input.viewportWidth,
      rect.height / input.viewportHeight,
    );
  }
  if (drawRectUniform) {
    const left = Math.max(0, rect.left / input.viewportWidth - 0.08);
    const right = Math.min(1, rect.right / input.viewportWidth + 0.08);
    const bottom = Math.max(0, 1 - rect.bottom / input.viewportHeight);
    const top = Math.min(1, 1 - rect.top / input.viewportHeight);
    drawRectUniform.value.set(left, bottom, right - left, top - bottom);
  }
  if (curlUniform) curlUniform.value = input.curl;
  if (hoverUniform) {
    const progress = input.hoverProgress[input.index] ?? 0;
    hoverUniform.value = 0.5 - 0.5 * Math.cos(Math.PI * progress);
  }
  const cellWidth = Math.max(18 / Math.max(1, input.viewportWidth), 1 / 4096);
  const cellHeight = Math.max(18 / Math.max(1, input.viewportHeight), 1 / 4096);
  if (dotCellSize) dotCellSize.value.set(cellWidth, cellHeight);
  if (hoverMetrics) {
    const rectAspect = Math.max(1, rect.width) / Math.max(1, rect.height);
    const maximumRadius = Math.sqrt(1 + rectAspect * rectAspect);
    const revealBand = Math.max(Math.hypot(cellWidth, cellHeight) * 18, 0.08);
    hoverMetrics.value.set(rectAspect, maximumRadius, revealBand, 0);
  }
  return preparation as CardPreparation;
}
