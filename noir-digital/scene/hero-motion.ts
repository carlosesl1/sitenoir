const HERO_EXIT_END_PROGRESS = 0.095;

export function resolveHeroExitProgress(scrollProgress: number): number {
  return Math.min(1, Math.max(0, scrollProgress / HERO_EXIT_END_PROGRESS));
}
