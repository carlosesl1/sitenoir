import type { Page } from "@playwright/test";

import {
  expect,
  expectVisualSnapshot,
  openVisualHome,
  positionVisualPage,
  settleVisualPage,
  test,
  type VisualEffects,
  type VisualTheme,
  type VisualViewport,
} from "./visual-fixture";

type VisualState = "contact" | "home" | "mobile-menu-open" | "work";

type VisualCase = {
  readonly effects: VisualEffects;
  readonly name: string;
  readonly reducedMotion: boolean;
  readonly state: VisualState;
  readonly theme: VisualTheme;
  readonly viewport: VisualViewport;
};

const desktop = { width: 1280, height: 720 } as const;
const wide = { width: 1440, height: 900 } as const;
const tablet = { width: 768, height: 1024 } as const;
const mobile = { width: 390, height: 844 } as const;

const visualCases = [
  {
    effects: "on",
    name: "1280x720-home",
    reducedMotion: false,
    state: "home",
    theme: "system",
    viewport: desktop,
  },
  {
    effects: "off",
    name: "1280x720-work",
    reducedMotion: false,
    state: "work",
    theme: "system",
    viewport: desktop,
  },
  {
    effects: "on",
    name: "1280x720-contact",
    reducedMotion: false,
    state: "contact",
    theme: "system",
    viewport: desktop,
  },
  {
    effects: "off",
    name: "1280x720-light",
    reducedMotion: false,
    state: "home",
    theme: "light",
    viewport: desktop,
  },
  {
    effects: "on",
    name: "1280x720-dark",
    reducedMotion: false,
    state: "home",
    theme: "dark",
    viewport: desktop,
  },
  {
    effects: "on",
    name: "1440x900-home",
    reducedMotion: false,
    state: "home",
    theme: "system",
    viewport: wide,
  },
  {
    effects: "off",
    name: "1440x900-work",
    reducedMotion: false,
    state: "work",
    theme: "system",
    viewport: wide,
  },
  {
    effects: "on",
    name: "768x1024-home",
    reducedMotion: false,
    state: "home",
    theme: "system",
    viewport: tablet,
  },
  {
    effects: "off",
    name: "768x1024-work",
    reducedMotion: false,
    state: "work",
    theme: "system",
    viewport: tablet,
  },
  {
    effects: "on",
    name: "390x844-home",
    reducedMotion: false,
    state: "home",
    theme: "system",
    viewport: mobile,
  },
  {
    effects: "on",
    name: "390x844-dark",
    reducedMotion: false,
    state: "home",
    theme: "dark",
    viewport: mobile,
  },
  {
    effects: "off",
    name: "390x844-mobile-menu-open",
    reducedMotion: false,
    state: "mobile-menu-open",
    theme: "system",
    viewport: mobile,
  },
  {
    effects: "off",
    name: "390x844-work",
    reducedMotion: false,
    state: "work",
    theme: "system",
    viewport: mobile,
  },
  {
    effects: "on",
    name: "390x844-contact",
    reducedMotion: false,
    state: "contact",
    theme: "system",
    viewport: mobile,
  },
  {
    effects: "off",
    name: "390x844-reduced-motion-home",
    reducedMotion: true,
    state: "home",
    theme: "system",
    viewport: mobile,
  },
  {
    effects: "off",
    name: "390x844-reduced-motion-contact",
    reducedMotion: true,
    state: "contact",
    theme: "system",
    viewport: mobile,
  },
] as const satisfies readonly VisualCase[];

async function prepareVisualState(page: Page, state: VisualState): Promise<void> {
  switch (state) {
    case "home":
      await positionVisualPage(page, "#home");
      return;
    case "work":
      await positionVisualPage(page, "#selected-work");
      return;
    case "contact":
      await positionVisualPage(page, "#contact");
      await expect
        .poll(() => page.evaluate(() => window.__NOIR_CONTACT_READY__), { timeout: 30_000 })
        .toBe(true);
      await settleVisualPage(page);
      return;
    case "mobile-menu-open":
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
      await settleVisualPage(page);
      return;
    default: {
      const exhaustiveState: never = state;
      throw new Error(`Unsupported visual state: ${exhaustiveState}`);
    }
  }
}

test.describe("approved homepage visual states", () => {
  test.describe.configure({ mode: "serial" });

  for (const visualCase of visualCases) {
    test(visualCase.name, async ({ visualPage }) => {
      await openVisualHome(visualPage, visualCase);
      await prepareVisualState(visualPage, visualCase.state);
      await expectVisualSnapshot(visualPage, `${visualCase.name}.png`);
    });
  }
});
