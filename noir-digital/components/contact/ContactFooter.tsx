import { SpectrumContactCta } from "@/components/contact/SpectrumContactCta";
import { contactEmail, contactHeadlineLines, socialLinks } from "@/data/content";

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
          <section className={`${styles["informationCell"]} ${styles["brandCell"]}`}>
            <span className={styles["brandSymbol"]} aria-hidden="true">
              ✦
            </span>
            <div className={styles["brandIdentity"]}>
              <p>NOIR DIGITAL</p>
              <span>ESTÚDIO DE ESTRUTURA DIGITAL</span>
            </div>
          </section>

          <section className={styles["informationCell"]} aria-labelledby="footer-contact-label">
            <h3 id="footer-contact-label">Contato</h3>
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </section>

          <section className={styles["informationCell"]} aria-labelledby="footer-social-label">
            <h3 id="footer-social-label">Social</h3>
            <div className={styles["informationList"]}>
              {socialLinks.map((social) => (
                <span key={social.label}>{social.label}</span>
              ))}
            </div>
          </section>

          <nav className={styles["informationCell"]} aria-label="Links do footer">
            <h3>Links</h3>
            <a href="/#selected-work">Work</a>
            <a href="/services">Services</a>
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
