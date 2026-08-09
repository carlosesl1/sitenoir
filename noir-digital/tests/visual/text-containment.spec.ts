import { expect, test } from "@playwright/test";

const viewportWidths = [
  320, 359, 360, 390, 767, 768, 900, 1023, 1024, 1199, 1200, 1280, 1440, 1920, 2560,
] as const;

async function settleResponsiveLayout(page: import("@playwright/test").Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

test("keeps the services statement inside its grid rail at every responsive boundary", async ({
  page,
}) => {
  await page.goto("/?effects=off#selected-work");
  await page.evaluate(() => document.fonts.ready);

  for (const width of viewportWidths) {
    await page.setViewportSize({ width, height: 900 });
    await settleResponsiveLayout(page);

    const metrics = await page.locator("#work-heading").evaluate((heading) => {
      const rail = heading.closest('[data-services-sticky-rail="true"]');
      if (!(rail instanceof HTMLElement)) throw new Error("Services rail not found");

      const railRight = rail.getBoundingClientRect().right;
      const fragments = Array.from(heading.querySelectorAll("span > span")).flatMap((line) => {
        const range = document.createRange();
        range.selectNodeContents(line);
        return Array.from(range.getClientRects(), (rect) => ({ right: rect.right }));
      });

      return {
        pageOverflows: document.documentElement.scrollWidth > window.innerWidth,
        textOverflows: fragments.some(({ right }) => right > railRight + 1),
      };
    });

    expect(metrics.pageOverflows, `home page overflows horizontally at ${width}px`).toBe(false);
    expect(metrics.textOverflows, `services heading leaves its rail at ${width}px`).toBe(false);
  }
});

test("keeps the contact headline inside its introduction column at every responsive boundary", async ({
  page,
}) => {
  await page.goto("/contato/?effects=off");
  await page.evaluate(() => document.fonts.ready);

  for (const width of viewportWidths) {
    await page.setViewportSize({ width, height: 900 });
    await settleResponsiveLayout(page);

    const metrics = await page.locator("#contact-page-heading").evaluate((heading) => {
      const intro = heading.closest("section");
      if (!(intro instanceof HTMLElement)) throw new Error("Contact introduction not found");

      const introRect = intro.getBoundingClientRect();
      const introStyle = getComputedStyle(intro);
      const contentRight = introRect.right - Number.parseFloat(introStyle.paddingRight);
      const range = document.createRange();
      range.selectNodeContents(heading);
      const fragments = Array.from(range.getClientRects(), (rect) => ({ right: rect.right }));

      return {
        pageOverflows: document.documentElement.scrollWidth > window.innerWidth,
        textOverflows: fragments.some(({ right }) => right > contentRight + 1),
      };
    });

    expect(metrics.pageOverflows, `contact page overflows horizontally at ${width}px`).toBe(false);
    expect(metrics.textOverflows, `contact heading leaves its column at ${width}px`).toBe(false);
  }
});

test("keeps every WhatsApp card label inside the panel and clear of its icon", async ({ page }) => {
  await page.goto("/contato/?effects=off");
  await page.evaluate(() => document.fonts.ready);

  for (const width of viewportWidths) {
    await page.setViewportSize({ width, height: 900 });
    await settleResponsiveLayout(page);

    const metrics = await page.locator("[data-contact-whatsapp-panel]").evaluate((panel) => {
      const panelRect = panel.getBoundingClientRect();
      const mark = panel.querySelector('[data-contact-whatsapp-icon="true"]');
      const actionSurface = panel.querySelector("[data-spectrum-contact-surface]");
      const actionLabel = actionSurface?.querySelector("span");
      const supportingCopy = Array.from(panel.children).find((child) => child.tagName === "P");

      if (!(mark instanceof HTMLElement)) throw new Error("WhatsApp mark not found");
      if (!(actionSurface instanceof HTMLElement)) throw new Error("WhatsApp action not found");
      if (!(actionLabel instanceof HTMLElement)) throw new Error("WhatsApp action label not found");
      if (!(supportingCopy instanceof HTMLElement)) throw new Error("WhatsApp copy not found");

      const fragmentRects = (element: Element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return Array.from(range.getClientRects());
      };

      const textElements = [
        panel.querySelector("h3"),
        panel.querySelector('[class*="recommended"]'),
        panel.querySelector('[class*="whatsAppSubtitle"]'),
        supportingCopy,
        actionLabel,
      ].filter((element): element is Element => element instanceof Element);
      const textRects = textElements.flatMap(fragmentRects);
      const copyRects = fragmentRects(supportingCopy);
      const markRect = mark.getBoundingClientRect();
      const actionRect = actionSurface.getBoundingClientRect();
      const actionLabelRects = fragmentRects(actionLabel);

      return {
        pageOverflows: document.documentElement.scrollWidth > window.innerWidth,
        panelTextOverflows: textRects.some(
          (rect) => rect.left < panelRect.left - 1 || rect.right > panelRect.right + 1,
        ),
        copyInvadesMark: copyRects.some(
          (rect) =>
            rect.bottom > markRect.top &&
            rect.top < markRect.bottom &&
            rect.right > markRect.left - 8,
        ),
        actionTextOverflows: actionLabelRects.some(
          (rect) => rect.left < actionRect.left || rect.right > actionRect.right,
        ),
      };
    });

    expect(metrics.pageOverflows, `contact page overflows horizontally at ${width}px`).toBe(false);
    expect(metrics.panelTextOverflows, `WhatsApp copy leaves the panel at ${width}px`).toBe(false);
    expect(metrics.copyInvadesMark, `WhatsApp copy reaches the icon at ${width}px`).toBe(false);
    expect(
      metrics.actionTextOverflows,
      `WhatsApp action label leaves its button at ${width}px`,
    ).toBe(false);
  }
});
