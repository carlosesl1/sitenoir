"use client";

import type { Project } from "@/data/projects";
import { useLanguage } from "@/features/i18n/LanguageProvider";
import styles from "./CaseDetails.module.css";

export function CaseArrow({
  direction = "diagonal",
}: {
  readonly direction?: "back" | "down" | "diagonal";
}) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={styles[direction]}
    >
      <path d="M5 19 19 5M5 5h14v14" />
    </svg>
  );
}

export function CaseDetails({ project }: { readonly project: Project }) {
  const { t } = useLanguage();
  return (
    <dl className={styles["details"]}>
      <div>
        <dt>{t("Cliente")}</dt>
        <dd>{project.client}</dd>
      </div>
      <div>
        <dt>{t("Escopo")}</dt>
        <dd>{project.deliveryLabels.map(t).join(" / ")}</dd>
      </div>
      <div>
        <dt>{t("Entrega")}</dt>
        <dd>{project.year}</dd>
      </div>
    </dl>
  );
}

export function CaseJumpLink({
  id,
  label,
  play = false,
}: {
  readonly id: string;
  readonly label: string;
  readonly play?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <a className={styles["jump"]} href={`#${id}`}>
      {t(label)}
      {play ? (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="m8 5 11 7-11 7Z" />
        </svg>
      ) : (
        <CaseArrow direction="down" />
      )}
    </a>
  );
}
