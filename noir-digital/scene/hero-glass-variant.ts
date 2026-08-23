export type HeroGlassVariant = "current" | "canvas-ui";

export function resolveHeroGlassVariant(search: string): HeroGlassVariant {
  return new URLSearchParams(search).get("glass") === "current" ? "current" : "canvas-ui";
}
