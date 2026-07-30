import type { SectionTarget } from "@/features/scroll/scroll-targets";
import type { ThemeMode } from "@/features/theme/theme-state";

export type ShortcutAction =
  | { readonly type: "theme"; readonly value: ThemeMode }
  | { readonly type: "sound-toggle" }
  | { readonly type: "scroll"; readonly target: SectionTarget }
  | { readonly type: "none" };

export function resolveShortcut(key: string): ShortcutAction {
  switch (key.toLowerCase()) {
    case "l":
      return { type: "theme", value: "light" };
    case "d":
      return { type: "theme", value: "dark" };
    case "a":
      return { type: "theme", value: "system" };
    case "s":
      return { type: "sound-toggle" };
    case "t":
      return { type: "scroll", target: "home" };
    case "b":
      return { type: "scroll", target: "contact" };
    default:
      return { type: "none" };
  }
}
