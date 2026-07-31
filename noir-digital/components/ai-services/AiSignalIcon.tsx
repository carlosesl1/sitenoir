import type { AiService } from "@/data/ai-services";

type AiSignalGlyph = AiService["glyph"];

type Point = {
  x: number;
  y: number;
  emphasis?: boolean;
};

const defaultDotSpacing = 2.65;

function sampleLine(start: Point, end: Point, spacing = defaultDotSpacing): Point[] {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const segments = Math.max(1, Math.round(distance / spacing));

  return Array.from({ length: segments + 1 }, (_, index) => {
    const progress = index / segments;

    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    };
  });
}

function sampleArc(
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
  spacing = defaultDotSpacing,
): Point[] {
  const arcLength = Math.abs(endAngle - startAngle) * radius;
  const segments = Math.max(1, Math.round(arcLength / spacing));

  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = startAngle + (endAngle - startAngle) * (index / segments);

    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });
}

function samplePolyline(vertices: readonly Point[], closed = false): Point[] {
  const edges = closed
    ? vertices.map((point, index) => [point, vertices[(index + 1) % vertices.length]] as const)
    : vertices.slice(0, -1).map((point, index) => [point, vertices[index + 1]] as const);

  return edges.flatMap(([start, end]) => (end ? sampleLine(start, end) : []));
}

function sampleRegularPolygon(center: Point, radius: number, sides: number): Point[] {
  const vertices = Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;

    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });

  return samplePolyline(vertices, true);
}

function sampleRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
  const right = x + width;
  const bottom = y + height;

  return [
    ...sampleLine({ x: x + radius, y }, { x: right - radius, y }),
    ...sampleArc({ x: right - radius, y: y + radius }, radius, -Math.PI / 2, 0),
    ...sampleLine({ x: right, y: y + radius }, { x: right, y: bottom - radius }),
    ...sampleArc({ x: right - radius, y: bottom - radius }, radius, 0, Math.PI / 2),
    ...sampleLine({ x: right - radius, y: bottom }, { x: x + radius, y: bottom }),
    ...sampleArc({ x: x + radius, y: bottom - radius }, radius, Math.PI / 2, Math.PI),
    ...sampleLine({ x, y: bottom - radius }, { x, y: y + radius }),
    ...sampleArc({ x: x + radius, y: y + radius }, radius, Math.PI, (Math.PI * 3) / 2),
  ];
}

function uniquePoints(points: readonly Point[]): Point[] {
  const pointsByPosition = new Map<string, Point>();

  for (const point of points) {
    pointsByPosition.set(`${point.x.toFixed(2)}:${point.y.toFixed(2)}`, point);
  }

  return [...pointsByPosition.values()];
}

function emphasize(points: readonly Point[]): Point[] {
  return points.map((point) => ({ ...point, emphasis: true }));
}

const arrowPoints = uniquePoints(
  emphasize([
    ...sampleLine({ x: 17, y: 31 }, { x: 31, y: 17 }, 2.45),
    ...sampleLine({ x: 23, y: 17 }, { x: 31, y: 17 }, 2.45),
    ...sampleLine({ x: 31, y: 17 }, { x: 31, y: 25 }, 2.45),
  ]),
);

const signalPoints = {
  automation: uniquePoints([...sampleRoundedRect(8, 8, 32, 32, 10), ...arrowPoints]),
  software: uniquePoints([
    ...sampleRoundedRect(8, 8, 32, 32, 4),
    ...emphasize([20, 24, 28].flatMap((y) => [20, 24, 28].map((x) => ({ x, y })))),
  ]),
  copilots: uniquePoints(sampleRegularPolygon({ x: 24, y: 24 }, 17, 6)),
  agents: uniquePoints([
    ...sampleRoundedRect(8, 8, 32, 32, 11),
    ...emphasize(
      samplePolyline([
        { x: 16, y: 20 },
        { x: 21, y: 24 },
        { x: 16, y: 28 },
      ]),
    ),
    ...emphasize(
      samplePolyline([
        { x: 32, y: 20 },
        { x: 27, y: 24 },
        { x: 32, y: 28 },
      ]),
    ),
  ]),
  integration: uniquePoints([
    ...sampleRoundedRect(9, 9, 30, 30, 5),
    ...emphasize(sampleLine({ x: 7, y: 24 }, { x: 41, y: 24 })),
    ...emphasize(sampleLine({ x: 24, y: 7 }, { x: 24, y: 41 })),
  ]),
  "ai-first": uniquePoints([...sampleRoundedRect(8, 8, 32, 32, 1.5), ...arrowPoints]),
} satisfies Record<AiSignalGlyph, readonly Point[]>;

type AiSignalIconProps = {
  glyph: AiSignalGlyph;
  className?: string | undefined;
};

function createDotPath(points: readonly Point[], radius: number): string {
  return points
    .map(
      ({ x, y }) =>
        `M ${x + radius} ${y} A ${radius} ${radius} 0 1 0 ${x - radius} ${y} A ${radius} ${radius} 0 1 0 ${x + radius} ${y} Z`,
    )
    .join(" ");
}

export function AiSignalIcon({ glyph, className }: AiSignalIconProps) {
  const points = signalPoints[glyph];
  const regularPoints = points.filter((point) => !point.emphasis);
  const emphasisPoints = points.filter((point) => point.emphasis);

  return (
    <svg
      className={className}
      data-ai-glyph-icon={glyph}
      aria-hidden="true"
      focusable="false"
      viewBox="3 3 42 42"
    >
      {regularPoints.length > 0 ? (
        <path
          className="ai-signal-dots"
          data-ai-glyph-dots="true"
          data-ai-glyph-dot-count={regularPoints.length}
          d={createDotPath(regularPoints, 0.72)}
        />
      ) : null}
      {emphasisPoints.length > 0 ? (
        <path
          className="ai-signal-dots"
          data-ai-glyph-dots="true"
          data-ai-glyph-dot-count={emphasisPoints.length}
          data-ai-glyph-emphasis="true"
          d={createDotPath(emphasisPoints, 0.88)}
        />
      ) : null}
    </svg>
  );
}
