"use client";

import Lenis from "lenis";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { CustomScrollbar } from "@/features/scroll/CustomScrollbar";
import { type SectionTarget, sectionSelector } from "@/features/scroll/scroll-targets";

interface ScrollContextValue {
  readonly scrollTo: (target: SectionTarget) => void;
  readonly scrollToSelector: (selector: `#${string}`) => void;
}

const ScrollContext = createContext<ScrollContextValue | null>(null);
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function ScrollProvider({ children }: { readonly children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const lenisFrameRef = useRef(0);
  const unsubscribeVirtualScrollRef = useRef<(() => void) | null>(null);

  const wakeLenis = useCallback(() => {
    if (lenisFrameRef.current !== 0) return;
    const tick = (time: number) => {
      lenisFrameRef.current = 0;
      const lenis = lenisRef.current;
      if (!lenis) return;
      lenis.raf(time);
      if (lenis.isScrolling !== false) {
        lenisFrameRef.current = window.requestAnimationFrame(tick);
      }
    };
    lenisFrameRef.current = window.requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const destroyLenis = () => {
      window.cancelAnimationFrame(lenisFrameRef.current);
      lenisFrameRef.current = 0;
      unsubscribeVirtualScrollRef.current?.();
      unsubscribeVirtualScrollRef.current = null;
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };

    const synchronizeLenis = () => {
      if (mediaQuery.matches) {
        destroyLenis();
        return;
      }

      if (lenisRef.current) return;
      const lenis = new Lenis({
        anchors: false,
        autoRaf: false,
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: true,
      });
      lenisRef.current = lenis;
      unsubscribeVirtualScrollRef.current = lenis.on("virtual-scroll", wakeLenis);
    };

    synchronizeLenis();
    mediaQuery.addEventListener("change", synchronizeLenis);
    return () => {
      mediaQuery.removeEventListener("change", synchronizeLenis);
      destroyLenis();
    };
  }, [wakeLenis]);

  const scrollToSelector = useCallback(
    (selector: `#${string}`) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(selector);
        wakeLenis();
        return;
      }

      document.querySelector<HTMLElement>(selector)?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    },
    [wakeLenis],
  );

  const scrollTo = useCallback(
    (target: SectionTarget) => scrollToSelector(sectionSelector(target)),
    [scrollToSelector],
  );

  const value = useMemo(() => ({ scrollTo, scrollToSelector }), [scrollTo, scrollToSelector]);
  return (
    <ScrollContext.Provider value={value}>
      {children}
      <CustomScrollbar />
    </ScrollContext.Provider>
  );
}

export function useScroll(): ScrollContextValue {
  const context = useContext(ScrollContext);
  if (!context) throw new Error("useScroll must be used within ScrollProvider");
  return context;
}
