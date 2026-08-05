"use client";

import { lazy, Suspense, useEffect, useState } from "react";

import { useWorkCardMotionSupport } from "@/components/work/use-work-card-motion-support";

const WORK_CANVAS_ROOT_MARGIN = "10% 0px";

const DeferredWorkCardCanvas = lazy(() =>
  import("@/scene/WorkCardCanvas").then((module) => ({ default: module.WorkCardCanvas })),
);

export function LazyWorkCardCanvas({ className }: { readonly className: string | undefined }) {
  const [enabled, setEnabled] = useState(false);
  const motionSupported = useWorkCardMotionSupport();

  useEffect(() => {
    if (enabled || !motionSupported) return;

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
  }, [enabled, motionSupported]);

  return enabled && motionSupported ? (
    <Suspense fallback={null}>
      <DeferredWorkCardCanvas className={className} />
    </Suspense>
  ) : null;
}
