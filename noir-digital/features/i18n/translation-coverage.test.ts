import { describe, expect, it } from "vitest";

import { aiServices } from "@/data/ai-services";
import { caseStudiesV2 } from "@/data/case-studies-v2";
import {
  contactHeadlineLines,
  heroDescriptionLines,
  heroHeadlineLines,
  heroLabels,
  heroSupportLines,
  principleStages,
  principleStatements,
  serviceContent,
} from "@/data/content";
import { privacyPolicy, termsOfUse } from "@/data/legal-documents";
import { projects, serviceGroups } from "@/data/projects";
import { translate } from "./translate";

const copyKeys = new Set([
  "title",
  "heading",
  "headingLines",
  "description",
  "summary",
  "headline",
  "alt",
  "imageAlt",
  "caption",
  "paragraphs",
  "label",
  "body",
  "role",
  "contribution",
  "text",
  "items",
  "segments",
  "lastUpdated",
  "deliveryLabels",
  "lines",
  "seoDescription",
]);
const unchanged = new Set([
  "Design",
  "Motion design",
  "Google",
  "Together",
  "Madeireira Fortaleza",
  "JR Express",
  "Strong",
  "Ecox Hostel Cabanas",
  "Chapada Backpackers",
  "Contábil Sudoeste",
  "Posto Ipiranga",
  "NOIR Digital",
  "Cookies",
  "Google Analytics;",
  "Google Tag Manager;",
  "Meta Pixel;",
  "Cloudflare;",
  "Cloudflare.",
  "layouts;",
  "interfaces;",
]);

function collectCopy(value: unknown, include = false): string[] {
  if (typeof value === "string") return include ? [value] : [];
  if (Array.isArray(value)) return value.flatMap((entry) => collectCopy(entry, include));
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([key, entry]) => collectCopy(entry, copyKeys.has(key)));
}

describe("English translation coverage", () => {
  it.each([
    [
      "home",
      [
        ...heroLabels,
        ...heroSupportLines,
        ...heroDescriptionLines,
        ...heroHeadlineLines,
        ...contactHeadlineLines,
        ...principleStatements.flat(),
        ...collectCopy([principleStages, serviceContent, aiServices]),
      ],
    ],
    ["projects", collectCopy([projects, serviceGroups, caseStudiesV2])],
    ["legal documents", collectCopy([privacyPolicy, termsOfUse])],
  ])("covers the published %s copy without changing names or links", (_name, copy) => {
    const missing = [...new Set(copy as string[])].filter(
      (text) => !unchanged.has(text) && translate(text, "en") === text,
    );
    expect(missing).toEqual([]);
  });

  it("preserves Portuguese and unknown names", () => {
    expect(translate("Serviços", "pt")).toBe("Serviços");
    expect(translate("NOIR DIGITAL", "en")).toBe("NOIR DIGITAL");
  });
});
