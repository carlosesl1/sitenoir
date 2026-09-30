import { LANGUAGE_STORAGE_KEY, resolveLanguage } from "./language-preference";

// This function is serialized into the static document head. All dependencies
// must be passed explicitly so it can run before the application bundle loads.
function initializeLanguage(resolve: typeof resolveLanguage, storageKey: string): void {
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(storageKey);
  } catch {
    // Detection does not require local storage.
  }
  const language = resolve(saved, window.navigator.languages, window.navigator.language);
  const root = document.documentElement;
  root.lang = language === "en" ? "en" : "pt-BR";

  if (language === "en") {
    root.dataset["languagePending"] = "true";
    // If the application bundle fails, leave the static Portuguese site usable.
    window.setTimeout(() => {
      if (root.dataset["languagePending"] !== "true") return;
      root.lang = "pt-BR";
      delete root.dataset["languagePending"];
    }, 8000);
  }
}

export const languageBootstrapScript = `(${initializeLanguage.toString()})(${resolveLanguage.toString()},${JSON.stringify(LANGUAGE_STORAGE_KEY)});`;
