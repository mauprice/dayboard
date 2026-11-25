import { defineStore } from 'pinia';
import { useStorage } from '@/composables/useStorage';
import { createSyncedStore } from '@/services/storage';
import { DEFAULT_SETTINGS, migrateSettings } from '@/types/storage';

const settingsStore = createSyncedStore('dayboard:settings', DEFAULT_SETTINGS, migrateSettings);

export const useSettingsStore = defineStore('settings', () => {
  const { state: settings, ready } = useStorage(settingsStore, DEFAULT_SETTINGS);
  return { settings, ready };
});
