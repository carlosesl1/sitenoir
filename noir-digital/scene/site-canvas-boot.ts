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

export const ENTRY_SYMBOL_WAIT_TIMEOUT_MS = 3_200;

interface EntrySymbolWaitOptions {
  readonly activate: () => void;
  readonly root: HTMLElement;
  readonly timeoutMs?: number;
}

/**
 * Defers WebGL setup until the entry symbol has finished drawing so shader
 * compilation and model upload never compete with the preloader animation.
 */
export function waitForEntrySymbol({
  activate,
  root,
  timeoutMs = ENTRY_SYMBOL_WAIT_TIMEOUT_MS,
}: EntrySymbolWaitOptions): () => void {
  let done = false;
  let observer: MutationObserver | null = null;
  let timeoutId: number | null = null;

  const isReady = () =>
    root.dataset["entrySymbolComplete"] === "true" || root.dataset["entryReady"] === "true";

  const finish = () => {
    if (done) return;
    done = true;
    observer?.disconnect();
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    activate();
  };

  if (isReady()) {
    finish();
    return () => undefined;
  }

  observer = new MutationObserver(() => {
    if (isReady()) finish();
  });
  observer.observe(root, {
    attributeFilter: ["data-entry-symbol-complete", "data-entry-ready"],
    attributes: true,
  });
  timeoutId = window.setTimeout(finish, timeoutMs);

  return () => {
    done = true;
    observer?.disconnect();
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  };
}
