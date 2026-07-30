export type SoundState = "on" | "off";

function assertNever(value: never): never {
  throw new Error(`Unexpected sound state: ${String(value)}`);
}

export function toggleSound(sound: SoundState): SoundState {
  switch (sound) {
    case "on":
      return "off";
    case "off":
      return "on";
    default:
      return assertNever(sound);
  }
}
