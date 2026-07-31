"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

import { type ClientLogo, clientLogos } from "@/data/content";

import styles from "./TrustStrip.module.css";

export function TrustStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      section.dataset["animationActive"] = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const rootTop = entry?.rootBounds?.top ?? 0;
        const rootBottom = entry?.rootBounds?.bottom ?? window.innerHeight;
        const visiblePixels = entry
          ? Math.max(
              0,
              Math.min(entry.boundingClientRect.bottom, rootBottom) -
                Math.max(entry.boundingClientRect.top, rootTop),
            )
          : 0;
        section.dataset["animationActive"] =
          entry?.isIntersecting && visiblePixels >= 1 ? "true" : "false";
      },
      { threshold: [0, 0.01] },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles["trustStrip"]}
      aria-labelledby="clients-heading"
      data-animation-active="false"
    >
      <h2 id="clients-heading" className={styles["eyebrow"]}>
        Empresas que confiam
      </h2>
      <div className={styles["marqueeViewport"]}>
        <div className={styles["marqueeTrack"]} data-logo-marquee="track">
          <LogoSequence logos={clientLogos} />
          <LogoSequence logos={clientLogos} duplicate />
        </div>
      </div>
    </section>
  );
}

type LogoStyle = CSSProperties & {
  "--client-aspect": number;
  "--client-logo": string;
};

function LogoSequence({
  logos,
  duplicate = false,
}: {
  logos: readonly ClientLogo[];
  duplicate?: boolean;
}) {
  return (
    <ul
      className={styles["logoSequence"]}
      aria-label={duplicate ? undefined : "Clientes"}
      aria-hidden={duplicate || undefined}
      data-logo-marquee="sequence"
    >
      {logos.map((client) => {
        const style: LogoStyle = {
          "--client-aspect": client.aspectRatio,
          "--client-logo": `url(${client.image})`,
        };

        return (
          <li key={`${duplicate ? "duplicate-" : ""}${client.id}`} className={styles["logoItem"]}>
            <span
              className={styles["logo"]}
              role="img"
              aria-label={client.label}
              data-client-logo={client.id}
              style={style}
            />
          </li>
        );
      })}
    </ul>
  );
}
