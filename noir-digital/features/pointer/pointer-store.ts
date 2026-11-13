"use client";

import { useSyncExternalStore } from "react";

export interface PointerSnapshot {
  readonly clientX: number;
  readonly clientY: number;
  readonly inside: boolean;
  readonly lastMovedAt: number;
  readonly normalizedX: number;
  readonly normalizedY: number;
}

export interface PointerStore {
  readonly subscribe: (listener: () => void) => () => void;
  readonly getSnapshot: () => PointerSnapshot;
  readonly getServerSnapshot: () => PointerSnapshot;
}

const SERVER_SNAPSHOT: PointerSnapshot = Object.freeze({
  clientX: 0,
  clientY: 0,
  inside: false,
  lastMovedAt: 0,
  normalizedX: 0,
  normalizedY: 0,
});

export function createPointerStore(): PointerStore {
  let snapshot = SERVER_SNAPSHOT;
  let animationFrame = 0;
  let pendingPointer: PointerSnapshot | null = null;
  const listeners = new Set<() => void>();

  const publish = () => {
    animationFrame = 0;
    if (!pendingPointer) return;
    snapshot = pendingPointer;
    pendingPointer = null;
    for (const listener of listeners) listener();
  };

  // A finger is not a cursor: it lands at a point and vanishes, so following it
  // makes the scene snap on every tap and stay tilted after the touch ends.
  const updatePointer = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);
    pendingPointer = Object.freeze({
      clientX: event.clientX,
      clientY: event.clientY,
      inside: true,
      lastMovedAt: performance.now(),
      normalizedX: (event.clientX / width) * 2 - 1,
      normalizedY: 1 - (event.clientY / height) * 2,
    });
    animationFrame ||= window.requestAnimationFrame(publish);
  };

  const markPointerOutside = (event: PointerEvent) => {
    if (event.relatedTarget !== null || event.pointerType === "touch") return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    pendingPointer = null;
    snapshot = Object.freeze({ ...snapshot, inside: false });
    for (const listener of listeners) listener();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) {
        window.addEventListener("pointermove", updatePointer, { passive: true });
        window.addEventListener("pointerout", markPointerOutside, { passive: true });
      }

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = 0;
          pendingPointer = null;
          window.removeEventListener("pointermove", updatePointer);
          window.removeEventListener("pointerout", markPointerOutside);
        }
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => SERVER_SNAPSHOT,
  };
}

export const pointerStore = createPointerStore();

export function usePointerSnapshot(store: PointerStore = pointerStore): PointerSnapshot {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
