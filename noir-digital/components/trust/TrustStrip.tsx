import type { CSSProperties } from "react";

import { type ClientLogo, clientLogos } from "@/data/content";

import styles from "./TrustStrip.module.css";

export function TrustStrip() {
  return (
    <section className={styles["trustStrip"]} aria-labelledby="clients-heading">
      <h2 id="clients-heading" className={styles["eyebrow"]}>
        Empresas que confiam
      </h2>
      <div className={styles["marqueeViewport"]}>
        <div className={styles["marqueeTrack"]} data-logo-marquee="track">
          <LogoSequence logos={clientLogos} />
          <LogoSequence logos={clientLogos} duplicate />
          <LogoSequence logos={clientLogos} duplicate />
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
