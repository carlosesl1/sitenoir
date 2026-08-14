"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

import { PhysicalPrismGlassAsset } from "@/scene/PhysicalPrismGlassAsset";

export function PhysicalPrismTestScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 38, near: 0.1, far: 40 }}
      dpr={[1, 1.5]}
      gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.95;
      }}
    >
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.18} />
      <Suspense fallback={null}>
        <PhysicalPrismGlassAsset />
      </Suspense>
    </Canvas>
  );
}
