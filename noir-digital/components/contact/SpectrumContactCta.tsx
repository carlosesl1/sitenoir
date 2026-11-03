"use client";

import type { ReactNode } from "react";

import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./SpectrumContactCta.module.css";

interface SpectrumContactCtaProps {
  /** Keeps the glint on for the single most important action of a screen. */
  readonly emphasis?: boolean;
  readonly href?: string;
  readonly label?: string;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
  /** Primary actions are white; secondary ones keep the shape and glint without the surface. */
  readonly variant?: "primary" | "secondary";
}

export function SpectrumContactCta({
  emphasis = false,
  href = "/contato",
  label = "Entrar em contato",
  leading,
  trailing,
  variant = "primary",
}: SpectrumContactCtaProps = {}) {
  const { t } = useLanguage();
  return (
    <a
      className={styles["root"]}
      data-emphasis={emphasis ? "true" : undefined}
      data-spectrum-contact-cta="true"
      data-variant={variant === "secondary" ? "secondary" : undefined}
      href={href}
    >
      <span className={styles["surface"]}>
        {leading}
        {t(label)}
        {trailing}
      </span>
    </a>
  );
}
