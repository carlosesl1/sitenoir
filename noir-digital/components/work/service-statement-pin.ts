export type ServicePinState = "before" | "pinned" | "after";

interface ServicePinMetrics {
  readonly pinOffset: number;
  readonly railBottom: number;
  readonly railTop: number;
  readonly statementHeight: number;
}

export function resolveServicePinState({
  pinOffset,
  railBottom,
  railTop,
  statementHeight,
}: ServicePinMetrics): ServicePinState {
  if (railTop > pinOffset) return "before";
  if (railBottom - statementHeight <= pinOffset) return "after";
  return "pinned";
}
