<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNow } from '@/composables/useNow';
import { useSettingsStore } from '@/stores/settings';
import { useTextTheme } from '@/composables/useTextTheme';

const settings = useSettingsStore();
const { isLight } = useTextTheme();
const now = useNow(60_000);
const editing = ref(false);
const draft = ref('');

const timeOfDay = computed(() => {
  const hour = now.value.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
});

const name = computed(() => settings.settings.name.trim());

function startEdit() {
  draft.value = name.value;
  editing.value = true;
}

function commit() {
  settings.settings.name = draft.value.trim();
  editing.value = false;
}
</script>

<template>
  <div class="text-center text-xl drop-shadow" :class="isLight ? 'text-white/90' : 'text-neutral-900/90'">
    <input
      v-if="editing"
      v-model="draft"
      type="text"
      autofocus
      placeholder="Your name"
      class="rounded bg-white/10 px-2 py-1 text-center text-white outline-none ring-1 ring-white/30 focus:ring-white/70"
      @keyup.enter="commit"
      @keyup.escape="editing = false"
      @blur="commit"
    />
    <span v-else>
      Good {{ timeOfDay }}<template v-if="name">, </template>
      <button
        v-if="name"
        type="button"
        class="underline decoration-dotted underline-offset-4 hover:decoration-solid"
        @click="startEdit"
      >{{ name }}</button>
      <button
        v-else
        type="button"
        class="underline decoration-dotted underline-offset-4 hover:decoration-solid"
        @click="startEdit"
      >— add your name</button>.
    </span>
  </div>
</template>
