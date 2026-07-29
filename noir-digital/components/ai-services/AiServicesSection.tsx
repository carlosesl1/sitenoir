"use client";

import { useEffect, useRef, useState } from "react";

import { NoirControl } from "@/components/primitives/NoirControl";
import { aiServices, type AiServiceId } from "@/data/ai-services";

import styles from "./AiServicesSection.module.css";

export function AiServicesSection() {
  const [activeId, setActiveId] = useState<AiServiceId | null>(null);
  const markerRefs = useRef(new Map<AiServiceId, HTMLButtonElement>());
  const activeService = aiServices.find(({ id }) => id === activeId) ?? null;

  useEffect(() => {
    if (activeId === null) {
      return;
    }

    const close = () => setActiveId(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      markerRefs.current.get(activeId)?.focus();
      close();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest("[data-ai-marker], [data-ai-detail]") === null) {
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [activeId]);

  return (
    <section
      id="ai-services"
      className={styles["section"]}
      aria-labelledby="ai-services-heading"
      data-active-service={activeId ?? "none"}
    >
      <div className={styles["copy"]}>
        <p className={styles["eyebrow"]}>Inteligência aplicada</p>
        <h2 id="ai-services-heading">IA para transformar operação em vantagem real</h2>
        <p className={styles["body"]}>
          Soluções de IA que aumentam a eficiência, reduzem custos e criam vantagem competitiva. Do
          diagnóstico à execução, com foco em resultado.
        </p>
        <NoirControl kind="link" href="mailto:contato@noirdigital.com.br" meta="↗">
          Falar com especialista
        </NoirControl>
      </div>

      <div className={styles["visual"]}>
        <picture aria-hidden="true">
          <source
            media="(max-width: 767px)"
            srcSet="/assets/v1/ai-services/ascii-wave-mobile.svg"
          />
          <img
            className={styles["wave"]}
            src="/assets/v1/ai-services/ascii-wave-desktop.svg"
            alt=""
            width="1600"
            height="900"
            loading="lazy"
            decoding="async"
          />
        </picture>

        <div className={styles["markers"]}>
          {aiServices.map((service) => {
            const expanded = service.id === activeId;

            return (
              <div
                key={service.id}
                className={styles["marker"]}
                data-ai-marker
                data-ai-service={service.id}
              >
                <button
                  ref={(node) => {
                    if (node) {
                      markerRefs.current.set(service.id, node);
                    } else {
                      markerRefs.current.delete(service.id);
                    }
                  }}
                  type="button"
                  className={styles["markerButton"]}
                  aria-controls="ai-service-detail"
                  aria-expanded={expanded}
                  onClick={() => setActiveId(expanded ? null : service.id)}
                >
                  <span aria-hidden="true">+</span>
                  <span>{service.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles["detailReserve"]}>
        {activeService ? (
          <div
            id="ai-service-detail"
            className={styles["detail"]}
            data-ai-detail
            data-testid="ai-service-detail"
          >
            <strong>{activeService.label}</strong>
            <p>{activeService.description}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
