"use client";

import {
  createContext,
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import type { PrincipleProgressStage } from "@/components/principles/principles-progress";

interface PrincipleSceneContextValue {
  readonly active: boolean;
  readonly fullscreen: boolean;
  readonly setActive: (active: boolean) => void;
  readonly setFullscreen: (fullscreen: boolean) => void;
  readonly progressRef: MutableRefObject<number>;
  readonly sectionRef: MutableRefObject<HTMLElement | null>;
  readonly sectionRectRef: MutableRefObject<PrincipleSectionRect | null>;
  readonly setProgress: (progress: number) => void;
  readonly setStage: (stage: PrincipleProgressStage) => void;
  readonly stage: PrincipleProgressStage;
}

export interface PrincipleSectionRect {
  readonly bottom: number;
  readonly height: number;
  readonly top: number;
}

const NOOP = () => undefined;
const DEFAULT_PROGRESS_REF = { current: 0 };
const DEFAULT_SECTION_RECT_REF = { current: null };
const PrincipleSceneContext = createContext<PrincipleSceneContextValue>({
  active: false,
  fullscreen: false,
  progressRef: DEFAULT_PROGRESS_REF,
  sectionRef: { current: null },
  sectionRectRef: DEFAULT_SECTION_RECT_REF,
  setActive: NOOP,
  setFullscreen: NOOP,
  setProgress: NOOP,
  setStage: NOOP,
  stage: "positioning",
});

export function PrincipleSceneProvider({ children }: { readonly children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [stage, setStage] = useState<PrincipleProgressStage>("positioning");
  const progressRef = useRef(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const sectionRectRef = useRef<PrincipleSectionRect | null>(null);
  const setProgress = useCallback((progress: number) => {
    progressRef.current = Math.min(1, Math.max(0, progress));
  }, []);
  const value = useMemo(
    () => ({
      active,
      fullscreen,
      progressRef,
      sectionRef,
      sectionRectRef,
      setActive,
      setFullscreen,
      setProgress,
      setStage,
      stage,
    }),
    [active, fullscreen, setProgress, stage],
  );

  return <PrincipleSceneContext.Provider value={value}>{children}</PrincipleSceneContext.Provider>;
}

export function usePrincipleScene(): PrincipleSceneContextValue {
  return useContext(PrincipleSceneContext);
}
