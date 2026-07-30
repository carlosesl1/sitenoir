export type WeatherResult = {
  readonly temperature: number;
  readonly location: "BR";
};

export const WEATHER_FALLBACK = {
  temperature: 24,
  location: "BR",
} as const satisfies WeatherResult;

export const VISUAL_TEST_FIXTURE = {
  clock: "00:00",
  weather: WEATHER_FALLBACK,
  pointer: {
    clientX: 640,
    clientY: 360,
  },
  stickerSeed: 2026,
  animationProgress: 0,
} as const;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseWeatherPayload(payload: unknown): WeatherResult {
  if (!isRecord(payload) || payload["code"] !== "200") {
    return WEATHER_FALLBACK;
  }

  const now = payload["now"];
  if (!isRecord(now) || typeof now["temp"] !== "string") {
    return WEATHER_FALLBACK;
  }

  const temperature = Number(now["temp"]);
  if (!Number.isFinite(temperature)) {
    return WEATHER_FALLBACK;
  }

  return {
    temperature,
    location: "BR",
  };
}

export async function resolveWeather(load: () => Promise<unknown>): Promise<WeatherResult> {
  try {
    const payload = await load();
    return parseWeatherPayload(payload);
  } catch {
    // no-excuse-ok: catch -- provider failures intentionally collapse to a stable UI fallback.
    return WEATHER_FALLBACK;
  }
}
