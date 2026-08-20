"use client";

import { type ChangeEvent, useState } from "react";

import {
  PHYSICAL_PRISM_REFLECTION_LAYERS,
  type PhysicalPrismReflectionLayerAdjustment,
  type PhysicalPrismReflectionLayerAdjustments,
  type PhysicalPrismReflectionLayerId,
} from "@/scene/physical-prism-reflection-atlas-config";

import styles from "./PhysicalPrismTest.module.css";

type AdjustmentField = keyof PhysicalPrismReflectionLayerAdjustment;

interface AdjustmentControl {
  readonly field: AdjustmentField;
  readonly label: string;
  readonly max: number;
  readonly min: number;
  readonly step: number;
}

const ADJUSTMENT_CONTROLS: readonly AdjustmentControl[] = [
  { field: "offsetX", label: "Posição X", max: 0.18, min: -0.18, step: 0.001 },
  { field: "offsetY", label: "Posição Y", max: 0.18, min: -0.18, step: 0.001 },
  { field: "scaleX", label: "Escala X", max: 1.5, min: 0.5, step: 0.005 },
  { field: "scaleY", label: "Escala Y", max: 1.5, min: 0.5, step: 0.005 },
];

interface PhysicalPrismFineTunerProps {
  readonly adjustments: PhysicalPrismReflectionLayerAdjustments;
  readonly onChange: (
    layerId: PhysicalPrismReflectionLayerId,
    field: AdjustmentField,
    value: number,
  ) => void;
  readonly onReset: () => void;
}

function formatAdjustment(value: number): string {
  return value.toFixed(3);
}

export function PhysicalPrismFineTuner({
  adjustments,
  onChange,
  onReset,
}: PhysicalPrismFineTunerProps) {
  const [activeLayerId, setActiveLayerId] = useState<PhysicalPrismReflectionLayerId>("n");
  const activeLayer = PHYSICAL_PRISM_REFLECTION_LAYERS.find((layer) => layer.id === activeLayerId);

  function handleChange(
    event: ChangeEvent<HTMLInputElement>,
    layerId: PhysicalPrismReflectionLayerId,
    field: AdjustmentField,
  ) {
    const value = Number(event.currentTarget.value);
    if (Number.isFinite(value)) onChange(layerId, field, value);
  }

  if (!activeLayer) return null;

  const adjustment = adjustments[activeLayer.id];
  const activeLayerLabel = activeLayer.id === "ir" ? "IR" : activeLayer.id.toUpperCase();

  return (
    <aside className={styles["tuner"]} data-testid="physical-prism-fine-tuner">
      <div className={styles["tunerHeader"]}>
        <div>
          <p className={styles["tunerEyebrow"]}>CALIBRAÇÃO LOCAL</p>
          <h1 className={styles["tunerTitle"]}>Reflexos por letra</h1>
        </div>
        <button className={styles["resetButton"]} onClick={onReset} type="button">
          Restaurar
        </button>
      </div>

      <p className={styles["tunerDescription"]}>
        Posição move a imagem. Escala altera seu tamanho sem deslocar o centro.
      </p>

      <div aria-label="Letra a ajustar" className={styles["tunerTabs"]} role="tablist">
        {PHYSICAL_PRISM_REFLECTION_LAYERS.map((layer) => {
          const layerLabel = layer.id === "ir" ? "IR" : layer.id.toUpperCase();
          const isActive = layer.id === activeLayer.id;

          return (
            <button
              aria-controls={`prism-panel-${layer.id}`}
              aria-selected={isActive}
              className={styles["tunerTab"]}
              id={`prism-tab-${layer.id}`}
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              role="tab"
              type="button"
            >
              {layerLabel}
            </button>
          );
        })}
      </div>

      <fieldset
        aria-labelledby={`prism-tab-${activeLayer.id}`}
        className={styles["tunerLayer"]}
        id={`prism-panel-${activeLayer.id}`}
        role="tabpanel"
      >
        <legend>{activeLayerLabel}</legend>
        {ADJUSTMENT_CONTROLS.map((control) => {
          const controlId = `prism-${activeLayer.id}-${control.field}`;
          const value = adjustment[control.field];

          return (
            <div className={styles["tunerControl"]} key={control.field}>
              <div className={styles["tunerControlHeading"]}>
                <label htmlFor={controlId}>{control.label}</label>
                <output htmlFor={controlId}>{formatAdjustment(value)}</output>
              </div>
              <div className={styles["tunerInputs"]}>
                <input
                  aria-label={`${activeLayerLabel} ${control.label}`}
                  id={controlId}
                  max={control.max}
                  min={control.min}
                  onChange={(event) => handleChange(event, activeLayer.id, control.field)}
                  step={control.step}
                  type="range"
                  value={value}
                />
                <input
                  aria-label={`${activeLayerLabel} ${control.label} valor`}
                  max={control.max}
                  min={control.min}
                  onChange={(event) => handleChange(event, activeLayer.id, control.field)}
                  step={control.step}
                  type="number"
                  value={value}
                />
              </div>
            </div>
          );
        })}
      </fieldset>
    </aside>
  );
}
