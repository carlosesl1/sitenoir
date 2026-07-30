import Link from "next/link";
import type { JSX } from "react";

import styles from "./primitives.module.css";

export function BrandMark(): JSX.Element {
  return (
    <Link className={styles["brandMark"]} href="/" aria-label="NOIR DIGITAL home">
      <span className={styles["brandName"]}>NOIR DIGITAL</span>
      <span className={styles["brandMeta"]} aria-hidden="true">
        Foundation / 00
      </span>
    </Link>
  );
}
