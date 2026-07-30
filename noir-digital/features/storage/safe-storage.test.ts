import { afterEach, describe, expect, it, vi } from "vitest";

import { safeStorageGet, safeStorageSet } from "@/features/storage/safe-storage";

afterEach(() => vi.restoreAllMocks());

describe("safe storage", () => {
  it("reads and writes supported preferences", () => {
    expect(safeStorageSet("theme", "dark")).toBe(true);
    expect(safeStorageGet("theme")).toBe("dark");
  });

  it("keeps the application operational when storage access throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });

    expect(safeStorageGet("sound")).toBeNull();
    expect(safeStorageSet("sound", "on")).toBe(false);
  });
});
