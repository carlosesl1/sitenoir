"use client";

import { useEffect, useState } from "react";

import { PointerCoordinates } from "@/components/controls/PointerCoordinates";
import { WEATHER_FALLBACK, type WeatherResult } from "@/features/weather/weather";

import styles from "./Header.module.css";

const VISUAL_TEST_MODE = process.env["NEXT_PUBLIC_VISUAL_TEST_MODE"] === "1";
const BRAZIL_TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Sao_Paulo",
});

function formatBrazilTime(): string {
  return BRAZIL_TIME_FORMATTER.format(new Date());
}

function isWeatherResult(value: unknown): value is WeatherResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return (
    Number.isFinite(Reflect.get(value, "temperature")) && Reflect.get(value, "location") === "BR"
  );
}

export function HeaderStatus({ hidden = false }: { readonly hidden?: boolean } = {}) {
  const [clock, setClock] = useState(VISUAL_TEST_MODE ? "00:00" : formatBrazilTime);
  const [weather, setWeather] = useState<WeatherResult>(WEATHER_FALLBACK);
  const [contactActive, setContactActive] = useState(false);

  useEffect(() => {
    if (VISUAL_TEST_MODE) return;
    const abortController = new AbortController();
    const updateClock = () => setClock(formatBrazilTime());
    const timer = window.setInterval(updateClock, 30_000);

    if (typeof window.fetch === "function") {
      void window
        .fetch("/api/weather", { cache: "no-store", signal: abortController.signal })
        .then((response) => response.json())
        .then((payload: unknown) => {
          if (isWeatherResult(payload)) setWeather(payload);
        })
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            setWeather(WEATHER_FALLBACK);
          }
        });
    }

    return () => {
      abortController.abort();
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const contact = document.querySelector("#contact");
    if (!contact || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setContactActive((entry?.intersectionRatio ?? 0) > 0.55),
      { threshold: [0.55] },
    );
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  const className = contactActive || hidden
    ? `${styles["statusBar"]} ${styles["hiddenStatus"]}`
    : styles["statusBar"];

  return (
    <div className={className} aria-hidden={contactActive || hidden}>
      <span className={styles["clock"]} suppressHydrationWarning>
        <span className={styles["desktopClockPrefix"]}>GMT-3 BR </span>
        {clock} {weather.temperature}°C
      </span>
      <PointerCoordinates className={styles["statusCoordinates"]} />
      <span className={styles["statusMark"]} aria-hidden="true" />
    </div>
  );
}
