import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function read(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("impeccable critique regressions", () => {
  it("keeps the Chapada accent readable in both themes", () => {
    const caseCss = read("components/services/case-v2/CaseStudyArticleV2.module.css");
    const tokens = read("styles/tokens.css");

    expect(caseCss).toMatch(
      /\.page\[data-accent="chapada-green"\]\s*\{[^}]*--case-accent:\s*var\(--color-chapada-green\)/,
    );
    expect(tokens).toMatch(/--color-chapada-green:\s*#55d86a/);
    expect(tokens).toMatch(/\[data-theme="light"\]\s*\{[^}]*--color-chapada-green:\s*#116329/s);
  });

  it("uses 44px touch targets for footer and contact links", () => {
    const footerCss = read("components/contact/ContactFooter.module.css");
    const contactCss = read("components/contact/ContactPage.module.css");

    expect(footerCss).toMatch(
      /\.informationCell > a,[\s\S]*\.legalClosing a\s*\{[^}]*min-height:\s*44px/,
    );
    expect(contactCss).toMatch(/\.information a\s*\{[^}]*min-height:\s*44px/);
  });

  it("keeps operational copy and project metadata above the craft floor", () => {
    const heroCss = read("components/hero/Hero.module.css");
    const workCss = read("components/work/SelectedWork.module.css");
    const contactCss = read("components/contact/ContactPage.module.css");

    expect(heroCss).toMatch(
      /@media \(min-width: 768px\)[\s\S]*\.description\s*\{[^}]*font-size:\s*1rem/,
    );
    expect(workCss).toMatch(/\.statement p\s*\{[^}]*font-size:\s*var\(--type-micro\)/);
    expect(workCss).toMatch(/\.serviceHeading span\s*\{[^}]*font-size:\s*var\(--type-micro\)/);
    expect(workCss).toMatch(
      /\.projectMeta > span:last-child\s*\{[^}]*font-size:\s*var\(--type-micro\)/,
    );
    expect(contactCss).toMatch(/\.feedback\s*\{[^}]*font-size:\s*0\.875rem/);
    expect(contactCss).toMatch(/\.privacyNote\s*\{[^}]*font-size:\s*0\.8125rem/);
  });

  it("does not compress case and contact display type beyond the system floor", () => {
    for (const relativePath of [
      "components/contact/ContactPage.module.css",
      "components/services/case-v2/CaseStudyArticleV2.module.css",
      "components/services/case-v2/GoogleCaseLayout.module.css",
      "components/services/case-v2/SiteCaseLayout.module.css",
      "components/services/case-v2/VideoCaseLayout.module.css",
    ]) {
      expect(read(relativePath)).not.toMatch(/letter-spacing:\s*-0\.0[5-9]\d*em/);
    }
  });
});
