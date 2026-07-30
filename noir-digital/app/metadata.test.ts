import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { caseStudies } from "@/data/case-studies";

const robotsPath = resolve(process.cwd(), "public", "robots.txt");

async function loadLayout(siteUrl: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
  return import("@/app/layout");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("production metadata", () => {
  it("preserves approved copy, local icons, and responsive theme colors", async () => {
    // Given
    const { metadata, viewport } = await loadLayout("");

    // When
    const publicMetadata = { metadata, viewport };

    // Then
    expect(publicMetadata.metadata.title).toBe("NOIR DIGITAL");
    expect(publicMetadata.metadata.description).toBe("Digital Product Designer & Builder © 2026");
    expect(publicMetadata.metadata.icons).toEqual({
      icon: [{ url: "/stickers/noir-face.png", type: "image/png" }],
      apple: [{ url: "/stickers/noir-face.png", type: "image/png" }],
    });
    expect(publicMetadata.viewport).toMatchObject({
      width: "device-width",
      initialScale: 1,
      colorScheme: "light dark",
      themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f3fbf9" },
        { media: "(prefers-color-scheme: dark)", color: "#030303" },
      ],
    });
  });

  it.each([
    "",
    "http://noir.example",
    "not a url",
    "https://user:secret@noir.example",
  ])("omits canonical and Open Graph URLs for invalid public site URL %j", async (siteUrl) => {
    // Given
    const { metadata } = await loadLayout(siteUrl);

    // When
    const serializedMetadata = JSON.stringify(metadata);

    // Then
    expect(metadata.metadataBase).toBeUndefined();
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toBeUndefined();
    if (siteUrl !== "") {
      expect(serializedMetadata).not.toContain(siteUrl);
    }
  });

  it("emits absolute canonical and Open Graph URLs for a valid HTTPS site URL", async () => {
    // Given
    const { metadata } = await loadLayout("https://noir.example/studio?draft=1#preview");

    // When
    const serializedMetadata = JSON.stringify(metadata);

    // Then
    expect(metadata.metadataBase?.toString()).toBe("https://noir.example/studio/");
    expect(metadata.openGraph?.siteName).toBe("NOIR DIGITAL");
    expect(serializedMetadata).toContain("https://noir.example/studio/");
    expect(serializedMetadata).not.toContain("draft=1");
    expect(serializedMetadata).not.toContain("preview");
  });
});

describe("search engine discovery", () => {
  it("allows crawlers without advertising an unknown deployment URL", async () => {
    // Given
    const expectedRules = "User-agent: *\nAllow: /\n";

    // When
    const rules = await readFile(robotsPath, "utf8");

    // Then
    expect(rules.replaceAll("\r\n", "\n")).toBe(expectedRules);
    expect(rules).not.toContain("Sitemap:");
  });

  it("returns no sitemap entry until a valid HTTPS deployment URL is configured", async () => {
    // Given
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    const { default: sitemap } = await import("@/app/sitemap");

    // When
    const entries = sitemap();

    // Then
    expect(entries).toEqual([]);
  });

  it("returns the canonical public pages for a valid HTTPS deployment URL", async () => {
    // Given
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://noir.example/studio");
    const { default: sitemap } = await import("@/app/sitemap");

    // When
    const entries = sitemap();

    // Then
    expect(entries).toEqual([
      {
        url: "https://noir.example/studio/",
        changeFrequency: "yearly",
        priority: 1,
      },
      {
        url: "https://noir.example/studio/services",
        changeFrequency: "monthly",
        priority: 0.8,
      },
      ...caseStudies.map(({ slug }) => ({
        url: `https://noir.example/studio/services/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]);
  });
});
