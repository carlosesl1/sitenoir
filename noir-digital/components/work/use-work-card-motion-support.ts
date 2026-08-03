"use client";

import { useEffect, useState } from "react";

export const WORK_CARD_MOTION_QUERY = "(hover: hover) and (pointer: fine)";

export function useWorkCardMotionSupport(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia(WORK_CARD_MOTION_QUERY);
    const synchronize = () => setSupported(mediaQuery.matches);
    synchronize();
    mediaQuery.addEventListener("change", synchronize);
    return () => mediaQuery.removeEventListener("change", synchronize);
  }, []);

  return supported;
}
