import { aiServices } from "@/data/ai-services";
import styles from "./AiServicesSection.module.css";
import { AiSignalIcon } from "./AiSignalIcon";

const totalServices = String(aiServices.length).padStart(2, "0");

export function AiServicesSection() {
  return (
    <section id="ai-services" className={styles["section"]} aria-labelledby="ai-services-heading">
      <div className={styles["inner"]}>
        <header className={styles["intro"]}>
          <p className={styles["kicker"]}>
            IA FIRST
            <span className={styles["focusMark"]} aria-hidden="true" />
          </p>

          <h2 id="ai-services-heading" className={styles["heading"]}>
            <span>IA para simplificar</span>
            <span>sua operação</span>
          </h2>

          <p className={styles["introCopy"]}>
            Soluções de IA aplicadas ao que realmente move o seu negócio: eficiência, escala e
            decisões melhores.
          </p>
        </header>

        <div className={styles["servicesGrid"]}>
          {aiServices.map((service, index) => {
            const number = String(index + 1).padStart(2, "0");

            return (
              <article
                key={service.id}
                className={styles["card"]}
                data-ai-service={service.id}
                data-glyph={service.glyph}
              >
                <div className={styles["cardMain"]}>
                  <div className={styles["cardCopy"]}>
                    <p className={styles["number"]}>{number}</p>
                    <h3>{service.label}</h3>
                    <p className={styles["description"]}>{service.description}</p>
                  </div>

                  <div
                    className={styles["signal"]}
                    data-ai-signal={service.glyph}
                    aria-hidden="true"
                  >
                    <AiSignalIcon glyph={service.glyph} className={styles["signalGlyph"]} />
                  </div>
                </div>

                <footer className={styles["cardFooter"]}>
                  <span>NOIR-IA · {service.code}</span>
                  <span>
                    {number}/{totalServices}
                  </span>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
