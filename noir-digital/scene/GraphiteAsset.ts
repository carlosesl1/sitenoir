import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  Box3,
  Mesh,
  MeshMatcapMaterial,
  MeshPhysicalMaterial,
  type Object3D,
  Vector3,
} from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { useTheme } from "@/features/theme/ThemeProvider";
import { createContactChromeMatcap } from "@/scene/contact-chrome-matcap";
import { HERO_MODEL_SOURCE, POINTER_MODEL_SOURCE } from "@/scene/critical-hero-preload";

function applyContactSidePaint(material: MeshPhysicalMaterial, cursor: boolean): void {
  const sideStart = cursor ? 0.08 : 0.24;
  const sideEnd = cursor ? 0.46 : 0.72;
  const sideEmission = cursor ? 2.1 : 1.15;
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vContactObjectNormal;`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
vContactObjectNormal = normalize(objectNormal);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vContactObjectNormal;
float contactSideMask() {
  float lateral = 1.0 - abs(normalize(vContactObjectNormal).z);
  return smoothstep(${sideStart.toFixed(2)}, ${sideEnd.toFixed(2)}, lateral);
}`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
float contactSides = contactSideMask();
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), contactSides);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(1.0) * contactSideMask() * ${sideEmission.toFixed(2)};`,
      );
  };
  material.customProgramCacheKey = () =>
    cursor ? "cursor-side-paint-v2" : "contact-side-paint-v1";
}

export function useGraphiteAsset(path: string, heroStyle = false): Object3D {
  const source = useLoader(GLTFLoader, path, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const { resolvedTheme } = useTheme();
  const isHeroAsset = heroStyle || path === HERO_MODEL_SOURCE;
  const isCursorAsset = path === POINTER_MODEL_SOURCE;
  const isContactAsset =
    !heroStyle && (path.includes("/contact-") || path.endsWith("/contact.glb"));
  const dark = resolvedTheme === "dark";
  const contactMatcap = useMemo(
    () => (isContactAsset ? createContactChromeMatcap() : null),
    [isContactAsset],
  );
  const material = useMemo(() => {
    if (isContactAsset) {
      return new MeshMatcapMaterial({
        color: dark ? "#ffffff" : "#e3e6e9",
        matcap: contactMatcap,
        toneMapped: false,
      });
    }

    const physicalMaterial = new MeshPhysicalMaterial({
      color: heroStyle
        ? dark
          ? "#8f99a5"
          : "#747d86"
        : dark
          ? isHeroAsset
            ? "#dde8ff"
            : isCursorAsset
              ? "#8d96a5"
              : "#c5c8c5"
          : isHeroAsset
            ? "#aeb2ae"
            : "#414441",
      emissive: heroStyle
        ? dark
          ? "#252c34"
          : "#1d2228"
        : dark
          ? isHeroAsset
            ? "#f4f4f0"
            : isCursorAsset
              ? "#1b2431"
              : "#8f9890"
          : isHeroAsset
            ? "#4b4f4b"
            : "#141714",
      emissiveIntensity: heroStyle
        ? 0.18
        : dark
          ? isHeroAsset
            ? 0.55
            : isCursorAsset
              ? 0.45
              : 2.2
          : isHeroAsset
            ? 0.42
            : 0.58,
      roughness: heroStyle
        ? dark
          ? 0.26
          : 0.34
        : dark
          ? isHeroAsset
            ? 0.2
            : 0.25
          : isHeroAsset
            ? 0.38
            : 0.29,
      metalness: heroStyle ? 0.28 : isHeroAsset ? 0.4 : 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.13,
      envMapIntensity: 0.8,
      iridescence: 0.08,
      iridescenceIOR: 1.32,
      opacity: isHeroAsset ? 0.78 : 1,
      transparent: isHeroAsset,
      depthWrite: !isHeroAsset,
    });

    if (heroStyle) applyContactSidePaint(physicalMaterial, isCursorAsset);
    return physicalMaterial;
  }, [contactMatcap, dark, heroStyle, isContactAsset, isCursorAsset, isHeroAsset]);
  const scene = useMemo(() => {
    const clone = source.scene.clone(true);
    clone.traverse((object) => {
      if (object instanceof Mesh) {
        object.material = material;
        object.castShadow = false;
        object.receiveShadow = false;
      }
    });
    clone.updateMatrixWorld(true);
    const center = new Box3().setFromObject(clone).getCenter(new Vector3());
    clone.position.sub(center);
    clone.updateMatrixWorld(true);
    return clone;
  }, [material, source.scene]);

  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => contactMatcap?.dispose(), [contactMatcap]);
  return scene;
}
