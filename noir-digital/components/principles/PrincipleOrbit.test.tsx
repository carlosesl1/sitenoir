import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { PrincipleOrbit, type PrincipleOrbitHandle } from "@/components/principles/PrincipleOrbit";
import { resolvePrincipleOrbit } from "@/components/principles/principle-orbit";

describe("PrincipleOrbit", () => {
  it("updates the existing SVG ellipses without requiring a React render", () => {
    const orbitRef = createRef<PrincipleOrbitHandle>();
    const view = render(<PrincipleOrbit ref={orbitRef} progress={0} />);
    const expected = resolvePrincipleOrbit(0.5);

    act(() => orbitRef.current?.setProgress(0.5));

    const ellipses = view.container.querySelectorAll("ellipse");
    expect(ellipses).toHaveLength(expected.length);
    for (const [index, ellipse] of Array.from(ellipses).entries()) {
      const geometry = expected[index];
      expect(ellipse).toHaveAttribute("cx", String(geometry?.centerX));
      expect(ellipse).toHaveAttribute("cy", String(geometry?.centerY));
      expect(ellipse).toHaveAttribute("rx", String(geometry?.radiusX));
      expect(ellipse).toHaveAttribute("ry", String(geometry?.radiusY));
      expect(ellipse).toHaveAttribute("opacity", geometry?.visible ? "1" : "0");
    }
  });
});
