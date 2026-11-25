<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import Background from '@/components/Background.vue';
import Clock from '@/components/Clock.vue';
import Greeting from '@/components/Greeting.vue';
import Focus from '@/components/Focus.vue';
import TodoPanel from '@/components/TodoPanel.vue';
import Onboarding from '@/components/Onboarding.vue';
import { useOnboardingStore } from '@/stores/onboarding';
import { useMidnight } from '@/composables/useMidnight';
import { runDailyRollover } from '@/services/dailyReset';

const onboarding = useOnboardingStore();
const showOnboarding = computed(() => onboarding.ready && !onboarding.onboarding.completed);

const { today } = useMidnight();
// Defensive fallback alongside the background alarm (src/entrypoints/background.ts) —
// idempotent, so running it here too just covers a tab left open across midnight
// or a service worker that was asleep at the boundary.
onMounted(() => void runDailyRollover(today.value));
watch(today, (value) => void runDailyRollover(value));
</script>

<template>
  <main class="relative flex h-screen w-screen flex-col items-center justify-center gap-6 overflow-hidden">
    <Background />
    <div class="relative z-10 flex flex-col items-center gap-4">
      <Clock />
      <Greeting />
      <Focus />
    </div>
    <TodoPanel />
    <Onboarding v-if="showOnboarding" />
  </main>
</template>
