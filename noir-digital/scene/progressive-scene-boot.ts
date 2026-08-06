export const PROGRESSIVE_SCENE_IDLE_TIMEOUT_MS = 1_500;

const PROGRESSIVE_SCENE_FALLBACK_DELAY_MS = 350;

interface ProgressiveSceneBootOptions {
  readonly activate: () => void;
  readonly heading: HTMLElement | null;
  readonly root: HTMLElement;
}

function isHeadlineSettled(heading: HTMLElement | null): boolean {
  if (!heading) return false;
  const lines = Array.from(heading.querySelectorAll<HTMLElement>('[data-hero-scramble="true"]'));
  return lines.length > 0 && lines.every((line) => line.dataset["scrambleState"] === "settled");
}

export function scheduleProgressiveSceneBoot({
  activate,
  heading,
  root,
}: ProgressiveSceneBootOptions): () => void {
  let active = true;
  let idleCallback: number | null = null;
  let timeout: number | null = null;
  let observer: MutationObserver | null = null;

  const run = () => {
    if (!active) return;
    active = false;
    activate();
  };

  const schedule = () => {
    if (
      !active ||
      idleCallback !== null ||
      timeout !== null ||
      root.dataset["entryReady"] !== "true" ||
      !isHeadlineSettled(heading)
    ) {
      return;
    }

    observer?.disconnect();
    observer = null;
    if (typeof window.requestIdleCallback === "function") {
      idleCallback = window.requestIdleCallback(run, {
        timeout: PROGRESSIVE_SCENE_IDLE_TIMEOUT_MS,
      });
      return;
    }

    timeout = window.setTimeout(run, PROGRESSIVE_SCENE_FALLBACK_DELAY_MS);
  };

  observer = new MutationObserver(schedule);
  observer.observe(root, {
    attributeFilter: ["data-entry-ready"],
    attributes: true,
  });
  if (heading) {
    observer.observe(heading, {
      attributeFilter: ["data-scramble-state"],
      attributes: true,
      subtree: true,
    });
  }
  schedule();

  return () => {
    active = false;
    observer?.disconnect();
    if (idleCallback !== null) window.cancelIdleCallback(idleCallback);
    if (timeout !== null) window.clearTimeout(timeout);
  };
}
