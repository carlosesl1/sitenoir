export function initializeTheme(): void {
  try {
    const storedTheme = window.localStorage.getItem("theme");
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system";
    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.dataset["theme"] = resolvedTheme;
  } catch {
    return;
  }
}

export const themeBootstrapScript = `(${initializeTheme.toString()})();`;
