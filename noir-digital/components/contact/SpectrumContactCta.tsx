"use client";

import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./SpectrumContactCta.module.css";

interface SpectrumContactCtaProps {
  /** Keeps the spectrum on for the single most important action of a screen. */
  readonly emphasis?: boolean;
  readonly href?: string;
  readonly label?: string;
}

export function SpectrumContactCta({
  emphasis = false,
  href = "/contato",
  label = "Entrar em contato",
}: SpectrumContactCtaProps = {}) {
  const { t } = useLanguage();
  return (
    <a
      className={styles["root"]}
      data-emphasis={emphasis ? "true" : undefined}
      data-spectrum-contact-cta="true"
      href={href}
    >
      <span className={styles["surface"]}>{t(label)}</span>
    </a>
  );
}
