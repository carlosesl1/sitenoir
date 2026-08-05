"use client";

import { useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";

import { usePrincipleScene } from "@/features/principles/PrincipleSceneProvider";
import { ContactModel } from "@/scene/ContactModel";
import { StickerField } from "@/scene/StickerField";
import { principleSceneLayouts, resolveViewportFamily, sceneLayouts } from "@/scene/scene-layout";

interface ProgressiveSceneContentProps {
  readonly reducedMotion: boolean;
  readonly scrollProgress: { readonly get: () => number };
}

function SceneMilestoneMarker({ milestone }: { readonly milestone: "contact" | "decor" }) {
  useEffect(() => {
    if (milestone === "contact") window.__NOIR_CONTACT_READY__ = true;
    else window.__NOIR_DECOR_READY__ = true;

    return () => {
      if (milestone === "contact") window.__NOIR_CONTACT_READY__ = false;
      else window.__NOIR_DECOR_READY__ = false;
    };
  }, [milestone]);

  return null;
}

export function ProgressiveSceneContent({
  reducedMotion,
  scrollProgress,
}: ProgressiveSceneContentProps) {
  const width = useThree((state) => state.size.width);
  const principleScene = usePrincipleScene();
  const layout = sceneLayouts[resolveViewportFamily(width)];
  const stickerVisibility = principleScene.active
    ? principleSceneLayouts[principleScene.stage].stickerVisibility
    : 0;

  return (
    <>
      <Suspense fallback={null}>
        <StickerField
          layout={layout.stickers}
          reducedMotion={reducedMotion}
          scrollProgress={scrollProgress}
          visibility={stickerVisibility}
        />
        <SceneMilestoneMarker milestone="decor" />
      </Suspense>
      <Suspense fallback={null}>
        <ContactModel
          layout={layout.contact}
          reducedMotion={reducedMotion}
          scrollProgress={scrollProgress}
        />
        <SceneMilestoneMarker milestone="contact" />
      </Suspense>
    </>
  );
}
