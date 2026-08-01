import type { JSX } from "react";

import { BrandMark } from "@/components/primitives/BrandMark";
import { GridGuide } from "@/components/primitives/GridGuide";
import { NoirControl } from "@/components/primitives/NoirControl";
import { TypographySample } from "@/components/primitives/TypographySample";

import styles from "./primitive-showcase.module.css";

export function PrimitiveShowcase(): JSX.Element {
  return (
    <main className={styles["showcase"]} id="main-content" lang="en">
      <header className={styles["intro"]}>
        <p className={styles["eyebrow"]}>System / 00 / Foundation</p>
        <h1>Primitive showcase</h1>
        <p className={styles["lede"]}>
          The NOIR homepage begins here: declared type roles, structural lines, native controls, and
          two calibrated surfaces before composition.
        </p>
        <dl className={styles["stateGuide"]}>
          <div>
            <dt>Hover</dt>
            <dd>Front face lifts</dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>Dotted outline appears</dd>
          </div>
          <div>
            <dt>Active</dt>
            <dd>Face meets back plate</dd>
          </div>
        </dl>
      </header>

      <section
        className={[styles["surface"], styles["darkSurface"]].join(" ")}
        data-theme="dark"
        aria-label="Dark surface"
      >
        <header className={styles["surfaceHeader"]}>
          <p>Surface / Dark</p>
          <h2>Graphite instrument</h2>
        </header>

        <div className={styles["brandSpecimen"]}>
          <p className={styles["specimenLabel"]}>BrandMark / Linked</p>
          <BrandMark />
        </div>

        <div className={styles["controlSpecimen"]}>
          <p className={styles["specimenLabel"]}>NoirControl / States</p>
          <div className={styles["controlRow"]}>
            <NoirControl kind="button" meta="01">
              Start a project
            </NoirControl>
            <NoirControl kind="link" href="#work" variant="link" meta="02">
              View work
            </NoirControl>
            <NoirControl kind="button" variant="quiet" disabled>
              Unavailable action
            </NoirControl>
          </div>
        </div>

        <div className={styles["gridSpecimen"]} id="work">
          <p className={styles["specimenLabel"]}>GridGuide / Cross</p>
          <GridGuide label="X 06 / Y 04" variant="field" />
        </div>

        <div className={styles["typeSpecimen"]}>
          <TypographySample label="TikTok Sans / Display" sampleType="display">
            Structure before spectacle.
          </TypographySample>
          <TypographySample label="Departure Mono / Control" sampleType="pixel">
            Physical digital systems
          </TypographySample>
        </div>
      </section>

      <section
        className={[styles["surface"], styles["lightSurface"]].join(" ")}
        data-theme="light"
        aria-label="Light surface"
      >
        <header className={styles["surfaceHeader"]}>
          <p>Surface / Light</p>
          <h2>Technical paper</h2>
        </header>

        <div className={styles["controlSpecimen"]}>
          <p className={styles["specimenLabel"]}>NoirControl / Contrast</p>
          <div className={styles["controlRow"]}>
            <NoirControl kind="button" meta="03">
              Inspect system
            </NoirControl>
            <NoirControl kind="button" variant="quiet" disabled>
              Disabled on light
            </NoirControl>
          </div>
        </div>

        <div className={styles["gridSpecimen"]}>
          <p className={styles["specimenLabel"]}>GridGuide / Line</p>
          <GridGuide label="COLUMN 09" variant="line" />
        </div>

        <div className={styles["typeSpecimen"]}>
          <TypographySample label="TikTok Sans / Body" sampleType="body">
            Every future surface inherits a documented token, a semantic role, and a verified state.
          </TypographySample>
          <TypographySample label="Departure Mono / Interface" sampleType="interface">
            12 columns / 24 gutter / <span className={styles["layoutLimit"]}>1440 MAX</span>
          </TypographySample>
        </div>
      </section>
    </main>
  );
}
