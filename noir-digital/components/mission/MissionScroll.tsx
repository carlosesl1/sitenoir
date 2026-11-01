"use client";

import { useReducedMotion } from "motion/react";
import { type CSSProperties, useCallback, useEffect, useRef } from "react";

import {
  MISSION_STORY_VIEWPORTS,
  resolveMissionProgress,
  resolveMissionViewportProgress,
} from "@/components/mission/mission-progress";
import { missionEyebrow, missionStatement } from "@/data/content";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./MissionScroll.module.css";

interface WordStyle extends CSSProperties {
  readonly "--word-index": number;
}

interface PanelStyle extends CSSProperties {
  readonly "--word-count": number;
}

function FillText({ className, text }: { readonly className: string; readonly text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  const style: PanelStyle = { "--word-count": words.length };

  return (
    <p className={className} style={style}>
      {words.map((word, index) => (
        <span
          className={styles["word"]}
          data-mission-word=""
          // biome-ignore lint/suspicious/noArrayIndexKey: words repeat and keep their reading order.
          key={`${word}-${index}`}
          style={{ "--word-index": index } as WordStyle}
        >
          {word}
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}

export function MissionScroll() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewportHeightRef = useRef(0);
  const [statement, detail] = missionStatement;

  const updateStory = useCallback(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    const viewportHeight = Math.max(1, window.innerHeight);
    if (viewportHeightRef.current !== viewportHeight) {
      viewportHeightRef.current = viewportHeight;
      section.style.setProperty(
        "--mission-story-height",
        `${MISSION_STORY_VIEWPORTS * viewportHeight}px`,
      );
      section.style.setProperty("--mission-viewport-height", `${viewportHeight}px`);
    }

    const progress = resolveMissionViewportProgress({
      sectionTop: section.getBoundingClientRect().top,
      viewportHeight,
    });
    const { fillDetail, fillStatement, trackX } = resolveMissionProgress(progress);
    frame.style.setProperty("--track-x", trackX.toFixed(4));
    frame.style.setProperty("--fill-statement", fillStatement.toFixed(4));
    frame.style.setProperty("--fill-detail", fillDetail.toFixed(4));
    frame.dataset["missionProgress"] = progress.toFixed(3);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    updateStory();
    window.addEventListener("scroll", updateStory, { passive: true });
    window.addEventListener("resize", updateStory, { passive: true });
    window.addEventListener("orientationchange", updateStory, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateStory);
      window.removeEventListener("resize", updateStory);
      window.removeEventListener("orientationchange", updateStory);
    };
  }, [reducedMotion, updateStory]);

  return (
    <section
      aria-labelledby="mission-heading"
      className={styles["story"]}
      data-mission-static={String(reducedMotion)}
      id="missao"
      ref={sectionRef}
    >
      <div className={styles["stickyFrame"]} ref={frameRef}>
        <div className={styles["track"]} data-mission-track="">
          <div className={styles["panel"]}>
            <h2 className={styles["eyebrow"]} id="mission-heading">
              {t(missionEyebrow)}
            </h2>
            <FillText className={styles["statement"] ?? ""} text={t(statement)} />
          </div>
          <div className={styles["panel"]}>
            <FillText className={styles["detail"] ?? ""} text={t(detail)} />
          </div>
        </div>
      </div>
    </section>
  );
}
