import { describe, expect, it } from "vitest";

import { resolveServicePinState } from "@/components/work/service-statement-pin";

describe("resolveServicePinState", () => {
  it("keeps the statement in normal flow before its rail reaches the offset", () => {
    expect(
      resolveServicePinState({
        railTop: 180,
        railBottom: 1600,
        statementHeight: 240,
        pinOffset: 112,
      }),
    ).toBe("before");
  });

  it("pins the statement while there is room inside the rail", () => {
    expect(
      resolveServicePinState({
        railTop: 80,
        railBottom: 900,
        statementHeight: 240,
        pinOffset: 112,
      }),
    ).toBe("pinned");
  });

  it("anchors the statement at the end of the rail after the cards pass", () => {
    expect(
      resolveServicePinState({
        railTop: -1200,
        railBottom: 300,
        statementHeight: 240,
        pinOffset: 112,
      }),
    ).toBe("after");
  });
});
