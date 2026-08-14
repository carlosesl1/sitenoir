"use client";

import { PhysicalPrismTestScene } from "@/scene/PhysicalPrismTestScene";

import styles from "./PhysicalPrismTest.module.css";

export function PhysicalPrismTest() {
  return (
    <main className={styles["shell"]} data-testid="physical-prism-test">
      <span className={styles["label"]}>PRISM TEST</span>
      <div className={styles["canvas"]}>
        <PhysicalPrismTestScene />
      </div>
    </main>
  );
}
