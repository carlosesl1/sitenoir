"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { safeStorageGet, safeStorageSet } from "@/features/storage/safe-storage";
import { nextTheme, type ThemeMode } from "@/features/theme/theme-state";

type ResolvedTheme = Exclude<ThemeMode, "system">;

interface ThemeContextValue {
  readonly theme: ThemeMode;
  readonly resolvedTheme: ResolvedTheme;
  readonly setTheme: (theme: ThemeMode) => void;
  readonly cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const storedTheme = safeStorageGet("theme");
  return isThemeMode(storedTheme) ? storedTheme : "system";
}

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("dark");
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    const synchronizeSystemTheme = () => setSystemTheme(mediaQuery.matches ? "dark" : "light");

    setTheme(readStoredTheme());
    synchronizeSystemTheme();
    mediaQuery.addEventListener("change", synchronizeSystemTheme);
    return () => mediaQuery.removeEventListener("change", synchronizeSystemTheme);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.dataset["theme"] = resolvedTheme;
    safeStorageSet("theme", theme);
  }, [resolvedTheme, theme]);

  const cycleTheme = useCallback(() => setTheme((currentTheme) => nextTheme(currentTheme)), []);
  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, cycleTheme }),
    [theme, resolvedTheme, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
