import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/weather/route";
import { WEATHER_FALLBACK } from "@/features/weather/weather";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/weather", () => {
  it("returns the fallback without contacting QWeather when no server key is configured", async () => {
    // Given
    vi.stubEnv("QWEATHER_API_KEY", "");
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    // When
    const response = await GET();

    // Then
    expect(await response.json()).toEqual(WEATHER_FALLBACK);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches current São Paulo weather without exposing provider credentials", async () => {
    // Given
    vi.stubEnv("QWEATHER_API_KEY", "test-provider-key");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        code: "200",
        now: { temp: "31" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    // When
    const response = await GET();
    const body: unknown = await response.json();

    // Then
    expect(body).toEqual({ temperature: 31, location: "BR" });
    expect(JSON.stringify(body)).not.toContain("test-provider-key");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [request, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(request)).toContain("location=-46.63%2C-23.55");
    expect(String(request)).not.toContain("test-provider-key");
    expect(init?.cache).toBe("no-store");
    expect(new Headers(init?.headers).get("X-QW-Api-Key")).toBe("test-provider-key");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns the fallback when the upstream response is not successful", async () => {
    // Given
    vi.stubEnv("QWEATHER_API_KEY", "test-provider-key");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("upstream unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    // When
    const response = await GET();

    // Then
    expect(await response.json()).toEqual(WEATHER_FALLBACK);
  });
});
