"use client";

import { useReducedMotion } from "motion/react";
import { type CSSProperties, memo, useCallback, useEffect, useRef, useState } from "react";

import { PrincipleOrbit, type PrincipleOrbitHandle } from "@/components/principles/PrincipleOrbit";
import {
  PRINCIPLES_STORY_VIEWPORTS,
  type PrincipleProgressStage,
  resolvePrincipleProgress,
  resolvePrincipleViewportProgress,
} from "@/components/principles/principles-progress";
import { principleStages, principleStatements } from "@/data/content";
import { usePrincipleScene } from "@/features/principles/PrincipleSceneProvider";

import styles from "./PrinciplesStory.module.css";

interface CopyPanelProps {
  readonly active: boolean;
  readonly exitWhenInactive?: boolean;
  readonly lines: readonly [string, string, string];
  readonly stage: PrincipleProgressStage;
}

interface CharacterStyle extends CSSProperties {
  readonly "--character-delay": string;
  readonly "--character-exit-delay": string;
}

function characterDelays(line: string, salt?: string): readonly number[] {
  let seed = 0x811c9dc5;
  const seedSource = salt ? `${line}\0${salt}` : line;
  for (const character of seedSource) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 0x1000193);
  }
  let randomState = seed >>> 0;
  const random = () => {
    randomState += 0x6d2b79f5;
    let value = randomState;
    value = Math.imul(value ^ (value >>> 15), 1 | value);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
  };
  if (line.length <= 1) return [0];
  return Array.from({ length: line.length }, (_, index) => {
    const orderedOffset = (index / (line.length - 1)) * 290 * 0.7;
    const randomOffset = random() * 290 * 0.35;
    return Math.min(290, orderedOffset + randomOffset);
  });
}

const StaggeredLine = memo(function StaggeredLine({
  line,
  groupDelayMs = 0,
}: {
  readonly line: string;
  readonly groupDelayMs?: number;
}) {
  const enterDelays = characterDelays(line);
  const exitDelays = characterDelays(line, "out");

  return (
    <span className={styles["copyLine"]} data-staggered-line="true">
      <span className={styles["visuallyHidden"]}>{line}</span>
      <span aria-hidden="true">
        {Array.from(line).map((character, characterIndex) => {
          const style: CharacterStyle = {
            "--character-delay": `${(enterDelays[characterIndex] ?? 0) + groupDelayMs}ms`,
            "--character-exit-delay": `${(exitDelays[characterIndex] ?? 0) + groupDelayMs}ms`,
          };
          return (
            <span
              key={`${line}-${line.slice(0, characterIndex + 1)}`}
              className={styles["copyCharacter"]}
              style={style}
            >
              {character === " " ? "\u00a0" : character}
            </span>
          );
        })}
      </span>
    </span>
  );
});

const CopyPanel = memo(function CopyPanel({
  active,
  exitWhenInactive = false,
  lines,
  stage,
}: CopyPanelProps) {
  const playedRef = useRef(false);
  if (active) playedRef.current = true;
  const className = active
    ? `${styles["panel"]} ${styles["activePanel"]}`
    : exitWhenInactive && playedRef.current
      ? `${styles["panel"]} ${styles["exitPanel"]}`
      : styles["panel"];

  return (
    <div className={className} data-stage={stage} data-active={active}>
      <p className={styles["stageCopy"]}>
        {lines.map((line, lineIndex) => (
          <StaggeredLine key={line} line={line} groupDelayMs={lineIndex * 100} />
        ))}
      </p>
    </div>
  );
});

