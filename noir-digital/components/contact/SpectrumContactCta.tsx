import { contactEmail } from "@/data/content";

import styles from "./SpectrumContactCta.module.css";

interface SpectrumContactCtaProps {
  readonly href?: string;
  readonly label?: string;
}

export function SpectrumContactCta({
  href = `mailto:${contactEmail}`,
  label = "Entrar em contato",
}: SpectrumContactCtaProps = {}) {
  return (
    <a className={styles["root"]} data-spectrum-contact-cta="true" href={href}>
      <span className={styles["surface"]}>{label}</span>
    </a>
  );
}
