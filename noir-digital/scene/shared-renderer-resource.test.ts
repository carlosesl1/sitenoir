import { expect, it, vi } from "vitest";
import { createSharedRendererResource } from "./shared-renderer-resource";

it("generates once for three users, isolates renderers, and disposes after the final release", async () => {
  const create = vi.fn(() => ({ dispose: vi.fn() }));
  const pool = createSharedRendererResource(create);
  const renderer = {};
  const a = pool.acquire(renderer),
    b = pool.acquire(renderer),
    c = pool.acquire(renderer);
  expect(create).toHaveBeenCalledTimes(1);
  expect(a.value).toBe(b.value);
  expect(b.value).toBe(c.value);
  const other = pool.acquire({});
  expect(other.value).not.toBe(a.value);
  a.release();
  b.release();
  await Promise.resolve();
  expect(a.value.dispose).not.toHaveBeenCalled();
  c.release();
  c.release();
  other.release();
  await Promise.resolve();
  expect(a.value.dispose).toHaveBeenCalledTimes(1);
  expect(other.value.dispose).toHaveBeenCalledTimes(1);
  const next = pool.acquire(renderer);
  expect(next.value).not.toBe(a.value);
  next.release();
});

it("reuses a resource during effect cleanup/setup replay", async () => {
  const create = vi.fn(() => ({ dispose: vi.fn() }));
  const pool = createSharedRendererResource(create);
  const renderer = {};
  const first = pool.acquire(renderer);
  first.release();
  const replay = pool.acquire(renderer);
  await Promise.resolve();
  expect(create).toHaveBeenCalledTimes(1);
  expect(replay.value.dispose).not.toHaveBeenCalled();
  replay.release();
  await Promise.resolve();
  expect(replay.value.dispose).toHaveBeenCalledTimes(1);
});
