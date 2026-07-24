"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";

import { serviceContent } from "@/data/content";
import { serviceGroups, type ServiceId } from "@/data/projects";
import { useScroll } from "@/features/scroll/ScrollProvider";
import { useScrollSpy } from "@/features/scroll/use-scroll-spy";

import styles from "./SelectedWork.module.css";
import { resolveServicePinState, type ServicePinState } from "./service-statement-pin";

const DESKTOP_PIN_QUERY = "(min-width: 1024px)";
const PIN_OFFSET_REM = 7;
type ServiceAnchorId = `service-${ServiceId}`;
const serviceAnchorIds: readonly ServiceAnchorId[] = serviceGroups.map(
  ({ id }) => `service-${id}` as ServiceAnchorId,
);
const INITIAL_SERVICE_ANCHOR: ServiceAnchorId = "service-sites";

export function ServiceStatement() {
  const railRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const [pinState, setPinState] = useState<ServicePinState>("before");
  const activeService = useScrollSpy({
    ids: serviceAnchorIds,
    initialId: INITIAL_SERVICE_ANCHOR,
  });
  const { scrollToSelector } = useScroll();

  const scrollToService = (
    event: MouseEvent<HTMLAnchorElement>,
    anchorId: ServiceAnchorId,
  ) => {
    event.preventDefault();
    window.history.replaceState(null, "", `#${anchorId}`);
    scrollToSelector(`#${anchorId}`);
  };

  useEffect(() => {
    const rail = railRef.current;
    const statement = statementRef.current;
    if (!rail || !statement) return;

    const desktopQuery =
      typeof window.matchMedia === "function" ? window.matchMedia(DESKTOP_PIN_QUERY) : null;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!desktopQuery?.matches) {
        setPinState("before");
        return;
      }

      const railRect = rail.getBoundingClientRect();
      const statementHeight = statement.offsetHeight;
      if (railRect.height <= 0 || statementHeight <= 0) return;

      const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const pinOffset = rootFontSize * PIN_OFFSET_REM;

      rail.style.setProperty("--service-pin-left", `${railRect.left}px`);
      rail.style.setProperty("--service-pin-width", `${railRect.width}px`);
      setPinState((current) => {
        const next = resolveServicePinState({
          pinOffset,
          railBottom: railRect.bottom,
          railTop: railRect.top,
          statementHeight,
        });
        return current === next ? current : next;
      });
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    desktopQuery?.addEventListener("change", scheduleUpdate);

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleUpdate);
    resizeObserver?.observe(rail);
    resizeObserver?.observe(statement);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      desktopQuery?.removeEventListener("change", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div ref={railRef} className={styles["statementRail"]} data-services-sticky-rail="true">
      <div ref={statementRef} className={styles["statement"]} data-service-pin-state={pinState}>
        <p>{serviceContent.eyebrow}</p>
        <h2 id="work-heading" aria-label={serviceContent.heading}>
          <span className={styles["statementLink"]}>
            {serviceContent.headingLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < serviceContent.headingLines.length - 1 ? " " : null}
              </span>
            ))}
          </span>
        </h2>
        <nav className={styles["serviceIndex"]} aria-label="Índice de serviços">
          {serviceGroups.map((service) => {
            const anchorId: ServiceAnchorId = `service-${service.id}`;

            return (
              <a
                key={service.id}
                href={`#${anchorId}`}
                aria-current={activeService === anchorId ? "location" : undefined}
                onClick={(event) => scrollToService(event, anchorId)}
              >
                {service.title}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
