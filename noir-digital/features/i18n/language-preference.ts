import type { Language } from "./translate";

export const LANGUAGE_STORAGE_KEY = "noir-language";

export function resolveLanguage(
  saved: string | null,
  languages: readonly string[],
  browserLanguage: string,
): Language {
  if (saved === "en" || saved === "pt") return saved;

  const preferences = languages.length > 0 ? languages : [browserLanguage];
  for (const preference of preferences) {
    const language = preference.toLowerCase().split("-")[0];
    if (language === "en" || language === "pt") return language;
  }
  return "pt";
}

export function readPreferredLanguage(): Language {
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    // Browser language detection also works when storage is unavailable.
  }
  return resolveLanguage(saved, window.navigator.languages, window.navigator.language);
}
