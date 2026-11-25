import { defineStore } from 'pinia';
import { useStorage } from '@/composables/useStorage';
import { createSyncedStore } from '@/services/storage';
import { DEFAULT_FOCUS, FOCUS_SCHEMA_VERSION, migrateFocus } from '@/types/storage';

const focusStore = createSyncedStore('dayboard:focus', DEFAULT_FOCUS, migrateFocus);

// Full Focus widget (checkbox, completion, history) lands in Phase 3; for now
// this just gives Onboarding somewhere to write the first-run answer.
export const useFocusStore = defineStore('focus', () => {
  const { state: focus, ready } = useStorage(focusStore, DEFAULT_FOCUS);

  function setToday(text: string, dateKey: string) {
    focus.value = { schemaVersion: FOCUS_SCHEMA_VERSION, date: dateKey, text, completed: false };
  }

  return { focus, ready, setToday };
});
