"use client";

import { useLayoutEffect, useRef } from "react";

import {
  NOIR_SYMBOL_DURATION_MS,
  NOIR_SYMBOL_FRONTS,
  resolveNoirSymbolFrame,
} from "@/components/preloader/noir-symbol-preloader-timeline";

import styles from "./NoirSymbolPreloaderMark.module.css";

export const NOIR_SYMBOL_PATHS = [
  "M141.536 58.991V126.54C141.533 126.713 141.487 126.883 141.399 127.033C141.312 127.183 141.187 127.308 141.037 127.396L98.7618 152.098C97.4206 152.855 96.3049 153.951 95.5273 155.273C94.7498 156.595 94.3382 158.098 94.3339 159.629V172.55C94.3092 173.315 94.4986 174.071 94.8812 174.735C95.2638 175.399 95.8244 175.946 96.501 176.313C97.1776 176.68 97.9436 176.854 98.714 176.816C99.4843 176.778 100.229 176.529 100.865 176.096L159.635 142.349C160.936 141.712 162.025 140.717 162.771 139.483C163.517 138.249 163.889 136.827 163.841 135.389V50.2743C163.838 48.9156 163.472 47.5819 162.779 46.4094C162.087 45.2368 161.094 44.2673 159.9 43.5995L85.9098 1.09177C84.7709 0.410521 83.4729 0.0350626 82.1433 0.00233892C80.8137 -0.0303847 79.4985 0.280754 78.327 0.90514L19.978 34.4217C19.2099 34.866 18.5744 35.5045 18.1364 36.2719C17.6984 37.0394 17.4735 37.9083 17.4848 38.7901C17.496 39.6719 17.743 40.5349 18.2005 41.2912C18.6579 42.0474 19.3095 42.6697 20.0887 43.0945L92.8616 84.9107C93.3209 85.1271 93.7062 85.4722 93.9698 85.9034C94.2334 86.3346 94.3639 86.833 94.345 87.3369V135.641C94.3741 136.451 94.6109 137.241 95.0329 137.936C95.4548 138.63 96.0482 139.207 96.757 139.611C97.4657 140.015 98.2666 140.233 99.0841 140.246C99.9016 140.258 100.709 140.064 101.43 139.681L114.06 132.436C114.856 131.913 115.509 131.204 115.961 130.371C116.413 129.538 116.65 128.606 116.651 127.66V78.2579C116.639 76.623 116.195 75.0198 115.361 73.6093C114.527 72.1988 113.334 71.0305 111.902 70.2218L57.6486 39.0655C57.5912 39.0314 57.5438 38.9831 57.5109 38.9254C57.478 38.8677 57.4607 38.8025 57.4607 38.7362C57.4607 38.6699 57.478 38.6047 57.5109 38.547C57.5438 38.4893 57.5912 38.441 57.6486 38.4068L81.4376 24.7499C81.5967 24.6561 81.7783 24.6067 81.9634 24.6067C82.1485 24.6067 82.3301 24.6561 82.4892 24.7499L141.248 58.508C141.334 58.5563 141.407 58.6264 141.457 58.7112C141.508 58.796 141.535 58.8925 141.536 58.991Z",
  "M22.3364 145.566V81.4198C22.3349 81.3294 22.3579 81.2402 22.403 81.1616C22.4482 81.083 22.5137 81.0179 22.5929 80.973C22.6721 80.9282 22.762 80.9052 22.8532 80.9066C22.9444 80.9079 23.0335 80.9335 23.1113 80.9807L62.542 103.596C62.6533 103.668 62.7455 103.765 62.811 103.88C62.8765 103.994 62.9133 104.123 62.9183 104.255V172.495C62.9203 173.524 63.1828 174.535 63.6819 175.437C64.1809 176.339 64.9004 177.101 65.7743 177.655L79.3238 185.417C79.9617 185.699 80.6601 185.819 81.3564 185.767C82.0527 185.715 82.7251 185.492 83.3133 185.119C83.9015 184.746 84.387 184.234 84.7263 183.628C85.0656 183.023 85.248 182.344 85.2572 181.651V96.3064C85.2674 94.7049 84.8548 93.1287 84.0606 91.7344C83.2663 90.34 82.118 89.176 80.7297 88.3581L9.53972 47.541C8.57497 46.9644 7.47176 46.6555 6.34542 46.6464C5.21908 46.6374 4.11098 46.9286 3.13693 47.4895C2.16289 48.0505 1.35867 48.8607 0.808361 49.8353C0.258047 50.81 -0.0181594 51.9134 0.00861455 53.0301V136.015C-0.0524743 137.173 0.212266 138.325 0.773279 139.343C1.33429 140.361 2.1695 141.204 3.18565 141.778L16.1927 149.189C16.827 149.522 17.5372 149.688 18.2549 149.67C18.9726 149.653 19.6737 149.453 20.2908 149.089C20.9079 148.725 21.4202 148.21 21.7784 147.593C22.1367 146.976 22.3288 146.278 22.3364 145.566Z",
] as const;

