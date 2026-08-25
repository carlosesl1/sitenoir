export type ThreeDimensionalTheme = "dark" | "light";

export const LIGHT_THREE_DIMENSIONAL_COLOR = "#0074e8";

export function resolveThreeDimensionalColor(
  theme: ThreeDimensionalTheme,
  darkColor: string,
): string {
  return theme === "light" ? LIGHT_THREE_DIMENSIONAL_COLOR : darkColor;
}
