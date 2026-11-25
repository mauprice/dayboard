import { browser } from 'wxt/browser';
import { clearCustomBackgrounds } from './imageCache';

const DOMAIN_KEYS = [
  'dayboard:settings',
  'dayboard:onboarding',
  'dayboard:focus',
  'dayboard:todos',
  'dayboard:background',
  'dayboard:weather',
  'dayboard:links',
  'dayboard:quotes',
];

/**
 * Raw per-domain storage objects, keyed by their storage key. Each domain
 * Pinia store listens for storage.onChanged (services/storage.ts) and
 * re-applies its own migrate() to whatever lands here, so an import of an
 * older export (or a hand-edited file) still comes out shaped correctly.
 */
export async function exportAllData(): Promise<Record<string, unknown>> {
  const synced = await browser.storage.sync.get(DOMAIN_KEYS);
  const local = await browser.storage.local.get(DOMAIN_KEYS);
  const merged: Record<string, unknown> = {};
  for (const key of DOMAIN_KEYS) {
    if (synced[key] !== undefined) merged[key] = synced[key];
    else if (local[key] !== undefined) merged[key] = local[key];
  }
  return merged;
}

export async function importAllData(data: Record<string, unknown>): Promise<void> {
  const toSet: Record<string, unknown> = {};
  for (const key of DOMAIN_KEYS) {
    if (data[key] !== undefined) toSet[key] = data[key];
  }
  await browser.storage.sync.set(toSet);
}

export async function resetAllData(): Promise<void> {
  await browser.storage.sync.clear();
  await browser.storage.local.clear();
  await clearCustomBackgrounds();
}
