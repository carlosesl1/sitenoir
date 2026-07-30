"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import { type SoundState, toggleSound } from "@/features/audio/audio-state";
import { safeStorageGet, safeStorageSet } from "@/features/storage/safe-storage";

interface AudioContextValue {
  readonly sound: SoundState;
  readonly isPlaying: boolean;
  readonly toggle: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);
const AUDIO_SOURCE = "/assets/v1/audio/bgm.mp3";

function readStoredSound(): SoundState {
  if (typeof window === "undefined") return "off";
  return safeStorageGet("sound") === "on" ? "on" : "off";
}

export function AudioProvider({ children }: { readonly children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const playbackAttemptRef = useRef(0);
  const mountedRef = useRef(false);
  const [sound, setSound] = useState<SoundState>("off");
  const [isPlaying, setIsPlaying] = useState(false);

  const storeSound = useCallback((nextSound: SoundState) => {
    setSound(nextSound);
    safeStorageSet("sound", nextSound);
  }, []);

  const ensureAudio = useCallback(() => {
    const existing = audioRef.current;
    if (existing) return existing;

    const audio = new Audio(AUDIO_SOURCE);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0.35;

    const handlePlaying = () => setIsPlaying(true);
    const handlePaused = () => setIsPlaying(false);
    const handleError = () => {
      playbackAttemptRef.current += 1;
      setIsPlaying(false);
      storeSound("off");
    };

    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePaused);
    audio.addEventListener("ended", handlePaused);
    audio.addEventListener("error", handleError);
    audioRef.current = audio;
    audioCleanupRef.current = () => {
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePaused);
      audio.removeEventListener("ended", handlePaused);
      audio.removeEventListener("error", handleError);
    };
    return audio;
  }, [storeSound]);

  const startPlayback = useCallback(async () => {
    const audio = ensureAudio();
    const attempt = playbackAttemptRef.current + 1;
    playbackAttemptRef.current = attempt;

    try {
      await audio.play();
      if (
        !mountedRef.current ||
        audioRef.current !== audio ||
        playbackAttemptRef.current !== attempt
      ) {
        audio.pause();
        return;
      }
      setIsPlaying(true);
    } catch {
      if (
        !mountedRef.current ||
        audioRef.current !== audio ||
        playbackAttemptRef.current !== attempt
      ) {
        return;
      }
      audio.pause();
      setIsPlaying(false);
      storeSound("off");
    }
  }, [ensureAudio, storeSound]);
  const resumePersistedPlayback = useEffectEvent(() => {
    void startPlayback();
  });

  useEffect(() => {
    mountedRef.current = true;
    setSound(readStoredSound());

    return () => {
      mountedRef.current = false;
      playbackAttemptRef.current += 1;
      audioCleanupRef.current?.();
      audioCleanupRef.current = null;
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sound !== "on" || isPlaying) return;

    const removeUnlockListeners = () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
    const handleUnlock = () => {
      removeUnlockListeners();
      resumePersistedPlayback();
    };

    window.addEventListener("pointerdown", handleUnlock, { once: true });
    window.addEventListener("keydown", handleUnlock, { once: true });
    return () => {
      removeUnlockListeners();
    };
  }, [isPlaying, sound]);

  const toggle = useCallback(() => {
    const nextSound = toggleSound(sound);
    storeSound(nextSound);

    if (nextSound === "on") {
      void startPlayback();
      return;
    }

    playbackAttemptRef.current += 1;
    audioRef.current?.pause();
    setIsPlaying(false);
  }, [sound, startPlayback, storeSound]);

  const value = useMemo(() => ({ sound, isPlaying, toggle }), [sound, isPlaying, toggle]);
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
}
