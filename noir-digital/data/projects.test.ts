import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  groupProjectsByService,
  projects,
  reservedWorkAssets,
  serviceGroups,
} from "@/data/projects";

describe("projects", () => {
  it("publishes the four services in the approved order", () => {
    expect(serviceGroups).toEqual([
      { id: "sites", index: "01", title: "Sites" },
      { id: "videos", index: "02", title: "Vídeos" },
      { id: "google", index: "03", title: "Presença no Google" },
      { id: "social", index: "04", title: "Redes sociais" },
    ]);
  });

  it("places every visible project in exactly one non-empty service group", () => {
    const grouped = groupProjectsByService(projects);
    const groupedSlugs = grouped.flatMap((group) =>
      group.projects.map((project) => project.slug),
    );

    expect(grouped.map((group) => group.projects.length)).toEqual([3, 2, 2, 3]);
    expect(groupedSlugs).toHaveLength(projects.length);
    expect(new Set(groupedSlugs).size).toBe(projects.length);
    expect(groupedSlugs.toSorted()).toEqual(projects.map((project) => project.slug).toSorted());
  });

  it("gives every project client and delivery metadata", () => {
    for (const project of projects) {
      expect(project.client.trim()).not.toBe("");
      expect(project.deliveryLabels.length).toBeGreaterThan(0);
      expect(project.deliveryLabels.every((label) => label.trim() !== "")).toBe(true);
    }
  });

  it("keeps every project slug unique", () => {
    // Given the visible project slugs.
    const slugs = projects.map((project) => project.slug);

    // When their unique values are collected.
    const uniqueSlugs = new Set(slugs);

    // Then no card shares a route identity.
    expect(uniqueSlugs.size).toBe(10);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("routes every project card to the internal services page", () => {
    expect(projects.every((project) => project.href === "/services")).toBe(true);
  });

  it.each(projects)("ships non-empty image pairs for $slug", async (project) => {
    // Given a visible project image pair.
    const assetPaths = [project.image, project.hoverImage];

    // When both public files are inspected.
    const assetStats = await Promise.all(
      assetPaths.map((assetPath) => stat(path.join(process.cwd(), "public", assetPath.slice(1)))),
    );

    // Then both paths resolve to non-empty files.
    for (const asset of assetStats) {
      expect(asset.isFile()).toBe(true);
      expect(asset.size).toBeGreaterThan(0);
    }
  });

  it("accounts for all work assets without fabricating a Teambition hover image", async () => {
    // Given the visible project paths and the source-only protected item paths.
    const uniqueProjectAssets = Array.from(
      new Set(projects.flatMap((project) => [project.image, project.hoverImage])),
    );
    const modeledAssets = Array.from(new Set([...uniqueProjectAssets, ...reservedWorkAssets]));

    // When the approved public work directory is enumerated.
    const publicWorkAssets = (
      await readdir(path.join(process.cwd(), "public", "work"), {
        withFileTypes: true,
      })
    )
      .filter((entry) => entry.isFile())
      .map((entry) => `/work/${entry.name}`)
      .toSorted();

    // Then 19 unique visible paths plus two reserved paths cover all 21 files exactly.
    expect(uniqueProjectAssets).toHaveLength(19);
    expect(reservedWorkAssets).toEqual(["/work/tt01.png", "/work/tt02.png"]);
    expect(modeledAssets).toHaveLength(21);
    expect(modeledAssets.toSorted()).toEqual(publicWorkAssets);
  });
});
