import { contactEmail } from "@/data/content";

import styles from "./SpectrumContactCta.module.css";

export function SpectrumContactCta() {
  return (
    <a className={styles["root"]} href={`mailto:${contactEmail}`}>
      <span className={styles["surface"]}>Entrar em contato</span>
    </a>
  );
}
