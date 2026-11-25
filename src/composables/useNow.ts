import { onMounted, onUnmounted, ref } from 'vue';

/** Reactive current time, ticking every `intervalMs`. */
export function useNow(intervalMs = 1000) {
  const now = ref(new Date());
  let timer: ReturnType<typeof setInterval> | undefined;

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date();
    }, intervalMs);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  return now;
}
