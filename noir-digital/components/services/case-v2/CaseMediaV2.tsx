"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { EditorialMedia } from "@/data/case-studies-v2";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./CaseMediaV2.module.css";

export function CaseMediaV2({
  media,
  priority = false,
}: {
  readonly media: EditorialMedia;
  readonly priority?: boolean;
}) {
  const { t, language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    for (const track of Array.from(video.textTracks)) {
      track.mode = track.language === (language === "en" ? "en" : "pt-BR") ? "showing" : "disabled";
    }
  }, [language]);
  const ratio = `${media.width} / ${media.height}`;

  return (
    <figure className={styles["figure"]}>
      <div
        className={styles["frame"]}
        data-fit={media.kind === "image" ? media.fit : "contain"}
        style={{ aspectRatio: ratio }}
      >
        {media.kind === "image" ? (
          <Image
            className={styles["image"]}
            src={media.src}
            alt={t(media.alt)}
            width={media.width}
            height={media.height}
            priority={priority}
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 88vw, 1120px"
          />
        ) : (
          <video
            ref={videoRef}
            className={styles["video"]}
            aria-label={t(media.alt)}
            controls
            playsInline
            preload="metadata"
            poster={media.poster}
            width={media.width}
            height={media.height}
          >
            <source src={media.src} type="video/mp4" />
            <track
              kind="captions"
              src={media.captions}
              srcLang="pt-BR"
              label="Português"
              default={language === "pt"}
            />
            <track
              kind="captions"
              src={media.captions.replace(".pt-BR.vtt", ".en.vtt")}
              srcLang="en"
              label="English"
              default={language === "en"}
            />
          </video>
        )}
      </div>
      <figcaption>{t(media.caption)}</figcaption>
    </figure>
  );
}
