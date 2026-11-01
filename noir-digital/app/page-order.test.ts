import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("homepage section order", () => {
  it("places the mission story between the trust strip and selected work", () => {
    const source = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
    const trust = source.indexOf("<TrustStrip />");
    const mission = source.indexOf("<MissionScroll />");
    const work = source.indexOf("<SelectedWork />");

    expect(trust).toBeGreaterThan(-1);
    expect(mission).toBeGreaterThan(trust);
    expect(work).toBeGreaterThan(mission);
  });

  it("places AI services after work and before the cursor story", () => {
    const source = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
    const work = source.indexOf("<SelectedWork />");
    const ai = source.indexOf("<AiServicesSection />");
    const principles = source.indexOf("<PrinciplesStory />");

    expect(work).toBeGreaterThan(-1);
    expect(ai).toBeGreaterThan(work);
    expect(principles).toBeGreaterThan(ai);
  });
});
