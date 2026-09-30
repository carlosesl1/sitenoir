"use client";

import { useLanguage } from "@/features/i18n/LanguageProvider";

export function LanguageButton({ className }: { readonly className?: string | undefined }) {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      type="button"
      className={className}
      lang={language === "pt" ? "en" : "pt-BR"}
      aria-label={language === "pt" ? "Switch to English" : "Mudar para português"}
      onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
    >
      <span lang="pt-BR" aria-hidden="true" style={{ opacity: language === "pt" ? 1 : 0.5 }}>
        PT
      </span>
      <span aria-hidden="true"> / </span>
      <span lang="en" aria-hidden="true" style={{ opacity: language === "en" ? 1 : 0.5 }}>
        EN
      </span>
    </button>
  );
}