export function PrinciplesStory() {
  const storyRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const {
    fullscreen,
    sectionRef,
    sectionRectRef,
    setActive,
    setProgress: setSceneProgress,
    setStage,
  } = usePrincipleScene();
  const [stage, setLocalStage] = useState<PrincipleProgressStage>("positioning");
  const [copyReveal, setCopyReveal] = useState(false);
  const [technologyReveal, setTechnologyReveal] = useState(false);
  const progressRef = useRef(-1);
  const activeRef = useRef(false);
  const copyRevealRef = useRef(false);
  const technologyRevealRef = useRef(false);
  const viewportHeightRef = useRef(0);
  const stageRef = useRef<PrincipleProgressStage>("positioning");
  const stickyFrameRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<PrincipleOrbitHandle>(null);
  const setStoryNode = useCallback(
    (node: HTMLElement | null) => {
      storyRef.current = node;
      sectionRef.current = node;
      if (!node) sectionRectRef.current = null;
    },
    [sectionRectRef, sectionRef],
  );
  const setStickyFrameNode = useCallback((node: HTMLDivElement | null) => {
    stickyFrameRef.current = node;
    if (node && node.dataset["stageProgress"] === undefined) {
      node.dataset["stageProgress"] = "0.000";
      node.dataset["cursorClosing"] = "false";
    }
  }, []);

  const updateStory = useCallback(() => {
    if (reducedMotion) return;
    const story = storyRef.current;
    if (!story) return;

    const viewportHeight = Math.max(1, window.innerHeight);
    if (viewportHeightRef.current !== viewportHeight) {
      viewportHeightRef.current = viewportHeight;
      story.style.setProperty(
        "--principles-story-height",
        `${PRINCIPLES_STORY_VIEWPORTS * viewportHeight}px`,
      );
      story.style.setProperty("--principles-viewport-height", `${viewportHeight}px`);
    }
    const rect = story.getBoundingClientRect();
    sectionRectRef.current = {
      bottom: rect.bottom,
      height: rect.height,
      top: rect.top,
    };
    const nextProgress = resolvePrincipleViewportProgress({
      sectionTop: rect.top,
      viewportHeight,
      storyViewports: PRINCIPLES_STORY_VIEWPORTS,
    });
    const { localProgress: nextLocalProgress, stage: nextStage } =
      resolvePrincipleProgress(nextProgress);
    const nextActive = nextProgress > 0 && rect.bottom > 0;
    const nextCopyReveal = rect.top <= viewportHeight * 0.2 && rect.bottom > 0;
    const nextTechnologyReveal = nextStage === "technology" && rect.bottom >= viewportHeight * 0.35;

    setSceneProgress(nextProgress);
    if (Math.abs(progressRef.current - nextProgress) >= 0.0001) {
      progressRef.current = nextProgress;
      const stickyFrame = stickyFrameRef.current;
      if (stickyFrame) {
        stickyFrame.dataset["stageProgress"] = nextLocalProgress.toFixed(3);
        stickyFrame.dataset["cursorClosing"] = String(
          nextStage === "technology" && nextLocalProgress >= 0.19,
        );
      }
      orbitRef.current?.setProgress(nextLocalProgress);
    }
    if (stageRef.current !== nextStage) {
      stageRef.current = nextStage;
      setLocalStage(nextStage);
      setStage(nextStage);
    }
    if (activeRef.current !== nextActive) {
      activeRef.current = nextActive;
      setActive(nextActive);
    }
    if (copyRevealRef.current !== nextCopyReveal) {
      copyRevealRef.current = nextCopyReveal;
      setCopyReveal(nextCopyReveal);
    }
    if (technologyRevealRef.current !== nextTechnologyReveal) {
      technologyRevealRef.current = nextTechnologyReveal;
      setTechnologyReveal(nextTechnologyReveal);
    }
  }, [reducedMotion, sectionRectRef, setActive, setSceneProgress, setStage]);

  useEffect(() => {
    if (reducedMotion) {
      activeRef.current = false;
      setActive(false);
      return;
    }

    updateStory();
    window.addEventListener("scroll", updateStory, { passive: true });
    window.addEventListener("resize", updateStory, { passive: true });
    window.addEventListener("orientationchange", updateStory, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateStory);
      window.removeEventListener("resize", updateStory);
      window.removeEventListener("orientationchange", updateStory);
      setActive(false);
      sectionRectRef.current = null;
    };
  }, [reducedMotion, sectionRectRef, setActive, updateStory]);

  const positioning = principleStages[0];
  const design = principleStages[1];
  const technology = principleStages[2];
  const principlesClassName =
    stage === "principles" ? `${styles["panel"]} ${styles["activePanel"]}` : styles["panel"];
  return (
    <section
      ref={setStoryNode}
      id="principles"
      className={styles["story"]}
      aria-labelledby="principles-heading"
    >
      <h2 id="principles-heading" className={styles["visuallyHidden"]}>
        Princípios
      </h2>

      <div
        ref={setStickyFrameNode}
        className={styles["stickyFrame"]}
        data-principle-stage={stage}
        data-cursor-fullscreen={fullscreen}
      >
        <CopyPanel
          active={stage === "positioning" && copyReveal}
          lines={positioning.lines}
          stage="positioning"
        />
        <CopyPanel active={stage === "design" && copyReveal} lines={design.lines} stage="design" />

        <div
          className={principlesClassName}
          data-stage="principles"
          data-active={stage === "principles"}
        >
          <PrincipleOrbit ref={orbitRef} progress={reducedMotion ? 0.55 : 0} />
          <div className={styles["statementGrid"]}>
            {principleStatements.map((statement) => (
              <p key={statement[0]} data-principle-statement data-contrast-surface="diffuse">
                <StaggeredLine line={statement[0]} />
                <StaggeredLine line={statement[1]} />
              </p>
            ))}
          </div>
        </div>

        <CopyPanel
          active={stage === "technology" && technologyReveal}
          exitWhenInactive
          lines={technology.lines}
          stage="technology"
        />
      </div>
    </section>
  );
}
