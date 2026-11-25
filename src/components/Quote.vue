<script setup lang="ts">
import { computed } from 'vue';
import { QUOTES } from '@/data/quotes';
import { useMidnight } from '@/composables/useMidnight';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
const { today } = useMidnight();

function hashDateKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash;
}

// Stable for the lifetime of this tab, used only in 'tab' quote mode.
const tabIndex = Math.floor(Math.random() * QUOTES.length);

const quote = computed(() => {
  const index = settings.settings.quoteMode === 'tab' ? tabIndex : hashDateKey(today.value) % QUOTES.length;
  return QUOTES[index % QUOTES.length]!;
});
</script>

<template>
  <figure class="max-w-lg px-4 text-center text-white/80">
    <blockquote class="text-sm italic drop-shadow">"{{ quote.text }}"</blockquote>
    <figcaption class="mt-1 text-xs text-white/50">— {{ quote.author }}</figcaption>
  </figure>
</template>
