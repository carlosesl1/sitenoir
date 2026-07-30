import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  EntryRevealCanvas,
  resolveTransitionMaskProgress,
} from "@/components/preloader/EntryRevealCanvas";

describe("EntryRevealCanvas", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the dotted reveal on the GPU", () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    render(<EntryRevealCanvas active className="reveal" durationMs={800} />);

    expect(getContext).toHaveBeenCalledWith(
      "webgl",
      expect.objectContaining({
        alpha: true,
        antialias: false,
      }),
    );
    expect(getContext).not.toHaveBeenCalledWith("2d", expect.anything());
  });

  it("reuses its WebGL program and buffer across animation state changes", () => {
    const gl = {
      ARRAY_BUFFER: 1,
      BLEND: 2,
      COLOR_BUFFER_BIT: 3,
      COMPILE_STATUS: 4,
      FLOAT: 5,
      FRAGMENT_SHADER: 6,
      LINK_STATUS: 7,
      ONE: 8,
      ONE_MINUS_SRC_ALPHA: 9,
      STATIC_DRAW: 10,
      TRIANGLES: 11,
      VERTEX_SHADER: 12,
      attachShader: vi.fn(),
      bindBuffer: vi.fn(),
      blendFunc: vi.fn(),
      bufferData: vi.fn(),
      clear: vi.fn(),
      clearColor: vi.fn(),
      compileShader: vi.fn(),
      createBuffer: vi.fn(() => ({ buffer: true })),
      createProgram: vi.fn(() => ({ program: true })),
      createShader: vi.fn(() => ({ shader: true })),
      deleteBuffer: vi.fn(),
      deleteProgram: vi.fn(),
      deleteShader: vi.fn(),
      drawArrays: vi.fn(),
      enable: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      getExtension: vi.fn(() => ({})),
      getProgramParameter: vi.fn(() => true),
      getShaderParameter: vi.fn(() => true),
      getUniformLocation: vi.fn(() => ({ uniform: true })),
      linkProgram: vi.fn(),
      shaderSource: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      useProgram: vi.fn(),
      vertexAttribPointer: vi.fn(),
      viewport: vi.fn(),
    } as unknown as WebGLRenderingContext;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(gl);
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
    const cancelAnimationFrame = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => {});

    const view = render(
      <EntryRevealCanvas active={false} className="reveal" durationMs={800} direction="reveal" />,
    );
    view.rerender(
      <EntryRevealCanvas active className="reveal" durationMs={800} direction="cover" />,
    );

    expect(gl.createProgram).toHaveBeenCalledTimes(1);
    expect(gl.createBuffer).toHaveBeenCalledTimes(1);
    expect(gl.deleteProgram).not.toHaveBeenCalled();
    expect(gl.deleteBuffer).not.toHaveBeenCalled();

    view.unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(gl.deleteProgram).toHaveBeenCalledTimes(1);
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
  });

  it("maps reveal and cover directions to opposite mask progress", () => {
    expect(resolveTransitionMaskProgress("reveal", 0)).toBe(1);
    expect(resolveTransitionMaskProgress("reveal", 1)).toBe(0);
    expect(resolveTransitionMaskProgress("cover", 0)).toBe(0);
    expect(resolveTransitionMaskProgress("cover", 1)).toBe(1);
  });
});
