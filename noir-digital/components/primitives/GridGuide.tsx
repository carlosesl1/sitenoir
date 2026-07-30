import type { JSX } from "react";

import styles from "./primitives.module.css";

type GridGuideProps = {
  readonly label: string;
  readonly variant?: "line" | "cross" | "field";
};

export function GridGuide({ label, variant = "cross" }: GridGuideProps): JSX.Element {
  return (
    <div className={[styles["gridGuide"], styles[variant]].join(" ")} aria-hidden="true">
      <span className={styles["gridLabel"]}>{label}</span>
    </div>
  );
}
