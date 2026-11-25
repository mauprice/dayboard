import { createSyncedStore } from './storage';
import { daysBetweenDateKeys } from './date';
import {
  DEFAULT_FOCUS,
  DEFAULT_TODO_DATA,
  MAX_FOCUS_HISTORY,
  migrateFocus,
  migrateTodos,
} from '@/types/storage';

const focusStore = createSyncedStore('dayboard:focus', DEFAULT_FOCUS, migrateFocus);
const todoStore = createSyncedStore('dayboard:todos', DEFAULT_TODO_DATA, migrateTodos);

/**
 * Idempotent daily rollover: archives yesterday's focus into history and
 * resets today's slot, then sweeps completed to-dos past the auto-clear
 * window. Safe to call repeatedly (e.g. from both the background alarm and
 * the page on every midnight tick) — a no-op once already applied for the
 * given date.
 */
export async function runDailyRollover(todayKey: string): Promise<void> {
  const focus = await focusStore.load();
  if (focus.today.date && focus.today.date !== todayKey) {
    const hadText = focus.today.text.trim() !== '';
    await focusStore.save({
      ...focus,
      today: { date: todayKey, text: '', completed: false },
      history: hadText ? [focus.today, ...focus.history].slice(0, MAX_FOCUS_HISTORY) : focus.history,
    });
  } else if (!focus.today.date) {
    await focusStore.save({ ...focus, today: { date: todayKey, text: '', completed: false } });
  }

  const todos = await todoStore.load();
  const maxAge = todos.autoClearCompletedAfterDays;
  if (maxAge != null) {
    let changed = false;
    const lists = todos.lists.map((list) => {
      const items = list.items.filter((item) => {
        if (!item.completed || !item.completedAt) return true;
        const shouldClear = daysBetweenDateKeys(item.completedAt, todayKey) >= maxAge;
        if (shouldClear) changed = true;
        return !shouldClear;
      });
      return { ...list, items };
    });
    if (changed) await todoStore.save({ ...todos, lists });
  }
}
