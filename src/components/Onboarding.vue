<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useOnboardingStore } from '@/stores/onboarding';
import { useFocusStore } from '@/stores/focus';
import { useMidnight } from '@/composables/useMidnight';

const settings = useSettingsStore();
const onboarding = useOnboardingStore();
const focusStore = useFocusStore();
const { today } = useMidnight();

const step = ref<1 | 2>(1);
const name = ref('');
const focusText = ref('');

function next() {
  settings.settings.name = name.value.trim();
  step.value = 2;
}

function finish() {
  const text = focusText.value.trim();
  if (text) focusStore.setToday(text, today.value);
  onboarding.complete();
}

function skip() {
  onboarding.complete();
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div class="w-full max-w-sm rounded-xl bg-neutral-900/90 p-8 text-center text-white shadow-2xl ring-1 ring-white/10">
      <template v-if="step === 1">
        <h2 class="mb-4 text-2xl font-light">Hello, what's your name?</h2>
        <input
          v-model="name"
          type="text"
          autofocus
          placeholder="Your name"
          class="mb-6 w-full rounded bg-white/10 px-3 py-2 text-center outline-none ring-1 ring-white/30 focus:ring-white/70"
          @keyup.enter="next"
        />
        <div class="flex justify-between text-sm">
          <button type="button" class="text-white/50 hover:text-white/80" @click="skip">Skip</button>
          <button
            type="button"
            class="rounded bg-white/90 px-4 py-1.5 font-medium text-neutral-900 hover:bg-white"
            @click="next"
          >Next</button>
        </div>
      </template>
      <template v-else>
        <h2 class="mb-4 text-2xl font-light">What's your main focus today?</h2>
        <input
          v-model="focusText"
          type="text"
          autofocus
          placeholder="e.g. Ship the first release"
          class="mb-6 w-full rounded bg-white/10 px-3 py-2 text-center outline-none ring-1 ring-white/30 focus:ring-white/70"
          @keyup.enter="finish"
        />
        <div class="flex justify-between text-sm">
          <button type="button" class="text-white/50 hover:text-white/80" @click="skip">Skip</button>
          <button
            type="button"
            class="rounded bg-white/90 px-4 py-1.5 font-medium text-neutral-900 hover:bg-white"
            @click="finish"
          >Done</button>
        </div>
      </template>
    </div>
  </div>
</template>
