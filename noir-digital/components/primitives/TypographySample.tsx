import type { JSX, ReactNode } from "react";

import styles from "./primitives.module.css";

type TypographySampleProps = {
  readonly children: ReactNode;
  readonly label: string;
  readonly sampleType: "display" | "body" | "interface" | "pixel";
};

function assertNever(value: never): never {
  throw new TypeError(`Unexpected typography sample: ${String(value)}`);
}

export function TypographySample({
  children,
  label,
  sampleType,
}: TypographySampleProps): JSX.Element {
  let sample: JSX.Element;

  switch (sampleType) {
    case "display":
      sample = <h3 className={styles[sampleType]}>{children}</h3>;
      break;
    case "body":
    case "interface":
    case "pixel":
      sample = <p className={styles[sampleType]}>{children}</p>;
      break;
    default:
      sample = assertNever(sampleType);
  }

  return (
    <article className={styles["typeSample"]}>
      <p className={styles["typeMeta"]}>{label}</p>
      {sample}
    </article>
  );
}
