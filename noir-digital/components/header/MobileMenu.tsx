"use client";

import { domAnimation, LazyMotion, m, useIsPresent, useReducedMotion } from "motion/react";
import type { KeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import { LanguageButton } from "@/components/controls/LanguageButton";
import { ThemeButton } from "@/components/controls/ThemeButton";
import { EntryRevealCanvas } from "@/components/preloader/EntryRevealCanvas";
import { useLanguage } from "@/features/i18n/LanguageProvider";
import type { SectionTarget } from "@/features/scroll/scroll-targets";
import { sectionSelector } from "@/features/scroll/scroll-targets";

import styles from "./Header.module.css";

interface MobileMenuProps {
  readonly onClose: () => void;
  readonly onNavigate: (target: SectionTarget) => void;
  readonly sectionLinksBase?: string;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ onClose, onNavigate, sectionLinksBase }: MobileMenuProps) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isPresent = useIsPresent();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable || focusable.length === 0) return;

    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        id="mobile-menu"
        ref={dialogRef}
        className={styles["mobileOverlay"]}
        role="dialog"
        aria-modal="true"
        aria-label={t("Menu")}
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.999 }}
        transition={{ duration: reducedMotion ? 0 : 0.7 }}
        onKeyDown={handleKeyDown}
      >
        {!reducedMotion ? (
          <EntryRevealCanvas
            key={isPresent ? "menu-reveal" : "menu-cover"}
            active
            className={styles["mobileRevealCanvas"]}
            direction={isPresent ? "reveal" : "cover"}
            durationMs={700}
          />
        ) : null}

        <div className={styles["mobileMenuContent"]}>
          <nav className={styles["mobileNavigation"]} aria-label={t("Menu móvel")}>
            {sectionLinksBase ? (
              <>
                <a className={styles["mobileLink"]} href={sectionLinksBase} onClick={onClose}>
                  {t("Início")}
                </a>
                <a
                  className={styles["mobileLink"]}
                  href={`${sectionLinksBase}${sectionSelector("work")}`}
                  onClick={onClose}
                >
                  {t("Serviços")}
                </a>
                <a className={styles["mobileLink"]} href="/contato" onClick={onClose}>
                  {t("Contato")}
                </a>
              </>
            ) : (
              <>
                <button
                  className={styles["mobileLink"]}
                  type="button"
                  onClick={() => onNavigate("home")}
                >
                  {t("Início")}
                </button>
                <button
                  className={styles["mobileLink"]}
                  type="button"
                  onClick={() => onNavigate("work")}
                >
                  {t("Serviços")}
                </button>
                <a className={styles["mobileLink"]} href="/contato" onClick={onClose}>
                  {t("Contato")}
                </a>
              </>
            )}
          </nav>

          <div className={styles["mobileControls"]}>
            <LanguageButton className={styles["mobileUtilityControl"]} />
            <ThemeButton className={styles["mobileUtilityControl"]} />
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
