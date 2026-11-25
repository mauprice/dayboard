<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFocusStore } from '@/stores/focus';
import { useMidnight } from '@/composables/useMidnight';

const focusStore = useFocusStore();
const { today } = useMidnight();
const draft = ref('');

const hasFocus = computed(
  () => focusStore.focus.today.date === today.value && focusStore.focus.today.text.trim() !== '',
);
const completed = computed(() => focusStore.focus.today.completed);

function submit() {
  const text = draft.value.trim();
  if (!text) return;
  focusStore.setToday(text, today.value);
  draft.value = '';
}
</script>

<template>
  <div class="flex flex-col items-center gap-2 text-white">
    <form v-if="!hasFocus" class="flex w-full max-w-md flex-col items-center gap-2" @submit.prevent="submit">
      <label for="focus-input" class="text-sm text-white/70">What is your main focus for today?</label>
      <input
        id="focus-input"
        v-model="draft"
        type="text"
        placeholder="Type your focus and press Enter"
        class="w-full rounded bg-white/10 px-3 py-2 text-center outline-none ring-1 ring-white/30 focus:ring-white/70"
      />
    </form>
    <div v-else class="flex flex-col items-center gap-1">
      <label class="flex cursor-pointer items-center gap-2 text-lg">
        <input
          type="checkbox"
          :checked="completed"
          class="h-5 w-5 accent-white"
          @change="focusStore.toggleToday()"
        />
        <span :class="{ 'line-through opacity-60': completed }">{{ focusStore.focus.today.text }}</span>
      </label>
      <p v-if="completed" class="text-sm text-emerald-300">Nice work — focus complete.</p>
    </div>
  </div>
</template>
