import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from "react";

import { resolvePrincipleOrbit } from "@/components/principles/principle-orbit";

import styles from "./PrinciplesStory.module.css";

export interface PrincipleOrbitHandle {
  readonly setProgress: (progress: number) => void;
}

export const PrincipleOrbit = forwardRef<PrincipleOrbitHandle, { readonly progress: number }>(
  function PrincipleOrbit({ progress }, ref) {
    const ellipses = resolvePrincipleOrbit(progress);
    const ellipseRefs = useRef<Array<SVGEllipseElement | null>>([]);

    const setProgress = useCallback((nextProgress: number) => {
      const nextEllipses = resolvePrincipleOrbit(nextProgress);
      for (const [index, geometry] of nextEllipses.entries()) {
        const ellipse = ellipseRefs.current[index];
        if (!ellipse) continue;
        ellipse.setAttribute("cx", String(geometry.centerX));
        ellipse.setAttribute("cy", String(geometry.centerY));
        ellipse.setAttribute("rx", String(geometry.radiusX));
        ellipse.setAttribute("ry", String(geometry.radiusY));
        ellipse.setAttribute("opacity", geometry.visible ? "1" : "0");
      }
    }, []);

    useImperativeHandle(ref, () => ({ setProgress }), [setProgress]);
    useLayoutEffect(() => setProgress(progress), [progress, setProgress]);

    return (
      <svg
        className={styles["principleOrbit"]}
        data-principle-orbit="true"
        viewBox="0 0 344 344"
        aria-hidden="true"
      >
        <title>Órbitas digitais</title>
        <defs>
          <clipPath id="principle-orbit-clip">
            <rect x="20" y="22" width="304" height="300" />
          </clipPath>
        </defs>
        <g clipPath="url(#principle-orbit-clip)">
          {ellipses.map((ellipse, index) => (
            <ellipse
              key={ellipse.id}
              ref={(node) => {
                ellipseRefs.current[index] = node;
              }}
              cx={ellipse.centerX}
              cy={ellipse.centerY}
              rx={ellipse.radiusX}
              ry={ellipse.radiusY}
              opacity={ellipse.visible ? 1 : 0}
            />
          ))}
        </g>
      </svg>
    );
  },
);
