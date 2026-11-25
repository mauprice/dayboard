import { browser } from 'wxt/browser';

export interface SyncedStore<T> {
  load: () => Promise<T>;
  save: (value: T) => Promise<void>;
  /** Registers a listener for changes made in other tabs/devices; returns an unsubscribe fn. */
  onChange: (callback: (value: T) => void) => () => void;
}

/**
 * Wraps one top-level browser.storage key with load/save/onChange, backed by
 * storage.sync with a storage.local fallback if the sync write is rejected
 * (e.g. the 8KB-per-item quota). Each domain gets its own key/store so one
 * oversized slice (to-dos, custom quotes) can't block writes to the others.
 */
export function createSyncedStore<T>(
  key: string,
  defaults: T,
  migrate: (raw: unknown) => T,
): SyncedStore<T> {
  async function load(): Promise<T> {
    const synced = await browser.storage.sync.get(key);
    if (synced[key] !== undefined) return migrate(synced[key]);

    const local = await browser.storage.local.get(key);
    if (local[key] !== undefined) return migrate(local[key]);

    return structuredClone(defaults);
  }

  async function save(value: T): Promise<void> {
    try {
      await browser.storage.sync.set({ [key]: value });
    } catch (error) {
      console.warn(`[dayboard] storage.sync rejected "${key}", falling back to storage.local`, error);
      await browser.storage.local.set({ [key]: value });
    }
  }

  function onChange(callback: (value: T) => void): () => void {
    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      const change = changes[key];
      if (change && change.newValue !== undefined) callback(migrate(change.newValue));
    };
    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }

  return { load, save, onChange };
}
