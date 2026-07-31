import type { MetadataRoute } from "next";

import { caseStudies } from "@/data/case-studies";

export const dynamic = "force-static";

function resolveSiteUrl(value: string | undefined): URL | undefined {
  if (!value || !URL.canParse(value)) {
    return undefined;
  }

  const url = new URL(value);
  if (url.protocol !== "https:" || url.username !== "" || url.password !== "") {
    return undefined;
  }

  url.search = "";
  url.hash = "";
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return url;
}

// biome-ignore lint/style/noDefaultExport: Next.js metadata routes require a default export.
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveSiteUrl(process.env["NEXT_PUBLIC_SITE_URL"]);
  if (siteUrl === undefined) {
    return [];
  }

  return [
    {
      url: siteUrl.href,
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${siteUrl.href}services`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: new URL("contato", siteUrl).href,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: new URL("privacidade", siteUrl).href,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: new URL("termos", siteUrl).href,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...caseStudies.map(({ slug }) => ({
      url: new URL(`services/${slug}`, siteUrl).href,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
