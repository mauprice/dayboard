import { computed } from 'vue';
import { useNow } from './useNow';

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Reactive local date key (YYYY-MM-DD) that flips over at local midnight. */
export function useMidnight() {
  const now = useNow(30_000);
  const today = computed(() => toLocalDateKey(now.value));
  return { today };
}
