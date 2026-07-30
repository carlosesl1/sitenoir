"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

export interface WorkCardAnimationFrame {
  readonly scrollSpeed: number;
  readonly time: number;
}

type WorkCardAnimationCallback = (frame: WorkCardAnimationFrame) => void;

interface WorkCardAnimationRegistry {
  readonly activeSize: () => number;
  readonly register: (callback: WorkCardAnimationCallback) => () => void;
  readonly run: (frame: WorkCardAnimationFrame) => void;
  readonly setActive: (callback: WorkCardAnimationCallback, active: boolean) => void;
  readonly size: () => number;
}

interface WorkCardAnimationContextValue {
  readonly requestFrame: () => void;
  readonly registerCard: (element: HTMLElement, callback: WorkCardAnimationCallback) => () => void;
}

const WorkCardAnimationContext = createContext<WorkCardAnimationContextValue | null>(null);

export function createWorkCardAnimationRegistry(): WorkCardAnimationRegistry {
  const callbacks = new Set<WorkCardAnimationCallback>();
  const activeCallbacks = new Set<WorkCardAnimationCallback>();

  return {
    activeSize: () => activeCallbacks.size,
    register(callback) {
      callbacks.add(callback);
      return () => {
        activeCallbacks.delete(callback);
        callbacks.delete(callback);
      };
    },
    run(frame) {
      for (const callback of activeCallbacks) callback(frame);
    },
    setActive(callback, active) {
      if (!callbacks.has(callback)) return;
      if (active) activeCallbacks.add(callback);
      else activeCallbacks.delete(callback);
    },
    size: () => callbacks.size,
  };
}

export function WorkCardAnimationProvider({ children }: { readonly children: ReactNode }) {
  const registry = useMemo(createWorkCardAnimationRegistry, []);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const registrationsRef = useRef(new Map<Element, WorkCardAnimationCallback>());
  const previousFrameRef = useRef<{ readonly scrollY: number; readonly time: number } | null>(null);
  const smoothedSpeedRef = useRef(0);
  const animationFrameRef = useRef(0);
  const runFrameRef = useRef<(time: number) => void>(() => undefined);

  const requestFrame = useCallback(() => {
    if (animationFrameRef.current !== 0 || document.hidden || registry.activeSize() === 0) {
      return;
    }
    animationFrameRef.current = window.requestAnimationFrame((time) => runFrameRef.current(time));
  }, [registry]);

  runFrameRef.current = (time) => {
    animationFrameRef.current = 0;
    if (document.hidden || registry.activeSize() === 0) return;

    const previous = previousFrameRef.current;
    const currentScrollY = window.scrollY;
    const deltaSeconds = previous
      ? Math.max(1 / 240, Math.min((time - previous.time) / 1000, 0.1))
      : 1 / 60;
    const speed = previous ? Math.abs(currentScrollY - previous.scrollY) / deltaSeconds : 0;
    const targetSpeed = Math.min(1, speed / 800);
    const currentSpeed = smoothedSpeedRef.current;
    const response = targetSpeed > currentSpeed ? 0.025 : 0.175;
    const mix = 1 - Math.exp(-deltaSeconds / response);
    const smoothedSpeed = currentSpeed + (targetSpeed - currentSpeed) * mix;
    smoothedSpeedRef.current = smoothedSpeed;
    previousFrameRef.current = { scrollY: currentScrollY, time };
    registry.run({ scrollSpeed: smoothedSpeed * 800, time });
    if (smoothedSpeed > 0.0005) requestFrame();
  };

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      for (const callback of registrationsRef.current.values()) registry.setActive(callback, true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const callback = registrationsRef.current.get(entry.target);
          if (!callback) continue;
          registry.setActive(callback, entry.isIntersecting);
          if (entry.isIntersecting) requestFrame();
          else callback({ scrollSpeed: 0, time: performance.now() });
        }
      },
      { rootMargin: "25% 0px", threshold: 0.01 },
    );
    observerRef.current = observer;
    for (const element of registrationsRef.current.keys()) observer.observe(element);

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [registry, requestFrame]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
        previousFrameRef.current = null;
        smoothedSpeedRef.current = 0;
        return;
      }
      requestFrame();
    };
    window.addEventListener("resize", requestFrame, { passive: true });
    window.addEventListener("scroll", requestFrame, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
      window.removeEventListener("resize", requestFrame);
      window.removeEventListener("scroll", requestFrame);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [requestFrame]);

  const registerCard = useCallback(
    (element: HTMLElement, callback: WorkCardAnimationCallback) => {
      const unregister = registry.register(callback);
      registrationsRef.current.set(element, callback);
      const observer = observerRef.current;
      if (observer) observer.observe(element);
      else if (typeof IntersectionObserver === "undefined") {
        registry.setActive(callback, true);
        requestFrame();
      }

      return () => {
        observerRef.current?.unobserve(element);
        registrationsRef.current.delete(element);
        unregister();
      };
    },
    [registry, requestFrame],
  );

  const value = useMemo(() => ({ registerCard, requestFrame }), [registerCard, requestFrame]);
  return (
    <WorkCardAnimationContext.Provider value={value}>{children}</WorkCardAnimationContext.Provider>
  );
}

export function useWorkCardAnimation(): WorkCardAnimationContextValue {
  const context = useContext(WorkCardAnimationContext);
  if (!context)
    throw new Error("useWorkCardAnimation must be used within WorkCardAnimationProvider");
  return context;
}
