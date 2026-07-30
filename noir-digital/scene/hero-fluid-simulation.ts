import {
  HalfFloatType,
  LinearFilter,
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  type Texture,
  Vector2,
  type WebGLRenderer,
  WebGLRenderTarget,
} from "three";

import { HERO_FLUID_CONFIG } from "@/scene/hero-fluid";
import {
  FLUID_ADVECT_SHADER,
  FLUID_CLEAR_SHADER,
  FLUID_CURL_SHADER,
  FLUID_DIVERGENCE_SHADER,
  FLUID_GRADIENT_SHADER,
  FLUID_PRESSURE_SHADER,
  FLUID_VERTEX_SHADER,
  FLUID_VORTICITY_SHADER,
} from "@/scene/hero-fluid-simulation-shaders";

type FluidMaterialName =
  | "advect"
  | "clear"
  | "curl"
  | "divergence"
  | "gradient"
  | "pressure"
  | "vorticity";

function createTarget(): WebGLRenderTarget {
  return new WebGLRenderTarget(1, 1, {
    depthBuffer: false,
    format: RGBAFormat,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
    stencilBuffer: false,
    type: HalfFloatType,
  });
}

function createMaterial(fragmentShader: string, uniforms: ShaderMaterial["uniforms"]) {
  return new ShaderMaterial({
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
    fragmentShader,
    toneMapped: false,
    uniforms,
    vertexShader: FLUID_VERTEX_SHADER,
  });
}

function setTexture(material: ShaderMaterial, name: string, texture: Texture) {
  const uniform = material.uniforms[name];
  if (uniform) uniform.value = texture;
}

export class HeroFluidSimulation {
  readonly pointer = new Vector2(-1, -1);
  readonly pointerDelta = new Vector2();
  readonly simSize = new Vector2(1, 1);
  readonly viewportSize = new Vector2(1, 1);
  readonly materials: Record<FluidMaterialName, ShaderMaterial>;
  private velocityRead = createTarget();
  private velocityWrite = createTarget();
  private readonly curlTarget = createTarget();
  private readonly vorticityTarget = createTarget();
  private readonly divergenceTarget = createTarget();
  private readonly pressureA = createTarget();
  private readonly pressureB = createTarget();
  private readonly projectedVelocityTarget = createTarget();
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly geometry = new PlaneGeometry(2, 2);
  private readonly quad: Mesh;

  constructor() {
    const texel = new Vector2(1, 1);
    this.materials = {
      curl: createMaterial(FLUID_CURL_SHADER, {
        uTexelSize: { value: texel.clone() },
        uVelocity: { value: null },
      }),
      vorticity: createMaterial(FLUID_VORTICITY_SHADER, {
        uCurl: { value: null },
        uCurlStrength: { value: HERO_FLUID_CONFIG.curlStrength },
        uPointer: { value: this.pointer },
        uPointerDelta: { value: this.pointerDelta },
        uResolution: { value: this.viewportSize },
        uSplatForce: { value: HERO_FLUID_CONFIG.velocityScale * 3000 },
        uSplatRadius: { value: Math.max(0.002 * HERO_FLUID_CONFIG.radius, 0.0005) },
        uTexelSize: { value: texel.clone() },
        uVelocity: { value: null },
      }),
      divergence: createMaterial(FLUID_DIVERGENCE_SHADER, {
        uTexelSize: { value: texel.clone() },
        uVelocity: { value: null },
      }),
      clear: createMaterial(FLUID_CLEAR_SHADER, {}),
      pressure: createMaterial(FLUID_PRESSURE_SHADER, {
        uDivergence: { value: null },
        uPressure: { value: null },
        uTexelSize: { value: texel.clone() },
      }),
      gradient: createMaterial(FLUID_GRADIENT_SHADER, {
        uPressure: { value: null },
        uTexelSize: { value: texel.clone() },
        uVelocity: { value: null },
      }),
      advect: createMaterial(FLUID_ADVECT_SHADER, {
        uDissipation: { value: HERO_FLUID_CONFIG.velocityDissipation },
        uProjectedVelocity: { value: null },
        uTexelSize: { value: texel.clone() },
      }),
    };
    this.quad = new Mesh(this.geometry, this.materials.clear);
    this.scene.add(this.quad);
  }

  get texture() {
    return this.velocityRead.texture;
  }

  setSize(width: number, height: number) {
    const aspect = width / Math.max(1, height);
    const base = HERO_FLUID_CONFIG.resolution;
    const simWidth = aspect > 1 ? Math.round(base * aspect) : base;
    const simHeight = aspect > 1 ? base : Math.round(base / Math.max(aspect, 0.0001));
    this.viewportSize.set(width, height);
    this.simSize.set(simWidth, simHeight);
    for (const target of this.targets()) target.setSize(simWidth, simHeight);
    const texelX = 1 / simWidth;
    const texelY = 1 / simHeight;
    for (const material of Object.values(this.materials)) {
      const uniform = material.uniforms["uTexelSize"];
      if (uniform) uniform.value.set(texelX, texelY);
    }
  }

  step(renderer: WebGLRenderer) {
    const previousTarget = renderer.getRenderTarget();
    setTexture(this.materials.curl, "uVelocity", this.velocityRead.texture);
    this.render(renderer, this.materials.curl, this.curlTarget);
    setTexture(this.materials.vorticity, "uVelocity", this.velocityRead.texture);
    setTexture(this.materials.vorticity, "uCurl", this.curlTarget.texture);
    this.render(renderer, this.materials.vorticity, this.vorticityTarget);
    setTexture(this.materials.divergence, "uVelocity", this.vorticityTarget.texture);
    this.render(renderer, this.materials.divergence, this.divergenceTarget);
    this.render(renderer, this.materials.clear, this.pressureA);
    let pressureRead = this.pressureA;
    let pressureWrite = this.pressureB;
    for (let index = 0; index < HERO_FLUID_CONFIG.pressureIterations; index += 1) {
      setTexture(this.materials.pressure, "uPressure", pressureRead.texture);
      setTexture(this.materials.pressure, "uDivergence", this.divergenceTarget.texture);
      this.render(renderer, this.materials.pressure, pressureWrite);
      [pressureRead, pressureWrite] = [pressureWrite, pressureRead];
    }
    setTexture(this.materials.gradient, "uVelocity", this.vorticityTarget.texture);
    setTexture(this.materials.gradient, "uPressure", pressureRead.texture);
    this.render(renderer, this.materials.gradient, this.projectedVelocityTarget);
    setTexture(this.materials.advect, "uProjectedVelocity", this.projectedVelocityTarget.texture);
    this.render(renderer, this.materials.advect, this.velocityWrite);
    [this.velocityRead, this.velocityWrite] = [this.velocityWrite, this.velocityRead];
    renderer.setRenderTarget(previousTarget);
  }

  dispose() {
    this.geometry.dispose();
    for (const material of Object.values(this.materials)) material.dispose();
    for (const target of this.targets()) target.dispose();
  }

  private render(renderer: WebGLRenderer, material: ShaderMaterial, target: WebGLRenderTarget) {
    this.quad.material = material;
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(this.scene, this.camera);
  }

  private targets() {
    return [
      this.velocityRead,
      this.velocityWrite,
      this.curlTarget,
      this.vorticityTarget,
      this.divergenceTarget,
      this.pressureA,
      this.pressureB,
      this.projectedVelocityTarget,
    ];
  }
}
