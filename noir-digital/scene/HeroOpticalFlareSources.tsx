"use client";

import { createContext, type ReactNode, type RefObject, useContext, useMemo, useRef } from "react";
import type { Mesh } from "three";

export interface HeroOpticalFlareSources {
  readonly wordmark: RefObject<Mesh | null>;
  readonly pointer: RefObject<Mesh | null>;
}

const Context = createContext<HeroOpticalFlareSources | null>(null);

export function HeroOpticalFlareProvider({ children }: { readonly children: ReactNode }) {
  const wordmark = useRef<Mesh>(null);
  const pointer = useRef<Mesh>(null);
  const sources = useMemo(() => ({ wordmark, pointer }), []);
  return <Context.Provider value={sources}>{children}</Context.Provider>;
}

export function useHeroOpticalFlareSources() {
  return useContext(Context);
}
