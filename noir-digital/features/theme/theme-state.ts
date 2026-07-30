export type ThemeMode = "system" | "light" | "dark";

function assertNever(value: never): never {
  throw new Error(`Unexpected theme mode: ${String(value)}`);
}

export function nextTheme(theme: ThemeMode): ThemeMode {
  switch (theme) {
    case "system":
      return "light";
    case "light":
      return "dark";
    case "dark":
      return "system";
    default:
      return assertNever(theme);
  }
}
