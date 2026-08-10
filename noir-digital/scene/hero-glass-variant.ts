export type HeroGlassVariant = "current" | "canvas-ui";

export function resolveHeroGlassVariant(search: string): HeroGlassVariant {
  return new URLSearchParams(search).get("glass") === "canvas-ui" ? "canvas-ui" : "current";
}
