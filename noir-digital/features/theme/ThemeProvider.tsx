"use client";

import { createContext, type ReactNode, useContext } from "react";

interface ThemeContextValue {
  readonly resolvedTheme: "dark";
}

// NOIR has a single appearance: black. The scene still reads it through this context.
const THEME: ThemeContextValue = { resolvedTheme: "dark" };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  return <ThemeContext.Provider value={THEME}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
