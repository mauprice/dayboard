import { computed } from 'vue';
import { useNow } from './useNow';
import { toLocalDateKey } from '@/services/date';

/** Reactive local date key (YYYY-MM-DD) that flips over at local midnight. */
export function useMidnight() {
  const now = useNow(30_000);
  const today = computed(() => toLocalDateKey(now.value));
  return { today };
}
