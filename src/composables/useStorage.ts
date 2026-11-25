import { ref, watch, type Ref } from 'vue';
import type { SyncedStore } from '@/services/storage';

/**
 * Bridges a SyncedStore to a reactive ref: loads it once, saves on change
 * (content-compared against the last known value to avoid an echo write when
 * the change originated from `onChange` itself), and applies updates that
 * arrive from other tabs/devices.
 */
export function useStorage<T>(store: SyncedStore<T>, defaults: T): { state: Ref<T>; ready: Ref<boolean> } {
  const state = ref(structuredClone(defaults)) as Ref<T>;
  const ready = ref(false);
  let lastSerialized = JSON.stringify(defaults);

  store.load().then((loaded) => {
    lastSerialized = JSON.stringify(loaded);
    state.value = loaded;
    ready.value = true;
  });

  store.onChange((updated) => {
    lastSerialized = JSON.stringify(updated);
    state.value = updated;
  });

  watch(
    state,
    (value) => {
      if (!ready.value) return;
      const serialized = JSON.stringify(value);
      if (serialized === lastSerialized) return;
      lastSerialized = serialized;
      void store.save(value);
    },
    { deep: true },
  );

  return { state, ready };
}
