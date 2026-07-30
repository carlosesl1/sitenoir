import { describe, expect, it } from "vitest";

import {
  parseWeatherPayload,
  resolveWeather,
  VISUAL_TEST_FIXTURE,
  WEATHER_FALLBACK,
} from "@/features/weather/weather";

describe("parseWeatherPayload", () => {
  it("returns the public weather shape when QWeather succeeds", () => {
    // Given
    const payload = {
      code: "200",
      now: {
        temp: "32",
      },
    };

    // When
    const result = parseWeatherPayload(payload);

    // Then
    expect(result).toEqual({ temperature: 32, location: "BR" });
    expect(result).not.toHaveProperty("key");
  });

  it.each([
    null,
    {},
    { code: "500", now: { temp: "32" } },
    { code: "200", now: {} },
    { code: "200", now: { temp: "not-a-temperature" } },
  ])("returns the deterministic fallback for malformed payload %#", (payload) => {
    // Given
    const malformedPayload: unknown = payload;

    // When
    const result = parseWeatherPayload(malformedPayload);

    // Then
    expect(result).toEqual(WEATHER_FALLBACK);
  });
});

describe("resolveWeather", () => {
  it("returns the deterministic fallback when the network loader rejects", async () => {
    // Given
    const load = async (): Promise<unknown> => {
      throw new TypeError("network unavailable");
    };

    // When
    const result = await resolveWeather(load);

    // Then
    expect(result).toEqual(WEATHER_FALLBACK);
  });
});

describe("VISUAL_TEST_FIXTURE", () => {
  it("freezes all public dynamic values for browser fixtures", () => {
    // Given
    const expectedFixture = {
      clock: "00:00",
      weather: { temperature: 24, location: "BR" },
      pointer: { clientX: 640, clientY: 360 },
      stickerSeed: 2026,
      animationProgress: 0,
    };

    // When
    const fixture = VISUAL_TEST_FIXTURE;

    // Then
    expect(fixture).toEqual(expectedFixture);
  });
});
