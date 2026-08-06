export function setDataFlag(element: HTMLElement, key: string, value: string): boolean {
  if (element.dataset[key] === value) return false;
  element.dataset[key] = value;
  return true;
}

export function setWebGlCardVisibility(
  element: HTMLElement,
  visible: boolean,
  curlActive: boolean,
): void {
  if (!visible && element.dataset["webglReady"] !== "true") return;
  setDataFlag(element, "canvasActive", visible ? "true" : "false");
  setDataFlag(element, "curlActive", visible && curlActive ? "true" : "false");
}
