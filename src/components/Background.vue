<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNow } from '@/composables/useNow';
import { useSettingsStore } from '@/stores/settings';
import { GRADIENTS } from '@/data/gradients';

const settings = useSettingsStore();
const now = useNow(60_000);

// Stable for the lifetime of this tab; 'tab' rotation just means "pick once".
const tabIndex = Math.floor(Math.random() * GRADIENTS.length);
const manualIndex = ref<number | null>(null);

const intervalIndex = computed(() => {
  switch (settings.settings.rotationInterval) {
    case 'hourly':
      return now.value.getHours() % GRADIENTS.length;
    case 'daily':
      return now.value.getDate() % GRADIENTS.length;
    default:
      return tabIndex;
  }
});

const activeIndex = computed(() => manualIndex.value ?? intervalIndex.value);
// GRADIENTS is a non-empty literal; the modulo always lands in range.
const active = computed(() => GRADIENTS[activeIndex.value % GRADIENTS.length]!);

function skip() {
  manualIndex.value = (activeIndex.value + 1) % GRADIENTS.length;
}
</script>

<template>
  <div
    class="fixed inset-0 -z-10 transition-[background-image] duration-700 ease-out"
    :style="{ backgroundImage: active.css }"
  >
    <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/35" />
    <button
      type="button"
      class="absolute bottom-4 left-4 rounded px-2 py-1 text-xs text-white/70 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      @click="skip"
    >
      Skip background
    </button>
  </div>
</template>
