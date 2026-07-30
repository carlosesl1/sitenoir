import { describe, expect, it, vi } from "vitest";

import { createWorkCardAnimationRegistry } from "@/components/work/work-card-animation-controller";

describe("work card animation registry", () => {
  it("updates only cards marked near the viewport from one shared frame", () => {
    const registry = createWorkCardAnimationRegistry();
    const first = vi.fn();
    const second = vi.fn();
    const unregisterFirst = registry.register(first);
    const unregisterSecond = registry.register(second);

    registry.setActive(first, true);
    expect(registry.activeSize()).toBe(1);
    registry.run({ scrollSpeed: 400, time: 16 });

    expect(first).toHaveBeenCalledWith({ scrollSpeed: 400, time: 16 });
    expect(second).not.toHaveBeenCalled();

    unregisterFirst();
    unregisterSecond();
    expect(registry.size()).toBe(0);
    expect(registry.activeSize()).toBe(0);
  });
});
