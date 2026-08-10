import { AdditiveBlending, DoubleSide, ShaderMaterial } from "three";

import { HERO_CANVAS_UI_SPECTRUM_CONFIG as config } from "@/scene/hero-canvas-ui-spectrum-config";
import {
  HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER,
  HERO_CANVAS_UI_SPECTRUM_VERTEX_SHADER,
} from "@/scene/hero-canvas-ui-spectrum-shaders";

export function createHeroCanvasUiSpectrumMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    blending: AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    fragmentShader: HERO_CANVAS_UI_SPECTRUM_FRAGMENT_SHADER,
    polygonOffset: true,
    polygonOffsetFactor: config.polygonOffsetFactor,
    polygonOffsetUnits: config.polygonOffsetUnits,
    side: DoubleSide,
    toneMapped: false,
    transparent: true,
    uniforms: {
      uBandFrequency: { value: config.bandFrequency },
      uBandSharpness: { value: config.bandSharpness },
      uBandStrength: { value: config.bandStrength },
      uMaximumOpacity: { value: config.maximumOpacity },
      uRimPower: { value: config.rimPower },
      uRimStrength: { value: config.rimStrength },
      uSaturation: { value: config.saturation },
    },
    vertexShader: HERO_CANVAS_UI_SPECTRUM_VERTEX_SHADER,
  });
}
