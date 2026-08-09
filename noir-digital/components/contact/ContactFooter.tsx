import Image from "next/image";

import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";
import {
  contactEmail,
  contactHeadlineLines,
  contactPhoneDisplay,
  contactPhoneHref,
  socialLinks,
} from "@/data/content";

import styles from "./ContactFooter.module.css";

export function ContactFooter() {
  return (
    <footer id="contact" className={styles["contact"]}>
      <div className={styles["contactStage"]}>
        <div className={styles["contactContent"]}>
          <h2 id="contact-heading" className={styles["headline"]}>
            {contactHeadlineLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>

          <div className={styles["contactCtaSlot"]}>
            <SpectrumContactCta />
          </div>
        </div>

        <div className={styles["sceneAnchor"]} data-scene-anchor="contact" aria-hidden="true" />
      </div>

      <div className={styles["informationFooter"]}>
        <div className={styles["informationGrid"]}>
          <section
            className={`${styles["informationCell"]} ${styles["brandCell"]}`}
            aria-label="NOIR DIGITAL — Agência de Estrutura Digital"
          >
            <div className={styles["brandNameRow"]} data-footer-brand-name-row="true">
              <Image
                className={styles["brandSymbol"]}
                src="/brand/noir-symbol.svg"
                width="164"
                height="186"
                alt=""
                aria-hidden="true"
              />
              <Image
                className={styles["brandWordmark"]}
                src="/brand/noir-wordmark.svg"
                width="389"
                height="116"
                alt=""
                aria-hidden="true"
              />
            </div>
            <span className={styles["brandTagline"]}>AGÊNCIA DE ESTRUTURA DIGITAL</span>
          </section>

          <section
            className={`${styles["informationCell"]} ${styles["contactCell"]}`}
            aria-labelledby="footer-contact-label"
          >
            <h3 id="footer-contact-label">Contato</h3>
            <div className={styles["informationList"]}>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              <a href={contactPhoneHref}>{contactPhoneDisplay}</a>
            </div>
          </section>

          <section
            className={`${styles["informationCell"]} ${styles["socialCell"]}`}
            aria-labelledby="footer-social-label"
          >
            <h3 id="footer-social-label">Social</h3>
            <div className={styles["informationList"]}>
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
                  {social.label}
                </a>
              ))}
            </div>
          </section>

          <nav
            className={`${styles["informationCell"]} ${styles["linksCell"]}`}
            aria-label="Links do footer"
          >
            <h3>Links</h3>
            <a href="/contato">Contato</a>
            <a href="/#selected-work">Serviços</a>
          </nav>
        </div>

        <div className={styles["closingBar"]}>
          <p>© NOIR DIGITAL 2026. TODOS OS DIREITOS RESERVADOS.</p>
          <p className={styles["manifesto"]}>DO ESCURO, HÁ IDEIAS QUE MARCAM.</p>
          <nav className={styles["legalClosing"]} aria-label="Links legais finais">
            <a href="/privacidade">Privacidade</a>
            <a href="/termos">Termos</a>
            <span className={styles["footerMark"]} aria-hidden="true" />
          </nav>
        </div>
      </div>
    </footer>
  );
}
