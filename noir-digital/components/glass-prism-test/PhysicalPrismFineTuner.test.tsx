import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PhysicalPrismFineTuner } from "@/components/glass-prism-test/PhysicalPrismFineTuner";
import { createPhysicalPrismReflectionLayerAdjustments } from "@/scene/physical-prism-reflection-atlas-config";

describe("PhysicalPrismFineTuner", () => {
  afterEach(cleanup);

  it("offers independent position and scale controls for N, O, and IR", () => {
    const onChange = vi.fn();

    render(
      <PhysicalPrismFineTuner
        adjustments={createPhysicalPrismReflectionLayerAdjustments()}
        onChange={onChange}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByRole("tabpanel", { name: "N" })).toBeInTheDocument();
    expect(screen.getByLabelText("N Posição X")).toHaveValue("-0.015");

    fireEvent.click(screen.getByRole("tab", { name: "O" }));
    expect(screen.getByRole("tabpanel", { name: "O" })).toBeInTheDocument();
    expect(screen.getByLabelText("O Escala Y")).toHaveValue("0.995");

    fireEvent.change(screen.getByLabelText("O Escala X"), { target: { value: "1.125" } });
    expect(onChange).toHaveBeenCalledWith("o", "scaleX", 1.125);

    fireEvent.click(screen.getByRole("tab", { name: "IR" }));
    expect(screen.getByRole("tabpanel", { name: "IR" })).toBeInTheDocument();
    expect(screen.getByLabelText("IR Posição Y")).toHaveValue("0.12");
  });

  it("restores the calibration defaults on demand", () => {
    const onReset = vi.fn();

    render(
      <PhysicalPrismFineTuner
        adjustments={createPhysicalPrismReflectionLayerAdjustments()}
        onChange={vi.fn()}
        onReset={onReset}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Restaurar" }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
