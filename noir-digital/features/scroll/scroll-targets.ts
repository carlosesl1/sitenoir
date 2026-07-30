export type SectionTarget = "home" | "work" | "contact";

function assertNever(value: never): never {
  throw new Error(`Unexpected section target: ${String(value)}`);
}

export function sectionSelector(target: SectionTarget): `#${string}` {
  switch (target) {
    case "home":
      return "#home";
    case "work":
      return "#selected-work";
    case "contact":
      return "#contact";
    default:
      return assertNever(target);
  }
}
