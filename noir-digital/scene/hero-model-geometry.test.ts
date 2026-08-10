import { Box3, BoxGeometry, BufferAttribute, Group, Mesh, Vector3 } from "three";
import { expect, it } from "vitest";

import { createHeroModelGeometry } from "@/scene/hero-model-geometry";

it("merges, centers, and normalizes model geometry inputs", () => {
  const root = new Group();
  const left = new Mesh(new BoxGeometry(1, 1, 1));
  const right = new Mesh(new BoxGeometry(1, 1, 1));
  left.position.x = -2;
  right.position.x = 2;
  root.add(left, right);

  const geometry = createHeroModelGeometry(root);
  const position = geometry.getAttribute("position");
  expect(position).toBeInstanceOf(BufferAttribute);
  if (!(position instanceof BufferAttribute)) throw new Error("Expected a position buffer");
  const bounds = new Box3().setFromBufferAttribute(position);
  const center = bounds.getCenter(new Vector3());

  expect(center.length()).toBeLessThan(0.000001);
  expect(geometry.getAttribute("normal")).toBeDefined();
  geometry.dispose();
});
