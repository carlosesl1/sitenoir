"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WORK_CANVAS_ROOT_MARGIN = "150% 0px";

const WorkCardCanvas = dynamic(
  () => import("@/scene/WorkCardCanvas").then((module) => module.WorkCardCanvas),
  {
    loading: () => null,
    ssr: false,
  },
);

export function LazyWorkCardCanvas({ className }: { readonly className: string | undefined }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) return;

    const section = document.getElementById("selected-work");
    if (!section || typeof IntersectionObserver === "undefined") {
      setEnabled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setEnabled(true);
      },
      { rootMargin: WORK_CANVAS_ROOT_MARGIN },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, [enabled]);

  return enabled ? <WorkCardCanvas className={className} /> : null;
}
