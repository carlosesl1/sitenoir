import { BufferGeometry, type Object3D } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function createHeroModelGeometry(source: Object3D): BufferGeometry {
  source.updateMatrixWorld(true);
  const parts: BufferGeometry[] = [];
  source.traverse((object) => {
    if (!("isMesh" in object) || object.isMesh !== true || !("geometry" in object)) return;
    const geometry = object.geometry;
    if (!(geometry instanceof BufferGeometry)) return;
    const part = geometry.clone();
    part.applyMatrix4(object.matrixWorld);
    parts.push(part);
  });
  const combined = mergeGeometries(parts, false) ?? parts[0] ?? new BufferGeometry();
  for (const part of parts) {
    if (part !== combined) part.dispose();
  }
  combined.center();
  combined.computeBoundingBox();
  combined.computeVertexNormals();
  return combined;
}
