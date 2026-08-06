"use client";

import { useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";

import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";
import { HeroScrambleText } from "@/components/hero/HeroScrambleText";
import {
  heroDescriptionLines,
  heroHeadlineLines,
  heroLabels,
  heroSupportLines,
} from "@/data/content";

import styles from "./Hero.module.css";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [pageRevealComplete, setPageRevealComplete] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || hasEnteredViewport) return;
    if (!("IntersectionObserver" in window)) {
      setHasEnteredViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasEnteredViewport(true);
        observer.disconnect();
      },
      { threshold: 0.1 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [hasEnteredViewport]);

  useEffect(() => {
    const documentRoot = document.documentElement;
    const updateRevealState = () => {
      setPageRevealComplete(
        documentRoot.dataset["entryReady"] === "true" &&
          documentRoot.dataset["routeTransition"] !== "true",
      );
    };
    updateRevealState();
    const observer = new MutationObserver(updateRevealState);
    observer.observe(documentRoot, {
      attributeFilter: ["data-entry-ready", "data-route-transition"],
      attributes: true,
    });
    return () => observer.disconnect();
  }, []);

  const scrambleActive = hasEnteredViewport && pageRevealComplete;

  return (
    <section
      ref={heroRef}
      id="home"
      className={styles["hero"]}
      aria-labelledby="hero-heading"
      data-scramble-active={scrambleActive}
      data-scramble-in-view={hasEnteredViewport}
      data-scramble-page-ready={pageRevealComplete}
      data-scramble-reduced-motion={reducedMotion}
    >
      <div className={styles["heroGrid"]}>
        <ul className={`${styles["disciplines"]} ${styles["desktopSupport"]}`}>
          {heroLabels.map((label) => (
            <li key={label}>
              <HeroScrambleText
                active={scrambleActive}
                letterDelayMs={10}
                reducedMotion={reducedMotion}
                startDelayMs={0}
                text={label}
              />
            </li>
          ))}
        </ul>

        <p className={`${styles["promise"]} ${styles["desktopSupport"]}`}>
          {heroSupportLines.map((line) => (
            <HeroScrambleText
              active={scrambleActive}
              key={line}
              letterDelayMs={10}
              reducedMotion={reducedMotion}
              startDelayMs={0}
              text={line}
            />
          ))}
        </p>

        <h1 id="hero-heading" className={styles["headline"]}>
          {heroHeadlineLines.map((line, index) => (
            <Fragment key={line}>
              <HeroScrambleText
                active={scrambleActive}
                letterDelayMs={50}
                reducedMotion={reducedMotion}
                startDelayMs={index * 120}
                text={line}
              />
              {index < heroHeadlineLines.length - 1 ? " " : null}
            </Fragment>
          ))}
        </h1>

        <div className={styles["actionRow"]} data-hero-action-row="true">
          <p className={styles["description"]}>
            {heroDescriptionLines.map((line, index) => (
              <Fragment key={line}>
                <HeroScrambleText
                  active={scrambleActive}
                  letterDelayMs={10}
                  reducedMotion={reducedMotion}
                  startDelayMs={0}
                  text={line}
                />
                {index < heroDescriptionLines.length - 1 ? " " : null}
              </Fragment>
            ))}
          </p>

          <div className={styles["heroCtaSlot"]}>
            <SpectrumContactCta />
          </div>
        </div>
      </div>

      <div className={styles["sceneAnchor"]} data-scene-anchor="hero" aria-hidden="true" />
    </section>
  );
}
