"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  LANGUAGE_STORAGE_KEY,
  readPreferredLanguage,
  resolveLanguage,
} from "./language-preference";
import { type Language, translate } from "./translate";

export { LANGUAGE_STORAGE_KEY } from "./language-preference";

type LanguageContextValue = {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
  readonly t: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "pt",
  setLanguage: () => {},
  t: (text) => text,
});

export function LanguageProvider({ children }: { readonly children: ReactNode }) {
  // The initial render matches the static HTML. Resolve the visitor's language
  // before exposing the hydrated content, without a Portuguese text flash.
  const [preference, updateLanguage] = useState<Language | null>(null);
  const language = preference ?? "pt";

  useLayoutEffect(() => {
    updateLanguage(readPreferredLanguage());
  }, []);

  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY && event.key !== null) return;
      updateLanguage(
        resolveLanguage(event.newValue, window.navigator.languages, window.navigator.language),
      );
    };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, []);

  useLayoutEffect(() => {
    if (preference === null) return;
    document.documentElement.lang = preference === "en" ? "en" : "pt-BR";
    delete document.documentElement.dataset["languagePending"];
  }, [preference]);

  const setLanguage = useCallback((next: Language) => {
    updateLanguage(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // The current page can still switch languages without persistence.
    }
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, t: (text: string) => translate(text, language) }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
