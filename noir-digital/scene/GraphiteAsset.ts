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

export function useGraphiteAsset(path: string): Object3D {
  const source = useLoader(GLTFLoader, path, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const { resolvedTheme } = useTheme();
  const isHeroAsset = path.endsWith("/hello.glb");
  const isCursorAsset = path.endsWith("/cursor.glb");
  const isContactAsset = path.includes("/contact-") || path.endsWith("/contact.glb");
  const dark = resolvedTheme === "dark";
  const contactMatcap = useMemo(
    () => (isContactAsset ? createContactChromeMatcap() : null),
    [isContactAsset],
  );
  const material = useMemo(
    () =>
      isContactAsset
        ? new MeshMatcapMaterial({
            color: dark ? "#ffffff" : "#e3e6e9",
            matcap: contactMatcap,
            toneMapped: false,
          })
        : new MeshPhysicalMaterial({
            color: dark
              ? isHeroAsset
                ? "#dde8ff"
                : isCursorAsset
                  ? "#8d96a5"
                  : "#c5c8c5"
              : isHeroAsset
                ? "#aeb2ae"
                : "#414441",
            emissive: dark
              ? isHeroAsset
                ? "#f4f4f0"
                : isCursorAsset
                  ? "#1b2431"
                  : "#8f9890"
              : isHeroAsset
                ? "#4b4f4b"
                : "#141714",
            emissiveIntensity: dark
              ? isHeroAsset
                ? 0.55
                : isCursorAsset
                  ? 0.45
                  : 2.2
              : isHeroAsset
                ? 0.42
                : 0.58,
            roughness: dark ? (isHeroAsset ? 0.2 : 0.25) : isHeroAsset ? 0.38 : 0.29,
            metalness: isHeroAsset ? 0.4 : 0.2,
            clearcoat: 0.9,
            clearcoatRoughness: 0.13,
            envMapIntensity: 0.8,
            iridescence: 0.08,
            iridescenceIOR: 1.32,
          }),
    [contactMatcap, dark, isContactAsset, isCursorAsset, isHeroAsset],
  );
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
