"use client";

import { AnimatePresence } from "motion/react";
import { useRef, useState } from "react";

import { SoundButton } from "@/components/controls/SoundButton";
import { ThemeButton } from "@/components/controls/ThemeButton";
import { HeaderStatus } from "@/components/header/HeaderStatus";
import { MobileMenu } from "@/components/header/MobileMenu";
import { usePrincipleScene } from "@/features/principles/PrincipleSceneProvider";
import { useScroll } from "@/features/scroll/ScrollProvider";
import { type SectionTarget, sectionSelector } from "@/features/scroll/scroll-targets";

import styles from "./Header.module.css";

interface SiteHeaderProps {
  readonly sectionLinksBase?: string;
}

export function SiteHeader({ sectionLinksBase }: SiteHeaderProps = {}) {
  const { scrollTo } = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLayerActive, setMenuLayerActive] = useState(false);
  const principleScene = usePrincipleScene();
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    menuTriggerRef.current?.focus();
  };

  const navigate = (target: SectionTarget) => {
    scrollTo(target);
    closeMenu();
  };

  return (
    <header
      className={
        principleScene.fullscreen
          ? `${styles["header"]} ${styles["designScene"]}`
          : styles["header"]
      }
    >
      <div className={styles["headerGrid"]}>
        <a className={styles["brand"]} href={sectionLinksBase ?? "#home"} aria-label="NOIR DIGITAL">
          <span>NOIR DIGITAL</span>
          <span className={styles["brandDescriptor"]} aria-hidden="true">
            Foundation / 00
          </span>
        </a>

        <nav className={styles["desktopNavigation"]} aria-label="Principal">
          {sectionLinksBase ? (
            <>
              <a
                className={styles["control"]}
                href={`${sectionLinksBase}${sectionSelector("work")}`}
              >
                Work
              </a>
              <a
                className={styles["control"]}
                href={`${sectionLinksBase}${sectionSelector("contact")}`}
              >
                Contact
              </a>
            </>
          ) : (
            <>
              <button className={styles["control"]} type="button" onClick={() => scrollTo("work")}>
                Work
              </button>
              <button
                className={styles["control"]}
                type="button"
                onClick={() => scrollTo("contact")}
              >
                Contact
              </button>
            </>
          )}
          <ThemeButton className={styles["control"]} />
          <SoundButton className={styles["control"]} />
        </nav>

        <button
          ref={menuTriggerRef}
          className={styles["menuTrigger"]}
          data-open={menuOpen}
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => {
            if (!menuOpen) setMenuLayerActive(true);
            setMenuOpen((isOpen) => !isOpen);
          }}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence onExitComplete={() => setMenuLayerActive(false)}>
        {menuOpen ? (
          <MobileMenu
            key="mobile-menu"
            {...(sectionLinksBase ? { sectionLinksBase } : {})}
            onClose={closeMenu}
            onNavigate={navigate}
          />
        ) : null}
      </AnimatePresence>
      <HeaderStatus hidden={menuLayerActive} />
    </header>
  );
}
