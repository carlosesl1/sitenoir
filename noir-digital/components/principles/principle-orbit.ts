const ORBIT_TRAVEL = 945;
const ENTER_TRAVEL = 300;
const LOOP_TRAVEL = 300;
const ELLIPSE_SPACING = 50;
const ORBIT_RADIUS = 150;
const ORBIT_CENTER = 172;

export interface PrincipleOrbitEllipse {
  readonly centerX: number;
  readonly centerY: number;
  readonly id: string;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly visible: boolean;
}

function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

function ellipseAt(id: string, distance: number, visible: boolean): PrincipleOrbitEllipse {
  const radiusX = Math.sqrt(Math.max(0, ORBIT_RADIUS ** 2 - (distance - ORBIT_RADIUS) ** 2));

  return {
    centerX: ORBIT_CENTER,
    centerY: 22 + distance,
    id,
    radiusX,
    radiusY: radiusX * 0.1,
    visible,
  };
}

export function resolvePrincipleOrbit(progress: number): readonly PrincipleOrbitEllipse[] {
  const travel = clampProgress(progress) * ORBIT_TRAVEL;
  const visibleDistances: number[] = [];
  const phase = travel <= ENTER_TRAVEL ? "enter" : travel <= 600 ? "loop" : "exit";
  const phaseDistance =
    phase === "enter" ? travel : phase === "loop" ? travel - ENTER_TRAVEL : travel - 600;
  const entranceGroup = Math.floor(phaseDistance / ELLIPSE_SPACING);

  return Array.from({ length: 7 }, (_, index) => {
    const id = `orbit-ellipse-${index + 1}`;
    const distance =
      phase === "enter"
        ? phaseDistance >= ELLIPSE_SPACING * index
          ? phaseDistance - (Math.min(entranceGroup, 6) - index) * ELLIPSE_SPACING
          : 0
        : phase === "loop"
          ? (phaseDistance + ELLIPSE_SPACING * index + LOOP_TRAVEL) % LOOP_TRAVEL
          : phaseDistance + ELLIPSE_SPACING * index;
    const inRange = distance > 0 && distance < ENTER_TRAVEL;
    const unique = !visibleDistances.some(
      (visibleDistance) => Math.abs(visibleDistance - distance) < 0.5,
    );
    if (inRange && unique) visibleDistances.push(distance);
    return ellipseAt(id, Math.min(ENTER_TRAVEL, Math.max(0, distance)), inRange && unique);
  });
}
