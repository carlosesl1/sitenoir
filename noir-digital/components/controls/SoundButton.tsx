"use client";

import { useAudio } from "@/features/audio/AudioProvider";

interface SoundButtonProps {
  readonly className?: string | undefined;
}

export function SoundButton({ className }: SoundButtonProps) {
  const { isPlaying, toggle } = useAudio();

  return (
    <button
      type="button"
      className={className}
      aria-label="Sound"
      aria-pressed={isPlaying}
      onClick={toggle}
    >
      {isPlaying ? "SOUND[|]" : "SOUND[-]"}
    </button>
  );
}
