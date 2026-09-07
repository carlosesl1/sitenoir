import { ShaderMaterial, Texture, Vector2, Vector4 } from "three";
import { expect, it, vi } from "vitest";
import { updateCardMaterial } from "./WorkCardLayer";

it("reuses image lookups and cover calculations across 60 moving frames, refreshing replacements and resize", () => {
  const element = document.createElement("span");
  element.dataset["workCardInView"] = "true";
  const makeImage = (role: string) => {
    const image = document.createElement("img");
    image.dataset["imageRole"] = role;
    Object.defineProperties(image, {
      complete: { value: true },
      naturalWidth: { value: 1200 },
      naturalHeight: { value: 600 },
    });
    return image;
  };
  const primary = makeImage("primary");
  element.append(primary, makeImage("hover"));
  const query = vi.spyOn(element, "querySelector");
  const cover = new Vector2();
  const setCover = vi.spyOn(cover, "set");
  const material = new ShaderMaterial({
    uniforms: {
      uBaseCoverScale: { value: cover },
      uHoverCoverScale: { value: new Vector2() },
      uRect: { value: new Vector4() },
      uCurlStrength: { value: 0 },
    },
  });
  const prepared = document.createElement("canvas");
  const texture = new Texture(prepared);
  const input = {
    curl: 0.06,
    delta: 1 / 60,
    element,
    hoverProgress: [0],
    index: 0,
    material,
    pixelRatio: 1,
    prepareImage: vi.fn(() => prepared),
    prewarm: false,
    programReady: true,
    rect: { left: 20, top: 0, bottom: 200, width: 400, height: 200 } as DOMRect,
    renderer: { initTexture: vi.fn() },
    textureBudget: { remaining: 1 },
    textures: [{ base: texture, hover: texture }],
    viewportHeight: 900,
    viewportWidth: 1440,
  };
  for (let frame = 0; frame < 60; frame++) {
    input.rect = { ...input.rect, top: frame, bottom: frame + 200 } as DOMRect;
    updateCardMaterial(input);
  }
  expect(query).toHaveBeenCalledTimes(2);
  expect(setCover).toHaveBeenCalledTimes(1);
  expect(element.dataset["curlActive"]).toBe("true");
  expect(material.uniforms["uRect"]?.value.y).toBeCloseTo(1 - 259 / 900);
  primary.replaceWith(makeImage("primary"));
  input.rect = { ...input.rect, width: 200 } as DOMRect;
  input.curl = 0;
  updateCardMaterial(input);
  expect(query).toHaveBeenCalledTimes(4);
  expect(setCover).toHaveBeenCalledTimes(2);
  expect(cover.x).toBe(0.5);
  expect(element.dataset["curlActive"]).toBe("false");
  material.dispose();
  texture.dispose();
});
