interface RenderedFrameWaitOptions {
  readonly cancelFrame: (frameId: number) => void;
  readonly invalidate: () => void;
  readonly onRendered: () => void;
  readonly readRenderedFrame: () => number;
  readonly requestFrame: (callback: FrameRequestCallback) => number;
}

export function waitForRenderedFrame({
  cancelFrame,
  invalidate,
  onRendered,
  readRenderedFrame,
  requestFrame,
}: RenderedFrameWaitOptions): () => void {
  const initialRenderedFrame = readRenderedFrame();
  let active = true;
  let frameId = 0;

  const checkRenderedFrame: FrameRequestCallback = () => {
    if (!active) return;
    if (readRenderedFrame() > initialRenderedFrame) {
      active = false;
      onRendered();
      return;
    }
    frameId = requestFrame(checkRenderedFrame);
  };

  invalidate();
  frameId = requestFrame(checkRenderedFrame);

  return () => {
    active = false;
    if (frameId !== 0) cancelFrame(frameId);
  };
}
