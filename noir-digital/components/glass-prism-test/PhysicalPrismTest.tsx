"use client";

import { useState } from "react";

import { PhysicalPrismFineTuner } from "@/components/glass-prism-test/PhysicalPrismFineTuner";
import { PhysicalPrismTestScene } from "@/scene/PhysicalPrismTestScene";
import {
  createPhysicalPrismReflectionLayerAdjustments,
  type PhysicalPrismReflectionLayerAdjustment,
  type PhysicalPrismReflectionLayerId,
} from "@/scene/physical-prism-reflection-atlas-config";

import styles from "./PhysicalPrismTest.module.css";

export function PhysicalPrismTest() {
  const [adjustments, setAdjustments] = useState(createPhysicalPrismReflectionLayerAdjustments);

  function handleAdjustmentChange(
    layerId: PhysicalPrismReflectionLayerId,
    field: keyof PhysicalPrismReflectionLayerAdjustment,
    value: number,
  ) {
    setAdjustments((current) => ({
      ...current,
      [layerId]: {
        ...current[layerId],
        [field]: value,
      },
    }));
  }

  return (
    <main className={styles["shell"]} data-testid="physical-prism-test">
      <span className={styles["label"]}>PRISM TEST</span>
      <div className={styles["canvas"]}>
        <PhysicalPrismTestScene reflectionAdjustments={adjustments} />
      </div>
      <PhysicalPrismFineTuner
        adjustments={adjustments}
        onChange={handleAdjustmentChange}
        onReset={() => setAdjustments(createPhysicalPrismReflectionLayerAdjustments())}
      />
    </main>
  );
}
