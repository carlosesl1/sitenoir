"use client";

import { useId } from "react";
import { useLanguage } from "@/features/i18n/LanguageProvider";
import { useTheme } from "@/features/theme/ThemeProvider";

interface ThemeButtonProps {
  readonly className?: string | undefined;
}

export function ThemeButton({ className }: ThemeButtonProps) {
  const { t, language } = useLanguage();
  const { cycleTheme, resolvedTheme, theme } = useTheme();
  const descriptionId = useId();

  return (
    <button
      type="button"
      className={className}
      aria-label={t("Tema")}
      aria-pressed={theme !== "system"}
      aria-describedby={descriptionId}
      onClick={cycleTheme}
    >
      {`${t("TEMA")}[${theme === "system" ? "A" : theme === "dark" ? "D" : "L"}]`}
      <span id={descriptionId} className="visuallyHidden">
        {language === "en"
          ? `${theme} mode; ${resolvedTheme} appearance`
          : `Modo ${theme}; aparência ${resolvedTheme}`}
      </span>
    </button>
  );
}
