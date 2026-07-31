"use client";

import { useId } from "react";

import { useTheme } from "@/features/theme/ThemeProvider";

interface ThemeButtonProps {
  readonly className?: string | undefined;
}

export function ThemeButton({ className }: ThemeButtonProps) {
  const { cycleTheme, resolvedTheme, theme } = useTheme();
  const descriptionId = useId();

  return (
    <button
      type="button"
      className={className}
      aria-label="Tema"
      aria-pressed={theme !== "system"}
      aria-describedby={descriptionId}
      onClick={cycleTheme}
    >
      {`TEMA[${theme === "system" ? "A" : theme === "dark" ? "D" : "L"}]`}
      <span id={descriptionId} className="visuallyHidden">
        {`Modo ${theme}; aparência ${resolvedTheme}`}
      </span>
    </button>
  );
}
