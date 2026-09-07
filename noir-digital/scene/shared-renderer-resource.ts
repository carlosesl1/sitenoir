/** Renderer-local ownership; delayed disposal accommodates React effect replay. */
export function createSharedRendererResource<K extends object, V extends { dispose(): void }>(
  create: (key: K) => V,
) {
  const entries = new WeakMap<K, { value: V; users: number }>();
  return {
    acquire(key: K) {
      let entry = entries.get(key);
      if (!entry) {
        entry = { value: create(key), users: 0 };
        entries.set(key, entry);
      }
      entry.users++;
      const owned = entry;
      let released = false;
      return {
        value: owned.value,
        release() {
          if (released) return;
          released = true;
          owned.users--;
          queueMicrotask(() => {
            if (owned.users !== 0 || entries.get(key) !== owned) return;
            entries.delete(key);
            owned.value.dispose();
          });
        },
      };
    },
  };
}
