<script setup lang="ts">
import { computed } from 'vue';
import { useNow } from '@/composables/useNow';
import { useSettingsStore } from '@/stores/settings';
import { useTextTheme } from '@/composables/useTextTheme';

const settings = useSettingsStore();
const { isLight } = useTextTheme();
const now = useNow(1000);

const timeParts = computed(() => {
  const date = now.value;
  const is24h = settings.settings.clockFormat === '24h';
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  let suffix = '';

  if (!is24h) {
    suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }

  return { hours: is24h ? String(hours).padStart(2, '0') : String(hours), minutes, seconds, suffix };
});
</script>

<template>
  <div
    class="flex items-baseline justify-center gap-2 text-[clamp(3rem,10vw,8rem)] font-extralight leading-none tracking-tight drop-shadow-md"
    :class="isLight ? 'text-white' : 'text-neutral-900'"
  >
    <span>{{ timeParts.hours }}:{{ timeParts.minutes }}</span>
    <span v-if="settings.settings.showSeconds" class="text-[0.4em] opacity-70">:{{ timeParts.seconds }}</span>
    <span v-if="timeParts.suffix" class="mb-2 self-end text-[0.3em] opacity-70">{{ timeParts.suffix }}</span>
  </div>
</template>
