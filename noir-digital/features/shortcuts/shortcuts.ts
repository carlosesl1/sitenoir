import type { SectionTarget } from "@/features/scroll/scroll-targets";

export type ShortcutAction =
  | { readonly type: "scroll"; readonly target: SectionTarget }
  | { readonly type: "none" };

export function resolveShortcut(key: string): ShortcutAction {
  switch (key.toLowerCase()) {
    case "t":
      return { type: "scroll", target: "home" };
    case "b":
      return { type: "scroll", target: "contact" };
    default:
      return { type: "none" };
  }
}
