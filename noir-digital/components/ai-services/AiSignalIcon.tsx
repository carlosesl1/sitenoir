import type { AiService } from "@/data/ai-services";

type AiSignalGlyph = AiService["glyph"];

// Line drawings on a 48-unit grid, each showing what the service does.
const glyphPaths = {
  automation: [
    "M10 21v-7l4-4h20l4 4v11",
    "M32 20l6 6 6-6",
    "M38 27v7l-4 4H14l-4-4V23",
    "M16 28l-6-6-6 6",
  ],
  software: ["M5 12l4-4h30l4 4v24l-4 4H9l-4-4z", "M5 17h38", "M19 23l-6 6 6 6", "M29 23l6 6-6 6"],
  copilots: ["M20 8l4 14 14 4-14 4-4 14-4-14-14-4 14-4z", "M38 5v10", "M33 10h10"],
  agents: [
    "M24 16l8 4.5v9L24 34l-8-4.5v-9z",
    "M24 16V9",
    "M32 29.5l6 3.5",
    "M16 29.5L10 33",
    "M24 4.5v.01",
    "M42 35.5v.01",
    "M6 35.5v.01",
  ],
  integration: ["M5 12l4-4h15l4 4v15l-4 4H9l-4-4z", "M20 21l4-4h15l4 4v15l-4 4H24l-4-4z"],
  "ai-first": ["M24 5l19 10-19 10L5 15z", "M5 24l19 10 19-10", "M5 33l19 10 19-10"],
} satisfies Record<AiSignalGlyph, readonly string[]>;

type AiSignalIconProps = {
  glyph: AiSignalGlyph;
  className?: string | undefined;
};

export function AiSignalIcon({ glyph, className }: AiSignalIconProps) {
  return (
    <svg
      className={className}
      data-ai-glyph-icon={glyph}
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyphPaths[glyph].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