const CENTER_X = 82;
const CENTER_Y = 93;
const SPIRAL_SWING = 2.4;
const TRAIL_DOTS = ["one", "two", "three", "four", "five"] as const;

type NoirSymbolPreloaderMarkProps = {
  readonly onComplete: () => void;
  readonly reducedMotion: boolean;
};

function smooth(value: number): number {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function spiralPoint(frontIndex: number, progress: number): { x: number; y: number } {
  const front = NOIR_SYMBOL_FRONTS[frontIndex];
  const eased = 1 - (1 - progress) ** 3;
  const targetAngle = Math.atan2(front.y - CENTER_Y, front.x - CENTER_X);
  const targetRadius = Math.hypot(front.x - CENTER_X, front.y - CENTER_Y);
  const radius = targetRadius * (0.03 + 0.97 * eased);
  const angle = targetAngle - (1 - eased) * SPIRAL_SWING;

  return {
    x: CENTER_X + Math.cos(angle) * radius,
    y: CENTER_Y + Math.sin(angle) * radius,
  };
}

const SPIRAL_PATHS = NOIR_SYMBOL_FRONTS.map((_, frontIndex) => {
  const points = Array.from({ length: 49 }, (__, pointIndex) =>
    spiralPoint(frontIndex, pointIndex / 48),
  );
  return `M${points.map((point) => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`).join("L")}`;
});

function setCircle(element: SVGCircleElement | null, x: number, y: number, opacity: number) {
  if (!element) return;
  element.setAttribute("cx", String(x));
  element.setAttribute("cy", String(y));
  element.style.opacity = String(opacity);
}

export function NoirSymbolPreloaderMark({
  onComplete,
  reducedMotion,
}: NoirSymbolPreloaderMarkProps) {
  const rootRef = useRef<SVGSVGElement>(null);
  const sourceRefs = useRef<(SVGPathElement | null)[]>([]);
  const mainRefs = useRef<(SVGPathElement | null)[]>([]);
  const chaseRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);
  const flashRefs = useRef<(SVGPathElement | null)[]>([]);
  const emissaryRefs = useRef<(SVGCircleElement | null)[]>([]);
  const emissaryHaloRefs = useRef<(SVGCircleElement | null)[]>([]);
  const emissaryTrailRefs = useRef<(SVGPathElement | null)[]>([]);
  const tipRefs = useRef<(SVGCircleElement | null)[]>([]);
  const tipHaloRefs = useRef<(SVGCircleElement | null)[]>([]);
  const tipTrailRefs = useRef<(SVGCircleElement | null)[][]>([]);
  const heartCoreRef = useRef<SVGCircleElement>(null);
  const heartHaloRef = useRef<SVGCircleElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    if (!root || !fill) return;

    let animationFrame = 0;
    let didComplete = false;
    let disposed = false;

    const complete = (fallback = false) => {
      if (didComplete || disposed) return;
      didComplete = true;
      root.dataset.symbolPhase = "complete";
      root.dataset.symbolComplete = "true";
      if (fallback) root.dataset.symbolFallback = "true";
      fill.style.opacity = "1";
      onCompleteRef.current();
    };

    if (reducedMotion) {
      complete();
      return () => {
        disposed = true;
      };
    }

    try {
      const lengths = sourceRefs.current.map((path) => path?.getTotalLength() ?? 0);
      if (lengths.length !== NOIR_SYMBOL_PATHS.length || lengths.some((length) => length <= 0)) {
        throw new Error("NOIR symbol paths could not be measured");
      }

      const startedAt = performance.now();
      const renderFrame = (now: number) => {
        if (disposed) return;
        const elapsedMs = Math.max(0, now - startedAt);
        const frame = resolveNoirSymbolFrame(elapsedMs);
        root.dataset.symbolPhase = frame.phase;
        root.dataset.symbolComplete = String(frame.complete);

        setCircle(heartCoreRef.current, CENTER_X, CENTER_Y, frame.heartOpacity * 0.95);
        setCircle(heartHaloRef.current, CENTER_X, CENTER_Y, frame.heartOpacity * 0.5);

        NOIR_SYMBOL_FRONTS.forEach((front, frontIndex) => {
          const contourLength = lengths[front.contour];
          const seedAt = contourLength * front.seed;
          const segmentLength = contourLength * (front.end - front.seed);
          const drawnLength = Math.max(0.001, segmentLength * frame.drawProgress);
          const dash = `${drawnLength} ${Math.max(0.001, contourLength - drawnLength)}`;
          const dashOffset = String(-seedAt);

          [
            mainRefs.current[frontIndex],
            chaseRefs.current[frontIndex],
            glowRefs.current[frontIndex],
          ]
            .filter((path): path is SVGPathElement => Boolean(path))
            .forEach((path) => {
              path.style.strokeDasharray = dash;
              path.style.strokeDashoffset = dashOffset;
            });

          const drawingOpacity = frame.drawProgress > 0 && frame.drawProgress < 1 ? 1 : 0;
          const main = mainRefs.current[frontIndex];
          const chase = chaseRefs.current[frontIndex];
          const glow = glowRefs.current[frontIndex];
          if (main) main.style.opacity = frame.drawProgress > 0 ? "1" : "0";
          if (chase) chase.style.opacity = frame.drawProgress > 0 ? "0.14" : "0";
          if (glow) glow.style.opacity = frame.drawProgress > 0 ? "0.1" : "0";

          const flight = frame.flightProgress[frontIndex];
          const emissaryPoint = spiralPoint(frontIndex, flight);
          const emissaryOpacity = frame.phase === "flight" ? 0.92 * smooth(flight * 6) : 0;
          setCircle(
            emissaryRefs.current[frontIndex],
            emissaryPoint.x,
            emissaryPoint.y,
            emissaryOpacity,
          );
          setCircle(
            emissaryHaloRefs.current[frontIndex],
            emissaryPoint.x,
            emissaryPoint.y,
            emissaryOpacity * 0.55,
          );
          const emissaryTrail = emissaryTrailRefs.current[frontIndex];
          if (emissaryTrail) {
            const trailLength = Math.min(0.24, flight);
            emissaryTrail.style.strokeDasharray = `${trailLength} ${1 - trailLength}`;
            emissaryTrail.style.strokeDashoffset = String(trailLength - flight);
            emissaryTrail.style.opacity = String(emissaryOpacity * 0.42);
          }

          const measurePath = sourceRefs.current[front.contour];
          if (measurePath && drawingOpacity > 0) {
            const tipAt = seedAt + segmentLength * frame.drawProgress;
            const point = measurePath.getPointAtLength(tipAt);
            const tipOpacity =
              0.95 *
              smooth(frame.drawProgress * 9) *
              (1 - smooth((frame.drawProgress - 0.94) / 0.06));
            setCircle(tipRefs.current[frontIndex], point.x, point.y, tipOpacity);
            setCircle(tipHaloRefs.current[frontIndex], point.x, point.y, tipOpacity * 0.55);

            const delta = Math.min(contourLength * 0.02, 1.9);
            tipTrailRefs.current[frontIndex]?.forEach((dot, dotIndex) => {
              const trailAt = Math.max(seedAt, tipAt - (dotIndex + 1) * delta);
              const trailPoint = measurePath.getPointAtLength(trailAt);
              setCircle(
                dot,
                trailPoint.x,
                trailPoint.y,
                tipOpacity * 0.4 * (1 - (dotIndex + 1) / 6),
              );
            });
          } else {
            setCircle(tipRefs.current[frontIndex], front.x, front.y, 0);
            setCircle(tipHaloRefs.current[frontIndex], front.x, front.y, 0);
            tipTrailRefs.current[frontIndex]?.forEach((dot) => {
              dot.style.opacity = "0";
            });
          }
        });

        flashRefs.current.forEach((flash, contourIndex) => {
          if (!flash) return;
          const contourLength = lengths[contourIndex];
          const windowLength = contourLength * 0.13;
          flash.style.strokeDasharray = `${windowLength} ${contourLength - windowLength}`;
          flash.style.strokeDashoffset = String(
            windowLength / 2 - contourLength * frame.ignitionProgress,
          );
          flash.style.opacity = String(Math.sin(Math.PI * frame.ignitionProgress) ** 0.7 * 0.82);
        });

        fill.style.opacity = String(frame.fillOpacity);

        if (frame.complete || elapsedMs >= NOIR_SYMBOL_DURATION_MS) {
          complete();
          return;
        }
        animationFrame = window.requestAnimationFrame(renderFrame);
      };

      animationFrame = window.requestAnimationFrame(renderFrame);
    } catch {
      complete(true);
    }

    return () => {
      disposed = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [reducedMotion]);

  return (
    <svg
      aria-hidden="true"
      className={styles["mark"]}
      data-symbol-complete={String(reducedMotion)}
      data-symbol-phase={reducedMotion ? "complete" : "void"}
      data-testid="noir-symbol-preloader"
      ref={rootRef}
      viewBox="0 0 164 186"
    >
      <defs>
        <filter id="noir-symbol-preloader-bloom" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="2.7" />
        </filter>
      </defs>

      <g className={styles["source"]}>
        {NOIR_SYMBOL_PATHS.map((path, contourIndex) => (
          <path
            d={path}
            data-symbol-source=""
            key={path}
            ref={(node) => {
              sourceRefs.current[contourIndex] = node;
            }}
          />
        ))}
      </g>

      <g className={styles["ghost"]} data-symbol-layer="ghost">
        {NOIR_SYMBOL_PATHS.map((path) => (
          <path d={path} key={path} />
        ))}
      </g>

      <g data-symbol-layer="draw">
        {NOIR_SYMBOL_FRONTS.map((front, frontIndex) => (
          <g key={front.name}>
            <path
              className={styles["chase"]}
              d={NOIR_SYMBOL_PATHS[front.contour]}
              ref={(node) => {
                chaseRefs.current[frontIndex] = node;
              }}
            />
            <path
              className={styles["glow"]}
              d={NOIR_SYMBOL_PATHS[front.contour]}
              filter="url(#noir-symbol-preloader-bloom)"
              ref={(node) => {
                glowRefs.current[frontIndex] = node;
              }}
            />
            <path
              className={styles["main"]}
              d={NOIR_SYMBOL_PATHS[front.contour]}
              ref={(node) => {
                mainRefs.current[frontIndex] = node;
              }}
            />
          </g>
        ))}
      </g>

      <g
        className={styles["bloom"]}
        data-symbol-layer="bloom"
        filter="url(#noir-symbol-preloader-bloom)"
      >
        {NOIR_SYMBOL_PATHS.map((path, contourIndex) => (
          <path
            className={styles["flash"]}
            d={path}
            key={path}
            ref={(node) => {
              flashRefs.current[contourIndex] = node;
            }}
          />
        ))}
        {NOIR_SYMBOL_FRONTS.map((front, frontIndex) => (
          <circle
            className={styles["emissaryHalo"]}
            data-symbol-emissary-halo=""
            key={`emissary-halo-${front.name}`}
            r="2.3"
            ref={(node) => {
              emissaryHaloRefs.current[frontIndex] = node;
            }}
          />
        ))}
        {NOIR_SYMBOL_FRONTS.map((front, frontIndex) => (
          <circle
            className={styles["tipHalo"]}
            data-symbol-tip-halo=""
            key={`tip-halo-${front.name}`}
            r="2.3"
            ref={(node) => {
              tipHaloRefs.current[frontIndex] = node;
            }}
          />
        ))}
        <circle
          className={styles["heartHalo"]}
          cx={CENTER_X}
          cy={CENTER_Y}
          r="5.4"
          ref={heartHaloRef}
        />
      </g>

      <g data-symbol-layer="tips">
        {NOIR_SYMBOL_FRONTS.map((front, frontIndex) => (
          <g key={`moving-${front.name}`}>
            <path
              className={styles["emissaryTrail"]}
              d={SPIRAL_PATHS[frontIndex]}
              data-symbol-emissary-trail=""
              pathLength="1"
              ref={(node) => {
                emissaryTrailRefs.current[frontIndex] = node;
              }}
            />
            <circle
              className={styles["emissary"]}
              data-symbol-emissary={front.name}
              r="0.78"
              ref={(node) => {
                emissaryRefs.current[frontIndex] = node;
              }}
            />
            <circle
              className={styles["tip"]}
              data-symbol-tip={front.name}
              r="0.88"
              ref={(node) => {
                tipRefs.current[frontIndex] = node;
              }}
            />
            {TRAIL_DOTS.map((dotName, dotIndex) => (
              <circle
                className={styles["trailDot"]}
                data-symbol-trail-dot=""
                key={`${front.name}-trail-${dotName}`}
                r={0.7 * (1 - (dotIndex + 1) / 7)}
                ref={(node) => {
                  if (!tipTrailRefs.current[frontIndex]) tipTrailRefs.current[frontIndex] = [];
                  tipTrailRefs.current[frontIndex][dotIndex] = node;
                }}
              />
            ))}
          </g>
        ))}
        <circle
          className={styles["heart"]}
          cx={CENTER_X}
          cy={CENTER_Y}
          r="1.8"
          ref={heartCoreRef}
        />
      </g>

      <g className={styles["fill"]} data-symbol-layer="fill" ref={fillRef}>
        {NOIR_SYMBOL_PATHS.map((path) => (
          <path d={path} key={path} />
        ))}
      </g>

      <g
        className={styles["waitingBloom"]}
        data-symbol-layer="waiting-bloom"
        filter="url(#noir-symbol-preloader-bloom)"
      >
        {NOIR_SYMBOL_PATHS.map((path) => (
          <path d={path} key={path} />
        ))}
      </g>
    </svg>
  );
}
