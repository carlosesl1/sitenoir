"use client";

import { useLayoutEffect, useState } from "react";
import type { WebGLRenderer, WebGLRenderTarget } from "three";
import { createHeroCanvasUiEnvironment } from "./hero-canvas-ui-environment";
import { createSharedRendererResource } from "./shared-renderer-resource";

const environments = createSharedRendererResource(createHeroCanvasUiEnvironment);

export function useSharedOpticalEnvironment(renderer: WebGLRenderer) {
  const [environment, setEnvironment] = useState<WebGLRenderTarget | null>(null);
  useLayoutEffect(() => {
    const lease = environments.acquire(renderer);
    setEnvironment(lease.value);
    return lease.release;
  }, [renderer]);
  return environment;
}
