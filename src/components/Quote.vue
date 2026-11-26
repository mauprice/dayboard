<script setup lang="ts">
import { computed } from 'vue';
import { useMidnight } from '@/composables/useMidnight';
import { useSettingsStore } from '@/stores/settings';
import { useQuotesStore } from '@/stores/quotes';
import { useTextTheme } from '@/composables/useTextTheme';

const settings = useSettingsStore();
const quotesStore = useQuotesStore();
const { isLight } = useTextTheme();
const { today } = useMidnight();

function hashDateKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash;
}

// Stable for the lifetime of this tab, used only in 'tab' quote mode.
const tabSeed = Math.floor(Math.random() * 100_000);

const quote = computed(() => {
  const pool = quotesStore.pool;
  const index =
    settings.settings.quoteMode === 'tab' ? tabSeed % pool.length : hashDateKey(today.value) % pool.length;
  return pool[index]!;
});
</script>

<template>
  <figure class="max-w-lg px-4 text-center drop-shadow" :class="isLight ? 'text-white/80' : 'text-neutral-900/80'">
    <blockquote class="text-sm font-light italic">{{ quote.text }}</blockquote>
    <figcaption class="mt-1 text-xs opacity-70">— {{ quote.author }}</figcaption>
  </figure>
</template>
