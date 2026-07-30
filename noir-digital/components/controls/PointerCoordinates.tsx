"use client";

import { usePointerSnapshot } from "@/features/pointer/pointer-store";

function formatCoordinate(value: number): string {
  return Math.round(Math.max(0, value)).toString().padStart(4, "0");
}

export function PointerCoordinates({ className }: { readonly className?: string | undefined }) {
  const { clientX, clientY } = usePointerSnapshot();

  return (
    <span className={className} data-pointer-coordinates="true" aria-hidden="true">
      {`${formatCoordinate(clientX)} X ${formatCoordinate(clientY)} Y`}
    </span>
  );
}
