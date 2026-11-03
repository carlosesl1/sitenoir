import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

const SOURCE_GLOBS = ["app/**/*.css", "components/**/*.css", "styles/*.css", "scene/**/*.ts"];
const sourceFiles = SOURCE_GLOBS.flatMap((pattern) => globSync(pattern)).filter(
  (file) => !file.endsWith(".test.ts"),
);

// Screens already moved to the type roles. Every screen joins this list as it migrates.
const MIGRATED_CSS = [
  "components/ai-services/AiServicesSection.module.css",
  "components/contact/ContactFooter.module.css",
  "components/contact/FloatingWhatsApp.module.css",
  "components/contact/SpectrumContactCta.module.css",
  "components/header/Header.module.css",
  "components/hero/Hero.module.css",
  "components/mission/MissionScroll.module.css",
  "components/principles/PrinciplesStory.module.css",
  "components/trust/TrustStrip.module.css",
  "components/work/SelectedWork.module.css",
];

describe("brand system", () => {
  it("defines ten text roles plus the wordmark", () => {
    const tokens = read("styles/tokens.css");
    for (const role of [
      "display-l",
      "display-m",
      "title",
      "subtitle",
      "lead",
      "body",
      "note",
      "nav",
      "label",
      "button",
      "wordmark",
    ]) {
      expect(tokens).toContain(`--role-${role}:`);
    }
  });

  it("uses two font families", () => {
    const tokens = read("styles/tokens.css");
    expect(tokens).toContain("--font-sans:");
    expect(tokens).toContain("--font-mono:");
    expect(tokens).not.toMatch(/--font-(display|interface|pixel):/);
  });

  it.each(MIGRATED_CSS)("%s picks its text styles from the roles", (file) => {
    const css = read(file);
    expect(css).not.toMatch(/(^|\s)font-(size|weight|family|stretch)\s*:/);
    expect(css).not.toMatch(/(^|\s)letter-spacing\s*:(?!\s*var\(--tracking-)/);
    expect(css).not.toMatch(/(^|\s)line-height\s*:/);
    expect(css).not.toMatch(/font-variation-settings\s*:(?!\s*var\(--wdth-)/);
  });

  it("keeps lime out of the palette: the brand is black, white light and spectrum", () => {
    const lime = /#(c0fe04|d7ff21|d9ff3c|afe900|d6ff38|b7ef04|98ca00|dfff81|607f02)\b/i;
    expect(sourceFiles.filter((file) => lime.test(read(file)))).toEqual([]);
  });

  it("has a single black appearance", () => {
    expect(sourceFiles.filter((file) => read(file).includes('data-theme="light"'))).toEqual([]);
  });

  it("orders the spectrum like the prism, without cyan", () => {
    const tokens = read("styles/tokens.css");
    expect(tokens).not.toContain("--color-spectral-cyan");
    expect(tokens.replace(/\s+/g, " ")).toContain(
      "--spectrum-stops: var(--color-spectral-red), var(--color-spectral-orange), var(--color-spectral-yellow), var(--color-spectral-green), var(--color-spectral-blue), var(--color-spectral-violet);",
    );
  });
});
