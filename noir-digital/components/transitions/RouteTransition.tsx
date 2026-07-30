"use client";

import { useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { EntryRevealCanvas } from "@/components/preloader/EntryRevealCanvas";

import styles from "./RouteTransition.module.css";

const TRANSITION_DURATION_MS = 800;

type TransitionPhase = "covering" | "idle" | "revealing";

function resolveInternalDestination(anchor: HTMLAnchorElement): string | null {
  if (anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return null;
  const current = new URL(window.location.href);
  const destination = new URL(anchor.href, current);
  if (destination.origin !== current.origin) return null;
  if (destination.pathname === current.pathname && destination.search === current.search)
    return null;
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function RouteTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const navigationTimerRef = useRef(0);
  const revealTimerRef = useRef(0);
  const pendingDestinationRef = useRef<string | null>(null);
  const prefetchedDestinationsRef = useRef(new Set<string>());
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (pathname === previousPathnameRef.current) return;
    previousPathnameRef.current = pathname;
    if (!pendingDestinationRef.current) return;

    pendingDestinationRef.current = null;
    setPhase("revealing");
    revealTimerRef.current = window.setTimeout(() => {
      setPhase("idle");
      delete document.documentElement.dataset["routeTransition"];
    }, TRANSITION_DURATION_MS);
  }, [pathname]);

  useEffect(() => {
    const handleIntent = (event: Event) => {
      const element = event.target instanceof Element ? event.target : null;
      const anchor = element?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const destination = resolveInternalDestination(anchor);
      if (!destination || prefetchedDestinationsRef.current.has(destination)) return;

      prefetchedDestinationsRef.current.add(destination);
      router.prefetch(destination);
    };

    document.addEventListener("pointerover", handleIntent, true);
    document.addEventListener("focusin", handleIntent, true);
    return () => {
      document.removeEventListener("pointerover", handleIntent, true);
      document.removeEventListener("focusin", handleIntent, true);
    };
  }, [router]);

  useEffect(() => {
    const handleClick = (event: globalThis.MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const element = event.target instanceof Element ? event.target : null;
      const anchor = element?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const destination = resolveInternalDestination(anchor);
      if (!destination) return;

      event.preventDefault();
      if (reducedMotion) {
        router.push(destination);
        return;
      }
      if (phase !== "idle") return;

      if (!prefetchedDestinationsRef.current.has(destination)) {
        prefetchedDestinationsRef.current.add(destination);
        router.prefetch(destination);
      }
      pendingDestinationRef.current = destination;
      document.documentElement.dataset["routeTransition"] = "true";
      setPhase("covering");
      navigationTimerRef.current = window.setTimeout(
        () => router.push(destination),
        TRANSITION_DURATION_MS,
      );
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [phase, reducedMotion, router]);

  useEffect(
    () => () => {
      window.clearTimeout(navigationTimerRef.current);
      window.clearTimeout(revealTimerRef.current);
      delete document.documentElement.dataset["routeTransition"];
    },
    [],
  );

  if (phase === "idle") return null;

  return (
    <div className={styles["root"]} aria-hidden="true" data-route-transition={phase}>
      <EntryRevealCanvas
        active
        className={styles["canvas"]}
        direction={phase === "covering" ? "cover" : "reveal"}
        durationMs={TRANSITION_DURATION_MS}
      />
    </div>
  );
}
