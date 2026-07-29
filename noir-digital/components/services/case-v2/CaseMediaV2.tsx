import Image from "next/image";

import type { EditorialMedia } from "@/data/case-studies-v2";

import styles from "./CaseMediaV2.module.css";

export function CaseMediaV2({
  media,
  priority = false,
}: {
  readonly media: EditorialMedia;
  readonly priority?: boolean;
}) {
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
            alt={media.alt}
            width={media.width}
            height={media.height}
            priority={priority}
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 88vw, 1120px"
          />
        ) : (
          // biome-ignore lint/a11y/useMediaCaption: supplied portfolio edits do not include transcript files.
          <video
            className={styles["video"]}
            aria-label={media.alt}
            controls
            playsInline
            preload="metadata"
            poster={media.poster}
            width={media.width}
            height={media.height}
          >
            <source src={media.src} type="video/mp4" />
          </video>
        )}
      </div>
      <figcaption>{media.caption}</figcaption>
    </figure>
  );
}
