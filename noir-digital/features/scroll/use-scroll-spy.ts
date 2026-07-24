"use client";

import { useEffect, useState } from "react";

const DEFAULT_ROOT_MARGIN = "-18% 0px -72% 0px";

type UseScrollSpyOptions<Id extends string> = {
  readonly ids: readonly Id[];
  readonly initialId: Id;
  readonly rootMargin?: string;
};

export function useScrollSpy<Id extends string>({
  ids,
  initialId,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: UseScrollSpyOptions<Id>): Id {
  const [activeId, setActiveId] = useState<Id>(initialId);

  useEffect(() => {
    setActiveId(initialId);
    if (typeof IntersectionObserver === "undefined") return;

    const order = new Map(ids.map((id, index) => [id, index] as const));
    const intersecting = new Set<Id>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as Id;
          if (!order.has(id)) continue;

          if (entry.isIntersecting) intersecting.add(id);
          else intersecting.delete(id);
        }

        const next = [...intersecting]
          .sort((left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0))
          .at(-1);

        if (next) {
          setActiveId((current) => (current === next ? current : next));
        }
      },
      { rootMargin, threshold: 0 },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [ids, initialId, rootMargin]);

  return activeId;
}
