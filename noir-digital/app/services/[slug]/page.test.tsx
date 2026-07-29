import { describe, expect, it } from "vitest";

import { caseStudiesV2, getCaseStudyV2 } from "@/data/case-studies-v2";

import { generateMetadata, generateStaticParams } from "./page";

describe("service case route", () => {
  it("prebuilds every approved case", () => {
    expect(generateStaticParams()).toEqual(
      caseStudiesV2.map(({ slug }) => ({ slug })),
    );
  });

  it("creates case-specific metadata", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "strong" }),
    });

    expect(metadata.title).toBe("Strong | Cases | NOIR DIGITAL");
    expect(metadata.description).toBe(getCaseStudyV2("strong")?.seoDescription);
    expect(metadata.openGraph).toMatchObject({
      title: "Strong | Cases | NOIR DIGITAL",
      images: [
        {
          url: "/cases-v2/strong/hero.webp",
        },
      ],
    });
  });

  it("returns empty metadata for an unknown case", async () => {
    expect(
      await generateMetadata({
        params: Promise.resolve({ slug: "unknown" }),
      }),
    ).toEqual({});
  });
});
