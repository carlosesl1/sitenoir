"use client";

import { useEffect } from "react";

import { useScroll } from "@/features/scroll/ScrollProvider";
import { resolveShortcut } from "@/features/shortcuts/shortcuts";

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function ShortcutController() {
  const { scrollTo } = useScroll();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) return;

      const action = resolveShortcut(event.key);
      if (action.type === "none") return;
      event.preventDefault();

      switch (action.type) {
        case "scroll":
          scrollTo(action.target);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollTo]);

  return null;
}
