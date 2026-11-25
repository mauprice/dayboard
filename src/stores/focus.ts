import { defineStore } from 'pinia';
import { useStorage } from '@/composables/useStorage';
import { createSyncedStore } from '@/services/storage';
import { DEFAULT_FOCUS, MAX_FOCUS_HISTORY, migrateFocus } from '@/types/storage';

const focusStore = createSyncedStore('dayboard:focus', DEFAULT_FOCUS, migrateFocus);

export const useFocusStore = defineStore('focus', () => {
  const { state: focus, ready } = useStorage(focusStore, DEFAULT_FOCUS);

  function setToday(text: string, dateKey: string) {
    const prev = focus.value.today;
    // Defensive: archive a stale (different-day) entry here too, in case the
    // user interacts before the background rollover (services/dailyReset.ts) runs.
    if (prev.date && prev.date !== dateKey && prev.text.trim() !== '') {
      focus.value.history = [prev, ...focus.value.history].slice(0, MAX_FOCUS_HISTORY);
    }
    focus.value.today = { date: dateKey, text, completed: false };
  }

  function toggleToday() {
    focus.value.today.completed = !focus.value.today.completed;
  }

  return { focus, ready, setToday, toggleToday };
});
