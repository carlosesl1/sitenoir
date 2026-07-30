import { resolveWeather, WEATHER_FALLBACK, type WeatherResult } from "@/features/weather/weather";

const QWEATHER_ENDPOINT = "https://devapi.qweather.com/v7/weather/now";
const SAO_PAULO_COORDINATES = "-46.63,-23.55";
const WEATHER_TIMEOUT_MS = 3_500;
const WEATHER_CACHE_MS = 5 * 60 * 1_000;
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
} as const;

export const dynamic = "force-static";

let cachedWeather: { readonly expiresAt: number; readonly value: WeatherResult } | null = null;
let pendingWeather: Promise<WeatherResult> | null = null;

export async function GET(): Promise<Response> {
  const providerKey = process.env["QWEATHER_API_KEY"]?.trim();
  if (!providerKey) {
    return Response.json(WEATHER_FALLBACK, { headers: NO_STORE_HEADERS });
  }

  if (
    process.env["NODE_ENV"] === "production" &&
    cachedWeather !== null &&
    cachedWeather.expiresAt > Date.now()
  ) {
    return Response.json(cachedWeather.value, { headers: NO_STORE_HEADERS });
  }

  const upstreamUrl = new URL(QWEATHER_ENDPOINT);
  upstreamUrl.searchParams.set("location", SAO_PAULO_COORDINATES);

  const requestWeather = () =>
    resolveWeather(async () => {
      const response = await fetch(upstreamUrl, {
        cache: "no-store",
        headers: { Accept: "application/json", "X-QW-Api-Key": providerKey },
        signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS),
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    });

  let weather: WeatherResult;
  if (process.env["NODE_ENV"] === "production") {
    pendingWeather ??= requestWeather().finally(() => {
      pendingWeather = null;
    });
    weather = await pendingWeather;
  } else {
    weather = await requestWeather();
  }

  if (process.env["NODE_ENV"] === "production") {
    cachedWeather = { expiresAt: Date.now() + WEATHER_CACHE_MS, value: weather };
  }

  return Response.json(weather, { headers: NO_STORE_HEADERS });
}
