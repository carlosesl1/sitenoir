const WORK_CARD_SCROLL_CURL_MAX = 0;

export function resolveWorkCardCurl(scrollVelocity: number): number {
  const normalizedVelocity = Math.min(1, Math.abs(scrollVelocity) / 800);
  return normalizedVelocity * WORK_CARD_SCROLL_CURL_MAX;
}
