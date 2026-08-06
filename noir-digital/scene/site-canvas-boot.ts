export const SITE_CANVAS_BOOT_DELAY_MS = 250;

interface SiteCanvasBootOptions {
  readonly activate: () => void;
  readonly root: HTMLElement;
  readonly waitForEntryReveal: boolean;
}

export function scheduleSiteCanvasBoot({
  activate,
  root,
  waitForEntryReveal,
}: SiteCanvasBootOptions): () => void {
  let active = true;
  let observer: MutationObserver | null = null;
  let timeoutId: number | null = null;

  const schedule = () => {
    observer?.disconnect();
    observer = null;
    if (timeoutId !== null) return;
    timeoutId = window.setTimeout(() => {
      if (active) activate();
    }, SITE_CANVAS_BOOT_DELAY_MS);
  };

  if (!waitForEntryReveal || root.dataset["entryReady"] === "true") {
    schedule();
  } else {
    observer = new MutationObserver(() => {
      if (root.dataset["entryReady"] === "true") schedule();
    });
    observer.observe(root, {
      attributeFilter: ["data-entry-ready"],
      attributes: true,
    });
  }

  return () => {
    active = false;
    observer?.disconnect();
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  };
}
